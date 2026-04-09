#include "includes/csv.h"
#include "includes/lib3man.h"
#include <stddef.h>

size_t size_of_sv(void){
    return sizeof(sv);
}

CSV *test(void *ptr, size_t size){
    if(ptr == NULL){
        jsprintf("fileptr is NULL\n");
        return NULL;
    } 
    FILE *f = fopen(ptr, size);
    CSV *csv = load_csv(f);
    csv_print_types(csv);
    for(size_t i = 0; i < csv->numrows; i++)
        csv_print_row(csv->data[i], csv->types, csv->numcols);
    jsprintf("types* = %d\n", csv->types);
    
    f32 s = 10.5f;
    jsprintf("\ncsv is at address:%d %d %g %d test\n", csv, CURRENT_PTR, s, 500);
    return csv;
}

size_t csv_get_numcol(CSV *csv){
    return (csv->numcols);
}

size_t csv_get_numrow(CSV *csv){
    return (csv->numrows);
}

sv * csv_data_ptr(CSV *csv, size_t row, size_t col){
    return &((sv**)csv->data)[row][col];
}
void **csv_data(CSV *csv){
    return csv->data;
}