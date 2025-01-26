import type { ErrorCode } from './codes';
import { errorMessageMap } from './messages';

export class ArgzodError extends Error {
    code: ErrorCode;
    path?: string;

    constructor({
        code,
        message,
        path,
    }: {
        code: ErrorCode;
        message?: string;
        path?: string;
    }) {
        message ??= errorMessageMap[code];
        const formattedMessage = path ? `${path}: ${message}` : message;

        super(formattedMessage);
        Object.setPrototypeOf(this, ArgzodError.prototype);

        this.name = 'ArgzodError';
        this.code = code;
        this.path = path;
    }
}
