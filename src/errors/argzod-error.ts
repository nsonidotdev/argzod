import type { MessageMap } from '../types';
import type { ErrorCode } from './codes';
import { errorMessageMap } from './messages';

export class ArgzodError<
    TCode extends ErrorCode = any,
    TMessage extends
        (typeof errorMessageMap)[TCode] = (typeof errorMessageMap)[TCode],
> extends Error {
    code: TCode;
    private ctx: TMessage extends (...args: any) => string
        ? Parameters<TMessage>
        : undefined;
    path?: string;

    constructor(
        data: TMessage extends (...args: any) => string
            ? { code: TCode; ctx: Parameters<TMessage>; path?: string }
            : { code: TCode; path?: string } | TCode,
        customMessages?: MessageMap
    ) {
        const messages = {
            ...errorMessageMap,
            ...customMessages
        }
        
        let message = '';
        let ctx: any = undefined;
        let code: TCode;
        let path: undefined | string;

        if (typeof data === 'string') {
            code = data as TCode;
            message = messages[code] as string;
        } else {
            // @ts-expect-error
            if ('ctx' in data) {
                const messageFn = messages[data.code] as (
                    ...arg: any
                ) => string;
                message = messageFn(...data.ctx);
                ctx = data.ctx;
                code = data.code;
                path = data.path;
            } else {
                message = messages[data.code] as string;
                code = data.code;
                path = data.path;
            }
        }

        super(message);
        Object.setPrototypeOf(this, ArgzodError.prototype);

        this.name = 'ArgzodError';
        this.ctx = ctx;
        this.code = code;
        this.path = path;
    }
}
