import type { CareerSection } from '../../domain/career-models.js';
export declare function findCareerSections(bytes: Uint8Array): CareerSection[];
export declare function sectionBounds(sections: readonly CareerSection[], name: string): {
    start: number;
    end: number;
} | undefined;
