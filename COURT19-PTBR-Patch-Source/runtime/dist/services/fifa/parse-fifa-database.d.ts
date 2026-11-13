import type { FifaDatabaseFile, FifaParseOptions } from '../../domain/fifa-models.js';
export declare function parseFifaDatabase(bytes: Uint8Array, xml: string, options?: FifaParseOptions): FifaDatabaseFile;
