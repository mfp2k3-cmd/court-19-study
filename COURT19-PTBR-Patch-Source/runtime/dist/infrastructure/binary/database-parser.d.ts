import type { DecodeBudget } from '../../domain/limits.js';
import type { EaDatabase, EaWarning } from '../../domain/models.js';
import type { IndexedTable } from '../metadata/schema-index.js';
export declare function hasDatabaseSignature(bytes: Uint8Array, offset: number): boolean;
export declare function findDatabase(bytes: Uint8Array, start: number): number;
export declare function parseDatabase(bytes: Uint8Array, start: number, index: number, metadata: ReadonlyMap<string, IndexedTable>, budget: DecodeBudget, warnings: EaWarning[], selectedTables?: ReadonlySet<string>): EaDatabase;
