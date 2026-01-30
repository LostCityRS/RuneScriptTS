import { PointerChecker } from '../codegen/script/config/PointerChecker';
import { PointerHolder } from '../pointer/PointerHolder';
import { TriggerType } from '../trigger/TriggerType';
import { Type } from '../type/Type';
import { Symbol } from './Symbol';

/**
 * A script symbol is a type of symbol that defines any type of script. Each script
 * must define its trigger type, name, parameter type(s), and return type(s).
 */
export abstract class ScriptSymbol implements Symbol {
    constructor(
        public readonly trigger: TriggerType,
        public readonly name: string,
        public readonly parameters: Type,
        public readonly returns: Type
    ) {}

    pointers(checker: PointerChecker): PointerHolder {
        return checker.getPointers(this);
    }
}

/**
 * A [ScriptSymbol] type specific for server sided scripts.
 */
export class ServerScriptSymbol extends ScriptSymbol {}
    
/**
 * A [ScriptSymbol] type specific for client sided scripts.
 */
export class ClientScriptSymbol extends ScriptSymbol {}