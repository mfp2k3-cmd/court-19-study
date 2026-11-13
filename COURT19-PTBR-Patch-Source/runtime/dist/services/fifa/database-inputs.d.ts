export declare function fifaOptions(options: object, allowed: readonly string[]): void;
export declare function fifaPath(path: string, name: string): void;
export declare function readFifaInputs(databasePath: string, xmlPath: string, maxBytes: number): Promise<{
    bytes: Uint8Array;
    xml: string;
}>;
