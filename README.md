# WTC GEM LAB

Local pilot for staff intake, examination, review, and public report verification. Use Node.js 24 and run from the repository directory.

For a quick test, run `node server.mjs --demo` and open http://127.0.0.1:3000. Keep the server running while using the portals. Sign in as Operator with `demo-operator-2026` or Reviewer with `demo-reviewer-2026`. Demo cases are stored in memory and reset when the server stops.

For a pilot that saves cases between restarts, set your own passwords and start without `--demo`.

```powershell
$env:WTC_OPERATOR_PASSWORD = Read-Host 'Local operator password' -MaskInput
$env:WTC_REVIEWER_PASSWORD = Read-Host 'Local reviewer password' -MaskInput
node server.mjs
```

Choose distinct passwords of at least 12 characters. Open http://127.0.0.1:3000. Sign in as the operator, create a fictional case, record any measured weight and refractive index, and submit supporting observations with a finding. The reviewer can read the evidence in the case. Public verification shows the approved finding and leaves the measurements and supporting observations in the Staff Portal. Sign out, sign in as the reviewer, and approve the case. Open the verification link from the issued case.

Cases are saved in wtc.sqlite. Set WTC_DB_PATH to use a different database file. Staff sessions end when the server restarts. Set PORT to change the local port.

This pilot binds to loopback. Use fictional records. Production use requires individual staff accounts, HTTPS, an audit trail, versioned PDF issuance, and backup and recovery procedures.



The reviewer sees how the submitted refractive index compares with the pilot sapphire and spinel references from GIA. Comparisons are saved with each new examination and stay inside the Staff Portal. The lab lead should validate the references and interpretation before operational use.

A reviewer can return a case with a reason before issuance. The operator can revise the prefilled examination and resubmit the same case. Prior findings and return reasons remain visible in staff revision history.
