import { ArgzodError } from "./errors"
import { trySync } from "./utils/try";

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
    stop: () => void;
}

type Tail<T extends any[]> = T extends [any, ...infer U] ? U : never;
export const operation = <T extends (ctx: OperationContext, ...args: any[]) => any>(fn: T): ((...args: Tail<Parameters<T>>) => Result<ReturnType<T>>) => {
    const errors: Set<ArgzodError> = new Set();
    const stop = () => { throw OPERATION_STOP };
    
    const ctx: OperationContext = {
        errors,
        stop
    }

    return (...args) => {
        const result = trySync(() => fn(ctx, ...args))
        
        if (!result.success) {
            if (result.error === ArgzodError) {
                errors.add(result.error)
            }
            
            return {
                errors,
                success: false,
                manuallyStopped: result.error === OPERATION_STOP
            }
        }
        
        return {
            errors,
            success: true,
            value: result.data,
            manuallyStopped: false
        }
    };
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

