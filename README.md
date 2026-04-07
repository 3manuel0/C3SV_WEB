### Lib3man WASM

Lib3man WASM is an experimental project where I make my C library ([lib3man](https://github.com/3manuel0/lib3man)) work in WebAssembly for learning purposes and to explore low-level behavior in a web environment.

> [!WARNING]
> This project is experimental and may change or break at any time.

#### It includes :

- WASM heap allocator (growing via memory pages)
- Memory arenas
- Arena-list (for managing multiple arenas)
- Length-based string (string view (sv))
- Dynamically allocated strings (string buffer (sb))

### Goals

The goal of this project is to explore how low-level C concepts such as memory management interact with WebAssembly, and to understand how to adapt a native library to run in the browser while keeping the code simple and minimal.
