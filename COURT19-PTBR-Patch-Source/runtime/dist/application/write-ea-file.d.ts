import type { EaFileSnapshot } from '../domain/models.js';
import type { WriteFileOptions, WriteFileResult } from '../domain/write-models.js';
export declare function writeEaFile(sourcePath: string, outputPath: string, file: EaFileSnapshot, options?: WriteFileOptions): Promise<WriteFileResult>;
