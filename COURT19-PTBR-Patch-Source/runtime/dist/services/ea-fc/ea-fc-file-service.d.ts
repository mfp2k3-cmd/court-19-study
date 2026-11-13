import { loadTemplateMetadata } from '../../application/load-template-metadata.js';
import { parseCareerData } from '../../application/parse-career-data.js';
import { parseEaFile } from '../../application/parse-ea-file.js';
import { readCareerData } from '../../application/read-career-data.js';
import { readEaFile } from '../../application/read-ea-file.js';
import { readTemplateDatabase } from '../../application/read-template-database.js';
import { serializeEaFile } from '../../application/serialize-ea-file.js';
import { writeEaFile } from '../../application/write-ea-file.js';
export declare class EaFcFileService {
    readonly parse: typeof parseEaFile;
    readonly read: typeof readEaFile;
    readonly serialize: typeof serializeEaFile;
    readonly write: typeof writeEaFile;
    readonly readTemplate: typeof readTemplateDatabase;
    readonly loadMetadata: typeof loadTemplateMetadata;
    readonly parseCareer: typeof parseCareerData;
    readonly readCareer: typeof readCareerData;
}
export declare const eaFcFileService: EaFcFileService;
