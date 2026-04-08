#include "includes/csv.h"
#include "includes/lib3man.h"
#include <stddef.h>

size_t size_of_sv(void){
    return sizeof(sv);
}

string_view *test(void *ptr, size_t size){
    if(ptr == NULL){
        jsprintf("fileptr is NULL\n");
        return NULL;
    } 
    FILE *f = fopen(ptr, size);
    CSV *csv = load_csv(f);
    csv_print_types(csv);
    for(size_t i = 0; i < csv->numrows; i++)
        csv_print_row(csv->data[i], csv->types, csv->numcols);
    
    f32 s = 10.5f;
    jsprintf("\ncsv is at address:%d %d %g %d test\n", csv, CURRENT_PTR, s, 500);
    return csv->head;
}