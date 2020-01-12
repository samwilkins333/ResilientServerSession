import { MessageHandler, PromisifiedIPCManager, HandlerMap } from "./promisified_ipc_manager";
export default abstract class ProcessMessageRouter {
    protected static IPCManager: PromisifiedIPCManager;
    protected handlers: HandlerMap;
    /**
     * Add a listener at this message. When the monitor process
     * receives a message, it will invoke all registered functions.
     */
    on: (name: string, handler: MessageHandler<any>, exclusive?: boolean) => void;
    /**
     * Unregister a given listener at this message.
     */
    off: (name: string, handler: MessageHandler<any>) => void;
    /**
     * Unregister all listeners at this message.
     */
    clearMessageListeners: (...names: string[]) => boolean[];
}
