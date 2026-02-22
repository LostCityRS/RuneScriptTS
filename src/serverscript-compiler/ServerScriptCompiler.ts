import { PointerHolder } from "../runescript-compiler/pointer/PointerHolder";
import { ScriptCompiler } from "../runescript-compiler/ScriptCompiler";
import { ScriptWriter } from "../runescript-compiler/writer/ScriptWriter";
import { SymbolMapper } from "./SymbolMapper";
import { CompilerTypeInfoConstantLoader } from "./CompilerTypeInfoConstantLoader";
import { Type } from "../runescript-compiler/type/Type";
import { CompilerTypeInfoProtectedLoader } from "./CompilerTypeInfoProtectedLoader";
import { CompilerTypeInfoLoader } from "./CompilerTypeInfoLoader";
import { ServerTriggerType } from "./trigger/ServerTriggerType";
import { ScriptVarType } from "./type/ScriptVarType";
import { MetaType } from "../runescript-compiler/type/MetaType";
import { QueueCommandHandler } from "./command/QueueCommandHandler";
import { QueueVarArgCommandHandler } from "./command/QueueVarArgCommandHandler";
import { LongQueueCommandHandler } from "./command/LongQueueCommandHandler";
import { LongQueueVarArgCommandHandler } from "./command/LongQueueVarArgCommandHandler";
import { TimerCommandHandler } from "./command/TimerCommandHandler";
import { ParamCommandHandler } from "./command/ParamCommandHandler";
import { ParamType } from "./type/ParamType";
import { VarBitType, VarNpcType, VarPlayerType, VarSharedType } from "../runescript-compiler/type/wrapped/GameVarType";
import { DumpCommandHandler } from "./command/debug/DumpCommandHandler ";
import { ScriptCommandHandler } from "./command/debug/ScriptCommandHandler ";
import { DbColumnType } from "./type/DbColumnType";
import { DbFindCommandHandler } from "./command/DbFindCommandHandler";
import { DbGetFieldCommandHandler } from "./command/DbGetFieldCommandHandler";
import { EnumCommandHandler } from "./command/EnumCommandHandler";
import { CompilerTypeInfo } from "./CompilerTypeInfo.js";

export class ServerScriptCompiler extends ScriptCompiler {
    private readonly symbols: Record<string, CompilerTypeInfo>;
    private readonly mapper: SymbolMapper;

    constructor(
        sourcePaths: string[],
        excludePaths: string[],
        scriptWriter: ScriptWriter,
        commandPointers: Map<string, PointerHolder>,
        symbols: Record<string, CompilerTypeInfo>,
        mapper: SymbolMapper,
    ) {
        super(sourcePaths, excludePaths, scriptWriter, commandPointers);
        this.symbols = symbols;
        this.mapper = mapper;
    }

    setup(): void {
        this.triggers.registerAll(ServerTriggerType);
        this.types.registerAll(ScriptVarType);

        this.types.changeOptions('long', opts => {
            opts.allowDeclaration = false;
        })

        this.types.register('proc', new MetaType.Script(ServerTriggerType.PROC, MetaType.Unit, MetaType.Unit));
        this.types.register('label', new MetaType.Script(ServerTriggerType.LABEL, MetaType.Unit, MetaType.Nothing));

        // Allow assignment of 'namedobj' to 'obj'.
        this.types.addTypeChecker((left, right) => left === ScriptVarType.OBJ && right === ScriptVarType.NAMEDOBJ);

        // TODO: Macros
        this.addSymConstantLoaders();

        this.types.register('walktrigger', new MetaType.Script(ServerTriggerType.WALKTRIGGER, MetaType.Any, MetaType.Nothing));
        this.types.register('ai_walktrigger', new MetaType.Script(ServerTriggerType.AI_WALKTRIGGER, MetaType.Any, MetaType.Nothing));

        this.types.register('queue', new MetaType.Script(ServerTriggerType.QUEUE, MetaType.Any, MetaType.Nothing));
        this.addDynamicCommandHandler('queue', new QueueCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler('.queue', new QueueCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler('queue*', new QueueVarArgCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler('.queue*', new QueueVarArgCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler('longqueue', new LongQueueCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler('.longqueue', new LongQueueCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler('longqueue*', new LongQueueVarArgCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler('.longqueue*', new LongQueueVarArgCommandHandler(this.types.find('queue')));

        this.types.register('timer', new MetaType.Script(ServerTriggerType.TIMER, MetaType.Any, MetaType.Nothing));
        this.addDynamicCommandHandler('settimer', new TimerCommandHandler(this.types.find('timer')));
        this.addDynamicCommandHandler('.settimer', new TimerCommandHandler(this.types.find('timer')));

        this.addDynamicCommandHandler('lc_param', new ParamCommandHandler(ScriptVarType.LOC));
        this.addDynamicCommandHandler('loc_param', new ParamCommandHandler(null));
        this.addSymLoader('loc', ScriptVarType.LOC);

        this.addDynamicCommandHandler('nc_param', new ParamCommandHandler(ScriptVarType.NPC));
        this.addDynamicCommandHandler('npc_param', new ParamCommandHandler(null));
        this.addSymLoader('npc', ScriptVarType.NPC);

        this.addDynamicCommandHandler('oc_param', new ParamCommandHandler(ScriptVarType.OBJ));
        this.addDynamicCommandHandler('obj_param', new ParamCommandHandler(null));
        this.addSymLoader('obj', ScriptVarType.NAMEDOBJ)

        this.addSymLoader('component', ScriptVarType.COMPONENT);
        this.addSymLoader('interface', ScriptVarType.INTERFACE);
        this.addSymLoader('overlayinterface', ScriptVarType.OVERLAYINTERFACE);
        this.addSymLoader('fontmetrics', ScriptVarType.FONTMETRICS);

        this.addSymLoader('category', ScriptVarType.CATEGORY);
        this.addSymLoader('hunt', ScriptVarType.HUNT);
        this.addSymLoader('inv', ScriptVarType.INV);
        this.addSymLoader('idk', ScriptVarType.IDKIT);
        this.addSymLoader('mesanim', ScriptVarType.MESANIM);
        this.addSymLoaderWithSupplier('param', sub => new ParamType(sub));
        this.addSymLoader('seq', ScriptVarType.SEQ);
        this.addSymLoader('spotanim', ScriptVarType.SPOTANIM);

        this.types.register('varp', new VarPlayerType(MetaType.Any));
        this.addProtectedSymLoaderWithSupplier('varp', sub => new VarPlayerType(sub));
        this.addSymLoaderWithSupplier('varn', sub => new VarNpcType(sub));
        this.addSymLoaderWithSupplier('vars', sub => new VarSharedType(sub));

        this.addSymLoader('stat', ScriptVarType.STAT);
        this.addSymLoader('locshape', ScriptVarType.LOC_SHAPE);
        this.addSymLoader('movespeed', ScriptVarType.MOVESPEED);
        this.addSymLoader('npc_mode', ScriptVarType.NPC_MODE);
        this.addSymLoader('npc_stat', ScriptVarType.NPC_STAT);

        this.addSymLoader('model', ScriptVarType.MODEL);
        this.addSymLoader('synth', ScriptVarType.SYNTH);

        // September 2004
        this.types.register('varbit', new VarBitType(MetaType.Any));
        this.addProtectedSymLoaderWithSupplier('varbit', sub => new VarBitType(sub));
        this.addDynamicCommandHandler('weakqueue', new QueueCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler(`.weakqueue`, new QueueCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler(`weakqueue*`, new QueueVarArgCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler(`.weakqueue*`, new QueueVarArgCommandHandler(this.types.find('queue')));

        // Late 2004/early 2005.
        this.addDynamicCommandHandler('strongqueue', new QueueCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler(`.strongqueue`, new QueueCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler(`strongqueue*`, new QueueVarArgCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler(`.strongqueue*`, new QueueVarArgCommandHandler(this.types.find('queue')));

        // 2005
        this.addDynamicCommandHandler('enum', new EnumCommandHandler());
        this.addSymLoader('enum', ScriptVarType.ENUM);
        // TODO: Mes type alias.

        // 2006
        // TODO: 'runclientscipt' command handler.

        // 2009
        this.addDynamicCommandHandler('struct_param', new ParamCommandHandler(ScriptVarType.STRUCT))
        this.addSymLoader('struct', ScriptVarType.STRUCT);
        this.types.register('softtimer', new MetaType.Script(ServerTriggerType.SOFTTIMER, MetaType.Any, MetaType.Nothing));
        this.addDynamicCommandHandler('softtimer', new TimerCommandHandler(this.types.find('softtimer')));
        this.addDynamicCommandHandler('.softtimer', new TimerCommandHandler(this.types.find('softtimer')));


        // 2013 RS / 2018 OSRS
        this.types.register('dbcolumn', new DbColumnType(MetaType.Any));
        this.addDynamicCommandHandler('db_find', new DbFindCommandHandler(false));
        this.addDynamicCommandHandler('db_find_refine', new DbFindCommandHandler(false));
        this.addDynamicCommandHandler('db_find_with_count', new DbFindCommandHandler(true));
        this.addDynamicCommandHandler('db_find_refine_with_count', new DbFindCommandHandler(true));
        this.addDynamicCommandHandler('db_getfield', new DbGetFieldCommandHandler());
        this.addSymLoaderWithSupplier('dbcolumn', sub => new DbColumnType(sub));
        this.addSymLoader('dbrow', ScriptVarType.DBROW);
        this.addSymLoader('dbtable', ScriptVarType.DBTABLE);

        // Debugging
        this.addDynamicCommandHandler('dump', new DumpCommandHandler());
        this.addDynamicCommandHandler('script', new ScriptCommandHandler());
    }

    private addSymConstantLoaders(): void {
        if (this.symbols['constant']) {
            this.addSymbolLoader(new CompilerTypeInfoConstantLoader(this.symbols['constant']));
        }
    }

    private addSymLoader(name: string, type: Type): void {
        this.addSymLoaderWithSupplier(name, () => type);
    }

    private addSymLoaderWithSupplier(name: string, typeSupplier: (subTypes: Type) => Type): void {
        if (this.symbols[name]) {
            this.addSymbolLoader(new CompilerTypeInfoLoader(this.mapper, this.symbols[name], typeSupplier));
        }
    }

    private addProtectedSymLoader(name: string, type: Type): void {
        this.addProtectedSymLoaderWithSupplier(name, () => type);
    }

    private addProtectedSymLoaderWithSupplier(name: string, typeSupplier: (subTypes: Type) => Type): void {
        if (this.symbols[name]) {
            this.addSymbolLoader(new CompilerTypeInfoProtectedLoader(this.mapper, this.symbols[name], typeSupplier));
        }
    }
}