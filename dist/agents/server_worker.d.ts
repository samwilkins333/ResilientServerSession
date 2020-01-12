import { ExitHandler } from "./applied_session_agent";
import ProcessMessageRouter from "./process_message_router";
/**
 * Effectively, each worker repairs the connection to the server by reintroducing a consistent state
 * if its predecessor has died. It itself also polls the server heartbeat, and exits with a notification
 * email if the server encounters an uncaught exception or if the server cannot be reached.
 */
export declare class ServerWorker extends ProcessMessageRouter {
    private static count;
    private shouldServerBeResponsive;
    private exitHandlers;
    private pollingFailureCount;
    private pollingIntervalSeconds;
    private pollingFailureTolerance;
    private pollTarget;
    private serverPort;
    private isInitialized;
    static Create(work: Function): ServerWorker;
    /**
     * Allows developers to invoke application specific logic
     * by hooking into the exiting of the server process.
     */
    addExitHandler: (handler: ExitHandler) => number;
    /**
     * Kill the session monitor (parent process) from this
     * server worker (child process). This will also kill
     * this process (child process).
     */
    killSession: (reason: string, graceful?: boolean, errorCode?: number) => Promise<import("./promisified_ipc_manager").Response<never>>;
    /**
     * A convenience wrapper to tell the session monitor (parent process)
     * to carry out the action with the specified message and arguments.
     */
    emit: <T = any>(name: string, args?: any) => Promise<import("./promisified_ipc_manager").Response<T>>;
    private constructor();
    /**
     * Set up message and uncaught exception handlers for this
     * server process.
     */
    private configureProcess;
    /**
     * Execute the list of functions registered to be called
     * whenever the process exits.
     */
    private executeExitHandlers;
    /**
     * Notify master thread (which will log update in the console) of initialization via IPC.
     */
    lifecycleNotification: (event: string) => Promise<import("./promisified_ipc_manager").Response<any>>;
    /**
     * Called whenever the process has a reason to terminate, either through an uncaught exception
     * in the process (potentially inconsistent state) or the server cannot be reached.
     */
    private proactiveUnplannedExit;
    /**
     * This monitors the health of the server by submitting a get request to whatever port / route specified
     * by the configuration every n seconds, where n is also given by the configuration.
     */
    private pollServer;
}
