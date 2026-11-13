import type { FifaDatabaseFile, FifaReadOptions } from '../../domain/fifa-models.js';
export declare function readFifaDatabase(databasePath: string, xmlPath: string, options?: FifaReadOptions): Promise<FifaDatabaseFile>;
