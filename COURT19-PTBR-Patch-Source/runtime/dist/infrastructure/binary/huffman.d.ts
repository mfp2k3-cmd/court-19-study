import type { DecodeBudget } from '../../domain/limits.js';
import { BinaryReader } from './binary-reader.js';
export declare class HuffmanDecoder {
    private readonly reader;
    private readonly base;
    private readonly treeSize;
    private readonly nodeCount;
    private readonly budget;
    private readonly longLengthLittle;
    constructor(reader: BinaryReader, base: number, length: number, treeSize: number, budget: DecodeBudget, longLengthLittle: boolean);
    read(relativeOffset: number, long: boolean): string;
    private validateTree;
}
