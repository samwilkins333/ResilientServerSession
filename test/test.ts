import { expect } from "chai";
import { fork } from "child_process";
import { manage } from "../dist/agents/promisified_ipc_manager";
import { describe } from "mocha";
import { v4 } from "uuid";

const secret = v4();
const delayFactor = 0.25;
const milliseconds = 10000;

async function onRequestSecret() {
    return new Promise<string>(resolve => setTimeout(() => resolve(secret), milliseconds * delayFactor));
}

const localHandlers = { requestSecret: [onRequestSecret] };

const child = fork(__dirname + "/child.js");
const manager = manage(child, localHandlers);

describe("emitPromise functionality test", () => {

    it("should take the appropriate duration to return the promised message", async function () {
        this.timeout(0);
        const before = Date.now();
        const { pid: parentPid } = process;
        const { pid: childPid } = child;
        const { results: [response], error } = await manager.emit<string>("wait", { milliseconds, parentPid });
        const elapsed = Date.now() - before;
        expect(elapsed, "The promise resolved too early.").to.be.greaterThan((1 + delayFactor) * milliseconds);
        expect(response, "The response from the child was malformed.").to.be.equal(`Hey, ${parentPid}! What a long wait that was. I'm ${childPid}. Your secret is ${secret}`);
        expect(error, "An unexpected error occurred.").to.be.equal(undefined);
    });

    it("should resolve the promise early with the appropriate error message", async function () {
        this.timeout(0);
        const destructionInterval = milliseconds / 2;
        const before = Date.now();
        setTimeout(manager.destroy, destructionInterval);
        const { results, error: { name, message } } = await manager.emit<string>("wait", { milliseconds, parentPid: process.pid });
        const elapsed = Date.now() - before;
        expect(elapsed, "The promise resolved too late.").to.be.lessThan(destructionInterval + 50);
        expect(message, "The expected error did not occur or had wrong message.").to.be.equal("The IPC manager was destroyed before the response could be returned.");
        expect(name, "The expected error did not occur or had wrong name.").to.be.equal("ManagerDestroyed");
        expect(results, "There was an unexpected presence of results.").to.be.equal(undefined);
    });

});