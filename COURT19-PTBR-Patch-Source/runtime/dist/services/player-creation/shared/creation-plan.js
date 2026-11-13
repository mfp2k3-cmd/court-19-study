import { EaFileError } from '../../../domain/errors.js';
import { RecordCreationPlan, validateValue as validateMappedValue } from '../../shared/record-creation-plan.js';
export { emptyRecord, integerRange } from '../../shared/record-creation-plan.js';
export function creationFailure(message) {
    throw new EaFileError('INVALID_PLAYER_CREATION', message);
}
export function validateValue(table, field, value) {
    validateMappedValue(table, field, value, creationFailure);
}
export class CreationPlan extends RecordCreationPlan {
    constructor() { super('INVALID_PLAYER_CREATION'); }
}
