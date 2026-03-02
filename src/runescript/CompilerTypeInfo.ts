export type CompilerTypeInfo = {
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
