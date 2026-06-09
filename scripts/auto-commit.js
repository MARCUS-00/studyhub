const { execSync } = require("child_process");

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

try {
  // Stage all changes
  console.log("Staging all changes...");
  run("git add -A");

  // Get staged file statuses
  const nameStatus = run(
    "git diff --cached --name-status --no-renames || true",
  );
  if (!nameStatus) {
    console.log("No changes to commit.");
    process.exit(0);
  }

  const lines = nameStatus.split("\n").filter(Boolean);
  const parts = lines.map((l) => l.split("\t"));
  let added = 0,
    modified = 0,
    deleted = 0;
  const files = [];
  for (const p of parts) {
    const code = p[0];
    const file = p[1] || p[0];
    files.push(file);
    if (code === "A") added++;
    else if (code === "D") deleted++;
    else modified++;
  }

  const shortList = files.slice(0, 6).join(", ");
  const message = `Auto-commit: ${files.length} file(s) (A:${added} M:${modified} D:${deleted}) - ${shortList}`;

  console.log("Committing with message:", message);
  run(`git commit -m "${message.replace(/"/g, '\\"')}"`);

  console.log("Pushing to origin/main...");
  run("git push origin main");

  console.log("Auto-commit complete.");
} catch (err) {
  console.error("Auto-commit failed:", err.message || err);
  process.exit(1);
}
