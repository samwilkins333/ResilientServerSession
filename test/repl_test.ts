import { AppliedSessionAgent } from "../dist/agents/applied_session_agent";
import { Monitor } from "../dist/agents/monitor";
import { ServerWorker } from "../dist/agents/server_worker";
import { v4 } from "uuid";
import * as express from "express";

class TestSessionAgent extends AppliedSessionAgent {
    
    protected initializeMonitor(monitor: Monitor) {
        monitor.addReplCommand("hello", [], () => console.log("world!"));
        return v4();
    }    

    protected initializeServerWorker() {
        return ServerWorker.Create(() => app.listen(3000));
    }
    
}

const app = express();
app.get("/", (_req, res) => res.send("allo!"));

new TestSessionAgent().launch();