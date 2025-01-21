import * as argzod from './external';

export * from './external';
export default argzod;
export { argzod }

export const add = (a: number, b: number) => {
    return a + b;
}

add(1, 'Hello, world!')