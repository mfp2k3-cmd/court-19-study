import type { EaDatabase, EaRecord, EaTable, RecordValue } from '../../../domain/models.js';
import { RecordCreationPlan } from '../../shared/record-creation-plan.js';
export { emptyRecord } from '../../shared/record-creation-plan.js';
export declare function clubFailure(message: string): never;
export declare class ClubPlan extends RecordCreationPlan {
    constructor();
}
export declare function clubTable(database: EaDatabase, name: string): EaTable;
export declare function clubKey(plan: ClubPlan, table: EaTable, name: string, requested?: number, reserved?: ReadonlySet<number>, count?: number): number;
export declare function reservedClubIds(database: EaDatabase): ReadonlySet<number>;
export declare function clubFields(table: EaTable, row: EaRecord, fields: Readonly<Record<string, RecordValue>> | undefined, managed: ReadonlySet<string>): void;
export declare function setClubValue(row: EaRecord, name: string, value: string | number): void;
