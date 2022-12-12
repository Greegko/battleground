import * as fs from "fs";

const defaultSettings = {
  extensions: ["ts"],
  timeout: "100m",
  environmentVariables: {
    TS_NODE_PROJECT: "tsconfig.test.json",
  },
  require: ["ts-node/register/transpile-only"],
};

const extraSettings = {};

const file = process.argv[2]; // ${file}
const fileLine = process.argv[6]; // --file-line = ${lineNumber}

const fileLineText = fs.readFileSync(file, "utf-8").split("\n")[fileLine - 1];
const testNameFinderRegexp = RegExp('^test\\("(.+)",( t =>)? \\{$');
const match = fileLineText.match(testNameFinderRegexp);

console.log();

if (match) {
  console.log("Running a specific testcase! =>", match[1]);
  extraSettings["match"] = match[1];
} else {
  console.log("Running all testcases");
}

export default { ...defaultSettings, ...extraSettings };
