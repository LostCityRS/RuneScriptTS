import { CallExpression } from '../../../runescipt-parser/ast/expr/call/CallExpression';
import { CommandCallExpression } from '../../../runescipt-parser/ast/expr/call/CommandCallExpression';
import { Expression } from '../../../runescipt-parser/ast/expr/Expression';
import { Identifier } from '../../../runescipt-parser/ast/expr/Identifier';
import { Diagnostic } from '../../diagnostics/Diagnostic';
import { DiagnosticMessage } from '../../diagnostics/DiagnosticMessage';
import { Diagnostics } from '../../diagnostics/Diagnostics';
import { DiagnosticType } from '../../diagnostics/DiagnosticType';
import { TypeChecking } from '../../semantics/TypeChecking';
import { BasicSymbol } from '../../symbol/Symbol';
import { MetaType } from '../../type/MetaType';
import { TupleType } from '../../type/TupleType';
import { Type } from '../../type/Type';
import { TypeManager } from '../../type/TypeManager';
import { Node } from '../../../runescipt-parser/ast/Node';

/**
 * Contains the context of the [TypeChecking] and supplies useful functions when
 * implementing a [DynamicCommandHandler].
 */
export class TypeCheckingContext {
    /**
     * Returns a list of expressions that were passed to the expression as arguments.
     * Returns `CallExpression.arguments` if the expression is a `CallExpression`,
     * otherwise an empty array.
     */
    public get arguments(): Expression[] {
        if (this.expression instanceof CallExpression) {
            return this.expression.arguments;
        }
        return [];
    }

    /**
     * Whether the expression is a constant expression.
     *
     * A constant expression is defined as being one of the following:
     *  - [ConstantVariableExpression]
     *  - [Literal]
     *  - [Identifier] (see note below)
     *
     * Note: Identifiers that reference symbols other than [BasicSymbol] do not
     * quality as a constant expression.
     */
    public get isConstant(): boolean {
        if (!this.expression) return false;
        return this.typeChecker.isConstantExpression(this.expression);
    }

    constructor(
        private readonly typeChecker: TypeChecking,
        public readonly typeManager: TypeManager,
        public readonly expression: Expression,
        public readonly diagnostics: Diagnostics
    ) {}

    /**
     * Helper function that returns the requested argument list.
     */
    private getArgumentsList(args2 = false): Expression[] {
        if (args2 && this.expression instanceof CommandCallExpression) {
            return this.expression.arguments2 ?? [];
        }
        return this.arguments;
    }

    /**
     * Checks the argument at [index]. If the argument exists then the `typeHint` of the
     * expression is set to [typeHint] and the argument is then passed through the visitor like
     * normal. Accessing `type` after this is safe as long as returned value is not `null`. The
     * returned value will only be `null` if the argument requested is out of bounds.
     *
     * Using [args2] will check [CommandCallExpression.arguments2] instead of [arguments].
     *
     * Example:
     * ```
     * // check the argument with a type hint of obj
     * checkArgument(0, typeHint = PrimitiveType.OBJ)
     *
     * // verify the types match, if mismatch let the function report the error
     * checkArgumentTypes(expected = PrimitiveType.OBJ)
     * ```
     *
     * @see checkTypeArgument
     */
    public checkArgument(index: number, typeHint?: Type, args2 = false): Expression | null {
        const args = this.getArgumentsList(args2);
        if (index < 0 || index >= args.length) return null;

        const argument = args[index];
        this.visitExpression(argument, typeHint);
        return argument;
    }

    /**
     * Checks the argument at [index]. If the argument exists is it validated to be a basic
     * [Identifier] and attempts to look up a type based on the identifier text. If the
     * argument does not exist (out of bounds), `null` is returned.
     *
     * If the expression is not an identifier or the type does not exist an error is logged.
     * The expressions type is assigned to either [MetaType.Error] in the case of error,
     * and [MetaType.Type] if successful.
     *
     * This should only be used when attempting to evaluate an argument as a type reference.
     *
     * @see checkArgument
     */
    public checkTypeArgument(index: number): Expression | null {
        const args = this.arguments;
        if (index < 0 || index >= args.length) return null;

        const argument = args[index];
        if (!(argument instanceof Identifier)) {
            this.diagnostics.report(new Diagnostic(DiagnosticType.ERROR, argument, TypeCheckingContext.DIAGNOSTIC_TYPEREF_EXPECTED));
            argument.type = MetaType.Error;
            return argument;
        }

        const type = this.typeManager.findOrNull(argument.text);
        if (!type) {
            this.diagnostics.report(new Diagnostic(DiagnosticType.ERROR, argument, DiagnosticMessage.GENERIC_INVALID_TYPE, argument.text));
            argument.type = MetaType.Error;
            return argument;
        }

        argument.type = new MetaType.Type(type);
        argument.reference = new BasicSymbol(argument.text, argument.type);
        return argument;
    }

    /**
     * Verifies that the command argument types matches [expected]. This function
     * should be used  for validation the argument types passed to the command.
     * When needing to compare multiple types, use [TupleType].
     *
     * If [reportError] is enabled and there is a type mismatch, an error is submitted to the
     * [diagnostics]. If this option is disabled, you _must_ use the return value to report
     * an error manually otherwise compilation will continue even though there was an error.
     *
     * The following example is type hinting to `int` and visiting the first argument if it exists.
     * Then it if verifying that the arguments passed to the command actually matches a single `int`.
     * ```
     * // check the argument while type hinting it as an int
     * checkArgument(0, typeHint = PrimitiveType.INT)
     *
     * // actually verify the arguments match to a single int
     * checkArgumentTypes(expected = PrimitiveType.INT)
     * ```
     */
    public checkArgumentTypes(expected: Type, reportError = true, args2 = false): boolean {
        const args = this.getArgumentsList(args2);
        const argumentTypes: Type[] = [];

        for (const arg of args) {
            if (!arg.nullableType) {
                this.visitExpression(arg);
            }
            argumentTypes.push(arg.type!);
        }

        const actual = TupleType.fromList(argumentTypes);
        return this.typeChecker.checkTypeMatch(this.expression, expected, actual, reportError);
    }

    /**
     * Collects all [Expression.type] for the [expressions].
     *
     * @see TupleType.fromList
     */
    public collectTypes(...expressions: Array<Expression | null | undefined>): Type {
        return TupleType.fromList(expressions.filter((e): e is Expression => !!e).map(e => e.nullableType!));
    }

    /**
     * Passes the node through the type checker if it is not `null`.
     */
    public visitNode(node?: Node) {
        if (node) this.typeChecker.visitNodeOrNull(node);
    }

    /**
     * Passes the expression through the type check if it is not `null`.
     */
    public visitExpression(expr?: Expression, typeHint?: Type) {
        if (!expr) return;
        if (typeHint) expr.typeHint = typeHint;
        this.typeChecker.visitNodeOrNull(expr);
    }

    /**
     * Passes all nodes within the list through the type check if it is not `null`.
     */
    public visitNodeList(nodes?: Node[]) {
        if (!nodes) return;
        for (const node of nodes) {
            this.typeChecker.visitNodeOrNull(node);
        }
    }

    private static readonly DIAGNOSTIC_TYPEREF_EXPECTED = "Type reference expected.";
}