import type { Program } from "../api";
import { ArgzodError } from "../errors"
import { trySync } from "./try";

const OPERATION_STOP = Symbol('operation-stop')

type Result<T> = {
    errors: Set<ArgzodError>;
    manuallyStopped: boolean;
} & (
        | { success: true; value: T }
        | { success: false }
    );

type OperationContext = {
    errors: Set<ArgzodError>;
    break: () => void;
}

type Tail<T extends any[]> = T extends [any, ...infer U] ? U : never;
type OperationFinalReturn<T> = Result<T> & { unwrap: UnwrapFn<T> }
type UnwrapFn<T> = (program: Program) => T | never;

export const operation = <T extends (ctx: OperationContext, ...args: any[]) => any>(fn: T): ((...args: Tail<Parameters<T>>) => OperationFinalReturn<ReturnType<T>>) => {
    const ctx: OperationContext = {
        errors: new Set(),
        break: () => { throw OPERATION_STOP }
    }

    return (...args) => {
        const result = trySync(() => fn(ctx, ...args))

        if (!result.success) {
            if (result.error === ArgzodError) {
                ctx.errors.add(result.error)
            }

            return withHelpers({
                errors: ctx.errors,
                success: false,
                manuallyStopped: result.error === OPERATION_STOP,
            })
        }

        return withHelpers({
            errors: ctx.errors,
            success: true,
            value: result.data,
            manuallyStopped: false
        })
    };
}

const withHelpers = <T>(data: Result<T>): OperationFinalReturn<T> => {
    const unwrap: UnwrapFn<T> = (program) => {
        data.errors.forEach(err => program._registerError(err));
        if (!data.success) throw Array.from(data.errors).at(-1);

        return data.value;
    }

    return {
        ...data,
        unwrap
    }
}

// export const operation = <T extends (...args: any[]) => any>(fn: (ctx: OperationContext) => T): (...args: Parameters<T>) => Result<ReturnType<T>> => {
//     const errors: Set<ArgzodError> = new Set();
//     const stop = () => { throw OPERATION_STOP };

//     const cb = fn({ errors, stop });

//     return (...args) => {
//         const result = trySync(() => cb(...args))

//         if (!result.success) {
//             if (result.error === ArgzodError) {
//                 errors.add(result.error)
//             }

//             return {
//                 errors,
//                 success: false,
//                 manuallyStopped: result.error === OPERATION_STOP
//             }
//         }

//         return {
//             errors,
//             success: true,
//             value: result.data,
//             manuallyStopped: false
//         }
//     };
// }

