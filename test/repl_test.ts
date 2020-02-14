import { AppliedSessionAgent } from "../dist/agents/applied_session_agent";
import { Monitor } from "../dist/agents/monitor";
import { ServerWorker } from "../dist/agents/server_worker";
import { v4 } from "uuid";

class TestSessionAgent extends AppliedSessionAgent {
    
    protected initializeMonitor(monitor: Monitor): Promise<string> {
        return new Promise(resolve => {
            monitor.addReplCommand("hello", [], () => console.log("world!"));
            resolve(v4());
        });
    }    

    protected initializeServerWorker(): Promise<ServerWorker> {
        return new Promise(resolve => {
            resolve(ServerWorker.Create(() => console.log("SERVER WORKER CREATED!")));
        });
    }
    
}

// new TestSessionAgent().launch();