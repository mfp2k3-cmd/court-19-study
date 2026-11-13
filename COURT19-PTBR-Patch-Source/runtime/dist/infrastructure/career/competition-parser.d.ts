import type { CompetitionNode } from '../../domain/career-models.js';
export declare const competitionRecordSize = 49;
export declare function parseCompetitions(bytes: Uint8Array, start: number, end: number): CompetitionNode[];
