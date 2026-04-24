const terminal = document.getElementById("terminal");

function generateEmpty(rows = 30, cols = 8) {
  const headers = [];
  for (let c = 0; c < cols; c++) {
    headers.push(" ");
  }

  const data = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(" ");
    }
    data.push(row);
  }

  return { headers, data };
}

function renderTable(headers, data) {
  const thead = document.querySelector("#csvTable thead");
  const tbody = document.querySelector("#csvTable tbody");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  // Headers
  const headerRow = document.createElement("tr");
  headers.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Rows
  // data.forEach((row) => {
  //   const tr = document.createElement("tr");
  //   row.forEach((cell) => {
  //     const td = document.createElement("td");
  //     td.textContent = cell;
  //     tr.appendChild(td);
  //   });
  //   tbody.appendChild(tr);
  // });
  data.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");

    row.forEach((cell, colIndex) => {
      const td = document.createElement("td");
      td.textContent = cell;

      td.addEventListener("click", () => {
        // prevent multiple inputs
        if (td.querySelector("input")) return;

        const input = document.createElement("input");
        input.type = "text";
        input.value = td.textContent;

        td.textContent = "";
        td.appendChild(input);
        input.focus();

        // Save function
        const save = () => {
          const newValue = input.value;
          td.removeChild(input);
          td.textContent = newValue;

          // update your data model
          data[rowIndex][colIndex] = newValue;

          // 🔥 HERE is your index
          console.log("Edited cell:", {
            row: rowIndex,
            col: colIndex,
            value: newValue,
          });
        };

        // Save on blur or Enter
        input.addEventListener("blur", save);
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") input.blur();
        });
      });

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

const empty = generateEmpty(50, 10);
renderTable(empty.headers, empty.data);

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

  // send without copying (transfer ownership)
  worker.postMessage({ type: "file", buffer }, [buffer]);
};

worker.onmessage = (e) => {
  const { type, error, result, term, head, body } = e.data;

  switch (type) {
    case "stdout":
      // writing to the fake terminal
      terminal.textContent += term;
      // scrolling
      terminal.scrollTop = terminal.scrollHeight;
      if (head) renderTable(head, body);
      break;

    case "ready":
      console.log("WASM is loaded and heap_base is:", result);
      break;

    case "error":
      console.error("Worker Error:", error);
      break;
  }
};
