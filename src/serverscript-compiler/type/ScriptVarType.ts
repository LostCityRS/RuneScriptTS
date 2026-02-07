import { BaseVarType } from "../../runescript-compiler/type/BaseVarType";
import { Type } from "../../runescript-compiler/type/Type";

export class ScriptVarType extends Type {
    static readonly ALL: ScriptVarType[] = [];

    readonly code: string | null;
    readonly baseType: BaseVarType;
    readonly defaultValue: any;
    readonly representation: string;

    private constructor(
        code: string | null,
        baseType: BaseVarType = BaseVarType.INTEGER,
        defaultValue: any = -1,
        representation?: string
    ) {
        super();
        this.code = code;
        this.baseType = baseType;
        this.defaultValue = defaultValue;
        this.representation = representation ?? this.name.toLowerCase();

        ScriptVarType.ALL.push(this);
    }

    // INT / BOOLEAN
    static readonly SEQ = new ScriptVarType('A');
    static readonly LOC_SHAPE = new ScriptVarType('H', BaseVarType.INTEGER, -1, 'locshape');
    static readonly COMPONENT = new ScriptVarType('I');
    static readonly IDKIT = new ScriptVarType('K');
    static readonly MIDI = new ScriptVarType('M');
    static readonly NPC_MODE = new ScriptVarType('N');
    static readonly NAMEDOBJ = new ScriptVarType('O');
    static readonly SYNTH = new ScriptVarType('P');
    static readonly AREA = new ScriptVarType('R');
    static readonly STAT = new ScriptVarType('S');
    static readonly NPC_STAT = new ScriptVarType('T');
    static readonly WRITEINV = new ScriptVarType('V');
    static readonly MAPAREA = new ScriptVarType('`', BaseVarType.INTEGER, -1, 'wma');

    // COORDGRID
    static readonly GRAPHIC = new ScriptVarType('d');
    static readonly FONTMETRICS = new ScriptVarType('f');
    static readonly ENUM = new ScriptVarType('g');
    static readonly HUNT = new ScriptVarType('h'); // Unconfirmed code.
    static readonly JINGLE = new ScriptVarType('j');
    static readonly LOC = new ScriptVarType('l');
    static readonly MODEL = new ScriptVarType('m');
    static readonly NPC = new ScriptVarType('n');
    static readonly OBJ = new ScriptVarType('o');
    static readonly PLAYER_UID = new ScriptVarType('p');

    // STRING
    static readonly SPOTANIM = new ScriptVarType('t');
    static readonly NPC_UID = new ScriptVarType('u');
    static readonly INV = new ScriptVarType('v');
    static readonly TEXTURE = new ScriptVarType('x');
    static readonly CATEGORY = new ScriptVarType('y');

    // CHAR
    static readonly MAPELEMENT = new ScriptVarType('µ');
    static readonly HITMARK = new ScriptVarType('×');
    static readonly STRUCT = new ScriptVarType('J');
    static readonly DBROW = new ScriptVarType('Ð');
    static readonly INTERFACE = new ScriptVarType('a');
    static readonly TOPLEVELINTERFACE = new ScriptVarType('F');
    static readonly OVERLAYINTERFACE = new ScriptVarType('L');
    static readonly MOVESPEED = new ScriptVarType('Ý');

    // LONG
    static readonly ENTITYOVERLAY = new ScriptVarType('-');
    static readonly DBTABLE = new ScriptVarType('Ø'); // Unconfirmed code.
    static readonly STRINGVECTOR = new ScriptVarType('¸');
    static readonly MESANIM = new ScriptVarType('Á');
    static readonly VERIFY_OBJECT = new ScriptVarType('®', BaseVarType.INTEGER, -1, 'verifyobj');


    /** Hack: emulate Kotlin enum `name` property for representation fallback */
    private get name(): string {
        // Find the first key in ALL that points to this instance
        const entry = (Object.entries(ScriptVarType) as [string, any][]).find(
            ([, value]) => value === this
        );
        return entry?.[0] ?? 'UNKNOWN';
    }
}