import type { EaRecord, EaTable } from '../../../domain/models.js';
import { TransferPlan } from './transfer-plan.js';
export declare const baseRoles: readonly ['captainid', 'penaltytakerid', 'freekicktakerid', 'leftfreekicktakerid', 'rightfreekicktakerid', 'leftcornerkicktakerid', 'rightcornerkicktakerid', 'longkicktakerid', 'cksupport1', 'cksupport2', 'cksupport3'];
export declare const extendedRoles: readonly ["captainid", "penaltytakerid", "freekicktakerid", "leftfreekicktakerid", "rightfreekicktakerid", "leftcornerkicktakerid", "rightcornerkicktakerid", "longkicktakerid", "cksupport1", "cksupport2", "cksupport3", "cksupport4", "cksupport5", "cksupport6", "cksupport7", "cksupport8", "cksupport9", "throwerleft", "throwerright"];
export declare function clearRoles(plan: TransferPlan, table: EaTable, original: EaRecord, playerId: number, roles: readonly string[], replacement: number | undefined): void;
export declare function updateTeamSheets(plan: TransferPlan, tables: readonly EaTable[], playerId: number, sourceTeamId: number, targetTeamId: number, remaining: readonly number[], roles: readonly string[], positions: ReadonlyMap<number, number>): number | undefined;
