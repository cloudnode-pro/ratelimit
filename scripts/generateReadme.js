/**
 * This script uses the README.template.md file to generate the README.md file.
 *
 * The script will also run other scripts such as tests, coverage, etc. to generate the relevant badges/shields.
 */
import fs from "node:fs/promises";
import * as child_process from "child_process";

const TEMPLATE_FILE = "README.template.md";
const OUTPUT_FILE = "README.md";

/**
 * Determine version from package.json
 */
const packageJson = JSON.parse(await fs.readFile("package.json", "utf8"));
const version = packageJson.version;

/**
 * Run test and get coverage
 *
 * If the command exits with 0, the tests pass. Otherwise, the tests have failed.
 * The command output (regardless of exit code) will return the coverage report, which looks like this:
 *
 * --------------|---------|----------|---------|---------|-------------------
 * File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
 * --------------|---------|----------|---------|---------|-------------------
 * All files     |     100 |      100 |     100 |     100 |
 *  RateLimit.js |     100 |      100 |     100 |     100 |
 * --------------|---------|----------|---------|---------|-------------------
 *
 * The coverage percentage is the average of all columns for "All files".
 */
const testsResult = await new Promise((resolve, reject) => {
    const child = child_process.spawn("npm", ["test"]);
    const data = [];
    child.stdout.on("data", (chunk) => data.push(chunk));
    child.on("exit", (code) => {
        // Get coverage percentage
        const output = data.join("");
        const coverage = (output.match(/----(?:\n|.)+/g) ?? []).pop() ?? "";
        const percentages = coverage.match(/All files\s*?\|\s*?([\d.]+)\s*?\|\s*?([\d.]+)\s*?\|\s*?([\d.]+)\s*?\|\s*?([\d.]+)\s*?/) ?? [];
        const averageCoverage = percentages.slice(1).reduce((a, b) => a + Number.parseFloat(b), 0) / 4;
        resolve({coverage: averageCoverage, testsPass: code === 0});
    });
});

/**
 * Coverage colors
 */
const coverageColors = ["16a34a", "84cc16", "eab308", "f59e0b", "f97316", "ef4444"];

/**
 * Determine if the build passes by the exit code of `npm run build`
 */
const buildPass = await new Promise((resolve, reject) => {
    const child = child_process.spawn("npm", ["run", "build"]);
    child.on("exit", (code) => resolve(code === 0));
});

/**
 * Variables to replace in the template file.
 *
 * {{variable_name}}
 */
const variables = {
    "shield:version": `![version: ${version}](https://img.shields.io/badge/version-${version}-%233b82f6)`,
    "shield:tests": `![test: ${testsResult.testsPass ? "passing" : "failing"}](https://img.shields.io/badge/tests-${testsResult.testsPass ? "passing" : "failing"}-${testsResult.testsPass ? "%2316a34a" : "%23ef4444"})`,
    "shield:coverage": `![coverage: ${testsResult.coverage}%](https://img.shields.io/badge/coverage-${testsResult.coverage}%25-%23${coverageColors.reverse()[Math.floor(testsResult.coverage * (coverageColors.length - 1) / 100)]})`,
    "shield:build": `![build: ${buildPass ? "passing" : "failing"}](https://img.shields.io/badge/build-${buildPass ? "passing" : "failing"}-${buildPass ? "%2316a34a" : "%23ef4444"})`,
}

/**
 * Read template file
 */
const template = await fs.readFile(TEMPLATE_FILE, "utf8");

/**
 * Replace variables in template
 */
const output = Object.entries(variables).reduce((output, [variable, value]) => output.replace(new RegExp(`{{${variable}}}`, "g"), value), template);

/**
 * Write output file
 */
await fs.writeFile(OUTPUT_FILE, output);

console.log(`Generated ${OUTPUT_FILE}`);
console.log("Variables", variables);
