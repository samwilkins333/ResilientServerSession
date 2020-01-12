/// <reference types="node" />
import { ChildProcess } from "child_process";
/**
 * Convenience constructor
 * @param target the process / worker to which to attach the specialized listeners
 */
export declare function manage(target: IPCTarget, handlers?: HandlerMap): PromisifiedIPCManager;
/**
 * Captures the logic to execute upon receiving a message
 * of a certain name.
 */
export declare type HandlerMap = {
    [name: string]: MessageHandler[];
};
/**
 * This will always literally be a child process. But, though setting
 * up a manager in the parent will indeed see the target as the ChildProcess,
 * setting up a manager in the child will just see itself as a regular NodeJS.Process.
 */
export declare type IPCTarget = NodeJS.Process | ChildProcess;
/**
 * Specifies a general message format for this API
 */
export declare type Message<T = any> = {
    name: string;
    args?: T;
};
export declare type MessageHandler<T = any> = (args: T) => (any | Promise<any>);
/**
 * Allows for the transmission of the error's key features over IPC.
 */
export interface ErrorLike {
    name?: string;
    message?: string;
    stack?: string;
}
/**
 * The arguments returned in a message sent from the target upon completion.
 */
export interface Response<T = any> {
    results?: T[];
    error?: ErrorLike;
}
/**
 * This is a wrapper utility class that allows the caller process
 * to emit an event and return a promise that resolves when it and all
 * other processes listening to its emission of this event have completed.
 */
export declare class PromisifiedIPCManager {
    private readonly target;
    private pendingMessages;
    private isDestroyed;
    private get callerIsTarget();
    constructor(target: IPCTarget, handlers?: HandlerMap);
    /**
     * This routine uniquely identifies each message, then adds a general
     * message listener that waits for a response with the same id before resolving
     * the promise.
     */
    emit: <T = any>(name: string, args?: any) => Promise<Response<T>>;
    /**
     * Invoked from either the parent or the child process, this allows
     * any unresolved promises to continue in the target process, but dispatches a dummy
     * completion response for each of the pending messages, allowing their
     * promises in the caller to resolve.
     */
    destroy: () => void;
    /**
     * Dispatches the dummy responses and sets the isDestroyed flag to true.
     */
    private destroyHelper;
    /**
     * This routine receives a uniquely identified message. If the message is itself a response,
     * it is ignored to avoid infinite mutual responses. Otherwise, the routine awaits its completion using whatever
     * router the caller has installed, and then sends a response containing the original message id,
     * which will ultimately invoke the responseHandler of the original emission and resolve the
     * sender's promise.
     */
    private generateInternalHandler;
}
