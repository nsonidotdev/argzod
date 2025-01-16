type Result<T> = {
    data: T;
    error: null;
} | {
    data: null;
    error: any;
};

export const asyncHandleError = async <T>(dataSource:  Promise<T> | (() => Promise<T>)): Promise<Result<T>> => {
    try {
        let data: T | Promise<T>;

        if (typeof dataSource === 'function') {
            data = await dataSource()
        } else {
            data = await dataSource
        }

        return {
            data,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error
        };
    }
}

export function syncHandleError<T>(dataSource: () => T): Result<T> {
    try {
        return {
            data: dataSource(),
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error
        };
    }
}

