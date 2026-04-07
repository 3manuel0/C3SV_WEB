#include "includes/csv.h"

int test(void *ptr, size_t size){
    if(ptr == NULL){
        jsprintf("fileptr is NULL\n");
        return 0;
    } 
    FILE *f = fopen(ptr, size);
    CSV *csv = create_csv();
    for(int i = 0; i < size; i++){
        jsprintf("%c", fgetc(f));
    }
    jsprintf("\ncsv is at address: %d %d\n", csv, CURRENT_PTR);
    return 1;
}