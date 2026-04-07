#ifndef _3MANIO_H
#define _3MANIO_H
#include "3mandef.h"

#define SEEK_SET	0	//offset is relative to the beginning of the file.
#define SEEK_CUR	1	//offset is relative to the current cursor position.
#define SEEK_END	2	//offset is relative to the end of the file.

typedef struct FILE{
  u8 *f_ptr;
  size_t offset;
  size_t size;
  i32 fdesc;
}FILE;

extern FILE *stdout;
extern FILE * stderr;

FILE *fopen(void *address, size_t size);

i32 fclose(FILE *stream);

i32 fgetc(FILE *stream);

i32 ftell(FILE *stream);

i32 fseek(FILE *stream, ssize_t off, i32 whence);

size_t fwrite( const void* buffer, size_t size, size_t count,
               FILE* stream );

int jsprintf(const char * t, ...);

int fprintf(FILE *stream, const char *__restrict format, ...); // maybe I don't need fprintf


#endif