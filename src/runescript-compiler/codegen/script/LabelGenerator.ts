import { Label } from './Label';

/**
 * A class used to generate unique label names by appending a number to the end
 * based on the number of times the name has been used.
 */
export class LabelGenerator {
    /**
     * A map of names that have been generated with the number of them that have been generated.
     */
    private names: Map<string, number> = new Map();

    /**
     * Generates a new version of [name] with an incremented number at the end
     * if the name has previously been used.
     */
    public generate(name: string): Label {
        const count = this.names.get(name) ?? 0;
        this.names.set(name, count + 1);
        return new Label(`${name}_${count}`);
    }

    /**
     * Resets the internal map of names to reset name counts.
     */
    public reset(): void {
        this.names.clear();
    }
}