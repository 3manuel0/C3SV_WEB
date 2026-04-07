# Compiler / tools
CC = clang
AR = llvm-ar

CFLAGS = -fno-builtin --target=wasm32 -ffast-math -O3 \
         --no-standard-libraries -I./include -DPLATFORM_WEB

LDFLAGS = --target=wasm32 -fno-builtin -ffast-math -O3 \
          --no-standard-libraries -I./include \
          -Wl,--export-all -Wl,--no-entry -Wl,--allow-undefined \
          -DPLATFORM_WEB

LIB_MAN = lib/lib3wasm.a

CSV_SRC = src/csv.c
CSV_OBJ = src/csv.o
LIB_CSV = lib/lib3csv.a

TARGET = build/main.wasm

all: $(TARGET)

src/csv.o: src/csv.c
	$(CC) $(CFLAGS) -c $< -o $@

$(LIB_CSV): $(CSV_OBJ)
	$(AR) rcs $(LIB_CSV) $(CSV_OBJ)


$(TARGET): main.c $(LIB_CSV)
	$(CC) $(LDFLAGS) main.c $(LIB_CSV) $(LIB_MAN) -o $(TARGET)

clean:
	rm -f src/csv.o $(LIB_CSV) $(TARGET)