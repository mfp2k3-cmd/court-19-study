import type { DecodeBudget } from '../../domain/limits.js';
import type { EaDatabase } from '../../domain/models.js';
export declare function encodeDatabase(sourceBytes: Uint8Array, database: EaDatabase, original: EaDatabase, fixedSize: boolean, budget: DecodeBudget): Uint8Array | undefined;
