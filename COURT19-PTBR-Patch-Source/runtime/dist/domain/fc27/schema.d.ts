import type { EaDatabase, EaField, EaFile, EaTable, MetadataField, MetadataSchema, MetadataTable, ReadFileOptions, ReadTemplateOptions } from '../models.js';
import type { TemplateDatabase } from '../templates.js';
import type { Fc27MainRecords, Fc27MainTableCodes } from './main.js';
import type { Fc27FutRecords, Fc27FutTableCodes } from './fut.js';
import type { Fc27LocalizationRecords, Fc27LocalizationTableCodes } from './localization.js';
type RecordsByDatabase = {
    main: Fc27MainRecords;
    fut: Fc27FutRecords;
    localization: Fc27LocalizationRecords;
};
type CodesByDatabase = {
    main: Fc27MainTableCodes;
    fut: Fc27FutTableCodes;
    localization: Fc27LocalizationTableCodes;
};
type DatabaseOption<D extends TemplateDatabase> = 'main' extends D ? {
    readonly database?: D;
} : {
    readonly database: D;
};
export type Fc27TableName<D extends TemplateDatabase = 'main'> = D extends TemplateDatabase ? keyof RecordsByDatabase[D] & string : never;
export type Fc27Record<N extends Fc27TableName<D>, D extends TemplateDatabase = 'main'> = D extends TemplateDatabase ? N extends keyof RecordsByDatabase[D] ? RecordsByDatabase[D][N] : never : never;
export type Fc27FieldName<N extends Fc27TableName<D>, D extends TemplateDatabase = 'main'> = Fc27Record<N, D> extends infer R ? R extends object ? keyof R & string : never : never;
export type Fc27TableShortName<D extends TemplateDatabase = 'main'> = D extends TemplateDatabase ? CodesByDatabase[D][keyof CodesByDatabase[D]] : never;
export type Fc27TableSelector<D extends TemplateDatabase = 'main'> = Fc27TableName<D> | Fc27TableShortName<D> | (string & {});
export type Fc27Table<D extends TemplateDatabase = 'main'> = D extends TemplateDatabase ? {
    [N in keyof RecordsByDatabase[D] & keyof CodesByDatabase[D] & string]: Omit<EaTable, 'name' | 'shortName' | 'records' | 'fields'> & {
        readonly name: N;
        readonly shortName: CodesByDatabase[D][N];
        readonly records: readonly RecordsByDatabase[D][N][];
        readonly fields: readonly (Omit<EaField, 'name'> & {
            readonly name: keyof RecordsByDatabase[D][N] & string;
        })[];
    };
}[keyof RecordsByDatabase[D] & keyof CodesByDatabase[D] & string] : never;
export type Fc27Database<D extends TemplateDatabase = 'main'> = Omit<EaDatabase, 'tables'> & {
    readonly tables: readonly Fc27Table<D>[];
};
export type Fc27File<D extends TemplateDatabase = 'main'> = Omit<EaFile, 'databases'> & {
    readonly databases: readonly Fc27Database<D>[];
};
type Fc27MetadataTable<D extends TemplateDatabase> = D extends TemplateDatabase ? {
    [N in keyof RecordsByDatabase[D] & keyof CodesByDatabase[D] & string]: Omit<MetadataTable, 'name' | 'shortName' | 'fields'> & {
        readonly name: N;
        readonly shortName: CodesByDatabase[D][N];
        readonly fields: readonly (Omit<MetadataField, 'name'> & {
            readonly name: keyof RecordsByDatabase[D][N] & string;
        })[];
    };
}[keyof RecordsByDatabase[D] & keyof CodesByDatabase[D] & string] : never;
export type Fc27Metadata<D extends TemplateDatabase = 'main'> = Omit<MetadataSchema, 'tables'> & {
    readonly tables: readonly Fc27MetadataTable<D>[];
};
export type Fc27ReadFileOptions<D extends TemplateDatabase = 'main'> = Omit<ReadFileOptions, 'version' | 'database' | 'metadata' | 'tables'> & DatabaseOption<D> & {
    readonly version: 'FC 27';
    readonly metadata?: never;
    readonly tables?: readonly Fc27TableSelector<D>[];
};
export type Fc27ReadTemplateOptions<D extends TemplateDatabase = 'main'> = Omit<ReadTemplateOptions, 'version' | 'database' | 'tables'> & DatabaseOption<D> & {
    readonly version: 'FC 27';
    readonly tables?: readonly Fc27TableSelector<D>[];
};
export {};
