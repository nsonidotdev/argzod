export type CommandName<T extends string = "index"> = "index" | T

export type Command = {
    name: string;
    run: () => void;
}