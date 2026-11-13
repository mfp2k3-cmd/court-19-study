import type { FifaDatabaseSnapshot, FifaWriteOptions } from '../../domain/fifa-models.js';
import type { WriteFileResult } from '../../domain/write-models.js';
export declare function writeFifaDatabase(databasePath: string, xmlPath: string, outputPath: string, file: FifaDatabaseSnapshot, options?: FifaWriteOptions): Promise<WriteFileResult>;
