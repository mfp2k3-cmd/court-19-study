import type { StandingEntry } from '../domain/career-models.js';
export interface RankedStanding extends StandingEntry {
    readonly position: number;
    readonly played: number;
    readonly wins: number;
    readonly draws: number;
    readonly losses: number;
    readonly goalsFor: number;
    readonly goalsAgainst: number;
    readonly goalDifference: number;
}
export declare function rankStandings(standings: readonly StandingEntry[], groupId: number): RankedStanding[];
