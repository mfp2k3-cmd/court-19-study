import type { Endianness } from '../../domain/models.js';
export declare class BinaryReader {
    readonly bytes: Uint8Array;
    readonly start: number;
    readonly end: number;
    private readonly view;
    private readonly little;
    constructor(bytes: Uint8Array, endianness?: Endianness, start?: number, end?: number);
    ensure(offset: number, length: number): void;
    u8(offset: number): number;
    u16(offset: number): number;
    u32(offset: number): number;
    i32(offset: number): number;
    f32(offset: number): number;
    slice(offset: number, length: number): Uint8Array;
    text(offset: number, length: number, nullPadded?: boolean): string;
    integer(recordOffset: number, bitOffset: number, depth: number, rangeLow: number): number;
}
