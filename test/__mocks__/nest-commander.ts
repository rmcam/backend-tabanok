export class CommandRunner {
    static prototype = {
        run: jest.fn(),
        execute: jest.fn(),
    };

    constructor() { }
    run() { }
    execute() { }
}

export const Command = () => jest.fn();
export const Option = () => jest.fn();
export const SubCommand = () => jest.fn(); 