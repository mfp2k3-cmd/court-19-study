import type { FifaDatabaseSnapshot, FifaSerializeOptions } from '../../domain/fifa-models.js';
export declare function serializeFifaDatabase(bytes: Uint8Array, xml: string, file: FifaDatabaseSnapshot, options?: FifaSerializeOptions): Uint8Array;
