import type { ArgzodError } from "../errors";

export type Result<T> = {
    value?: T;
    errors: ArgzodError[];
}