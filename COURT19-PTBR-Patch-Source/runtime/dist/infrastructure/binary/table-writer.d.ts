import type { DecodeBudget } from '../../domain/limits.js';
import type { EaField, EaRecord, EaTable, Endianness, RecordValue } from '../../domain/models.js';
export declare function validateTableSchema(table: EaTable, original: EaTable): void;
export declare function recordValue(original: EaRecord, field: EaField): RecordValue;
export declare function tableChanged(table: EaTable, original: EaTable): boolean;
export declare function reserveUnchangedTable(bytes: Uint8Array, table: EaTable, endianness: Endianness, budget: DecodeBudget): void;
export declare function encodeTable(sourceBytes: Uint8Array, table: EaTable, original: EaTable, endianness: Endianness, budget: DecodeBudget): Uint8Array;
