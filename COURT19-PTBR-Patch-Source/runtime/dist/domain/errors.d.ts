export type EaFileErrorCode = 'INVALID_OPTIONS' | 'FILE_READ_FAILED' | 'INVALID_METADATA' | 'INVALID_FORMAT' | 'TRUNCATED_FILE' | 'UNSUPPORTED_FIELD_TYPE' | 'INVALID_COMPRESSED_STRING' | 'INVALID_WRITE' | 'FILE_WRITE_FAILED' | 'LIMIT_EXCEEDED' | 'INVALID_TRANSFER' | 'INVALID_PLAYER_CREATION' | 'INVALID_CLUB_CREATION' | 'UNSUPPORTED_OPERATION';
export declare class EaFileError extends Error {
    readonly code: EaFileErrorCode;
    readonly offset: number | undefined;
    constructor(code: EaFileErrorCode, message: string, offset?: number, cause?: unknown);
    toJSON(): {
        code: EaFileErrorCode;
        message: string;
        offset: number | null;
    };
}
