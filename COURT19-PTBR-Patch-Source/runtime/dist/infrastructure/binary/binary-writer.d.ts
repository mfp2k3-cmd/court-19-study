import type { Endianness } from '../../domain/models.js';
export declare class BinaryWriter {
    readonly bytes: Uint8Array;
    private readonly view;
    private readonly little;
    constructor(bytes: Uint8Array, endianness: Endianness);
    u16(offset: number, value: number): void;
    u32(offset: number, value: number): void;
    i32(offset: number, value: number): void;
    f32(offset: number, value: number): void;
    integer(recordOffset: number, bitOffset: number, depth: number, value: number, rangeLow: number): void;
}
