import Repl from "../dist/utilities/repl";

const repl = new Repl({ identifier: () => "Sam" });
repl.registerCommand("exit", [], () => process.exit(0));