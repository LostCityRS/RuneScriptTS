import { RuneScript } from '#/runescript-compiler/codegen/script/RuneScript.js';

export interface ScriptWriter {
    write(script: RuneScript): void;
    close?(): void;
}
