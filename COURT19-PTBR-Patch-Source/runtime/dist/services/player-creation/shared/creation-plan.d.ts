import type { EaField, EaTable, RecordValue } from '../../../domain/models.js';
import { RecordCreationPlan } from '../../shared/record-creation-plan.js';
export { emptyRecord, integerRange } from '../../shared/record-creation-plan.js';
export declare function creationFailure(message: string): never;
export declare function validateValue(table: EaTable, field: EaField, value: RecordValue | undefined): void;
export declare class CreationPlan extends RecordCreationPlan {
    constructor();
}
