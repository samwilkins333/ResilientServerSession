import { expect } from "chai";
import { fork } from "child_process";
import { IPC_Promisify, MessageHandler } from "../dist/agents/promisified_ipc_manager";
import { describe } from "mocha";

const onMessage: { [key: string]: MessageHandler[] } = {};

const wrapper = IPC_Promisify(fork(__dirname + "/child.js"), {});

describe("emitPromise functionality test", () => {

    it("should take more than 10000 milliseconds to return from the promise message", async function () {
        this.timeout(0);
        const before = Date.now();
        const { pid: parentPid } = process;
        const { pid: childPid } = wrapper.target;
        const seconds = 10;
        // console.log("PARENT", seconds, parentPid, childPid);
        const { results, error } = await wrapper.emitPromise<string>("wait", { seconds, parentPid });
        // console.log("PARENT", results, error);
        const elapsed = Date.now() - before;
        expect(elapsed).to.be.greaterThan(10000);
        expect(results[0]).to.be.equal(`Hey, ${parentPid}! What a long wait that was. I'm ${childPid}.`);
        expect(error).to.be.equal(undefined);
    });

});