import { z } from 'zod';
import * as argzod from './external';

export * from './external';
export default argzod;
export { argzod }

const program = argzod.createProgram();
program.command({
    name: "connect",
    action: ({ options }) => {
        console.log("CONNECTING")
        console.log(options)
    },
    options: {
        a: {},
        b: {},
        c: {
            schema: z.string()
        },
    }
})

program.run();