import { RuneScript } from '#/compiler/codegen/script/RuneScript.js';

export interface ScriptWriter {
    write(script: RuneScript): void;
    close?(): void;
}
