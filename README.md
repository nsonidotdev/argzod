# argzod ![NPM Version](https://img.shields.io/npm/v/argzod) ![Bundle Size](https://deno.bundlejs.com/badge?q=argzod@0.6.2&treeshake=[*])
Minimalistic typescript-first CLI parser 📚

## 🔍 Overview
argzod is a lightweight CLI argument parsing library that simplifies input validation using Zod. It provides a streamlined alternative to tools like Commander and Yargs, offering seamless Zod integration for robust input validation.

With powerful type inference, argzod ensures type safety without extra configuration, eliminating inconsistencies and making CLI development more intuitive.

🚀 Why Choose argzod?
- ✅ Minimal & Intuitive – A simpler alternative to complex CLI parsers.
- ⚡ Seamless Zod Integration – Validate and transform CLI inputs effortlessly.
- 🔧 Strong Type Inference – No more manual type definitions which can lead to inconsistencies.
Perfect for developers who want a lightweight, type-safe, and modern approach to CLI argument parsing! 🚀

## 📦 Installation
Install **argzod** with package manager of your choice
### **npm**
`npm install argzod`
### **yarn**
`yarn add argzod`
### **pnpm**
`pnpm add argzod`
### **Deno 2**
`deno install npm:argzod`

## 💻 Quick Start
Let's create a simple app with an unnamed command that has one option, and one argument. For this example, we’ll use Deno for easy running of TypeScript files.

```ts
import { argzod } from "npm:argzod";
import { z } from "npm:zod";

const program = argzod.createProgram({
    name: 'my-tool',
});

program.command({
    action: ({ options }) => {
        console.log(`Formats ${options.format.join(', ')} where picked`);
    },
    options: {
        format: {
            name: ['format', 'f'],
            parse: 'many',
            schema: z.array(z.enum(['esm', 'cjs', 'iife'])).min(1).max(3)
        }
    },
    args: [
        { schema: z.coerce.number().refine(arg => arg % 2 === 0) }
    ]
})

program.run();
```

Let's run our program  with different sets of options and arguments
```sh 
$ deno --allow-all main.ts 42 --format iife cjs
# Formats iife, cjs where picked

$ deno --allow-all main.ts 99 --format iife umd
# [⚠ Error] | --format | Invalid enum value. Expected 'esm' | 'cjs' | 'iife', received 'umd'
```

## 📖 API Reference

### `createProgram`
```ts
createProgram(config: ProgramConfig): Program
```
Creates and returns a new instance of a `Program`

**Example usage:**
```ts
import { argzod } from 'argzod';

const program = argzod.createProgram({
    name: 'my-tool',
    description: 'My skibidi CLI tool',
    // If unknown options are met program will still be executed with warn logs
    undefinedOptionsBehavior: 'warn', 
    messages: {
        "option-not-defined": "You custom message here",
        "zod-parse": (error) => `Validation error: ${error.message}`
    },
    onError: ({ error, warn, ignore }) => {
        console.log('This is called when program catches error')
    },
});
```

### `createCommand`
```ts
createCommand(def: CommandDefinition & { program: Progam }): Command`
```
Creates and returns a `Command` instance that can be attached to a program. 
Command `action` infers types of options and arguments you have defined. In example below `args` and `options` have following types:
```ts
{ 
    args: ["save" | "draft", number], 
    options: { title: string } 
}
```
**Example usage:**
```ts
// index.ts
import { argzod } from 'argzod';
import { addCommand } from './commands/add';

const program = argzod.createProgram({
    name: 'my-tool',
    messages: {},
});

program.attachCommand(addCommand);

// commands/add.ts
import { argzod } from 'argzod';
import { program } from '../index';

export const addCommand = argzod.createCommand({
    program,
    name: 'add',
    description: 'adds something',
    action: ({ args, options, parsedEntries, unknownOptions }) => {
        console.log('===== Adding item =====');

        console.log('Count', args[0]);
        console.log('Title', options.title);
    },
    options: {
        title: {
            name: ['title', 't'],
            parse: 'single',
            schema: z.string().optional().default('Default title'),
        },
    },
    args: [{ schema: z.enum(['save', 'draft']).catch('draft') }, { schema: z.coerce.number().min(0).max(10).catch(1) }],
});
```


### `program.command`
```ts 
program.command(def: CommandDefinition): Command
```
Creates a `Command` and automatically attaches it to a `Program` instance so it does not need to be attached manually. 
See example in `createCommand` reference [section](#createcommand) for more information

**Example usage:**
```ts
const program = argzod.createProgram({
    name: 'my-tool',
    messages: {},
});

program.command({ 
    name,
    options, 
    args,
    action
});
```

### `program.attachCommand`
```ts
program.attachCommand(Command: Command): Program
```
Attaches given `Command` to the program. Returns `Program` so `attachCommand` calls can be chained.
**Example usage:**
```ts
import { argzod } from 'argzod';
import { commandA, commandB, commandC } from './commands';

const program = argzod.createProgram(...);

progam  
    .attachCommand(commandA)
    .attachCommand(commandB)
    .attachCommand(commandC)
```

### `program.run`
```ts
program.run(argv?: string[]): void
```
Parses passed `argv` and if not provided `pocess.argv`. 
> Commands should be attached before `program.run()`

**Example usage:**
```ts
import { argzod } from 'argzod';
import { commandA, commandB, commandC } from './commands';

const program = argzod.createProgram(...);
progam  
    .attachCommand(commandA)
    .attachCommand(commandB)
    .attachCommand(commandC)

program.run() // takes arguments from process.argv
// or
program.run(["command or argument", '--option=value', "--other-option", "value1", "value2"]) // pass custom arguments
```

### `Program`
Instance of a program. Can be created with [`createProgram`](#createprogram)

**Methods**
- `run` Parses arguments and calls `action` callbacks of attached commands
- `command` Creates and attaches command to a program
- `attachCommand` Attaches command to a program

### `ProgramConfig`
- `name: string` Name of your tool. Used for help messages
- `description?: string` Description of your tool. Used for help messages
- `messages?: MessageMap` An object containing custom error messages. Keys represent error codes and value can either be a `string` or a function which gives useful information about the error
- `undefinedOptionsBehavior?: ErrorLevel` Sets error level for unknown options. Default `error`.
- `onError?: (errors: Record<ErrorLevel, ArgzodError>) => void` Callback function which is called whenever at least one error has been caught. 

### `Command`
Instance of a command. Can be created with [`createCommand`](#createcommand) or [`program.command`](#programcommand)

### `CommandDefinition`

**Fields**
- `name: string` Command alias used to identify command while parsing
- `description?: string` Command description that will be dispalyed with `--help`  
- `options: Record<string, OptionDef>` Options which program will try to parse. See [`OptionDef`](#optiondef)
- `args: ArgumentDefinition[]` Arguments which program will try to parse. See [`ArgumentDefinition`](#argumentdefinition)
- `action` A callback function that runs when command is parsed successfuly
    ```ts
    action: <TArgs, TOpts>(
        data: { 
            args: TArgs, 
            options: TOpts, 
            parsedEntries: ParsedEntry[]; 
            unknownOptions: ParsedOption[];
        }
    ) => void
    ```
    Callback function which gets called if *options* and *args* are successfuly parsed. Infers from [`OptionDef`](#optiondef) and [`ArgumentDefinition`](#argumentdefinition)


### `OptionDef`
- `name: string | string[]` Option aliases for program to check
- `description?: string` Option description that will appear in `--help` 
- `parse: 'boolean' | 'signle' | 'many'` 
   Sets how option values will be parsed
   - `boolean` Expects that option to appear in argv only once and not have any values
   - `single` Expects that option to appear in argv only once and have one value. 
   - `many` Expects that option to appear in argv only any amount of times and have any amount of values 
- `schema?: ZodType` Zod type that

#### `BooleanOptionDef`
The same as [`OptionDef`](#optiondef)

#### `SingleOptionDef`
The same as [`OptionDef`](#optiondef)

#### `ManyOptionDef`
Extends [`OptionDef`](#optiondef)
- `maxLength?: number` A maximum number of values that will be parsed if values are passed space separated (`--many-option val1 val2 val3`)

### `ArgumentDefinition` 
- `schema: ZodType` Zod schema which will be applied to the argument
- `description?: string` Argument description that will appear in `--help` (not yet implemented)

### `ArgzodError`
Extends JS `Error` class.
- `code: ErrorCode`
- `level: ErrorLevel`
- `message: string`
