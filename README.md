
# Avni Water Tank Cleaning — Static Service Tracker

This is a static, single-page version of the app exported from Google AI Studio and converted to plain HTML/CSS/JS.
It stores service entries in **browser localStorage** and is ready to deploy on GitHub Pages.

## Features
- Dashboard stats (total today, completed, in-progress, pending)
- Add new service entries (customer, date, status, notes)
- Service logs table with delete
- Export CSV / Download JSON
- No backend required

## How to deploy to GitHub Pages
1. Upload all files in this folder to your GitHub repository root.
2. In repository settings → Pages, select branch `main` and folder `/ (root)`.
3. Wait a minute; your site will be available at:
   `https://<your-username>.github.io/<repo-name>/`

## Notes
- Data is stored locally in the browser (localStorage).
- If you need server storage (Google Sheets, Firebase, or an API), I can add that.

