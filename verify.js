const form = document.querySelector("form");
const report = document.querySelector("#report");
const result = document.querySelector("#result");
let activeLookup;

async function showResult() {
  activeLookup?.abort();
  const lookup = new AbortController();
  activeLookup = lookup;
  const number = report.value.trim();
  if (!number) {
    result.textContent = "Enter a report number.";
    return;
  }
  result.textContent = "Looking up report…";
  try {
    const response = await fetch("/api/report?" + new URLSearchParams({ report: number }), { signal: lookup.signal });
    if (response.status === 404) {
      result.textContent = "No issued report found. Check the number and try again.";
      return;
    }
    if (!response.ok) throw new Error("Lookup failed");
    const record = await response.json();
    result.textContent = `Issued · ${record.report} · ${record.finding} · ${record.issued_at.slice(0, 10)}`;
  } catch (error) {
    if (error.name !== "AbortError") result.textContent = "Verification is temporarily unavailable.";
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const url = new URL(window.location.href);
  url.searchParams.set("report", report.value.trim());
  window.history.replaceState(null, "", url);
  showResult();
});

const number = new URLSearchParams(window.location.search).get("report");
if (number) {
  report.value = number;
  showResult();
}
