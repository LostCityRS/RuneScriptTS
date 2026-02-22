<div align="center">
<h1>RuneScriptTS</h1>
</div>

This is a **RuneScript Compiler**, written in TypeScript. Our focus is to preserve RS2 history as accurately and authentically as we can.

### Installation and Usage

`npm i @lostcityrs/runescript`  
(or yarn, bun, pnpm...)

```ts
import { CompileServerScript, CompilerTypeInfo } from '@lostcityrs/runescript';

// opcode->command lookup + pointer info
const commandInfo: CompilerTypeInfo = ...;

// script id->name lookup
const runescriptInfo: CompilerTypeInfo = ...;

// config id->name lookup
const npcInfo: CompilerTypeInfo = ...;

CompileServerScript({
    symbols: {
        'command': commandInfo,
        'runescript': runescriptInfo,

        'npc': npcInfo,
        ...
    }
});
```

The compiler expects a couple things to be in place.

1. A source folder that contains `.rs2` scripts.
2. Symbol information provided for the types you plan on referencing.

By default it will read scripts from `../content/scripts`.
After it runs, compiled output will be placed in `./data/pack/server`.  
If that doesn't work for your use case, please see the config object you pass to CompileServerScript.

See [LostCityRS/Server](https://github.com/LostCityRS/Server) for a working example.

### Building RuneScriptTS

After cloning:
```sh
bun i
bun run antlr
```

Testing:  
You can test changes without publishing by copying `dist/runescript.js` into your consumer's node_modules folder
```sh
bun run build
cp dist/runescript.* ../node_modules/@lostcityrs/runescript/dist/
```

### History

Originally a fork of [Neptune](https://github.com/neptune-ps/neptune)'s script compiler.  
Our initial compiler fork (2023-2026) focused instead on making a complete server script compiler, along with a script runtime and world simulation:  
https://github.com/LostCityRS/RuneScriptKt  
https://github.com/LostCityRS/Engine-TS

As of February 2026 we have transitioned from the "legacy" Kotlin codebase to this TypeScript codebase (clean port).  
Consumers should use this. It is production-ready and produces compatible output along with some bug fixes.

### Credits

Polar: For your years of work on Neptune and many days brainstorming together.  
Flenarn: For your effort porting so much Kotlin code to TypeScript. There were only a few lines to fix afterwards - great job.  
Contributions in RuneScriptKt: Henke96 [PR #1](https://github.com/LostCityRS/RuneScriptKt/pull/1) and Bea5 [PR #2](https://github.com/LostCityRS/RuneScriptKt/pull/1).
