#include "includes/3mandef.h"
#include "includes/csv.h"
#include "includes/wasm_mem.h"

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