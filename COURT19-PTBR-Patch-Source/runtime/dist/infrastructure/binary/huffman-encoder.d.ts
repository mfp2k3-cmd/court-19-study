import type { DecodeBudget } from '../../domain/limits.js';
export interface PoolString {
    readonly value: string;
    readonly long: boolean;
}
export interface StringPool {
    readonly bytes: Uint8Array;
    readonly pointers: ReadonlyMap<string, number>;
}
export declare function stringKey(value: string, long: boolean): string;
export declare function encodeStringPool(strings: readonly PoolString[], bigEndian: boolean, budget: DecodeBudget): StringPool;
