import type { EaFileSnapshot } from '../../domain/models.js';
import type { FileOperations, PlayerTransferProfile } from '../../domain/transfer-models.js';
export declare function withFileOperations<T extends EaFileSnapshot>(file: T, profile?: PlayerTransferProfile): T & FileOperations;
