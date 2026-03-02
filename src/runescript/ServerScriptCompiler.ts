import { ScriptCompiler } from '#/compiler/ScriptCompiler.js';
import { StrictFeatureLevel } from '#/compiler/StrictFeatureLevel.js';

import { PointerChecker } from '#/compiler/codegen/script/config/PointerChecker.js';
import { RuneScript } from '#/compiler/codegen/script/RuneScript.js';

import { Diagnostics } from '#/compiler/diagnostics/Diagnostics.js';

import { PointerHolder } from '#/compiler/pointer/PointerHolder.js';

import { MetaType } from '#/compiler/type/MetaType.js';
import { PrimitiveType } from '#/compiler/type/PrimitiveType.js';
import { Type } from '#/compiler/type/Type.js';

import { VarBitType, VarNpcType, VarPlayerType, VarSharedType } from '#/compiler/type/wrapped/GameVarType.js';

import { ScriptWriter } from '#/compiler/writer/ScriptWriter.js';

import { CompilerTypeInfo } from '#/runescript/CompilerTypeInfo.js';
import { CompilerTypeInfoConstantLoader } from '#/runescript/CompilerTypeInfoConstantLoader.js';
import { CompilerTypeInfoLoader } from '#/runescript/CompilerTypeInfoLoader.js';
import { CompilerTypeInfoProtectedLoader } from '#/runescript/CompilerTypeInfoProtectedLoader.js';
import { ServerPointerChecker } from '#/runescript/ServerPointerChecker.js';
import { SymbolMapper } from '#/runescript/SymbolMapper.js';

import { DbFindCommandHandler } from '#/runescript/command/DbFindCommandHandler.js';
import { DbGetFieldCommandHandler } from '#/runescript/command/DbGetFieldCommandHandler.js';
import { EnumCommandHandler } from '#/runescript/command/EnumCommandHandler.js';
import { LongQueueCommandHandler } from '#/runescript/command/LongQueueCommandHandler.js';
import { LongQueueVarArgCommandHandler } from '#/runescript/command/LongQueueVarArgCommandHandler.js';
import { ParamCommandHandler } from '#/runescript/command/ParamCommandHandler.js';
import { QueueCommandHandler } from '#/runescript/command/QueueCommandHandler.js';
import { QueueVarArgCommandHandler } from '#/runescript/command/QueueVarArgCommandHandler.js';
import { TimerCommandHandler } from '#/runescript/command/TimerCommandHandler.js';

import { DumpCommandHandler } from '#/runescript/command/debug/DumpCommandHandler.js';
import { ScriptCommandHandler } from '#/runescript/command/debug/ScriptCommandHandler.js';

import { ServerTriggerType } from '#/runescript/trigger/ServerTriggerType.js';

import { DbColumnType } from '#/runescript/type/DbColumnType.js';
import { ParamType } from '#/runescript/type/ParamType.js';
import { ScriptVarType } from '#/runescript/type/ScriptVarType.js';

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
        features: StrictFeatureLevel = {}
    ) {
        super(sourcePaths, excludePaths, scriptWriter, commandPointers, features);
        this.symbols = symbols;
        this.mapper = mapper;
        this.features = features;
    }

    setup(): void {
        this.triggers.registerAll(ServerTriggerType);
        this.registerScriptVarTypes();

        this.types.changeOptions('long', opts => {
            opts.allowDeclaration = false;
            opts.allowParameter = true;
        });

        if (this.features.procs !== false) {
            this.types.register('proc', new MetaType.Script(ServerTriggerType.PROC, MetaType.Unit, MetaType.Unit));
        }
        this.types.register('label', new MetaType.Script(ServerTriggerType.LABEL, MetaType.Unit, MetaType.Nothing));

        // Allow assignment of 'namedobj' to 'obj'.
        this.types.addTypeChecker((left, right) => left === ScriptVarType.OBJ && right === ScriptVarType.NAMEDOBJ);

        // TODO: Macros
        this.addSymConstantLoaders();

        this.types.register('walktrigger', new MetaType.Script(ServerTriggerType.WALKTRIGGER, MetaType.Any, MetaType.Nothing));

        this.types.register('queue', new MetaType.Script(ServerTriggerType.QUEUE, MetaType.Any, MetaType.Nothing));
        this.addDynamicCommandHandler('queue', new QueueCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler('.queue', new QueueCommandHandler(this.types.find('queue')));
        if (this.features.queueTyped !== false) {
            this.addDynamicCommandHandler('queue*', new QueueVarArgCommandHandler(this.types.find('queue')));
            this.addDynamicCommandHandler('.queue*', new QueueVarArgCommandHandler(this.types.find('queue')));
        }
        this.addDynamicCommandHandler('longqueue', new LongQueueCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler('.longqueue', new LongQueueCommandHandler(this.types.find('queue')));
        if (this.features.queueTyped !== false) {
            this.addDynamicCommandHandler('longqueue*', new LongQueueVarArgCommandHandler(this.types.find('queue')));
            this.addDynamicCommandHandler('.longqueue*', new LongQueueVarArgCommandHandler(this.types.find('queue')));
        }

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
        this.addSymLoader('obj', ScriptVarType.NAMEDOBJ);

        this.addSymLoader('component', ScriptVarType.COMPONENT);
        this.addSymLoader('interface', ScriptVarType.INTERFACE);
        this.addSymLoader('overlayinterface', ScriptVarType.OVERLAYINTERFACE);
        this.addSymLoader('fontmetrics', ScriptVarType.FONTMETRICS);

        this.addSymLoader('category', ScriptVarType.CATEGORY);
        this.addSymLoader('hunt', ScriptVarType.HUNT);
        this.addSymLoader('inv', ScriptVarType.INV);
        this.addSymLoader('idk', ScriptVarType.IDKIT);
        this.addSymLoader('mesanim', ScriptVarType.MESANIM);
        this.types.register('param', new ParamType(MetaType.Any));
        this.types.register('intparam', new ParamType(PrimitiveType.INT));
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
        this.addSymLoader('midi', ScriptVarType.MIDI);
        this.addSymLoader('jingle', ScriptVarType.JINGLE);

        // September 2004
        this.types.register('varbit', new VarBitType(MetaType.Any));
        this.addProtectedSymLoaderWithSupplier('varbit', sub => new VarBitType(sub));
        this.addDynamicCommandHandler('weakqueue', new QueueCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler(`.weakqueue`, new QueueCommandHandler(this.types.find('queue')));
        if (this.features.queueTyped !== false) {
            this.addDynamicCommandHandler(`weakqueue*`, new QueueVarArgCommandHandler(this.types.find('queue')));
            this.addDynamicCommandHandler(`.weakqueue*`, new QueueVarArgCommandHandler(this.types.find('queue')));
        }

        // Late 2004/early 2005
        this.addDynamicCommandHandler('strongqueue', new QueueCommandHandler(this.types.find('queue')));
        this.addDynamicCommandHandler(`.strongqueue`, new QueueCommandHandler(this.types.find('queue')));
        if (this.features.queueTyped !== false) {
            this.addDynamicCommandHandler(`strongqueue*`, new QueueVarArgCommandHandler(this.types.find('queue')));
            this.addDynamicCommandHandler(`.strongqueue*`, new QueueVarArgCommandHandler(this.types.find('queue')));
        }

        // 2005
        if (this.features.enums !== false) {
            this.addDynamicCommandHandler('enum', new EnumCommandHandler());
            this.addSymLoader('enum', ScriptVarType.ENUM);
        }

        // 2006
        // TODO: 'runclientscipt' command handler.

        // 2009
        if (this.features.structs !== false) {
            this.addDynamicCommandHandler('struct_param', new ParamCommandHandler(ScriptVarType.STRUCT));
            this.addSymLoader('struct', ScriptVarType.STRUCT);
        }
        this.types.register('softtimer', new MetaType.Script(ServerTriggerType.SOFTTIMER, MetaType.Any, MetaType.Nothing));
        this.addDynamicCommandHandler('softtimer', new TimerCommandHandler(this.types.find('softtimer')));
        this.addDynamicCommandHandler('.softtimer', new TimerCommandHandler(this.types.find('softtimer')));

        // 2012 RS / 2018 OSRS
        if (this.features.dbtables !== false) {
            this.types.register('dbcolumn', new DbColumnType(MetaType.Any));
            this.addDynamicCommandHandler('db_find', new DbFindCommandHandler(false));
            this.addDynamicCommandHandler('db_find_refine', new DbFindCommandHandler(false));
            this.addDynamicCommandHandler('db_find_with_count', new DbFindCommandHandler(true));
            this.addDynamicCommandHandler('db_find_refine_with_count', new DbFindCommandHandler(true));
            this.addDynamicCommandHandler('db_getfield', new DbGetFieldCommandHandler());
            this.addSymLoaderWithSupplier('dbcolumn', sub => new DbColumnType(sub));
            this.addSymLoader('dbrow', ScriptVarType.DBROW);
            this.addSymLoader('dbtable', ScriptVarType.DBTABLE);
        }

        // Debugging
        this.addDynamicCommandHandler('dump', new DumpCommandHandler());
        this.addDynamicCommandHandler('script', new ScriptCommandHandler());
    }

    private registerScriptVarTypes(): void {
        for (const type of ScriptVarType.ALL) {
            if (this.features.enums === false && type === ScriptVarType.ENUM) continue;
            if (this.features.structs === false && type === ScriptVarType.STRUCT) continue;
            if (this.features.dbtables === false && (type === ScriptVarType.DBROW || type === ScriptVarType.DBTABLE)) continue;
            this.types.register(type);
        }
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

    protected override createPointerChecker(diagnostics: Diagnostics, scripts: RuneScript[]): PointerChecker {
        const overlaySymbols = this.symbols['overlayinterface'];
        const overlayInterfaces = overlaySymbols ? Object.values(overlaySymbols.map) : [];
        return new ServerPointerChecker(diagnostics, scripts, this.commandPointers, this.features, overlayInterfaces);
    }
}
