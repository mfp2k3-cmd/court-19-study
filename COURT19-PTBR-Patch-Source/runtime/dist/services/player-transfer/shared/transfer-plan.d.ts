import type { EaRecord, EaTable } from '../../../domain/models.js';
import type { TransferTableChange } from '../../../domain/transfer-models.js';
export declare function transferFailure(message: string): never;
export declare function integerField(table: EaTable, name: string, value: number): void;
export declare class TransferPlan {
    private readonly edits;
    private readonly removals;
    row(table: EaTable, original: EaRecord): EaRecord;
    set(table: EaTable, original: EaRecord, name: string, value: number): void;
    remove(table: EaTable, original: EaRecord): void;
    commit(): readonly TransferTableChange[];
}
