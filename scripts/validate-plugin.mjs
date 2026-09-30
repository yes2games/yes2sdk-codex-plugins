#!/usr/bin/env node
// Structural validation for the Yes2SDK Codex plugin.
// Dependency-free, Node stdlib only. Codex ships no `plugin validate` command, so this
// script plus the install smoke test in CI is the whole gate. It checks presence and
// cross-file agreement, not YAML validity: malformed-but-present frontmatter can pass.
// Errors accumulate and the script exits 1 at the end, so one run reports everything.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const fail = (msg) => errors.push(msg);
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

function readJson(rel) {
  if (!exists(rel)) {
    fail(`missing file: ${rel}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf-8"));
  } catch (e) {
    fail(`invalid JSON in ${rel}: ${e.message}`);
    return null;
  }
}

/** Extract the leading `---` YAML frontmatter block as raw text, or null. */
function frontmatter(src) {
  // `\r?\n` so a CRLF working tree still matches. .gitattributes pins LF, but don't
  // depend on the checkout.
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(src);
  return m ? m[1] : null;
}

/** Value of a single-line `key: value` frontmatter entry, unquoted, or null. */
function fmValue(fm, key) {
  // `[ \t]` not `\s`, or a bare `key:` swallows the following line.
  const m = new RegExp(`^${key}[ \\t]*:[ \\t]*([^\\r\\n]*)`, "m").exec(fm);
  return m ? m[1].trim() : null;
}
const unquote = (v) => v.replace(/^(["'])([\s\S]*)\1$/, "$2");

/** Width and height of a PNG from its IHDR chunk, or null if the file is not a PNG. */
function pngSize(abs) {
  const b = fs.readFileSync(abs);
  if (b.length < 24 || b.toString("latin1", 1, 4) !== "PNG") return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

// Directory listing rules: icons and logos are square, at least 48x48, at most 5 MiB,
// and raster images stay within 4096 px. Remote URLs are left to the submission portal.
function checkListingImages(ui) {
  const icons = ["composerIcon", "logo", "logoDark"].filter((k) => ui[k]).map((k) => [k, ui[k]]);
  const shots = (ui.screenshots ?? []).map((v, n) => [`screenshots[${n}]`, v]);
  for (const [k, rel] of [...icons, ...shots]) {
    if (/^https?:/.test(rel)) continue;
    const where = `${MANIFEST} interface.${k}`;
    if (!rel.startsWith("./assets/")) fail(`${where}: must live under ./assets/ (got "${rel}")`);
    if (!exists(rel)) {
      fail(`${where}: ${rel} does not exist`);
      continue;
    }
    const abs = path.join(ROOT, rel);
    if (!/\.(png|jpe?g|webp|svg)$/i.test(rel)) fail(`${where}: must be PNG, JPEG, WebP or SVG`);
    if (fs.statSync(abs).size > 5 * 1024 * 1024) fail(`${where}: over 5 MiB`);
    const size = /\.png$/i.test(rel) ? pngSize(abs) : null;
    if (size) {
      if (size.w > 4096 || size.h > 4096) fail(`${where}: over 4096 px (${size.w}x${size.h})`);
      if (!k.startsWith("screenshots") && (size.w !== size.h || size.w < 48)) {
        fail(`${where}: must be square and at least 48x48 (${size.w}x${size.h})`);
      }
    }
  }
  for (const k of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) {
    if (ui[k] && !ui[k].startsWith("https://")) fail(`${MANIFEST} interface.${k}: must be an https URL`);
  }
}

// 1. Plugin manifest. Codex CLI 0.156 installs from `.codex-plugin/plugin.json`.
const MANIFEST = ".codex-plugin/plugin.json";
const plugin = readJson(MANIFEST);
if (plugin) {
  for (const k of ["name", "version", "description"]) {
    if (!plugin[k]) fail(`${MANIFEST}: missing "${k}"`);
  }
  if (plugin.version && !/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(plugin.version)) {
    fail(`${MANIFEST}: "version" must be SemVer (got "${plugin.version}")`);
  }
  // Component pointers must resolve, or Codex installs a plugin with that part missing.
  for (const k of ["skills", "mcpServers"]) {
    if (!plugin[k]) fail(`${MANIFEST}: missing "${k}"`);
    else if (!plugin[k].startsWith("./")) fail(`${MANIFEST}: "${k}" must start with "./"`);
    else if (!exists(plugin[k])) fail(`${MANIFEST}: "${k}" points at ${plugin[k]}, which does not exist`);
  }
  if (!plugin.interface?.displayName) fail(`${MANIFEST}: missing "interface.displayName"`);
  checkListingImages(plugin.interface ?? {});
  // The submission portal rejects a longer subtitle; the manifest is where it comes from.
  const sub = plugin.interface?.shortDescription;
  if (!sub) fail(`${MANIFEST}: missing "interface.shortDescription"`);
  else if (sub.length > 30) fail(`${MANIFEST}: "interface.shortDescription" must be 30 characters or fewer (got ${sub.length})`);
  for (const [n, prompt] of (plugin.interface?.defaultPrompt ?? []).entries()) {
    if (prompt.length > 128) fail(`${MANIFEST}: "interface.defaultPrompt[${n}]" must be 128 characters or fewer (got ${prompt.length})`);
  }
  if ((plugin.interface?.defaultPrompt ?? []).length > 3) fail(`${MANIFEST}: at most 3 "interface.defaultPrompt" entries`);
}

// 2. package.json duplicates version/license; pin them and keep it private.
const pkg = readJson("package.json");
if (pkg && plugin) {
  if (pkg.private !== true) fail('package.json: must set "private": true');
  if (pkg.version !== plugin.version) {
    fail(`package.json "version" (${pkg.version}) must equal ${MANIFEST} "version" (${plugin.version})`);
  }
  if (pkg.license !== plugin.license) {
    fail(`package.json "license" (${pkg.license}) must equal ${MANIFEST} "license" (${plugin.license})`);
  }
}

// 3. Repo marketplace, read by `codex plugin marketplace add yes2games/yes2sdk-codex-plugin`.
const MARKET = ".agents/plugins/marketplace.json";
const market = readJson(MARKET);
if (market) {
  if (!market.name) fail(`${MARKET}: missing "name"`);
  const entry = plugin && market.plugins?.find((p) => p.name === plugin.name);
  if (!Array.isArray(market.plugins) || market.plugins.length === 0) {
    fail(`${MARKET}: "plugins" must be a non-empty array`);
  } else if (plugin && !entry) {
    fail(`${MARKET}: no plugin entry named "${plugin.name}"`);
  }
  if (entry) {
    const src = entry.source;
    if (src?.source !== "local" || typeof src.path !== "string") {
      fail(`${MARKET}: "${entry.name}" needs source {"source": "local", "path": "./..."}`);
    } else if (!src.path.startsWith("./")) {
      fail(`${MARKET}: source path must start with "./" (got "${src.path}")`);
    } else if (!fs.existsSync(path.join(ROOT, src.path, MANIFEST))) {
      // Local paths resolve against the marketplace root, which is the repo root.
      fail(`${MARKET}: source path "${src.path}" has no ${MANIFEST}`);
    }
  }
}

// 4. .mcp.json registers the hosted server under the name every skill routes to.
const mcp = readJson(".mcp.json");
if (mcp) {
  const srv = mcp.mcpServers?.yes2sdk;
  if (!srv) fail(".mcp.json: missing mcpServers.yes2sdk");
  else if (!srv.type || !srv.url) fail('.mcp.json: mcpServers.yes2sdk needs "type" and "url"');
}

// 5. Skills.
const skillsDir = path.join(ROOT, "skills");
const skillNames = fs.existsSync(skillsDir)
  ? fs.readdirSync(skillsDir).filter((d) => fs.statSync(path.join(skillsDir, d)).isDirectory())
  : [];
if (skillNames.length === 0) fail("skills/ is missing or has no skill directories");

const skillText = {};
for (const d of skillNames) {
  const rel = `skills/${d}/SKILL.md`;
  if (!exists(rel)) {
    fail(`${rel}: missing`);
    continue;
  }
  const src = fs.readFileSync(path.join(ROOT, rel), "utf-8");
  skillText[d] = src;
  const fm = frontmatter(src);
  if (!fm) {
    fail(`${rel}: missing --- frontmatter ---`);
    continue;
  }
  const name = fmValue(fm, "name");
  const desc = fmValue(fm, "description");
  if (!name) fail(`${rel}: frontmatter "name" is missing or empty`);
  else if (unquote(name) !== d) fail(`${rel}: "name" (${unquote(name)}) must equal its directory name (${d})`);
  if (!desc) {
    fail(`${rel}: frontmatter "description" is missing or empty`);
  } else {
    // An unquoted `: ` breaks the YAML mapping and the skill loads with nothing.
    if (!/^["']/.test(desc) && desc.includes(": ")) {
      fail(`${rel}: unquoted "description" contains ": ", which breaks the frontmatter; quote it or reword`);
    }
    // Agent Skills spec cap. Codex also budgets the whole skills list, so shorter is better.
    if (unquote(desc).length > 1024) fail(`${rel}: "description" is over 1024 characters`);
  }

  // agents/openai.yaml is optional; when present, its default_prompt must name this skill.
  const yamlRel = `skills/${d}/agents/openai.yaml`;
  if (exists(yamlRel)) {
    const y = fs.readFileSync(path.join(ROOT, yamlRel), "utf-8");
    if (!/^interface:/m.test(y)) fail(`${yamlRel}: missing "interface:" block`);
    const prompt = /default_prompt:[ \t]*"([^"]*)"/.exec(y)?.[1];
    if (prompt && !prompt.includes(`$${d}`)) fail(`${yamlRel}: default_prompt should mention $${d}`);
  }
}

// 6. Every `$yes2sdk-*` skill mention in a skill resolves. Skills hand off to each other
// by name, so a rename that misses one caller breaks that path silently.
for (const [d, src] of Object.entries(skillText)) {
  for (const [, ref] of src.matchAll(/\$(yes2sdk-[a-z0-9-]+)/g)) {
    if (!skillNames.includes(ref)) fail(`skills/${d}/SKILL.md: mentions $${ref}, which is not a skill here`);
  }
}

// 7. House style: no em or en dashes in authored copy.
const DASH = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walk(abs);
    else if (/\.(md|json|ya?ml|mjs)$/.test(e.name)) {
      fs.readFileSync(abs, "utf-8").split("\n").forEach((line, i) => {
        if (DASH.test(line)) fail(`${path.relative(ROOT, abs)}:${i + 1}: contains an em or en dash`);
      });
    }
  }
}
walk(ROOT);

if (errors.length) {
  console.error(`Plugin validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Plugin validation passed: manifests agree, ${skillNames.length} skills have valid frontmatter and references.`);
