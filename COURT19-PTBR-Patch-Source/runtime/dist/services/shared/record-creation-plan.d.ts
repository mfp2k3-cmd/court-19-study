import { type EaFileErrorCode } from '../../domain/errors.js';
import type { EaField, EaRecord, EaTable, RecordValue } from '../../domain/models.js';
export declare function integerRange(field: EaField): readonly [number, number];
export declare function validateValue(table: EaTable, field: EaField, value: RecordValue | undefined, fail: (message: string) => never): void;
export declare function emptyRecord(table: EaTable): EaRecord;
export declare class RecordCreationPlan {
    private readonly errorCode;
    constructor(errorCode: EaFileErrorCode);
    private fail;
    private readonly edits;
    records(table: EaTable): readonly EaRecord[];
    private edit;
    insert(table: EaTable, values: EaRecord): void;
    update(table: EaTable, original: EaRecord, values: EaRecord): void;
    private validate;
    finish(apply: boolean): readonly {
        name: string;
        addedRecords: number;
        updatedRecords: number;
    }[];
}
