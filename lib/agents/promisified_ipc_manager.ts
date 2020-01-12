import { Utilities } from "../utilities/utilities";
import { ChildProcess } from "child_process";

/**
 * Convenience constructor
 * @param target the process / worker to which to attach the specialized listeners 
 */
export function IPC_Promisify(target: IPCTarget, handlers?: HandlerMap) {
    return new PromisifiedIPCManager(target, handlers);
}

export type HandlerMap = { [name: string]: MessageHandler[] };

/**
 * Essentially, a node process or node cluster worker
 */
export type IPCTarget = NodeJS.Process | ChildProcess;

/**
 * Specifies a general message format for this API 
 */
export type Message<T = any> = {
    name: string;
    args: T;
};
export type MessageHandler<T = any> = (args: T) => (any | Promise<any>);

/**
 * When a message is emitted, it is embedded with private metadata
 * to facilitate the resolution of promises, etc.
 */
interface InternalMessage extends Message { metadata: any };
type InternalMessageHandler = (message: InternalMessage) => (any | Promise<any>);

export interface Response<T = any> {
    results?: T[],
    error?: Error
}

/**
 * This is a wrapper utility class that allows the caller process
 * to emit an event and return a promise that resolves when it and all
 * other processes listening to its emission of this event have completed. 
 */
export class PromisifiedIPCManager {
    public readonly target: IPCTarget;

    constructor(target: IPCTarget, handlers?: HandlerMap) {
        this.target = target;
        if (handlers) {
            this.target.addListener("message", this.internalHandler(handlers));
        }
    }

    /**
     * A convenience wrapper around the standard process emission.
     * Does not wait for a response. 
     */
    public emit = async (name: string, args?: any) => this.target.send?.({ name, args });

    /**
     * This routine uniquely identifies each message, then adds a general
     * message listener that waits for a response with the same id before resolving
     * the promise.
     */
    public emitPromise = async <T = any>(name: string, args?: any): Promise<Response<T>> => {
        return new Promise<Response<T>>(resolve => {
            const messageId = Utilities.guid();
            const responseHandler: InternalMessageHandler = ({ metadata: { id, isResponse }, args }) => {
                if (isResponse && id === messageId) {
                    this.target.removeListener("message", responseHandler);
                    resolve(args);
                }
            };
            this.target.addListener("message", responseHandler);
            const message = { name, args, metadata: { id: messageId } };
            this.target.send?.(message);
        });
    }

    /**
     * This routine receives a uniquely identified message. If the message is itself a response,
     * it is ignored to avoid infinite mutual responses. Otherwise, the routine awaits its completion using whatever
     * router the caller has installed, and then sends a response containing the original message id,
     * which will ultimately invoke the responseHandler of the original emission and resolve the
     * sender's promise.
     */
    private internalHandler = (handlers: HandlerMap): MessageHandler => async ({ name, args, metadata }: InternalMessage) => {
        if (name && (!metadata || !metadata.isResponse)) {
            let error: Error | undefined;
            let results: any[] | undefined ;
            try {
                const registered = handlers[name];
                if (registered) {
                    results = await Promise.all(registered.map(handler => handler(args)));
                }
            } catch (e) {
                error = e;
            }
            if (metadata && this.target.send) {
                metadata.isResponse = true;
                const response: Response = { results , error };
                this.target.send({ name, args: response , metadata });
            }
        }
    }

}