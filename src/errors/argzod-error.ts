import { ErrorLevel } from '../enums';
import type { MessageMap } from '../types';
import type { ErrorCode } from './codes';
import { errorMessageMap } from './messages';
import type { ErrorMessageFn } from './types';

export class ArgzodError<
    TCode extends ErrorCode = ErrorCode,
    TMessage extends (typeof errorMessageMap)[NoInfer<TCode>] = (typeof errorMessageMap)[NoInfer<TCode>],
> extends Error {
    #code: TCode;
    level: ErrorLevel;
    path?: string;
    private ctx: TMessage extends (...args: any) => string ? Parameters<TMessage> : undefined;

    constructor(
        data: TMessage extends (...args: any) => string
            ? { code: TCode; ctx: Parameters<TMessage>; path?: string; level?: ErrorLevel }
            : { code: TCode; path?: string; level?: ErrorLevel } | TCode,
    ) {
        const messages = {
            ...errorMessageMap,
        };

        let message = '';
        let ctx: any = undefined;
        let code: TCode;
        let path: undefined | string;
        let errorLevel: ErrorLevel = ErrorLevel.Error;

        if (typeof data === 'string') {
            code = data as TCode;
            message = messages[code] as string;
        } else {
            // @ts-expect-error
            if ('ctx' in data) {
                const messageFn = messages[data.code] as (...arg: any) => string;
                message = messageFn(...data.ctx);
                ctx = data.ctx;
                code = data.code;
                path = data.path;
            } else {
                message = messages[data.code] as string;
                code = data.code;
                path = data.path;
                if (data.level) errorLevel = data.level;
            }
        }

        super(message);
        Object.setPrototypeOf(this, ArgzodError.prototype);

        this.name = 'ArgzodError';
        this.ctx = ctx;
        this.#code = code;
        this.path = path;
        this.level = errorLevel;
    }

    get code() {
        return this.#code;
    }

    /**
     * Using given message map updates error message if finds appropriate code in a map
     * @param messageMap Map of user defined custom messages
     * @returns void
     */
    __applyMessageMap(messageMap?: MessageMap) {
        if (!messageMap) return;

        const message = messageMap[this.#code];
        if (!message) return;

        if (typeof message === 'string') {
            this.message = message;
        } else if (typeof message === 'function') {
            const messageFn = message as ErrorMessageFn;
            const ctx = this.ctx as any[];

            this.message = messageFn(...ctx);
        }
    }

    __setPath(path: string) {
        this.path = path;
    }
}
