/**
 * A dynamic command handler allows more complex commands to be implemented.
 * Implementations are able to do custom type checking and code generation,
 * which allows for some commands to be implemented properly.
 *
 * A lot of implementations may not need to supply custom code generation,
 * which in that case they can omit `generateCode`.
 */
export interface DynamicCommandHandler {
    /**
     * Handles type checking the expression. The expression will only ever be [CallExpression] or [Identifier].
     *
     * All implementations should follow these basic rules:
     *  - `expression.type` **must** be defined.
     *  - If `expression.symbol` is not defined, an attempt is made to look up a predefined symbol in the root
     *  table. If a predefined symbol wasn't found an internal compiler error will be thrown.
     *  - Errors should be reported using `reportError`.
     */
    typeCh
}