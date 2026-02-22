import { TriggerType } from '#/runescript-compiler/trigger/TriggerType.js';

/**
 * Handles mapping from name to [TriggerType].
 */
export class TriggerManager {
    /**
     * A map of trigger names to the [TriggerType].
     */
    private readonly nameToTrigger = new Map<string, TriggerType>();

    /**
     * Registers [trigger] using [name] for lookup.
     */
    register(name: string, trigger: TriggerType): void {
        if (this.nameToTrigger.has(name)) {
            throw new Error(`Trigger '${name}' is already registered.`);
        }
        this.nameToTrigger.set(name, trigger);
    }

    /**
     * Registers [trigger] using [TriggerType.identifier] for lookup.
     */
    registerTrigger(trigger: TriggerType): void {
        this.register(trigger.identifier, trigger);
    }

    /**
     * Registers all values within a trigger "enum" the name lookup.
     */
    registerAll<T extends TriggerType>(enumClass: HasAll<T>) {
        for (const value of enumClass.ALL) {
            this.registerTrigger(value);
        }
    }

    /**
     * Finds a trigger by [name]. If a trigger was not found an error is thrown.
     */
    find(name: string): TriggerType {
        const trigger = this.nameToTrigger.get(name);
        if (!trigger) {
            throw new Error(`Unable to find trigger '${name}'.`);
        }
        return trigger;
    }

    /**
     * Finds a trigger by [name].
     *
     * If a trigger with the name was not found, `null` is returned.
     */
    findOrNull(name: string): TriggerType | null {
        return this.nameToTrigger.get(name) ?? null;
    }
}

// TODO: Better solution for this.
interface HasAll<T> {
    readonly ALL: readonly T[];
}
