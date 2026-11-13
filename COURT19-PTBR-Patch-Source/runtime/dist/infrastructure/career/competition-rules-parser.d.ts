import type { CompetitionSetting, CompetitionTask } from '../../domain/career-models.js';
export declare const settingRecordSize = 9;
export declare const taskRecordSize = 19;
export declare function parseCompetitionSettings(bytes: Uint8Array, start: number, end: number): CompetitionSetting[];
export declare function parseCompetitionTasks(bytes: Uint8Array, start: number, end: number): CompetitionTask[];
