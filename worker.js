let wasm = null;
let exports = null;
let is_ready = false;
let terminal = "";
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
              f_str += new Float32Array(buffer, args_ptrs, 1)[0];
              args_ptrs += 4;
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

  const { heap_base, test, malloc } = wasm.instance.exports;

  switch (type) {
    case "init":
      let result = heap_base();
      self.postMessage({ type: "ready", result });
      break;
    case "run_test":
      // test(0);
      let term = terminal;
      self.postMessage({ type: "stdout", term });
      break;
    case "file": {
      const bytes = new Uint8Array(buffer);
      const len = bytes.length;
      const ptr = malloc(len);
      const wasmMemory = new Uint8Array(
        wasm.instance.exports.memory.buffer,
        ptr,
        len,
      );
      wasmMemory.set(bytes);
      test(ptr, len);
      console.log(ptr, buffer, len, terminal);
      let term = terminal;
      self.postMessage({ type: "stdout", term });
    }
  }
};
