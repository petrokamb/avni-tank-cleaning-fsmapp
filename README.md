
# Avni Service Tracker — Upgraded Static Version

This upgraded static app includes:
- Service Type dropdown (predefined list)
- Frequency dropdown (30, 60, 90, 180, 365 days)
- Auto-calculation of Next 3 Service Dates (based on service date + frequency)
- Saves entries to localStorage and optionally POSTs each new entry to a Google Sheet via Apps Script web app.
- Export CSV / JSON, delete, clear functions.

## Deploying to GitHub Pages
1. Upload `index.html`, `styles.css`, `script.js` to your GitHub repo root.
2. Enable Pages: Settings → Pages → Branch: `main`, Folder: `/ (root)` → Save.
3. Wait 30–60 seconds and open `https://<your-username>.github.io/<repo>/`

## How to enable Google Sheet sync (FREE)
1. Create a new Google Sheet. In row 1 add headers:
   `Customer,ServiceDate,ServiceType,Frequency,Status,Notes,CreatedAt`
2. Open Extensions → Apps Script and replace Code.gs with the script provided in `apps-script.txt` (see below).
3. Deploy → New deployment → Select "Web app" → Execute as: **Me**, Who has access: **Anyone** (or Anyone with link).
4. Copy the Web app URL and paste it into `script.js` `SHEET_WEBHOOK_URL` variable (replace the empty string).
5. Now every new entry will POST to the sheet (the Apps Script will append rows).

## Apps Script snippet (apps-script.txt)
Use the code provided in apps-script.txt (in this package) and paste into your Apps Script file.

