import type { EaDatabase, EaField, EaFile, EaTable, MetadataField, MetadataSchema, MetadataTable, ReadFileOptions, ReadTemplateOptions } from '../models.js';
import type { TemplateDatabase } from '../templates.js';
import type { Fc25MainRecords, Fc25MainTableCodes } from './main.js';
import type { Fc25FutRecords, Fc25FutTableCodes } from './fut.js';
import type { Fc25LocalizationRecords, Fc25LocalizationTableCodes } from './localization.js';
type RecordsByDatabase = {
    main: Fc25MainRecords;
    fut: Fc25FutRecords;
    localization: Fc25LocalizationRecords;
};
type CodesByDatabase = {
    main: Fc25MainTableCodes;
    fut: Fc25FutTableCodes;
    localization: Fc25LocalizationTableCodes;
};
type DatabaseOption<D extends TemplateDatabase> = 'main' extends D ? {
    readonly database?: D;
} : {
    readonly database: D;
};
export type Fc25TableName<D extends TemplateDatabase = 'main'> = D extends TemplateDatabase ? keyof RecordsByDatabase[D] & string : never;
export type Fc25Record<N extends Fc25TableName<D>, D extends TemplateDatabase = 'main'> = D extends TemplateDatabase ? N extends keyof RecordsByDatabase[D] ? RecordsByDatabase[D][N] : never : never;
export type Fc25FieldName<N extends Fc25TableName<D>, D extends TemplateDatabase = 'main'> = Fc25Record<N, D> extends infer R ? R extends object ? keyof R & string : never : never;
export type Fc25TableShortName<D extends TemplateDatabase = 'main'> = D extends TemplateDatabase ? CodesByDatabase[D][keyof CodesByDatabase[D]] : never;
export type Fc25TableSelector<D extends TemplateDatabase = 'main'> = Fc25TableName<D> | Fc25TableShortName<D> | (string & {});
export type Fc25Table<D extends TemplateDatabase = 'main'> = D extends TemplateDatabase ? {
    [N in keyof RecordsByDatabase[D] & keyof CodesByDatabase[D] & string]: Omit<EaTable, 'name' | 'shortName' | 'records' | 'fields'> & {
        readonly name: N;
        readonly shortName: CodesByDatabase[D][N];
        readonly records: readonly RecordsByDatabase[D][N][];
        readonly fields: readonly (Omit<EaField, 'name'> & {
            readonly name: keyof RecordsByDatabase[D][N] & string;
        })[];
    };
}[keyof RecordsByDatabase[D] & keyof CodesByDatabase[D] & string] : never;
export type Fc25Database<D extends TemplateDatabase = 'main'> = Omit<EaDatabase, 'tables'> & {
    readonly tables: readonly Fc25Table<D>[];
};
export type Fc25File<D extends TemplateDatabase = 'main'> = Omit<EaFile, 'databases'> & {
    readonly databases: readonly Fc25Database<D>[];
};
type Fc25MetadataTable<D extends TemplateDatabase> = D extends TemplateDatabase ? {
    [N in keyof RecordsByDatabase[D] & keyof CodesByDatabase[D] & string]: Omit<MetadataTable, 'name' | 'shortName' | 'fields'> & {
        readonly name: N;
        readonly shortName: CodesByDatabase[D][N];
        readonly fields: readonly (Omit<MetadataField, 'name'> & {
            readonly name: keyof RecordsByDatabase[D][N] & string;
        })[];
    };
}[keyof RecordsByDatabase[D] & keyof CodesByDatabase[D] & string] : never;
export type Fc25Metadata<D extends TemplateDatabase = 'main'> = Omit<MetadataSchema, 'tables'> & {
    readonly tables: readonly Fc25MetadataTable<D>[];
};
export type Fc25ReadFileOptions<D extends TemplateDatabase = 'main'> = Omit<ReadFileOptions, 'version' | 'database' | 'metadata' | 'tables'> & DatabaseOption<D> & {
    readonly version: 'FC 25';
    readonly metadata?: never;
    readonly tables?: readonly Fc25TableSelector<D>[];
};
export type Fc25ReadTemplateOptions<D extends TemplateDatabase = 'main'> = Omit<ReadTemplateOptions, 'version' | 'database' | 'tables'> & DatabaseOption<D> & {
    readonly version: 'FC 25';
    readonly tables?: readonly Fc25TableSelector<D>[];
};
export {};
