import type { EaFileSnapshot } from '../domain/models.js';
import type { SerializeOptions } from '../domain/write-models.js';
export declare function serializeEaFile(sourceBytes: Uint8Array, file: EaFileSnapshot, options?: SerializeOptions): Uint8Array;
