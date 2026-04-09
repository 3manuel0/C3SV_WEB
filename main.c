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
    csv_write_json(csv);
    jsprintf("\n");
    csv_print_types(csv);
    jsprintf("csv is at address: %d CURRENT_PTR: %d\n", csv, CURRENT_PTR);
    return csv;
}

size_t csv_get_numcol(CSV *csv){
    return (csv->numcols);
}

size_t csv_get_numrow(CSV *csv){
    return (csv->numrows);
}

void * csv_data_ptr(CSV *csv, size_t row, size_t col){
    if(csv->types[col] == string_)
        return &((sv**)csv->data)[row][col];
    else if (csv->types[col] == int64_)
        return &((i64**)csv->data)[row][col];
    else if (csv->types[col] == float64_)
        return &((f64**)csv->data)[row][col];
    return NULL;
}
void **csv_data(CSV *csv){
    return csv->data;
}