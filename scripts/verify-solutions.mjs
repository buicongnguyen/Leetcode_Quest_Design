import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import level12 from "../data/solutions/levels-1-2.mjs";
import level34 from "../data/solutions/levels-3-4.mjs";
import level5 from "../data/solutions/level-5.mjs";
import verification from "../data/verification.mjs";

const solutions = { ...level12, ...level34, ...level5 };
const requireCpp = process.argv.includes("--require-cpp");

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", chunk => { stdout += chunk; });
    child.stderr?.on("data", chunk => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", code => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`${command} ${args.join(" ")} exited ${code}\n${stdout}${stderr}`)));
  });
}

async function available(command, args = ["--version"]) {
  try {
    await run(command, args);
    return true;
  } catch {
    return false;
  }
}

function pythonLiteral(value) {
  if (value && typeof value === "object" && "approx" in value) return String(value.approx);
  if (value === true) return "True";
  if (value === false) return "False";
  if (value === null) return "None";
  if (Array.isArray(value)) return `[${value.map(pythonLiteral).join(", ")}]`;
  if (typeof value === "string") return JSON.stringify(value);
  return String(value);
}

function pythonDriver(spec) {
  const constructor = `${spec.className}(${spec.constructor.args.map(pythonLiteral).join(", ")})`;
  const lines = ["", "import math", `subject = ${constructor}`];
  spec.calls.forEach((entry, index) => {
    const expression = `subject.${entry.method}(${entry.args.map(pythonLiteral).join(", ")})`;
    if (!("expected" in entry)) lines.push(expression);
    else if (entry.expected && typeof entry.expected === "object" && "approx" in entry.expected) lines.push(`assert math.isclose(${expression}, ${entry.expected.approx}, rel_tol=1e-7, abs_tol=1e-7), "call ${index + 1}"`);
    else if (entry.expected && typeof entry.expected === "object" && "oneOf" in entry.expected) lines.push(`assert ${expression} in ${pythonLiteral(entry.expected.oneOf)}, "call ${index + 1}"`);
    else lines.push(`assert ${expression} == ${pythonLiteral(entry.expected)}, "call ${index + 1}"`);
  });
  lines.push(`print("verified ${spec.className}")`);
  return lines.join("\n");
}

function cppLiteral(value, type) {
  if (type.startsWith("vector<")) {
    const inner = type.slice(7, -1);
    return `${type}{${value.map(item => cppLiteral(item, inner)).join(", ")}}`;
  }
  if (type === "string") return JSON.stringify(value);
  if (type === "char") return `'${String(value).replaceAll("'", "\\'")}'`;
  if (type === "bool") return value ? "true" : "false";
  if (type === "long long") return `${value}LL`;
  return String(value);
}

function cppAssertion(actual, expected, returnType, index) {
  if (expected && typeof expected === "object" && "approx" in expected) return `assert((std::fabs(${actual} - ${expected.approx}) <= 1e-7));`;
  if (expected && typeof expected === "object" && "oneOf" in expected) return `{ auto actual = ${actual}; assert((${expected.oneOf.map(value => `actual == ${cppLiteral(value, returnType)}`).join(" || ")})); }`;
  return `assert((${actual} == ${cppLiteral(expected, returnType)})); // call ${index + 1}`;
}

function cppDriver(spec) {
  const lines = ["", "int main() {"];
  const constructorNames = spec.constructor.args.map((value, index) => {
    const name = `constructorArg${index}`;
    lines.push(`    ${spec.constructor.types[index]} ${name} = ${cppLiteral(value, spec.constructor.types[index])};`);
    return name;
  });
  lines.push(`    ${spec.className} subject{${constructorNames.join(", ")}};`);
  spec.calls.forEach((entry, callIndex) => {
    const method = spec.methods[entry.method];
    const argumentNames = entry.args.map((value, argumentIndex) => {
      const name = `arg${callIndex}_${argumentIndex}`;
      lines.push(`    ${method.types[argumentIndex]} ${name} = ${cppLiteral(value, method.types[argumentIndex])};`);
      return name;
    });
    const expression = `subject.${entry.method}(${argumentNames.join(", ")})`;
    lines.push(`    ${"expected" in entry ? cppAssertion(expression, entry.expected, method.returns, callIndex) : `${expression};`}`);
  });
  lines.push(`    std::cout << "verified ${spec.className}\\n";`, "    return 0;", "}");
  return lines.join("\n");
}

const pythonCandidates = process.env.PYTHON ? [[process.env.PYTHON, []]] : process.platform === "win32" ? [["py", ["-3"]], ["python", []], ["python3", []]] : [["python3", []], ["python", []]];
let python = null;
for (const [command, prefix] of pythonCandidates) {
  if (await available(command, [...prefix, "--version"])) {
    python = { command, prefix };
    break;
  }
}
if (!python) throw new Error("Python 3 is required to execute the solution verification suite. Set PYTHON to its executable path.");

const cppCandidates = process.env.CXX ? [process.env.CXX] : ["g++", "clang++", "cl"];
let compiler = null;
for (const candidate of cppCandidates) {
  const kind = path.basename(candidate).toLowerCase().startsWith("cl") ? "msvc" : "gnu";
  if (await available(candidate, kind === "msvc" ? ["/?"] : ["--version"])) {
    compiler = { command: candidate, kind };
    break;
  }
}
if (!compiler && requireCpp) throw new Error("A C++20 compiler is required when --require-cpp is set. Set CXX to g++, clang++, or cl.");

const directory = await mkdtemp(path.join(os.tmpdir(), "leetcode-quest-verification-"));
let pythonCount = 0;
let cppCount = 0;
try {
  for (const [id, spec] of Object.entries(verification)) {
    const solution = solutions[id];
    if (!solution) throw new Error(`Verification ${id} has no solution`);
    const pythonFile = path.join(directory, `${id}.py`);
    await writeFile(pythonFile, `${solution.python}\n${pythonDriver(spec)}\n`, "utf8");
    await run(python.command, [...python.prefix, pythonFile]);
    pythonCount += 1;

    if (compiler) {
      const cppFile = path.join(directory, `${id}.cpp`);
      const executable = path.join(directory, `${id}${process.platform === "win32" ? ".exe" : ""}`);
      await writeFile(cppFile, `#include <cassert>\n#include <cmath>\n#include <iostream>\n${solution.cpp}\n${cppDriver(spec)}\n`, "utf8");
      const compileArguments = compiler.kind === "msvc"
        ? ["/nologo", "/std:c++20", "/EHsc", "/W4", cppFile, `/Fe:${executable}`]
        : ["-std=c++20", "-O0", "-Wall", "-Wextra", "-pedantic", cppFile, "-o", executable];
      await run(compiler.command, compileArguments);
      await run(executable, []);
      cppCount += 1;
    }
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}

console.log(`Behavioral verification passed: ${pythonCount} Python solutions${compiler ? ` and ${cppCount} C++ solutions` : "; C++ execution skipped because no compiler was found"}.`);
