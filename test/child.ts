import { IPC_Promisify } from "../dist/agents/promisified_ipc_manager";

IPC_Promisify(process, {
    wait: [async ({ seconds, parentPid }) => {
        // console.log("CHILD", seconds, parentPid, process.pid);
        await new Promise<void>(resolve => setTimeout(resolve, 1000 * seconds));
        return `Hey, ${parentPid}! What a long wait that was. I'm ${process.pid}.`;
    }]
});