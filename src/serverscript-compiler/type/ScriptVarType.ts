import { BaseVarType } from "../../runescript-compiler/type/BaseVarType";
import { Type } from "../../runescript-compiler/type/Type";

export class ScriptVarType extends Type {
    static readonly ALL: ScriptVarType[] = [];

    readonly code?: string;
    readonly baseType: BaseVarType;
    readonly defaultValue: any;
    readonly representation: string;

    private constructor(
        code: string,
        baseType: BaseVarType = BaseVarType.INTEGER,
        defaultValue: any = -1,
        representation: string
    ) {
        super();
        this.code = code;
        this.baseType = baseType;
        this.defaultValue = defaultValue;
        this.representation = representation;

        ScriptVarType.ALL.push(this);
    }

    // INT / BOOLEAN
    static readonly SEQ = new ScriptVarType('A', BaseVarType.INTEGER, -1, 'seq');
    static readonly LOC_SHAPE = new ScriptVarType('H', BaseVarType.INTEGER, -1, 'locshape');
    static readonly COMPONENT = new ScriptVarType('I', BaseVarType.INTEGER, -1, 'component');
    static readonly IDKIT = new ScriptVarType('K', BaseVarType.INTEGER, -1, 'idkit');
    static readonly MIDI = new ScriptVarType('M', BaseVarType.INTEGER, -1, 'midi');
    static readonly NPC_MODE = new ScriptVarType('N', BaseVarType.INTEGER, -1, 'npc_mode');
    static readonly NAMEDOBJ = new ScriptVarType('O', BaseVarType.INTEGER, -1, 'namedobj');
    static readonly SYNTH = new ScriptVarType('P', BaseVarType.INTEGER, -1, 'synth');
    static readonly AREA = new ScriptVarType('R', BaseVarType.INTEGER, -1, 'area');
    static readonly STAT = new ScriptVarType('S', BaseVarType.INTEGER, -1, 'stat');
    static readonly NPC_STAT = new ScriptVarType('T', BaseVarType.INTEGER, -1, 'npc_stat');
    static readonly WRITEINV = new ScriptVarType('V', BaseVarType.INTEGER, -1, 'writeinv');
    static readonly MAPAREA = new ScriptVarType('`', BaseVarType.INTEGER, -1, 'wma');

    // COORDGRID
    static readonly GRAPHIC = new ScriptVarType('d', BaseVarType.INTEGER, -1, 'graphic');
    static readonly FONTMETRICS = new ScriptVarType('f', BaseVarType.INTEGER, -1, 'fontmetrics');
    static readonly ENUM = new ScriptVarType('g', BaseVarType.INTEGER, -1, 'enum');
    static readonly HUNT = new ScriptVarType('h', BaseVarType.INTEGER, -1, 'hunt'); // Unconfirmed code.
    static readonly JINGLE = new ScriptVarType('j', BaseVarType.INTEGER, -1, 'jingle');
    static readonly LOC = new ScriptVarType('l', BaseVarType.INTEGER, -1 , 'loc');
    static readonly MODEL = new ScriptVarType('m', BaseVarType.INTEGER, -1, 'model');
    static readonly NPC = new ScriptVarType('n', BaseVarType.INTEGER, -1, 'npc');
    static readonly OBJ = new ScriptVarType('o', BaseVarType.INTEGER, -1, 'obj');
    static readonly PLAYER_UID = new ScriptVarType('p', BaseVarType.INTEGER, -1, 'player_uid');

    // STRING
    static readonly SPOTANIM = new ScriptVarType('t', BaseVarType.INTEGER, -1, 'spotanim');
    static readonly NPC_UID = new ScriptVarType('u', BaseVarType.INTEGER, -1, 'npc_uid');
    static readonly INV = new ScriptVarType('v', BaseVarType.INTEGER, -1, 'inv');
    static readonly TEXTURE = new ScriptVarType('x', BaseVarType.INTEGER, -1, 'texture');
    static readonly CATEGORY = new ScriptVarType('y', BaseVarType.INTEGER, -1, 'category');

    // CHAR
    static readonly MAPELEMENT = new ScriptVarType('µ', BaseVarType.INTEGER, -1, 'mapelement');
    static readonly HITMARK = new ScriptVarType('×', BaseVarType.INTEGER, -1, 'hitmark');
    static readonly STRUCT = new ScriptVarType('J', BaseVarType.INTEGER, -1, 'struct');
    static readonly DBROW = new ScriptVarType('Ð', BaseVarType.INTEGER, -1, 'dbrow');
    static readonly INTERFACE = new ScriptVarType('a', BaseVarType.INTEGER, -1, 'interface');
    static readonly TOPLEVELINTERFACE = new ScriptVarType('F', BaseVarType.INTEGER, -1, 'toplevelinterface');
    static readonly OVERLAYINTERFACE = new ScriptVarType('L', BaseVarType.INTEGER, -1, 'overlayinterface');
    static readonly MOVESPEED = new ScriptVarType('Ý', BaseVarType.INTEGER, -1, 'movespeed');

    // LONG
    static readonly ENTITYOVERLAY = new ScriptVarType('-', BaseVarType.INTEGER, -1, 'entityoverlay');
    static readonly DBTABLE = new ScriptVarType('Ø', BaseVarType.INTEGER, -1, 'dbtable'); // Unconfirmed code.
    static readonly STRINGVECTOR = new ScriptVarType('¸', BaseVarType.INTEGER, -1, 'stringvector');
    static readonly MESANIM = new ScriptVarType('Á', BaseVarType.INTEGER, -1, 'mesanim');
    static readonly VERIFY_OBJECT = new ScriptVarType('®', BaseVarType.INTEGER, -1, 'verifyobj');

}