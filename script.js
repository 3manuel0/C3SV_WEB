const terminal = document.getElementById("terminal");

const worker = new Worker("worker.js");

worker.postMessage({
  type: "init",
});

worker.postMessage({
  type: "run_test",
});

const fileInput = document.querySelector("input[type=file]");

fileInput.onchange = async () => {
  const file = fileInput.files[0];

  // read file as ArrayBuffer
  const buffer = await file.arrayBuffer();

  // send WITHOUT copying (transfer ownership)
  worker.postMessage({ type: "file", buffer }, [buffer]);
};

worker.onmessage = (e) => {
  const { type, error, result, term } = e.data;

  switch (type) {
    case "stdout":
      // writing to the fake terminal
      terminal.textContent += term;
      // scrolling
      terminal.scrollTop = terminal.scrollHeight;

      break;

    case "ready":
      console.log("WASM is loaded and heap_base is:", result);
      break;

    case "error":
      console.error("Worker Error:", error);
      break;
  }
};
