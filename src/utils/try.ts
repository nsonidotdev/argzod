type Result<T> = {
    success: true
    data: T;
} | {
    success: false
    error: any;
};

export const tryAsync = async <T>(dataSource: Promise<T> | (() => Promise<T>)): Promise<Result<T>> => {
    try {
        let data: T | Promise<T>;

        if (typeof dataSource === 'function') {
            data = await dataSource()
        } else {
            data = await dataSource
        }

        return {
            success: true,
            data
        };
    } catch (error) {
        return {
            success: false,
            error
        };
    }
}

export function trySync<T>(dataSource: () => T): Result<T> {
    try {
        return {
            data: dataSource(),
            success: true
        };
    } catch (error) {
        return {
            success: false,
            error
        };
    }
}

