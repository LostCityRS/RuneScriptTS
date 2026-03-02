import { PointerChecker } from '#/runescript-compiler/codegen/script/config/PointerChecker.js';
import { RuneScript } from '#/runescript-compiler/codegen/script/RuneScript.js';
import { Diagnostics } from '#/runescript-compiler/diagnostics/Diagnostics.js';
import { PointerHolder } from '#/runescript-compiler/pointer/PointerHolder.js';
import { PointerType } from '#/runescript-compiler/pointer/PointerType.js';
import { StrictFeatureLevel } from '#/runescript-compiler/StrictFeatureLevel.js';

import { ServerTriggerType } from '#/serverscript-compiler/trigger/ServerTriggerType.js';

export class ServerPointerChecker extends PointerChecker {
    private readonly overlayInterfaces: Set<string>;

    constructor(
        diagnostics: Diagnostics,
        scripts: RuneScript[],
        commandPointers: Map<string, PointerHolder>,
        features: StrictFeatureLevel,
        overlayInterfaces: Iterable<string>
    ) {
        super(diagnostics, scripts, commandPointers, features);

        this.overlayInterfaces = new Set(Array.from(overlayInterfaces, ServerPointerChecker.normalizeName));
    }

    // server scripts conditionally give protected access to interface triggers
    // based on their modal / overlay status (protected / not protected)
    protected override setsPointerTrigger(script: RuneScript, pointer: PointerType): boolean {
        if (pointer !== PointerType.P_ACTIVE_PLAYER) {
            return super.setsPointerTrigger(script, pointer);
        }

        if (
            script.trigger === ServerTriggerType.IF_BUTTON ||
            // these triggers have aliases for "if_buttonX" (later rs) and must be checked with id
            script.trigger.id === ServerTriggerType.INV_BUTTON1.id ||
            script.trigger.id === ServerTriggerType.INV_BUTTON2.id ||
            script.trigger.id === ServerTriggerType.INV_BUTTON3.id ||
            script.trigger.id === ServerTriggerType.INV_BUTTON4.id ||
            script.trigger.id === ServerTriggerType.INV_BUTTON5.id ||
            script.trigger.id === ServerTriggerType.INV_BUTTOND.id
        ) {
            const subject = script.subjectReference;
            if (!subject) {
                return false;
            }

            const interfaceName = subject.name.split(':', 1)[0];
            if (!interfaceName) {
                return false;
            }

            return !this.overlayInterfaces.has(ServerPointerChecker.normalizeName(interfaceName));
        }

        return super.setsPointerTrigger(script, pointer);
    }

    private static normalizeName(name: string): string {
        return name.toLowerCase().replace(/\s+/g, '_');
    }
}
