/// <reference types="node" />
/**
 * Convenience constructor
 * @param target the process / worker to which to attach the specialized listeners
 */
export declare function IPC_Promisify(target: IPCTarget, router: Router): PromisifiedIPCManager;
/**
 * Essentially, a node process or node cluster worker
 */
export declare type IPCTarget = NodeJS.EventEmitter & {
    send?: Function;
};
/**
 * Some external code that maps the name of  incoming messages to registered handlers, if any
 * when this returns, the message is assumed to have been handled in its entirety by the process, so
 * await any asynchronous code inside this router.
 */
export declare type Router = (message: Message) => void | Promise<void>;
/**
 * Specifies a general message format for this API
 */
export declare type Message<T = any> = {
    name: string;
    args: T;
};
export declare type MessageHandler<T = any> = (args: T) => any | Promise<any>;
/**
 * This is a wrapper utility class that allows the caller process
 * to emit an event and return a promise that resolves when it and all
 * other processes listening to its emission of this event have completed.
 */
export declare class PromisifiedIPCManager {
    private readonly target;
    constructor(target: IPCTarget, router: Router);
    /**
     * A convenience wrapper around the standard process emission.
     * Does not wait for a response.
     */
    emit: (name: string, args?: any) => Promise<any>;
    /**
     * This routine uniquely identifies each message, then adds a general
     * message listener that waits for a response with the same id before resolving
     * the promise.
     */
    emitPromise: (name: string, args?: any) => Promise<unknown>;
    /**
     * This routine receives a uniquely identified message. If the message is itself a response,
     * it is ignored to avoid infinite mutual responses. Otherwise, the routine awaits its completion using whatever
     * router the caller has installed, and then sends a response containing the original message id,
     * which will ultimately invoke the responseHandler of the original emission and resolve the
     * sender's promise.
     */
    private internalHandler;
}
