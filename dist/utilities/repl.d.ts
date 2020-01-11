/// <reference types="node" />
import { Interface } from "readline";
export interface Configuration {
    identifier: () => string | string;
    onInvalid?: (command: string, validCommand: boolean) => string | string;
    onValid?: (success?: string) => string | string;
    isCaseSensitive?: boolean;
}
export declare type ReplAction = (parsedArgs: Array<string>) => any | Promise<any>;
export interface Registration {
    argPatterns: RegExp[];
    action: ReplAction;
}
export default class Repl {
    private identifier;
    private onInvalid;
    private onValid;
    private isCaseSensitive;
    private commandMap;
    interface: Interface;
    private busy;
    private keys;
    constructor({ identifier: prompt, onInvalid, onValid, isCaseSensitive }: Configuration);
    private resolvedIdentifier;
    private usage;
    private success;
    registerCommand: (basename: string, argPatterns: (string | RegExp)[], action: ReplAction) => void;
    private invalid;
    private valid;
    private considerInput;
}
