const csv_type = Object.freeze({
  string_: 1,
  float64_: 2,
  int64_: 3,
  boolean_: 4,
});

const get_types = Object.freeze({
  1: "string",
  2: "float64",
  3: "int64",
  4: "boolean",
});

let wasm = null;
let is_ready = false;
let terminal = "";
let head = [];
let body = [];
let types = [];
const make_environment = (env) => {
  return new Proxy(env, {
    get(target, prop, receiver) {
      if (env[prop] !== undefined) {
        return env[prop].bind(env);
      }
      return (...args) => {
        throw new Error(`NOT IMPLEMENTED: ${prop} ${args}`);
      };
    },
  });
};

const str_len = (mem, str_ptr) => {
  let len = 0;
  while (mem[str_ptr] != 0) {
    len++;
    str_ptr++;
  }
  return len;
};

// getting a Cstring from wasm memory
const get_str = (str_ptr) => {
  const buffer = wasm.instance.exports.memory.buffer;
  const mem = new Uint8Array(buffer);
  const len = str_len(mem, str_ptr);
  const str_bytes = new Uint8Array(buffer, str_ptr, len);
  return new TextDecoder().decode(str_bytes);
};

const get_str_len = (str_ptr, len) => {
  const buffer = wasm.instance.exports.memory.buffer;
  const str_bytes = new Uint8Array(buffer, str_ptr, len);
  return new TextDecoder().decode(str_bytes);
};

const get_string_view = (sv_ptr) => {
  const buffer = wasm.instance.exports.memory.buffer;
  const str_ptr = new Uint32Array(buffer, sv_ptr, 1)[0];
  const len = new Uint32Array(buffer, sv_ptr + 4, 1)[0];
  let string = get_str_len(str_ptr, len);
  console.log(string, len, str_ptr);
  return string;
};

const get_headptr = (csv_ptr) => {
  const buffer = wasm.instance.exports.memory.buffer;
  const head_ptr = new Uint32Array(buffer, csv_ptr, 1)[0];
  return head_ptr;
};

const get_typesptr = (csv_ptr) => {
  const buffer = wasm.instance.exports.memory.buffer;
  const types_ptr = new Uint32Array(buffer, csv_ptr + 4, 1)[0];
  return types_ptr;
};

const initPromise = WebAssembly.instantiateStreaming(fetch("build/main.wasm"), {
  env: make_environment({
    jsprintf: (str_ptr, args_ptrs) => {
      const buffer = wasm.instance.exports.memory.buffer;
      const str = get_str(str_ptr);
      let f_str = "";
      for (let i = 0; i < str.length; i++) {
        if (str[i] === "%") {
          switch (str[i + 1]) {
            case "f":
              f_str += new Float64Array(buffer, args_ptrs, 1)[0];
              args_ptrs += 8;
              i += 2;
              break;
            case "c":
              f_str += String.fromCharCode(
                new Int32Array(buffer, args_ptrs, 1)[0],
              );
              args_ptrs += 4;
              i += 2;
              break;
            case "d":
              f_str += new Int32Array(buffer, args_ptrs, 1)[0];
              args_ptrs += 4;
              i += 2;
              break;
            case "u":
              let uint = new Uint32Array(buffer, args_ptrs, 1)[0];
              f_str += uint;
              args_ptrs += 4;
              i += 2;
              break;
            // fix this, it causes errors
            case "g":
              f_str += new Float64Array(buffer, args_ptrs, 1)[0].toPrecision(6);
              args_ptrs += 8;
              i += 2;
              console.log(str, f_str);
              break;
            case "s":
              const str_ptr = new Uint32Array(buffer, args_ptrs, 1)[0];
              f_str += get_str(str_ptr);
              args_ptrs += 4;
              i += 2;
              break;
            case "i":
              f_str += new Int32Array(buffer, args_ptrs, 1)[0];
              args_ptrs += 4;
              i += 2;
              break;
            case "p":
              let ptr = new Uint32Array(buffer, args_ptrs, 1)[0];
              f_str += "0x" + ptr.toString(16);
              args_ptrs += 4;
              i += 2;
              break;
            case "l":
              if (str[i + 2] === "d") {
                f_str += new BigInt64Array(buffer, args_ptrs, 1)[0];
                args_ptrs += 8;
                i += 3;
              } else if (str[i + 2] === "f") {
                f_str += new Float64Array(buffer, args_ptrs, 1)[0];
                args_ptrs += 8;
                i += 3;
              }
              break;
          }
        }
        if (str[i] != undefined) f_str += str[i];
      }
      // console.log(f_str);
      // terminal.textContent += f_str;
      // terminal.scrollTop = terminal.scrollHeight;
      terminal += f_str;
      // console.log(get_str(args_ptrs), new Uint32Array(buffer, args_ptrs, 1));
    },
    fwrite: (str_ptr, len, count, filedesc) => {
      const str = get_str_len(str_ptr, len * count);
      // console.log(str);
      terminal += str;
    },
    time: () => {
      return Date.now();
    },
  }),
}).then((w) => {
  wasm = w;
  // worker.terminate();
  // testing functions
  // console.log(test_sv());
  is_ready = true;
});

self.onmessage = async (e) => {
  const { type, buffer } = e.data;

  await initPromise;

  const { heap_base, test, malloc, csv_column_count, csv_row_count, free_all } =
    wasm.instance.exports;

  switch (type) {
    case "init":
      let result = heap_base();
      self.postMessage({ type: "ready", result });
      break;
    case "run_test":
      // test(0);
      let term = terminal;
      terminal = "";
      head = [];
      self.postMessage({ type: "stdout", term });
      break;
    case "file": {
      terminal = "";
      const bytes = new Uint8Array(buffer);
      const len = bytes.length;
      const ptr = malloc(len);
      const wasmMemory = new Uint8Array(
        wasm.instance.exports.memory.buffer,
        ptr,
        len,
      );
      wasmMemory.set(bytes);
      let csvptr = test(ptr, len);
      let head_ptr = get_headptr(csvptr);
      let term = terminal;
      let numcols = csv_column_count(csvptr);
      let numrows = csv_row_count(csvptr);
      let typesptr = get_typesptr(csvptr);
      fill_head(head_ptr, numcols);
      types.length = 0;
      for (let i = 0; i < numcols; i++) {
        types[i] = new Uint32Array(
          wasm.instance.exports.memory.buffer,
          typesptr + i * 4,
          1,
        )[0];
      }
      fill_body(csvptr, numcols, numrows);
      console.log("number of columns", numcols, numrows);
      console.log(free_all());
      self.postMessage({ type: "stdout", term, head, body });
      break;
    }
  }
};

const fill_head = (head_ptr, numcols) => {
  head.length = 0;
  for (let i = 0; i < numcols; i++) {
    head[i] = get_string_view(head_ptr + i * 8);
    console.log(head);
  }
};

const fill_body = (csv_ptr, numcols, numrows) => {
  body.length = 0;
  const buffer = wasm.instance.exports.memory.buffer;
  const { csv_get_cell } = wasm.instance.exports;
  for (let i = 0; i < numrows; i++) {
    body[i] = [];
    for (let j = 0; j < numcols; j++) {
      // head.push(get_string_view(head_ptr + j * 8));
      let data_ptr = csv_get_cell(csv_ptr, i, j);
      switch (types[j]) {
        case csv_type.string_:
          body[i][j] = get_string_view(data_ptr);
          console.log(body[i][j]);
          break;
        case csv_type.float64_:
          console.log("float", types[j]);
          body[i][j] = new Float64Array(buffer, data_ptr, 1)[0];
          console.log(body[i][j]);
          break;

        case csv_type.int64_:
          console.log("int", types[j]);
          body[i][j] = new BigInt64Array(buffer, data_ptr, 1)[0];
          console.log(body[i][j], types[j]);
          break;
      }
    }
  }
  console.log(body[0][0]);
};
