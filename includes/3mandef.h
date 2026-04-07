
#ifndef _3MANDEF_H
#define _3MANDEF_H
#include <stdint.h>

typedef __SIZE_TYPE__ size_t; //size_t from clang 
typedef __PTRDIFF_TYPE__ ssize_t; //size_t from clang 
typedef uint8_t  u8;
typedef uint16_t u16;
typedef uint32_t u32;
typedef uint64_t u64;
typedef int8_t   i8;
typedef int16_t  i16;
typedef int32_t  i32;
typedef int64_t  i64;
typedef float    f32;
typedef double   f64;

#define false 0
#define true 1
#define NULL ((void *)0)

#endif