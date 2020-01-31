import { AppliedSessionAgent } from "../dist/agents/applied_session_agent";
import { Monitor } from "../dist/agents/monitor";
import { ServerWorker } from "../dist/agents/server_worker";
import * as express from "express";
import { Utilities } from "../dist/utilities/utilities";

class TestSessionAgent extends AppliedSessionAgent {
    
    protected async initializeMonitor(monitor: Monitor): Promise<string> {
        monitor.addReplCommand("hello", [], () => console.log("WORLD"));
        return Utilities.guid();
    }
    
    protected async initializeServerWorker(): Promise<ServerWorker> {
        const worker = ServerWorker.Create(() => {
            const app = express();
            app.listen(3000, () => console.log("Dummy server listening on 3000!"));
        });
        worker.addExitHandler(() => console.log("GOODBYE!"));
        return worker;
    }

}

new TestSessionAgent().launch();