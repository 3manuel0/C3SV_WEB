#ifndef WAS_MEM
#define WAS_MEM
#include "3mandef.h"

#define ALIGNMENT 8 // memory alignment for wasm32 (since it can store a double or int64 (64bits))

typedef struct mem_header{
  i32 flag;
  size_t size;
}mem_header;

typedef struct Free_mem{
    u8 *free_mem[100];
    size_t count;
}Free_mem;



extern unsigned char __heap_base;
extern unsigned char * HEAP_BASE;
extern unsigned char * CURRENT_PTR;
extern unsigned long PAGE_LEN;
extern Free_mem FREE_MEM;
extern unsigned long __builtin_wasm_memory_grow(int memory_index, unsigned long pages);
extern unsigned long __builtin_wasm_memory_size(int memory_index);

unsigned char * wmalloc(unsigned long size);

extern void *malloc(size_t size);

char time();

int rand(void);

void srand(unsigned int seed);
// TODO TEST THESE FUNCTIONS 

// TODO : IMPLIMENT THESE

void *realloc(void * ptr, size_t size);

void free(void *ptr);

#endif