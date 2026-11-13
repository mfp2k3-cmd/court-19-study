import type { CareerData, CareerParseOptions } from '../domain/career-models.js';
export declare function readCareerData(path: string, options?: CareerParseOptions): Promise<CareerData>;
