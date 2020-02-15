import { Monitor } from "./monitor";
import { ServerWorker } from "./server_worker";
export declare type ExitHandler = (reason: Error | boolean) => void | Promise<void>;
export declare abstract class AppliedSessionAgent {
    protected abstract initializeMonitor(monitor: Monitor): string | Promise<string>;
    protected abstract initializeServerWorker(): ServerWorker | Promise<ServerWorker>;
    private launched;
    killSession: (reason: string, graceful?: boolean, errorCode?: number) => void;
    private sessionMonitorRef;
    get sessionMonitor(): Monitor;
    private serverWorkerRef;
    get serverWorker(): ServerWorker;
    launch(): Promise<void>;
}
