export type CommandName<T extends string = "index"> = "index"  | T;

export type Command = {
    name: string;
    run: () => void;
}

export type OptionValue = string | true;

export type ParsedArgument = 
| {
    type: "option";
    variant: "long" | "short";
    name: string;
    value: OptionValue;
}
| {
    type: "argument";
    value: string;
}