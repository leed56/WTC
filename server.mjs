import { createServer } from "node:http";
import { randomUUID, randomBytes, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { compareRefractiveIndex } from "./gem-reference.mjs";

const demo = process.argv.includes("--demo");
const WTC_OPERATOR_PASSWORD = demo ? "demo-operator-2026" : process.env.WTC_OPERATOR_PASSWORD;
const WTC_REVIEWER_PASSWORD = demo ? "demo-reviewer-2026" : process.env.WTC_REVIEWER_PASSWORD;
if ([WTC_OPERATOR_PASSWORD, WTC_REVIEWER_PASSWORD].some(password => !password || password.length < 12)
    || WTC_OPERATOR_PASSWORD === WTC_REVIEWER_PASSWORD) {
  throw new Error("Set distinct operator and reviewer passwords of at least 12 characters.");
}

const db = new DatabaseSync(demo ? ":memory:" : (process.env.WTC_DB_PATH ?? "wtc.sqlite"));
db.exec(`CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY, stone TEXT NOT NULL, finding TEXT,
  status TEXT NOT NULL DEFAULT 'Intake',
  report TEXT UNIQUE, issued_at TEXT
) STRICT`);
if (!db.prepare("PRAGMA table_info(cases)").all().some(column => column.name === "examination")) {
  db.exec("ALTER TABLE cases ADD COLUMN examination TEXT");
}
if (!db.prepare("PRAGMA table_info(cases)").all().some(column => column.name === "revisions")) {
  db.exec("ALTER TABLE cases ADD COLUMN revisions TEXT NOT NULL DEFAULT '[]'");
}
const sessions = new Map();
const port = Number(process.env.PORT ?? 3000);
const origin = `http://127.0.0.1:${port}`;

const escape = value => String(value ?? "").replace(/[&<>"']/g, char =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

function send(res, status, body, type = "text/html; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
  });
  res.end(body);
}

function redirect(res, location) {
  res.writeHead(303, { Location: location, "Cache-Control": "no-store" });
  res.end();
}

function page(title, content) {
  return `<!doctype html><html lang="en"><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} | WTC GEM LAB</title><link rel="stylesheet" href="/styles.css">
  <header><a class="brand" href="/">WTC <span>GEM LAB</span></a>
  <nav aria-label="Staff"><a href="/staff/">Work queue</a><a href="/">Public verification</a></nav></header>
  <main><section class="intro"><h1>${title}</h1></section>${content}</main></html>`;
}

const login = page("Staff sign-in", `<form class="panel" method="post" action="/staff/login">
  ${demo ? "<p>Demo mode. Use fictional cases. Cases reset when the server stops.</p>" : ""}<label for="role">Role</label><select id="role" name="role"><option value="operator">Operator</option><option value="reviewer">Reviewer</option></select>
  <label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>
  <button>Sign in</button></form>`);

function referenceComparison(examination) {
  if (!examination.ri) return "<p>Record a refractive index to compare it with the pilot references.</p>";
  if (!examination.comparisons) return "<p>This examination predates reference comparisons.</p>";
  const rows = examination.comparisons.map(({ name, min, max, source, matches }) => {
    const reference = min === max ? min : `${min}–${max}`;
    return `<li><strong>${escape(name)}</strong> · ${matches ? "Matches" : "Differs from"} published RI ${escape(reference)} · <a href="${escape(source)}">GIA reference</a></li>`;
  }).join("");
  return `<h3>Refractive index comparison</h3><ul>${rows}</ul>
    <p class="note">The pilot compares a single reading with two published references. Gemologists should assess measurement uncertainty and other evidence before identifying a stone.</p>`;
}

function caseCard(record, role) {
  const examination = record.examination ? JSON.parse(record.examination) : null;
  const evidence = examination ? `<dl>
    <dt>Weight</dt><dd>${escape(examination.weight || "Not measured")}</dd>
    <dt>Refractive index</dt><dd>${escape(examination.ri || "Not measured")}</dd>
    <dt>Observations and supporting evidence</dt><dd class="evidence">${escape(examination.evidence)}</dd>
  </dl>${referenceComparison(examination)}` : record.finding ? "<p>No structured examination was recorded for this case.</p>" : "";
  const revisions = JSON.parse(record.revisions);
  const latestReturn = record.status === "Returned" ? revisions.at(-1) : null;
  const history = revisions.length ? `<h3>Revision history</h3><ol>${revisions.map(revision =>
    `<li><p>Returned on ${escape(revision.at.slice(0, 10))}</p>
    <p class="evidence">${escape(revision.reason)}</p>
    <p>Previous finding: ${escape(revision.finding)}</p>
    ${revision.examination ? `<p>Previous weight: ${escape(revision.examination.weight || "Not measured")}</p>
    <p>Previous refractive index: ${escape(revision.examination.ri || "Not measured")}</p>
    <p class="evidence">${escape(revision.examination.evidence)}</p>` : ""}</li>`
  ).join("")}</ol>` : "";
  const action = ["Intake", "Returned"].includes(record.status) && role === "operator"
    ? `<form method="post" action="/staff/examine"><input type="hidden" name="id" value="${record.id}"><input type="hidden" name="revision" value="${revisions.length}">
       <label for="weight-${record.id}">Weight in carats (optional)</label>
       <input id="weight-${record.id}" name="weight" inputmode="decimal" maxlength="16" value="${escape(latestReturn?.examination?.weight)}">
       <label for="ri-${record.id}">Refractive index (optional)</label>
       <input id="ri-${record.id}" name="ri" inputmode="decimal" maxlength="16" value="${escape(latestReturn?.examination?.ri)}">
       <label for="evidence-${record.id}">Observations and supporting evidence (staff only)</label>
       <textarea id="evidence-${record.id}" name="evidence" rows="5" maxlength="1500" required>${escape(latestReturn?.examination?.evidence)}</textarea>
       <label for="finding-${record.id}">Finding approved for public display after review</label>
       <input id="finding-${record.id}" name="finding" maxlength="200" value="${escape(latestReturn?.finding)}" required><button>Submit for review</button></form>`
    : record.status === "Review" && role === "reviewer"
      ? `<form method="post" action="/staff/issue"><input type="hidden" name="id" value="${record.id}"><input type="hidden" name="revision" value="${revisions.length}">
         <button>Approve and issue</button></form>
         <form method="post" action="/staff/return"><input type="hidden" name="id" value="${record.id}"><input type="hidden" name="revision" value="${revisions.length}">
           <label for="reason-${record.id}">Reason for returning the case</label>
           <textarea id="reason-${record.id}" name="reason" rows="3" maxlength="1000" required></textarea>
           <button>Return for revision</button></form>`
      : "";
  return `<details><summary><strong>${escape(record.stone)}</strong> <span>${record.status}</span></summary>
    <p>Case ${record.id}</p>${record.finding ? `<p>Finding: ${escape(record.finding)}</p>` : ""}
    ${record.report ? `<p><a href="/?report=${record.report}">Verify ${record.report}</a></p>` : ""}${evidence}${history}${action}</details>`;
}

async function readForm(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 32768) return null;
    chunks.push(chunk);
  }
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}

const server = createServer(async (req, res) => {
  try {
    if (req.headers.host !== `127.0.0.1:${port}`) return send(res, 403, "Use the loopback URL shown in the terminal.");
    const url = new URL(req.url, origin);
    const path = url.pathname;
    const token = /(?:^|; *)wtc_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie ?? "")?.[1];
    const session = sessions.get(token);
    const role = session?.expires > Date.now() ? session.role : undefined;

    if (req.method === "GET") {
      if (path === "/" || path === "/index.html") return send(res, 200, readFileSync("index.html"));
      if (path === "/styles.css") return send(res, 200, readFileSync("styles.css"), "text/css");
      if (path === "/verify.js") return send(res, 200, readFileSync("verify.js"), "text/javascript");
      if (path === "/api/report") {
        const number = url.searchParams.get("report")?.trim().toUpperCase() ?? "";
        const report = db.prepare("SELECT report, finding, issued_at FROM cases WHERE report = ? AND status = 'Issued'").get(number);
        return send(res, report ? 200 : 404, JSON.stringify(report ?? null), "application/json");
      }
      if (["/staff", "/staff/", "/staff/index.html"].includes(path)) {
        if (!role) return send(res, 200, login);
        const records = db.prepare("SELECT * FROM cases ORDER BY rowid DESC").all();
        const intake = role === "operator" ? `<form method="post" action="/staff/intake">
          <label for="stone">Stone label</label><input id="stone" name="stone" maxlength="100" required><button>Create case</button></form>` : "";
        return send(res, 200, page("Staff work queue", `<section class="panel">
          <form method="post" action="/staff/logout"><button>Sign out</button></form>
          <p>Signed in as ${role}</p>${intake}<h2>Cases</h2>
          ${records.map(record => caseCard(record, role)).join("") || "<p>No cases yet.</p>"}</section>`));
      }
      return send(res, 404, "Page not found.");
    }

    if (req.method !== "POST") return send(res, 405, "Method not allowed.");
    if (req.headers.origin !== origin) return send(res, 403, "Invalid request origin.");
    const form = await readForm(req);
    if (!form) return send(res, 413, "Request too large.");

    if (path === "/staff/login") {
      const requestedRole = form.get("role");
      const expected = { operator: WTC_OPERATOR_PASSWORD, reviewer: WTC_REVIEWER_PASSWORD };
      const supplied = Buffer.from(form.get("password") ?? "");
      const secret = Buffer.from(Object.hasOwn(expected, requestedRole) ? expected[requestedRole] : "");
      if (!secret.length || supplied.length !== secret.length || !timingSafeEqual(secret, supplied)) {
        return send(res, 401, login.replace("</form>", '<p role="alert">Invalid role or password.</p></form>'));
      }
      sessions.delete(token);
      for (const [key, value] of sessions) {
        if (value.expires <= Date.now()) sessions.delete(key);
      }
      const nextToken = randomBytes(32).toString("hex");
      sessions.set(nextToken, { role: requestedRole, expires: Date.now() + 8 * 60 * 60 * 1000 });
      res.setHeader("Set-Cookie", `wtc_session=${nextToken}; HttpOnly; SameSite=Strict; Path=/staff; Max-Age=28800`);
      return redirect(res, "/staff/");
    }

    if (!role) return send(res, 401, login);
    if (path === "/staff/logout") {
      sessions.delete(token);
      res.setHeader("Set-Cookie", "wtc_session=; HttpOnly; SameSite=Strict; Path=/staff; Max-Age=0");
      return redirect(res, "/staff/");
    }
    const id = form.get("id");
    const revision = Number(form.get("revision") ?? -1);
    if (path === "/staff/intake" && role === "operator") {
      const stone = form.get("stone")?.trim();
      if (!stone || stone.length > 100) return send(res, 400, "Enter a stone label of 1–100 characters.");
      db.prepare("INSERT INTO cases (id, stone) VALUES (?, ?)").run(randomUUID(), stone);
    } else if (path === "/staff/examine" && role === "operator") {
      const finding = form.get("finding")?.trim();
      if (!finding || finding.length > 200) return send(res, 400, "Enter a finding of 1–200 characters.");
      const weight = form.get("weight")?.trim() ?? "";
      const ri = form.get("ri")?.trim() ?? "";
      const evidence = form.get("evidence")?.trim();
      const positiveDecimal = value => value.length <= 16 && /^\d+(?:\.\d+)?$/.test(value) && Number(value) > 0;
      if ((weight && !positiveDecimal(weight)) || (ri && !positiveDecimal(ri))) {
        return send(res, 400, "Enter positive decimal measurements or leave the measurement fields empty.");
      }
      if (!evidence || evidence.length > 1500) return send(res, 400, "Enter supporting observations of 1–1500 characters.");
      const examination = JSON.stringify({ weight, ri, evidence, comparisons: compareRefractiveIndex(ri) });
      const result = db.prepare("UPDATE cases SET finding = ?, examination = ?, status = 'Review' WHERE id = ? AND status IN ('Intake', 'Returned') AND json_array_length(revisions) = ?").run(finding, examination, id, revision);
      if (!result.changes) return send(res, 409, "This case is no longer awaiting examination.");
    } else if (path === "/staff/return" && role === "reviewer") {
      const reason = form.get("reason")?.trim();
      if (!reason || reason.length > 1000) return send(res, 400, "Enter a reason of 1–1000 characters.");
      const result = db.prepare(`UPDATE cases SET status = 'Returned',
        revisions = json_insert(revisions, '$[#]', json_object(
          'at', ?, 'reason', ?, 'finding', finding, 'examination', json(examination)
        ))
        WHERE id = ? AND status = 'Review' AND json_array_length(revisions) = ?`).run(new Date().toISOString(), reason, id, revision);
      if (!result.changes) return send(res, 409, "This case is no longer awaiting review.");
    } else if (path === "/staff/issue" && role === "reviewer") {
      const number = "WTC-" + randomBytes(10).toString("hex").toUpperCase();
      const result = db.prepare("UPDATE cases SET status = 'Issued', report = ?, issued_at = ? WHERE id = ? AND status = 'Review' AND json_array_length(revisions) = ?").run(number, new Date().toISOString(), id, revision);
      if (!result.changes) return send(res, 409, "This case is no longer awaiting review.");
    } else {
      return send(res, 403, "This action is unavailable for your role.");
    }
    return redirect(res, "/staff/");
  } catch (error) {
    console.error(error);
    if (!res.headersSent) send(res, 500, "The request could not be completed.");
  }
});

server.listen(port, "127.0.0.1", () => console.log(`WTC GEM LAB pilot at ${origin}`));
