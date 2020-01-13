/// <reference types="node" />
import { ExitHandler } from "./applied_session_agent";
import { ReplAction } from "../utilities/repl";
import { MessageHandler } from "./promisified_ipc_manager";
import { ExecOptions } from "child_process";
import IPCMessageReceiver from "./process_message_router";
/**
 * Validates and reads the configuration file, accordingly builds a child process factory
 * and spawns off an initial process that will respawn as predecessors die.
 */
export declare class Monitor extends IPCMessageReceiver {
    private static count;
    private finalized;
    private exitHandlers;
    private readonly config;
    private activeWorker;
    private key;
    private repl;
    static Create(sessionKey: string): Monitor;
    private constructor();
    protected configureInternalHandlers: () => void;
    private initializeClusterFunctions;
    finalize: () => void;
    readonly coreHooks: Readonly<{
        onCrashDetected: (listener: MessageHandler<{
            error: Error;
        }>) => void;
        onServerRunning: (listener: MessageHandler<{
            isFirstTime: boolean;
        }>) => void;
    }>;
    /**
     * Kill this session and its active child
     * server process, either gracefully (may wait
     * indefinitely, but at least allows active networking
     * requests to complete) or immediately.
     */
    killSession: (reason: string, graceful?: boolean, errorCode?: number) => Promise<never>;
    /**
     * Execute the list of functions registered to be called
     * whenever the process exits.
     */
    addExitHandler: (handler: ExitHandler) => number;
    /**
     * Extend the default repl by adding in custom commands
     * that can invoke application logic external to this module
     */
    addReplCommand: (basename: string, argPatterns: (string | RegExp)[], action: ReplAction) => void;
    exec: (command: string, options?: ExecOptions | undefined) => Promise<void>;
    /**
     * Generates a blue UTC string associated with the time
     * of invocation.
     */
    private timestamp;
    /**
     * A formatted, identified and timestamped log in color
     */
    mainLog: (...optionalParams: any[]) => void;
    /**
     * A formatted, identified and timestamped log in color for non-
     */
    private execLog;
    /**
     * Reads in configuration .json file only once, in the master thread
     * and pass down any variables the pertinent to the child processes as environment variables.
     */
    private loadAndValidateConfiguration;
    /**
     * Builds the repl that allows the following commands to be typed into stdin of the master thread.
     */
    private initializeRepl;
    private executeExitHandlers;
    /**
     * Attempts to kill the active worker gracefully, unless otherwise specified.
     */
    private killActiveWorker;
    /**
     * Allows the caller to set the port at which the target (be it the server,
     * the websocket, some other custom port) is listening. If an immediate restart
     * is specified, this monitor will kill the active child and re-launch the server
     * at the port. Otherwise, the updated port won't be used until / unless the child
     * dies on its own and triggers a restart.
     */
    private setPort;
    /**
     * Kills the current active worker and proceeds to spawn a new worker,
     * feeding in configuration information as environment variables.
     */
    private spawn;
}
export declare namespace Monitor {
    enum IntrinsicEvents {
        KeyGenerated = "key_generated",
        CrashDetected = "crash_detected",
        ServerRunning = "server_running"
    }
}
