import type { Fixture, StandingEntry } from '../../domain/career-models.js';
export declare const fixtureRecordSize = 22;
export declare function parseFixtures(bytes: Uint8Array, start: number, end: number, standings: readonly StandingEntry[], competitionIds: ReadonlySet<number>): Fixture[];
