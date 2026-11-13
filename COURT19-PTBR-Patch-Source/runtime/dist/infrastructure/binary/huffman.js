import { EaFileError } from '../../domain/errors.js';
import { BinaryReader } from './binary-reader.js';
export class HuffmanDecoder {
    reader;
    base;
    treeSize;
    nodeCount;
    budget;
    longLengthLittle;
    constructor(reader, base, length, treeSize, budget, longLengthLittle) {
        this.reader = new BinaryReader(reader.bytes, 'little', base, base + length);
        this.base = base;
        this.treeSize = treeSize;
        this.nodeCount = treeSize / 4;
        this.budget = budget;
        this.longLengthLittle = longLengthLittle;
        if (treeSize % 4 !== 0 || treeSize > 1024 || treeSize < 0 || treeSize > length) {
            throw new EaFileError('INVALID_COMPRESSED_STRING', 'Invalid Huffman tree size.', base);
        }
        this.validateTree();
    }
    read(relativeOffset, long) {
        if (relativeOffset === -1)
            return '';
        const offset = this.base + relativeOffset;
        if (relativeOffset < this.treeSize) {
            throw new EaFileError('INVALID_COMPRESSED_STRING', 'String pointer points inside the Huffman tree.', offset);
        }
        this.reader.ensure(offset, long ? 2 : 1);
        const length = long
            ? (this.longLengthLittle
                ? this.reader.u8(offset) + this.reader.u8(offset + 1) * 256
                : this.reader.u8(offset) * 256 + this.reader.u8(offset + 1))
            : this.reader.u8(offset);
        this.budget.addString(length, offset);
        if (length === 0)
            return '';
        let cursor = offset + (long ? 2 : 1);
        if (this.nodeCount === 0)
            return this.reader.text(cursor, length);
        const output = new Uint8Array(length);
        let written = 0;
        let node = 0;
        while (written < length) {
            const byte = this.reader.u8(cursor++);
            for (let bit = 7; bit >= 0 && written < length; bit--) {
                const branch = (byte >>> bit) & 1;
                const childOffset = this.base + node * 4 + branch * 2;
                const child = this.reader.u8(childOffset);
                if (child === 0) {
                    output[written++] = this.reader.u8(childOffset + 1);
                    node = 0;
                }
                else {
                    node = child;
                }
            }
        }
        return new TextDecoder('utf-8').decode(output);
    }
    validateTree() {
        const visiting = new Set();
        const visited = new Set();
        const visit = (node) => {
            if (node >= this.nodeCount || visiting.has(node)) {
                throw new EaFileError('INVALID_COMPRESSED_STRING', 'Huffman tree contains a cycle or an invalid child reference.', this.base + node * 4);
            }
            if (visited.has(node))
                return;
            visiting.add(node);
            for (const branch of [0, 1]) {
                const child = this.reader.u8(this.base + node * 4 + branch * 2);
                if (child !== 0)
                    visit(child);
            }
            visiting.delete(node);
            visited.add(node);
        };
        if (this.nodeCount > 0)
            visit(0);
    }
}
