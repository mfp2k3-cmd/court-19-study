import type { ReadLimits } from './models.js';
export declare const DEFAULT_LIMITS: Readonly<ReadLimits>;
export declare function resolveLimits(overrides?: Partial<ReadLimits>): ReadLimits;
export declare class DecodeBudget {
    private records;
    private values;
    private stringBytes;
    readonly limits: ReadLimits;
    constructor(limits: ReadLimits);
    addRecords(records: number, fields: number, offset: number): void;
    addString(bytes: number, offset: number): void;
}
