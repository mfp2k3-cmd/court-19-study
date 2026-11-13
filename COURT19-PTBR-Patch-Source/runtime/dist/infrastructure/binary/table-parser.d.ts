import type { DecodeBudget } from '../../domain/limits.js';
import type { EaTable, EaWarning, Endianness } from '../../domain/models.js';
import type { IndexedTable } from '../metadata/schema-index.js';
export declare function parseTable(bytes: Uint8Array, endian: Endianness, shortName: string, start: number, end: number, metadata: IndexedTable | undefined, budget: DecodeBudget, warnings: EaWarning[]): EaTable;
