import type { MetadataField, MetadataSchema, MetadataTable } from '../../domain/models.js';
export interface IndexedTable {
    readonly definition: MetadataTable;
    readonly fields: ReadonlyMap<string, MetadataField>;
}
export declare function indexMetadata(schema?: MetadataSchema): ReadonlyMap<string, IndexedTable>;
