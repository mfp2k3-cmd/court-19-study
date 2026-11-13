import type { StandingEntry } from '../../domain/career-models.js';
export declare const standingRecordSize = 23;
export declare function parseStandings(bytes: Uint8Array, start: number, end: number): StandingEntry[];
