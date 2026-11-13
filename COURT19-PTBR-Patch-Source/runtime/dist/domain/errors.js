export class EaFileError extends Error {
    code;
    offset;
    constructor(code, message, offset, cause) {
        super(message, cause === undefined ? undefined : { cause });
        this.name = 'EaFileError';
        this.code = code;
        this.offset = offset;
    }
    toJSON() {
        return { code: this.code, message: this.message, offset: this.offset ?? null };
    }
}
