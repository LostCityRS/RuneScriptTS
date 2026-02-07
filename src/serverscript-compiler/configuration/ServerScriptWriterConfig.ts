/**
 * Container for different script writers.
 */
export interface ServerScriptWriterConfig {
    binary?: BinaryFileWriterConfig;
}

/**
 * Configuration for [BinaryFileScriptWriter].
 */
export interface BinaryFileWriterConfig {
    outputPath: string;
}
