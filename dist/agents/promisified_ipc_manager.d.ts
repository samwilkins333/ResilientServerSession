/// <reference types="node" />
import { ChildProcess } from "child_process";
/**
 * Convenience constructor
 * @param target the process / worker to which to attach the specialized listeners
 */
export declare function IPC_Promisify(target: IPCTarget, handlers?: HandlerMap): PromisifiedIPCManager;
export declare type HandlerMap = {
    [name: string]: MessageHandler[];
};
/**
 * Essentially, a node process or node cluster worker
 */
export declare type IPCTarget = NodeJS.Process | ChildProcess;
/**
 * Specifies a general message format for this API
 */
export declare type Message<T = any> = {
    name: string;
    args: T;
};
export declare type MessageHandler<T = any> = (args: T) => (any | Promise<any>);
export interface Response<T = any> {
    results?: T[];
    error?: Error;
}
/**
 * This is a wrapper utility class that allows the caller process
 * to emit an event and return a promise that resolves when it and all
 * other processes listening to its emission of this event have completed.
 */
export declare class PromisifiedIPCManager {
    readonly target: IPCTarget;
    constructor(target: IPCTarget, handlers?: HandlerMap);
    /**
     * A convenience wrapper around the standard process emission.
     * Does not wait for a response.
     */
    emit: (name: string, args?: any) => Promise<boolean | undefined>;
    /**
     * This routine uniquely identifies each message, then adds a general
     * message listener that waits for a response with the same id before resolving
     * the promise.
     */
    emitPromise: <T = any>(name: string, args?: any) => Promise<Response<T>>;
    /**
     * This routine receives a uniquely identified message. If the message is itself a response,
     * it is ignored to avoid infinite mutual responses. Otherwise, the routine awaits its completion using whatever
     * router the caller has installed, and then sends a response containing the original message id,
     * which will ultimately invoke the responseHandler of the original emission and resolve the
     * sender's promise.
     */
    private internalHandler;
}
