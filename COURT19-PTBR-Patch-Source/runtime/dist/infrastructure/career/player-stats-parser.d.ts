import type { PlayerCompetitionStats } from '../../domain/career-models.js';
export declare const playerStatsRecordSize = 73;
export declare function parsePlayerStats(bytes: Uint8Array, start: number, end: number): PlayerCompetitionStats[];
