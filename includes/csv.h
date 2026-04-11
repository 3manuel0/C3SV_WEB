#ifndef CSV_H
#define CSV_H
#include "lib3man.h"


typedef enum { string_ = 1, float64_, int64_, boolean_ } csv_type;

typedef struct {
  string_view *head;
  csv_type *types;
  void **data; // maybe void * is better for infering the types later
  size_t numrows;
  size_t numcols;
  ArenaList *gl_arena;
} CSV;

CSV *create_csv(); // creates an empty csv struct in memory

CSV *load_csv(FILE * file);// load with types (only int and float 64bit)

void csv_free(CSV *csv); // free csv in memory

void csv_print_head(const CSV *csv);// prints head

void csv_print_row(const void *row, csv_type * row_types, size_t numcolumns);

void csv_print_types(const CSV *csv);

void csv_print_column_from_string(const CSV *csv, string_view column_name);

void csv_write_file(void *address, size_t size, const CSV *csv); // write a csv file 

ssize_t csv_get_column_index(const CSV *csv, string_view name); // returns -1 if it doesn't find the column name

i32 csv_write_json(const CSV *csv);// writes a json files from a csv in memory

i64 csv_get_int_by_name(const CSV *csv, size_t row, string_view col_name);// returns an int64 based on a given header string_view

f64 csv_get_float_by_name(const CSV *csv,size_t row, string_view col_name);// returns a float64 based on a given header string_view

string_view csv_get_sv_by_name(const CSV *csv, size_t row, string_view col_name);// returns a string_view based on a given header string_view

int64_t csv_column_sum_int(const CSV* csv, size_t col_index); // return the sum of a column as an int64

f64 csv_column_sum_float(const CSV* csv, size_t col_index); // return the sum of a column as a float64

f64 csv_column_mean(const CSV* csv, size_t col_index);// return the mean of a column as a float64

f64 csv_column_min(const CSV* csv, size_t col_index);// return the mean of a column as a float64

f64 csv_column_max(const CSV* csv, size_t col_index);// return the mean of a column as a float64

size_t csv_column_count(const CSV *csv);// returns number of rows in a, if error returns 0

size_t csv_row_count(const CSV *csv); // returns number of columns in a csv, if error returns 0

void * csv_get_cell(const CSV *csv, size_t row, size_t col);// returns a pointer to a (cell) else return NULL

string_view csv_column_name(const CSV* csv, size_t column);





void print_type(csv_type t);// to remove later, just prints a type


#endif