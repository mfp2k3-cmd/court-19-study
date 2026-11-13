import type { EaDatabase, EaFileSnapshot, ReadLimits } from './models.js';
import type { FileOperations } from './transfer-models.js';
export interface FifaDatabaseSnapshot extends EaFileSnapshot {
    readonly format: 'fifa-db';
    readonly source: EaFileSnapshot['source'] & {
        readonly kind: 'database';
    };
    readonly container: 'database';
    readonly inGameName: null;
    readonly metadataComplete: true;
    readonly databases: readonly [EaDatabase];
}
export interface FifaDatabaseFile extends FifaDatabaseSnapshot, FileOperations {
}
export interface FifaParseOptions {
    readonly fileName?: string;
    readonly tables?: readonly string[];
    readonly limits?: Partial<ReadLimits>;
}
export type FifaReadOptions = FifaParseOptions;
export interface FifaSerializeOptions {
    readonly limits?: Partial<ReadLimits>;
}
export interface FifaWriteOptions extends FifaSerializeOptions {
    readonly overwrite?: boolean;
}
