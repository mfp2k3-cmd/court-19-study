import type { EaDatabase, ReadLimits } from '../../domain/models.js';
import { type IndexedTable } from './schema-index.js';
export declare function fifaMetadata(xml: string, maxBytes: number): ReadonlyMap<string, IndexedTable>;
export declare function inspectFifaDatabase(bytes: Uint8Array, metadata: ReadonlyMap<string, IndexedTable>, limits: ReadLimits): EaDatabase;
export declare function validateFifaRecordMapping(database: EaDatabase, metadata: ReadonlyMap<string, IndexedTable>): void;
