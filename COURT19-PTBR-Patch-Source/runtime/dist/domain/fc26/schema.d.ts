import type { EaDatabase, EaField, EaFile, EaTable, MetadataField, MetadataSchema, MetadataTable, ReadFileOptions, ReadTemplateOptions } from '../models.js';
import type { TemplateDatabase } from '../templates.js';
import type { Fc26MainRecords, Fc26MainTableCodes } from './main.js';
import type { Fc26FutRecords, Fc26FutTableCodes } from './fut.js';
import type { Fc26LocalizationRecords, Fc26LocalizationTableCodes } from './localization.js';
type RecordsByDatabase = {
    main: Fc26MainRecords;
    fut: Fc26FutRecords;
    localization: Fc26LocalizationRecords;
};
type CodesByDatabase = {
    main: Fc26MainTableCodes;
    fut: Fc26FutTableCodes;
    localization: Fc26LocalizationTableCodes;
};
type DatabaseOption<D extends TemplateDatabase> = 'main' extends D ? {
    readonly database?: D;
} : {
    readonly database: D;
};
export type Fc26TableName<D extends TemplateDatabase = 'main'> = D extends TemplateDatabase ? keyof RecordsByDatabase[D] & string : never;
export type Fc26Record<N extends Fc26TableName<D>, D extends TemplateDatabase = 'main'> = D extends TemplateDatabase ? N extends keyof RecordsByDatabase[D] ? RecordsByDatabase[D][N] : never : never;
export type Fc26FieldName<N extends Fc26TableName<D>, D extends TemplateDatabase = 'main'> = Fc26Record<N, D> extends infer R ? R extends object ? keyof R & string : never : never;
export type Fc26TableShortName<D extends TemplateDatabase = 'main'> = D extends TemplateDatabase ? CodesByDatabase[D][keyof CodesByDatabase[D]] : never;
export type Fc26TableSelector<D extends TemplateDatabase = 'main'> = Fc26TableName<D> | Fc26TableShortName<D> | (string & {});
export type Fc26Table<D extends TemplateDatabase = 'main'> = D extends TemplateDatabase ? {
    [N in keyof RecordsByDatabase[D] & keyof CodesByDatabase[D] & string]: Omit<EaTable, 'name' | 'shortName' | 'records' | 'fields'> & {
        readonly name: N;
        readonly shortName: CodesByDatabase[D][N];
        readonly records: readonly RecordsByDatabase[D][N][];
        readonly fields: readonly (Omit<EaField, 'name'> & {
            readonly name: keyof RecordsByDatabase[D][N] & string;
        })[];
    };
}[keyof RecordsByDatabase[D] & keyof CodesByDatabase[D] & string] : never;
export type Fc26Database<D extends TemplateDatabase = 'main'> = Omit<EaDatabase, 'tables'> & {
    readonly tables: readonly Fc26Table<D>[];
};
export type Fc26File<D extends TemplateDatabase = 'main'> = Omit<EaFile, 'databases'> & {
    readonly databases: readonly Fc26Database<D>[];
};
type Fc26MetadataTable<D extends TemplateDatabase> = D extends TemplateDatabase ? {
    [N in keyof RecordsByDatabase[D] & keyof CodesByDatabase[D] & string]: Omit<MetadataTable, 'name' | 'shortName' | 'fields'> & {
        readonly name: N;
        readonly shortName: CodesByDatabase[D][N];
        readonly fields: readonly (Omit<MetadataField, 'name'> & {
            readonly name: keyof RecordsByDatabase[D][N] & string;
        })[];
    };
}[keyof RecordsByDatabase[D] & keyof CodesByDatabase[D] & string] : never;
export type Fc26Metadata<D extends TemplateDatabase = 'main'> = Omit<MetadataSchema, 'tables'> & {
    readonly tables: readonly Fc26MetadataTable<D>[];
};
export type Fc26ReadFileOptions<D extends TemplateDatabase = 'main'> = Omit<ReadFileOptions, 'version' | 'database' | 'metadata' | 'tables'> & DatabaseOption<D> & {
    readonly version: 'FC 26';
    readonly metadata?: never;
    readonly tables?: readonly Fc26TableSelector<D>[];
};
export type Fc26ReadTemplateOptions<D extends TemplateDatabase = 'main'> = Omit<ReadTemplateOptions, 'version' | 'database' | 'tables'> & DatabaseOption<D> & {
    readonly version: 'FC 26';
    readonly tables?: readonly Fc26TableSelector<D>[];
};
export {};
