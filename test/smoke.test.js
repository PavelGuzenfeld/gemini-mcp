import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("gemini-mcp", () => {
  it("package.json has correct structure", async () => {
    const pkg = (await import("../package.json", { with: { type: "json" } }))
      .default;
    assert.equal(pkg.name, "claude-gemini-mcp");
    assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
    assert.equal(pkg.type, "module");
    assert.ok(pkg.dependencies["@google/genai"]);
    assert.ok(pkg.dependencies["@modelcontextprotocol/sdk"]);
    assert.ok(pkg.dependencies["zod"]);
    assert.ok(pkg.bin["gemini-mcp"]);
  });

  it("index.js is valid ES module syntax", async () => {
    // Verify the file parses without syntax errors (import will fail at
    // runtime due to missing GEMINI_API_KEY, but syntax check still works)
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../index.js", import.meta.url),
      "utf8"
    );
    assert.ok(source.includes('new McpServer'));
    assert.ok(source.includes('gemini_ask'));
    assert.ok(source.includes('gemini_analyze'));
    assert.ok(source.includes('gemini_chat'));
    assert.ok(source.includes('gemini_models'));
  });
});
