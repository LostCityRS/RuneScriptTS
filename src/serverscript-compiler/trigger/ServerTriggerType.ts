import { PointerType } from '#/runescript-compiler/pointer/PointerType.js';
import { SubjectMode } from '#/runescript-compiler/trigger/SubjectMode.js';
import { TriggerType } from '#/runescript-compiler/trigger/TriggerType.js';
import { PrimitiveType } from '#/runescript-compiler/type/PrimitiveType.js';
import { Type } from '#/runescript-compiler/type/Type.js';

import { ScriptVarType } from '#/serverscript-compiler/type/ScriptVarType.js';

/**
 * An enumeration of valid trigger types for use in serverscript.
 */
export class ServerTriggerType implements TriggerType {
    static readonly ALL: ServerTriggerType[] = [];

    readonly id: number;
    readonly subjectMode: SubjectMode;
    readonly allowParameters: boolean;
    readonly parameters: Type | null;
    readonly allowReturns: boolean;
    readonly returns: Type | null;
    readonly pointers: Set<PointerType> | null;
    readonly identifier: string;

    constructor({
        id,
        name,
        subjectMode,
        allowParameters = false,
        parameters = null,
        allowReturns = false,
        returns = null,
        pointers = null
    }: {
        id: number;
        name: string;
        subjectMode?: SubjectMode;
        allowParameters?: boolean;
        parameters?: Type | null;
        allowReturns?: boolean;
        returns?: Type | null;
        pointers?: Set<PointerType> | null;
    }) {
        this.id = id;
        if (subjectMode == null) {
            this.subjectMode = SubjectMode.Name;
        } else {
            this.subjectMode = subjectMode;
        }
        this.allowParameters = allowParameters;
        this.parameters = parameters;
        this.allowReturns = allowReturns;
        this.returns = returns;
        this.pointers = pointers ?? null;
        this.identifier = name.toLowerCase();

        ServerTriggerType.ALL.push(this);
    }

    static readonly PROC = new ServerTriggerType({
        id: 0,
        name: 'PROC',
        subjectMode: SubjectMode.Name,
        allowParameters: true,
        allowReturns: true,
        pointers: new Set(Object.values(PointerType))
    });

    static readonly LABEL = new ServerTriggerType({
        id: 1,
        name: 'LABEL',
        subjectMode: SubjectMode.Name,
        allowParameters: true,
        pointers: new Set(Object.values(PointerType))
    });

    static readonly DEBUGPROC = new ServerTriggerType({
        id: 2,
        name: 'DEBUGPROC',
        subjectMode: SubjectMode.Name,
        allowParameters: true,
        pointers: new Set([PointerType.ACTIVE_PLAYER])
    });

    static readonly APNPC1 = new ServerTriggerType({
        id: 3,
        name: 'APNPC1',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_NPC])
    });

    static readonly APNPC2 = new ServerTriggerType({
        id: 4,
        name: 'APNPC2',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_NPC])
    });

    static readonly APNPC3 = new ServerTriggerType({
        id: 5,
        name: 'APNPC3',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_NPC])
    });

    static readonly APNPC4 = new ServerTriggerType({
        id: 6,
        name: 'APNPC4',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_NPC])
    });

    static readonly APNPC5 = new ServerTriggerType({
        id: 7,
        name: 'APNPC5',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_NPC])
    });

    static readonly APNPCU = new ServerTriggerType({
        id: 8,
        name: 'APNPCU',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_USEITEM, PointerType.LAST_USESLOT, PointerType.ACTIVE_NPC])
    });

    static readonly APNPCT = new ServerTriggerType({
        id: 9,
        name: 'APNPCT',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT, false, false),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_NPC])
    });

    static readonly OPNPC1 = new ServerTriggerType({
        id: 10,
        name: 'OPNPC1',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_NPC])
    });

    static readonly OPNPC2 = new ServerTriggerType({
        id: 11,
        name: 'OPNPC2',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_NPC])
    });

    static readonly OPNPC3 = new ServerTriggerType({
        id: 12,
        name: 'OPNPC3',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_NPC])
    });

    static readonly OPNPC4 = new ServerTriggerType({
        id: 13,
        name: 'OPNPC4',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_NPC])
    });

    static readonly OPNPC5 = new ServerTriggerType({
        id: 14,
        name: 'OPNPC5',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_NPC])
    });

    static readonly OPNPCU = new ServerTriggerType({
        id: 15,
        name: 'OPNPCU',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_USEITEM, PointerType.LAST_USESLOT, PointerType.ACTIVE_NPC])
    });

    static readonly OPNPCT = new ServerTriggerType({
        id: 16,
        name: 'OPNPCT',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT, false, false),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_NPC])
    });

    static readonly AI_APNPC1 = new ServerTriggerType({
        id: 17,
        name: 'AI_APNPC1',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_NPC2])
    });

    static readonly AI_APNPC2 = new ServerTriggerType({
        id: 18,
        name: 'AI_APNPC2',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_NPC2])
    });

    static readonly AI_APNPC3 = new ServerTriggerType({
        id: 19,
        name: 'AI_APNPC3',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_NPC2])
    });

    static readonly AI_APNPC4 = new ServerTriggerType({
        id: 20,
        name: 'AI_APNPC4',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_NPC2])
    });

    static readonly AI_APNPC5 = new ServerTriggerType({
        id: 21,
        name: 'AI_APNPC5',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_NPC2])
    });

    static readonly AI_OPNPC1 = new ServerTriggerType({
        id: 24,
        name: 'AI_OPNPC1',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_NPC2])
    });

    static readonly AI_OPNPC2 = new ServerTriggerType({
        id: 25,
        name: 'AI_OPNPC2',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_NPC2])
    });

    static readonly AI_OPNPC3 = new ServerTriggerType({
        id: 26,
        name: 'AI_OPNPC3',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_NPC2])
    });

    static readonly AI_OPNPC4 = new ServerTriggerType({
        id: 27,
        name: 'AI_OPNPC4',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_NPC2])
    });

    static readonly AI_OPNPC5 = new ServerTriggerType({
        id: 28,
        name: 'AI_OPNPC5',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_NPC2])
    });

    static readonly APOBJ1 = new ServerTriggerType({
        id: 31,
        name: 'APOBJ1',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_OBJ])
    });

    static readonly APOBJ2 = new ServerTriggerType({
        id: 32,
        name: 'APOBJ2',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_OBJ])
    });

    static readonly APOBJ3 = new ServerTriggerType({
        id: 33,
        name: 'APOBJ3',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_OBJ])
    });

    static readonly APOBJ4 = new ServerTriggerType({
        id: 34,
        name: 'APOBJ4',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_OBJ])
    });

    static readonly APOBJ5 = new ServerTriggerType({
        id: 35,
        name: 'APOBJ5',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_OBJ])
    });

    static readonly APOBJU = new ServerTriggerType({
        id: 36,
        name: 'APOBJU',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_USEITEM, PointerType.LAST_USESLOT, PointerType.ACTIVE_OBJ])
    });

    static readonly APOBJT = new ServerTriggerType({
        id: 37,
        name: 'APOBJT',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT, false, false),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_OBJ])
    });

    static readonly OPOBJ1 = new ServerTriggerType({
        id: 38,
        name: 'OPOBJ1',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_OBJ])
    });

    static readonly OPOBJ2 = new ServerTriggerType({
        id: 39,
        name: 'OPOBJ2',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_OBJ])
    });

    static readonly OPOBJ3 = new ServerTriggerType({
        id: 40,
        name: 'OPOBJ3',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_OBJ])
    });

    static readonly OPOBJ4 = new ServerTriggerType({
        id: 41,
        name: 'OPOBJ4',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_OBJ])
    });

    static readonly OPOBJ5 = new ServerTriggerType({
        id: 42,
        name: 'OPOBJ5',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_OBJ])
    });

    static readonly OPOBJU = new ServerTriggerType({
        id: 43,
        name: 'OPOBJU',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_USEITEM, PointerType.LAST_USESLOT, PointerType.ACTIVE_OBJ])
    });

    static readonly OPOBJT = new ServerTriggerType({
        id: 44,
        name: 'OPOBJT',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT, false, false),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_OBJ])
    });

    static readonly AI_APOBJ1 = new ServerTriggerType({
        id: 45,
        name: 'AI_APOBJ1',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_OBJ])
    });

    static readonly AI_APOBJ2 = new ServerTriggerType({
        id: 46,
        name: 'AI_APOBJ2',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_OBJ])
    });

    static readonly AI_APOBJ3 = new ServerTriggerType({
        id: 47,
        name: 'AI_APOBJ3',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_OBJ])
    });

    static readonly AI_APOBJ4 = new ServerTriggerType({
        id: 48,
        name: 'AI_APOBJ4',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_OBJ])
    });

    static readonly AI_APOBJ5 = new ServerTriggerType({
        id: 49,
        name: 'AI_APOBJ5',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_OBJ])
    });

    static readonly AI_OPOBJ1 = new ServerTriggerType({
        id: 52,
        name: 'AI_OPOBJ1',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_OBJ])
    });

    static readonly AI_OPOBJ2 = new ServerTriggerType({
        id: 53,
        name: 'AI_OPOBJ2',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_OBJ])
    });

    static readonly AI_OPOBJ3 = new ServerTriggerType({
        id: 54,
        name: 'AI_OPOBJ3',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_OBJ])
    });

    static readonly AI_OPOBJ4 = new ServerTriggerType({
        id: 55,
        name: 'AI_OPOBJ4',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_OBJ])
    });

    static readonly AI_OPOBJ5 = new ServerTriggerType({
        id: 56,
        name: 'AI_OPOBJ5',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_OBJ])
    });

    static readonly APLOC1 = new ServerTriggerType({
        id: 59,
        name: 'APLOC1',
        subjectMode: SubjectMode.Type(ScriptVarType.LOC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_LOC])
    });

    static readonly APLOC2 = new ServerTriggerType({
        id: 60,
        name: 'APLOC2',
        subjectMode: SubjectMode.Type(ScriptVarType.LOC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_LOC])
    });

    static readonly APLOC3 = new ServerTriggerType({
        id: 61,
        name: 'APLOC3',
        subjectMode: SubjectMode.Type(ScriptVarType.LOC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_LOC])
    });

    static readonly APLOC4 = new ServerTriggerType({
        id: 62,
        name: 'APLOC4',
        subjectMode: SubjectMode.Type(ScriptVarType.LOC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_LOC])
    });

    static readonly APLOC5 = new ServerTriggerType({
        id: 63,
        name: 'APLOC5',
        subjectMode: SubjectMode.Type(ScriptVarType.LOC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_LOC])
    });

    static readonly APLOCU = new ServerTriggerType({
        id: 64,
        name: 'APLOCU',
        subjectMode: SubjectMode.Type(ScriptVarType.LOC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_USEITEM, PointerType.LAST_USESLOT, PointerType.ACTIVE_LOC])
    });

    static readonly APLOCT = new ServerTriggerType({
        id: 65,
        name: 'APLOCT',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT, false, false),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_LOC])
    });

    static readonly OPLOC1 = new ServerTriggerType({
        id: 66,
        name: 'OPLOC1',
        subjectMode: SubjectMode.Type(ScriptVarType.LOC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_LOC])
    });

    static readonly OPLOC2 = new ServerTriggerType({
        id: 67,
        name: 'OPLOC2',
        subjectMode: SubjectMode.Type(ScriptVarType.LOC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_LOC])
    });

    static readonly OPLOC3 = new ServerTriggerType({
        id: 68,
        name: 'OPLOC3',
        subjectMode: SubjectMode.Type(ScriptVarType.LOC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_LOC])
    });

    static readonly OPLOC4 = new ServerTriggerType({
        id: 69,
        name: 'OPLOC4',
        subjectMode: SubjectMode.Type(ScriptVarType.LOC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_LOC])
    });

    static readonly OPLOC5 = new ServerTriggerType({
        id: 70,
        name: 'OPLOC5',
        subjectMode: SubjectMode.Type(ScriptVarType.LOC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_LOC])
    });

    static readonly OPLOCU = new ServerTriggerType({
        id: 71,
        name: 'OPLOCU',
        subjectMode: SubjectMode.Type(ScriptVarType.LOC),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_USEITEM, PointerType.LAST_USESLOT, PointerType.ACTIVE_LOC])
    });

    static readonly OPLOCT = new ServerTriggerType({
        id: 72,
        name: 'OPLOCT',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT, false, false),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_LOC])
    });

    static readonly AI_APLOC1 = new ServerTriggerType({
        id: 73,
        name: 'AI_APLOC1',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_LOC])
    });

    static readonly AI_APLOC2 = new ServerTriggerType({
        id: 74,
        name: 'AI_APLOC2',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_LOC])
    });

    static readonly AI_APLOC3 = new ServerTriggerType({
        id: 75,
        name: 'AI_APLOC3',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_LOC])
    });

    static readonly AI_APLOC4 = new ServerTriggerType({
        id: 76,
        name: 'AI_APLOC4',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_LOC])
    });

    static readonly AI_APLOC5 = new ServerTriggerType({
        id: 77,
        name: 'AI_APLOC5',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_LOC])
    });

    static readonly AI_OPLOC1 = new ServerTriggerType({
        id: 80,
        name: 'AI_OPLOC1',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_LOC])
    });

    static readonly AI_OPLOC2 = new ServerTriggerType({
        id: 81,
        name: 'AI_OPLOC2',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_LOC])
    });

    static readonly AI_OPLOC3 = new ServerTriggerType({
        id: 82,
        name: 'AI_OPLOC3',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_LOC])
    });

    static readonly AI_OPLOC4 = new ServerTriggerType({
        id: 83,
        name: 'AI_OPLOC4',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_LOC])
    });

    static readonly AI_OPLOC5 = new ServerTriggerType({
        id: 84,
        name: 'AI_OPLOC5',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_LOC])
    });

    static readonly APPLAYER1 = new ServerTriggerType({
        id: 87,
        name: 'APPLAYER1',
        subjectMode: SubjectMode.None,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_PLAYER2])
    });

    static readonly APPLAYER2 = new ServerTriggerType({
        id: 88,
        name: 'APPLAYER2',
        subjectMode: SubjectMode.None,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_PLAYER2])
    });

    static readonly APPLAYER3 = new ServerTriggerType({
        id: 89,
        name: 'APPLAYER3',
        subjectMode: SubjectMode.None,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_PLAYER2])
    });

    static readonly APPLAYER4 = new ServerTriggerType({
        id: 90,
        name: 'APPLAYER4',
        subjectMode: SubjectMode.None,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_PLAYER2])
    });

    static readonly APPLAYER5 = new ServerTriggerType({
        id: 91,
        name: 'APPLAYER5',
        subjectMode: SubjectMode.None,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_PLAYER2])
    });

    static readonly APPLAYERU = new ServerTriggerType({
        id: 92,
        name: 'APPLAYERU',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ, true, false),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_USEITEM, PointerType.LAST_USESLOT, PointerType.ACTIVE_PLAYER2])
    });

    static readonly APPLAYERT = new ServerTriggerType({
        id: 93,
        name: 'APPLAYERT',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT, false, false),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_PLAYER2])
    });

    static readonly OPPLAYER1 = new ServerTriggerType({
        id: 94,
        name: 'OPPLAYER1',
        subjectMode: SubjectMode.None,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_PLAYER2])
    });

    static readonly OPPLAYER2 = new ServerTriggerType({
        id: 95,
        name: 'OPPLAYER2',
        subjectMode: SubjectMode.None,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_PLAYER2])
    });

    static readonly OPPLAYER3 = new ServerTriggerType({
        id: 96,
        name: 'OPPLAYER3',
        subjectMode: SubjectMode.None,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_PLAYER2])
    });

    static readonly OPPLAYER4 = new ServerTriggerType({
        id: 97,
        name: 'OPPLAYER4',
        subjectMode: SubjectMode.None,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_PLAYER2])
    });

    static readonly OPPLAYER5 = new ServerTriggerType({
        id: 98,
        name: 'OPPLAYER5',
        subjectMode: SubjectMode.None,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_PLAYER2])
    });

    static readonly OPPLAYERU = new ServerTriggerType({
        id: 99,
        name: 'OPPLAYERU',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ, true, false),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_USEITEM, PointerType.LAST_USESLOT, PointerType.ACTIVE_PLAYER2])
    });

    static readonly OPPLAYERT = new ServerTriggerType({
        id: 100,
        name: 'OPPLAYERT',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT, false, false),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.ACTIVE_PLAYER2])
    });

    static readonly AI_APPLAYER1 = new ServerTriggerType({
        id: 101,
        name: 'AI_APPLAYER1',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_PLAYER])
    });

    static readonly AI_APPLAYER2 = new ServerTriggerType({
        id: 102,
        name: 'AI_APPLAYER2',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_PLAYER])
    });

    static readonly AI_APPLAYER3 = new ServerTriggerType({
        id: 103,
        name: 'AI_APPLAYER3',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_PLAYER])
    });

    static readonly AI_APPLAYER4 = new ServerTriggerType({
        id: 104,
        name: 'AI_APPLAYER4',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_PLAYER])
    });

    static readonly AI_APPLAYER5 = new ServerTriggerType({
        id: 105,
        name: 'AI_APPLAYER5',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_PLAYER])
    });

    static readonly AI_OPPLAYER1 = new ServerTriggerType({
        id: 108,
        name: 'AI_OPPLAYER1',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_PLAYER])
    });

    static readonly AI_OPPLAYER2 = new ServerTriggerType({
        id: 109,
        name: 'AI_OPPLAYER2',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_PLAYER])
    });

    static readonly AI_OPPLAYER3 = new ServerTriggerType({
        id: 110,
        name: 'AI_OPPLAYER3',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_PLAYER])
    });

    static readonly AI_OPPLAYER4 = new ServerTriggerType({
        id: 111,
        name: 'AI_OPPLAYER4',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_PLAYER])
    });

    static readonly AI_OPPLAYER5 = new ServerTriggerType({
        id: 112,
        name: 'AI_OPPLAYER5',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.ACTIVE_PLAYER])
    });

    static readonly QUEUE = new ServerTriggerType({
        id: 116,
        name: 'QUEUE',
        allowParameters: true,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER])
    });

    static readonly AI_QUEUE1 = new ServerTriggerType({
        id: 117,
        name: 'AI_QUEUE1',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE2 = new ServerTriggerType({
        id: 118,
        name: 'AI_QUEUE2',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE3 = new ServerTriggerType({
        id: 119,
        name: 'AI_QUEUE3',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE4 = new ServerTriggerType({
        id: 120,
        name: 'AI_QUEUE4',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE5 = new ServerTriggerType({
        id: 121,
        name: 'AI_QUEUE5',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE6 = new ServerTriggerType({
        id: 122,
        name: 'AI_QUEUE6',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE7 = new ServerTriggerType({
        id: 123,
        name: 'AI_QUEUE7',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE8 = new ServerTriggerType({
        id: 124,
        name: 'AI_QUEUE8',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE9 = new ServerTriggerType({
        id: 125,
        name: 'AI_QUEUE9',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE10 = new ServerTriggerType({
        id: 126,
        name: 'AI_QUEUE10',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE11 = new ServerTriggerType({
        id: 127,
        name: 'AI_QUEUE11',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE12 = new ServerTriggerType({
        id: 128,
        name: 'AI_QUEUE12',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE13 = new ServerTriggerType({
        id: 129,
        name: 'AI_QUEUE13',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE14 = new ServerTriggerType({
        id: 130,
        name: 'AI_QUEUE14',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE15 = new ServerTriggerType({
        id: 131,
        name: 'AI_QUEUE15',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE16 = new ServerTriggerType({
        id: 132,
        name: 'AI_QUEUE16',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE17 = new ServerTriggerType({
        id: 133,
        name: 'AI_QUEUE17',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE18 = new ServerTriggerType({
        id: 134,
        name: 'AI_QUEUE18',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE19 = new ServerTriggerType({
        id: 135,
        name: 'AI_QUEUE19',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly AI_QUEUE20 = new ServerTriggerType({
        id: 136,
        name: 'AI_QUEUE20',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC, PointerType.LAST_INT])
    });

    static readonly SOFTTIMER = new ServerTriggerType({
        id: 137,
        name: 'SOFTTIMER',
        allowParameters: true,
        pointers: new Set([PointerType.ACTIVE_PLAYER])
    });

    static readonly TIMER = new ServerTriggerType({
        id: 138,
        name: 'TIMER',
        allowParameters: true,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER])
    });

    static readonly AI_TIMER = new ServerTriggerType({
        id: 139,
        name: 'AI_TIMER',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC])
    });

    static readonly OPHELD1 = new ServerTriggerType({
        id: 140,
        name: 'OPHELD1',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_ITEM, PointerType.LAST_SLOT])
    });

    static readonly OPHELD2 = new ServerTriggerType({
        id: 141,
        name: 'OPHELD2',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_ITEM, PointerType.LAST_SLOT])
    });

    static readonly OPHELD3 = new ServerTriggerType({
        id: 142,
        name: 'OPHELD3',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_ITEM, PointerType.LAST_SLOT])
    });

    static readonly OPHELD4 = new ServerTriggerType({
        id: 143,
        name: 'OPHELD4',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_ITEM, PointerType.LAST_SLOT])
    });

    static readonly OPHELD5 = new ServerTriggerType({
        id: 144,
        name: 'OPHELD5',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_ITEM, PointerType.LAST_SLOT])
    });

    static readonly OPHELDU = new ServerTriggerType({
        id: 145,
        name: 'OPHELDU',
        subjectMode: SubjectMode.Type(ScriptVarType.NAMEDOBJ),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_ITEM, PointerType.LAST_SLOT, PointerType.LAST_USEITEM, PointerType.LAST_USESLOT])
    });

    static readonly OPHELDT = new ServerTriggerType({
        id: 146,
        name: 'OPHELDT',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT, false, false),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_ITEM, PointerType.LAST_SLOT])
    });

    static readonly IF_BUTTON = new ServerTriggerType({
        id: 147,
        name: 'IF_BUTTON',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_COM])
    });

    static readonly IF_CLOSE = new ServerTriggerType({
        id: 148,
        name: 'IF_CLOSE',
        subjectMode: SubjectMode.Type(ScriptVarType.INTERFACE),
        pointers: new Set([PointerType.ACTIVE_PLAYER])
    });

    static readonly INV_BUTTON1 = new ServerTriggerType({
        id: 149,
        name: 'INV_BUTTON1',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_ITEM, PointerType.LAST_SLOT])
    });

    static readonly INV_BUTTON2 = new ServerTriggerType({
        id: 150,
        name: 'INV_BUTTON2',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_ITEM, PointerType.LAST_SLOT])
    });

    static readonly INV_BUTTON3 = new ServerTriggerType({
        id: 151,
        name: 'INV_BUTTON3',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_ITEM, PointerType.LAST_SLOT])
    });

    static readonly INV_BUTTON4 = new ServerTriggerType({
        id: 152,
        name: 'INV_BUTTON4',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_ITEM, PointerType.LAST_SLOT])
    });

    static readonly INV_BUTTON5 = new ServerTriggerType({
        id: 153,
        name: 'INV_BUTTON5',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_ITEM, PointerType.LAST_SLOT])
    });

    static readonly INV_BUTTOND = new ServerTriggerType({
        id: 154,
        name: 'INV_BUTTOND',
        subjectMode: SubjectMode.Type(ScriptVarType.COMPONENT),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER, PointerType.LAST_SLOT, PointerType.LAST_TARGETSLOT])
    });

    static readonly WALKTRIGGER = new ServerTriggerType({
        id: 155,
        name: 'WALKTRIGGER',
        subjectMode: SubjectMode.Name,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER])
    });

    static readonly AI_WALKTRIGGER = new ServerTriggerType({
        id: 156,
        name: 'AI_WALKTRIGGER',
        subjectMode: SubjectMode.Name,
        pointers: new Set([PointerType.ACTIVE_NPC])
    });

    static readonly LOGIN = new ServerTriggerType({
        id: 157,
        name: 'LOGIN',
        subjectMode: SubjectMode.None,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER])
    });

    static readonly LOGOUT = new ServerTriggerType({
        id: 158,
        name: 'LOGOUT',
        subjectMode: SubjectMode.None,
        allowReturns: true,
        returns: PrimitiveType.BOOLEAN,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER])
    });

    static readonly TUTORIAL = new ServerTriggerType({
        id: 159,
        name: 'TUTORIAL',
        subjectMode: SubjectMode.None,
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER])
    });

    static readonly ADVANCESTAT = new ServerTriggerType({
        id: 160,
        name: 'ADVANCESTAT',
        subjectMode: SubjectMode.Type(ScriptVarType.STAT),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER])
    });

    static readonly MAPZONE = new ServerTriggerType({
        id: 161,
        name: 'MAPZONE',
        subjectMode: SubjectMode.Type(PrimitiveType.MAPZONE),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER])
    });

    static readonly MAPZONEEXIT = new ServerTriggerType({
        id: 162,
        name: 'MAPZONEEXIT',
        subjectMode: SubjectMode.Type(PrimitiveType.MAPZONE),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER])
    });

    static readonly ZONE = new ServerTriggerType({
        id: 163,
        name: 'ZONE',
        subjectMode: SubjectMode.Type(PrimitiveType.COORD),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER])
    });

    static readonly ZONEEXIT = new ServerTriggerType({
        id: 164,
        name: 'ZONEEXIT',
        subjectMode: SubjectMode.Type(PrimitiveType.COORD),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER])
    });

    static readonly CHANGESTAT = new ServerTriggerType({
        id: 165,
        name: 'CHANGESTAT',
        subjectMode: SubjectMode.Type(ScriptVarType.STAT),
        pointers: new Set([PointerType.ACTIVE_PLAYER, PointerType.P_ACTIVE_PLAYER])
    });

    static readonly AI_SPAWN = new ServerTriggerType({
        id: 166,
        name: 'AI_SPAWN',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC])
    });

    static readonly AI_DESPAWN = new ServerTriggerType({
        id: 167,
        name: 'AI_DESPAWN',
        subjectMode: SubjectMode.Type(ScriptVarType.NPC),
        pointers: new Set([PointerType.ACTIVE_NPC])
    });
}
