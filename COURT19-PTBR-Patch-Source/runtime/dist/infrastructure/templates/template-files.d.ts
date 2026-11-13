import type { EaFcVersion, TemplateDatabase } from '../../domain/templates.js';
export declare function resolveTemplateFiles(version: EaFcVersion, database?: TemplateDatabase): {
    databasePath: string;
    xmlPath: string;
};
