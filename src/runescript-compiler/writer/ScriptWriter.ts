import { RuneScript } from '../codegen/script/RuneScript';

export interface ScriptWriter {
    write(script: RuneScript): void;
}