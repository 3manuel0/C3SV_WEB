#ifndef _3MANSTR_H
#define _3MANSTR_H
#include "3mandef.h"

extern void *__builtin_memset(void *s, int c, size_t n);

size_t strlen(const char *s);

void *memcpy(void* dest, const void* src, size_t count);

void *memset(void * s, i32 c, size_t n);

#endif