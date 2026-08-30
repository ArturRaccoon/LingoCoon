import { spawnSync } from "node:child_process";
import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const INVOCATION_CWD = process.cwd();
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const MAX_BUFFER_BYTES = 64 * 1024 * 1024;
const ROOT = repositoryRoot(INVOCATION_CWD);

const SECRET_RULES = [
  {
    id: "google-oauth-client-secret",
    current: /GOCSPX-[A-Za-z0-9_-]{16,64}/g,
    history: "GOCSPX-[[:alnum:]_-]{16,64}",
    example: () => `GOC${"SPX-"}${"A".repeat(24)}`,
  },
  {
    id: "google-api-key",
    current: /AIza[A-Za-z0-9_-]{35}/g,
    history: "AIza[[:alnum:]_-]{35}",
    example: () => `AI${"za"}${"A".repeat(35)}`,
  },
  {
    id: "github-classic-token",
    current: /gh[pousr]_[A-Za-z0-9]{36,255}/g,
    history: "gh[pousr]_[[:alnum:]]{36,255}",
    example: () => `gh${"p_"}${"A".repeat(36)}`,
  },
  {
    id: "github-fine-grained-token",
    current: /github_pat_[A-Za-z0-9_]{20,255}/g,
    history: "github_pat_[[:alnum:]_]{20,255}",
    example: () => `github_${"pat_"}${"A".repeat(30)}`,
  },
  {
    id: "aws-access-key-id",
    current: /(?:AKIA|ASIA)[A-Z0-9]{16}/g,
    history: "(AKIA|ASIA)[A-Z0-9]{16}",
    example: () => `AK${"IA"}${"A".repeat(16)}`,
  },
  {
    id: "private-key",
    current: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
    history: "-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----",
    example: () => `-----BEGIN ${"PRIVATE KEY-----"}`,
  },
  {
    id: "stripe-live-secret",
    current: /sk_live_[A-Za-z0-9]{16,}/g,
    history: "sk_live_[[:alnum:]]{16,}",
    example: () => `sk_${"live_"}${"A".repeat(24)}`,
  },
  {
    id: "slack-token",
    current: /xox[baprs]-[A-Za-z0-9-]{10,}/g,
    history: "xox[baprs]-[[:alnum:]-]{10,}",
    example: () => `xox${"b-"}${"1".repeat(12)}`,
  },
];

function runCommand(command, args, cwd, allowedStatuses = [0], encoding = "utf8") {
  const result = spawnSync(command, args, {
    cwd,
    encoding,
    maxBuffer: MAX_BUFFER_BYTES,
  });

  if (result.error || !allowedStatuses.includes(result.status ?? -1)) {
    throw new Error(`${command} ${args[0] ?? ""} failed without completing the secret scan`);
  }

  return result;
}

function repositoryRoot(cwd) {
  return runCommand("git", ["rev-parse", "--show-toplevel"], cwd).stdout.trim();
}

function runGit(args, allowedStatuses = [0]) {
  return runCommand("git", args, ROOT, allowedStatuses);
}

function runGitBuffer(args, allowedStatuses = [0]) {
  return runCommand("git", args, ROOT, allowedStatuses, null);
}

function trackedFiles() {
  return runGit(["ls-files", "-z"])
    .stdout.split("\0")
    .filter(Boolean);
}

function stagedFiles() {
  return runGit(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"])
    .stdout.split("\0")
    .filter(Boolean);
}

// Filename checks are intentionally conservative. Only explicit template suffixes are allowed;
// content suppressions require a reviewed rule change so a real credential cannot be hidden inline.
function sensitivePathRule(file) {
  const name = basename(file);
  const isTemplate = /\.(?:example|sample|template)$/i.test(name);

  if (/^\.env(?:\..+)?$/i.test(name) && !isTemplate) {
    return "sensitive-environment-file";
  }

  if (
    /^client_secret_.*\.json$/i.test(name) ||
    /^(?:credentials|service[-_]account)\.json$/i.test(name)
  ) {
    return "sensitive-credential-file";
  }

  return null;
}

function lineAt(text, index) {
  let line = 1;
  for (let position = 0; position < index; position += 1) {
    if (text.charCodeAt(position) === 10) {
      line += 1;
    }
  }
  return line;
}

function contentFindings(file, text, source = "worktree") {
  const findings = [];

  for (const rule of SECRET_RULES) {
    const pattern = new RegExp(rule.current.source, rule.current.flags);
    for (const match of text.matchAll(pattern)) {
      findings.push({
        rule: rule.id,
        file,
        line: lineAt(text, match.index ?? 0),
        source,
      });
    }
  }

  return findings;
}

function scanCurrentTree() {
  const files = trackedFiles();
  const staged = stagedFiles();
  const findings = [];

  for (const file of files) {
    const pathRule = sensitivePathRule(file);
    if (pathRule) {
      findings.push({ rule: pathRule, file, line: null, source: "path" });
    }

    const absolutePath = resolve(ROOT, file);
    let stat;
    try {
      stat = lstatSync(absolutePath);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        continue;
      }
      throw error;
    }

    if (stat.isSymbolicLink()) {
      findings.push(
        ...contentFindings(file, readlinkSync(absolutePath, "utf8"), "worktree-symlink"),
      );
      continue;
    }

    if (!stat.isFile()) {
      continue;
    }

    findings.push(...contentFindings(file, readFileSync(absolutePath).toString("latin1")));
  }

  for (const file of staged) {
    const pathRule = sensitivePathRule(file);
    if (pathRule) {
      findings.push({ rule: pathRule, file, line: null, source: "index" });
    }
    const content = runGitBuffer(["show", `:${file}`]).stdout;
    findings.push(...contentFindings(file, content.toString("latin1"), "index"));
  }

  findings.sort((left, right) =>
    `${left.file}:${left.line ?? 0}:${left.rule}:${left.source}`.localeCompare(
      `${right.file}:${right.line ?? 0}:${right.rule}:${right.source}`,
    ),
  );

  if (findings.length === 0) {
    console.log(
      `Secret scan passed: ${files.length} worktree files and ${staged.length} staged change(s) checked.`,
    );
    return 0;
  }

  console.error(`Secret scan failed: ${findings.length} finding(s).`);
  for (const finding of findings) {
    const line = finding.line === null ? "" : ` line=${finding.line}`;
    console.error(
      `- ${finding.rule} path=${JSON.stringify(finding.file)}${line} source=${finding.source}`,
    );
  }
  return 1;
}

function revisionsToScan() {
  return [
    ...new Set(
      runGit(["rev-list", "--all", "--reflog"])
        .stdout.split("\n")
        .filter(Boolean),
    ),
  ];
}

function addHistoryFinding(findings, rule, file, revision) {
  const key = `${rule}\0${file}`;
  if (!findings.has(key)) {
    findings.set(key, { rule, file, revisions: new Set() });
  }
  findings.get(key).revisions.add(revision);
}

function scanHistory() {
  const revisions = revisionsToScan();
  const findings = new Map();

  for (const rule of SECRET_RULES) {
    const result = runGit(
      ["grep", "-a", "-l", "-z", "-E", "-e", rule.history, ...revisions, "--"],
      [0, 1],
    );

    for (const line of result.stdout.split("\0").filter(Boolean)) {
      const separator = line.indexOf(":");
      if (separator === -1) {
        throw new Error("git grep returned an unexpected history result");
      }
      addHistoryFinding(
        findings,
        rule.id,
        line.slice(separator + 1),
        line.slice(0, separator),
      );
    }
  }

  for (const revision of revisions) {
    const files = runGit(["ls-tree", "-r", "--name-only", "-z", revision])
      .stdout.split("\0")
      .filter(Boolean);
    for (const file of files) {
      const rule = sensitivePathRule(file);
      if (rule) {
        addHistoryFinding(findings, rule, file, revision);
      }
    }
  }

  if (findings.size === 0) {
    console.log(`Secret history scan passed: ${revisions.length} revisions checked.`);
    return 0;
  }

  const affectedRevisions = new Set();
  const orderedFindings = [...findings.values()].sort((left, right) =>
    `${left.file}:${left.rule}`.localeCompare(`${right.file}:${right.rule}`),
  );

  for (const finding of orderedFindings) {
    for (const revision of finding.revisions) {
      affectedRevisions.add(revision);
    }
  }

  console.error(
    `Secret history scan failed: ${affectedRevisions.size} of ${revisions.length} revisions affected.`,
  );
  for (const finding of orderedFindings) {
    console.error(
      `- ${finding.rule} path=${JSON.stringify(finding.file)} revisions=${finding.revisions.size}`,
    );
  }
  return 1;
}

function scannerOutput(result) {
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

function runSelfTest() {
  for (const rule of SECRET_RULES) {
    const matches = contentFindings("self-test.txt", rule.example());
    if (!matches.some((finding) => finding.rule === rule.id)) {
      throw new Error(`self-test did not detect rule ${rule.id}`);
    }
  }

  if (contentFindings("safe.txt", "[REDACTED_GOOGLE_OAUTH_CLIENT_SECRET]").length !== 0) {
    throw new Error("self-test treated a redaction marker as a secret");
  }

  if (sensitivePathRule(".env.local.example") !== null) {
    throw new Error("self-test rejected an allowed environment template");
  }

  if (sensitivePathRule(".env.local") !== "sensitive-environment-file") {
    throw new Error("self-test did not reject a tracked environment file");
  }

  const fixture = mkdtempSync(join(tmpdir(), "lingocoon-secret-scan-"));
  try {
    runCommand("git", ["init", "-q"], fixture);
    writeFileSync(join(fixture, "safe.txt"), "safe\n");
    runCommand("git", ["add", "--", "safe.txt"], fixture);
    runCommand(
      "git",
      [
        "-c",
        "user.name=LingoCoon Secret Scanner",
        "-c",
        "user.email=security-test@invalid.example",
        "commit",
        "-q",
        "-m",
        "initial fixture",
      ],
      fixture,
    );

    const nested = join(fixture, "nested");
    mkdirSync(nested);
    runCommand(process.execPath, [SCRIPT_PATH], nested);

    const candidate = SECRET_RULES[0].example();
    writeFileSync(
      join(fixture, "safe.txt"),
      Buffer.concat([Buffer.from("binary\0", "latin1"), Buffer.from(candidate, "latin1")]),
    );
    const binaryResult = runCommand(process.execPath, [SCRIPT_PATH], nested, [1]);
    if (
      scannerOutput(binaryResult).includes(candidate) ||
      !scannerOutput(binaryResult).includes("source=worktree")
    ) {
      throw new Error("self-test did not safely detect a NUL-containing worktree secret");
    }
    writeFileSync(join(fixture, "safe.txt"), "safe\n");

    const unusualPath = "odd:name\ncredential.bin";
    writeFileSync(
      join(fixture, unusualPath),
      Buffer.concat([Buffer.from("binary\0", "latin1"), Buffer.from(candidate, "latin1")]),
    );
    runCommand("git", ["add", "--", unusualPath], fixture);
    writeFileSync(join(fixture, unusualPath), "safe\n");

    const indexResult = runCommand(process.execPath, [SCRIPT_PATH], nested, [1]);
    const indexOutput = scannerOutput(indexResult);
    if (
      indexOutput.includes(candidate) ||
      !indexOutput.includes("source=index") ||
      !indexOutput.includes(JSON.stringify(unusualPath))
    ) {
      throw new Error("self-test did not safely detect a staged secret behind a clean worktree");
    }

    runCommand(
      "git",
      [
        "-c",
        "user.name=LingoCoon Secret Scanner",
        "-c",
        "user.email=security-test@invalid.example",
        "commit",
        "-q",
        "-m",
        "binary history fixture",
      ],
      fixture,
    );
    const historyResult = runCommand(
      process.execPath,
      [SCRIPT_PATH, "--history"],
      nested,
      [1],
    );
    const historyOutput = scannerOutput(historyResult);
    if (historyOutput.includes(candidate) || !historyOutput.includes(JSON.stringify(unusualPath))) {
      throw new Error("self-test did not safely detect a binary history secret");
    }

    runCommand(process.execPath, [SCRIPT_PATH, "--invalid"], nested, [2]);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }

  console.log(
    `Secret scanner self-test passed: ${SECRET_RULES.length} content rules, filename policy, index, binary, history, path, and exit behavior checked.`,
  );
  return 0;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    return scanCurrentTree();
  }
  if (args.length === 1 && args[0] === "--history") {
    return scanHistory();
  }
  if (args.length === 1 && args[0] === "--self-test") {
    return runSelfTest();
  }
  throw new Error("expected no argument, --history, or --self-test");
}

try {
  process.exitCode = main();
} catch (error) {
  const message = error instanceof Error ? error.message : "unknown error";
  console.error(`Secret scan could not complete: ${message}.`);
  process.exitCode = 2;
}
