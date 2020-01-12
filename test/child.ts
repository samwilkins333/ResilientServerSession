import { manage, HandlerMap } from "../dist/agents/promisified_ipc_manager";

async function onWait({ milliseconds, parentPid }) {
    await new Promise<void>(resolve => setTimeout(resolve, milliseconds));
    const parentSecret = (await manager.emit<string>("requestSecret")).results[0];
    return `Hey, ${parentPid}! What a long wait that was. I'm ${process.pid}. Your secret is ${parentSecret}`;
};

const localHandlers: HandlerMap = { wait: [onWait] };

const manager = manage(process, localHandlers);