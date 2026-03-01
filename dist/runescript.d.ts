/* tslint:disable */
/* eslint-disable */

export declare function CompileServerScript(config?: {
    sourcePaths?: string[];
    symbols?: Record<string, CompilerTypeInfo>;
    excludePaths?: string[];
    checkPointers?: boolean;
    features?: StrictFeatureLevel;
    writer?: {
        jag?: {
            output: string;
        };
        js5?: {
            output: string;
        };
    };
}): void;

export declare type StrictFeatureLevel = {
    booleans?: boolean;
    procs?: boolean;
    macros?: boolean;
    enums?: boolean;
    structs?: boolean;
    dbtables?: boolean;
    logicalAnd?: boolean;
    relationalEquals?: boolean;
    queueTyped?: boolean;
    topLevelDefOnly?: boolean;
    pointerInversion?: boolean;
};

export declare type CompilerTypeInfo = {
    max: number;
    map: Record<string, string>;

    // info for some configs
    vartype: Record<string, string>;
    protect: Record<string, boolean>;

    // info for commands only
    require: Record<string, string>;
    require2: Record<string, string>;
    conditional: Record<string, boolean>;
    set: Record<string, string>;
    set2: Record<string, string>;
    corrupt: Record<string, string>;
    corrupt2: Record<string, string>;
};
