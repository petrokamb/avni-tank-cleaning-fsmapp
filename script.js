
// Upgraded static app with service types, frequency, next-3 calc and Google Sheet POST
const STORAGE_KEY = "avni_service_entries_v2";

// === CONFIG: set your Google Apps Script POST URL here after deploying the Apps Script web app ===
// Example: const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbx.../exec";
const SHEET_WEBHOOK_URL = ""; // <-- paste your web app URL here to enable sheet sync

const SERVICE_TYPES = [
  "Professional Pest Control Service",
  "Professional Water Tank Cleaning",
  "Professional Building Jet Cleaning",
  "Rodent Pipe Guard Installation",
  "Fire Extinguisher",
  "Fire System work",
  "CCTV Installation & work",
  "Safety equipments installation",
  "Industrial equipments others"
];

const FREQUENCIES = [30,60,90,180,365]; // days

function readEntries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch(e){ return []; }
}
function writeEntries(entries) { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.hidden = false;
  setTimeout(()=> t.hidden = true, 2500);
}

function updateStats() {
  const entries = readEntries();
  const today = new Date().toISOString().slice(0,10);
  const totalToday = entries.filter(e => e.date === today).length;
  const completed = entries.filter(e => e.status === 'completed').length;
  const inprogress = entries.filter(e => e.status === 'inprogress').length;
  const pending = entries.filter(e => e.status === 'pending').length;
  document.getElementById('total-today').textContent = totalToday;
  document.getElementById('completed').textContent = completed;
  document.getElementById('inprogress').textContent = inprogress;
  document.getElementById('pending').textContent = pending;
}

function calculateNextDates(startIso, freqDays) {
  const res = [];
  let current = new Date(startIso);
  for(let i=0;i<3;i++){
    current = new Date(current.getTime() + freqDays*24*60*60*1000);
    res.push(current.toISOString().slice(0,10));
  }
  return res;
}

function renderTable(filterText='') {
  const tbody = document.querySelector('#logs-table tbody');
  tbody.innerHTML = '';
  const entries = readEntries().slice().reverse();
  entries.forEach((e, idx) => {
    if(filterText) {
      const combined = (e.customer + ' ' + e.notes + ' ' + e.type).toLowerCase();
      if(!combined.includes(filterText.toLowerCase())) return;
    }
    const next3 = calculateNextDates(e.date, Number(e.frequency)).join("<br/>");
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${entries.length - idx}</td>
      <td>${escapeHtml(e.customer)}</td>
      <td>${e.date}</td>
      <td>${escapeHtml(e.type)}</td>
      <td>${e.frequency}</td>
      <td>${next3}</td>
      <td>${statusLabel(e.status)}</td>
      <td>${escapeHtml(e.notes || '')}</td>
      <td>
        <button data-idx="${entries.length - idx -1}" class="del">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function statusLabel(s) {
  if(s==='completed') return 'Completed';
  if(s==='inprogress') return 'In Progress';
  return 'Pending';
}

function escapeHtml(s) {
  if(!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

// populate selects
function populateSelects() {
  const st = document.getElementById('service-type');
  const st2 = document.getElementById('service-type2');
  SERVICE_TYPES.forEach(t => { const o=document.createElement('option'); o.value=t; o.textContent=t; st.appendChild(o); st2.appendChild(o.cloneNode(true)); });
  const f = document.getElementById('frequency');
  const f2 = document.getElementById('frequency2');
  FREQUENCIES.forEach(d => { const o=document.createElement('option'); o.value=d; o.textContent=d + ' days'; f.appendChild(o); f2.appendChild(o.cloneNode(true)); });
}

// handle nav
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const section = btn.dataset.section;
    document.getElementById('page-title').textContent = btn.textContent;
    document.querySelectorAll('.section').forEach(sec=>sec.classList.remove('visible'));
    document.getElementById(section).classList.add('visible');
    renderTable();
  });
});

function addEntry(entry) {
  const entries = readEntries();
  entries.push(entry);
  writeEntries(entries);
  updateStats();
  renderTable();
  showToast('Entry added locally');
  // push to Google Sheet if URL configured
  if(SHEET_WEBHOOK_URL) {
    fetch(SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(entry)
    }).then(r => r.json ? r.json() : r.text()).then(j => {
      console.log('sheet response', j);
      showToast('Synced to Google Sheet');
    }).catch(err => {
      console.error('sheet error', err);
      showToast('Sheet sync failed');
    });
  }
}

function addEntryFromForm(customerEl, dateEl, typeEl, freqEl, statusEl, notesEl) {
  const customer = customerEl.value.trim();
  const date = dateEl.value;
  const type = typeEl.value;
  const frequency = freqEl.value;
  const status = statusEl.value;
  const notes = notesEl.value.trim();
  if(!customer || !date) { showToast('Please enter customer and date'); return; }
  const entry = {customer, date, type, frequency, status, notes, createdAt: new Date().toISOString()};
  addEntry(entry);
  customerEl.value=''; notesEl.value='';
}

// wire first form
document.getElementById('entry-form').addEventListener('submit', e=>{
  e.preventDefault();
  addEntryFromForm(document.getElementById('customer'), document.getElementById('service-date'), document.getElementById('service-type'), document.getElementById('frequency'), document.getElementById('status'), document.getElementById('notes'));
});

// second quick form
document.getElementById('entry-form-2').addEventListener('submit', e=>{
  e.preventDefault();
  addEntryFromForm(document.getElementById('customer2'), document.getElementById('service-date2'), document.getElementById('service-type2'), document.getElementById('frequency2'), document.getElementById('status2'), document.getElementById('notes2'));
});

// delete
document.querySelector('#logs-table tbody').addEventListener('click', (e)=>{
  if(e.target.classList.contains('del')) {
    const idx = Number(e.target.dataset.idx);
    const entries = readEntries();
    entries.splice(idx,1);
    writeEntries(entries);
    updateStats();
    renderTable();
    showToast('Deleted');
  }
});

// clear all
document.getElementById('clear-storage').addEventListener('click', ()=>{
  if(confirm('Clear all data?')) {
    localStorage.removeItem(STORAGE_KEY);
    updateStats(); renderTable();
  }
});

// export CSV
function entriesToCSV(entries) {
  const hdr = ['Customer','Date','Type','Frequency','Status','Notes','CreatedAt'];
  const rows = entries.map(e => [e.customer, e.date, e.type, e.frequency, e.status, e.notes || '', e.createdAt || '']);
  const csv = [hdr].concat(rows).map(r => r.map(cell=>`"\${(cell||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  return csv;
}
document.getElementById('export-csv').addEventListener('click', ()=>{
  const entries = readEntries();
  const csv = entriesToCSV(entries);
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'avni-service-logs.csv'; a.click();
  URL.revokeObjectURL(url);
});

// download JSON
document.getElementById('download-json').addEventListener('click', ()=>{
  const entries = readEntries();
  const blob = new Blob([JSON.stringify(entries, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'avni-service-logs.json'; a.click();
  URL.revokeObjectURL(url);
});

// filter
document.getElementById('filter-text').addEventListener('input', (e)=>{
  renderTable(e.target.value);
});

// show next dates when selecting date/frequency
function wireNextDates() {
  const sd = document.getElementById('service-date');
  const sd2 = document.getElementById('service-date2');
  const f = document.getElementById('frequency');
  const f2 = document.getElementById('frequency2');
  [sd,sd2,f,f2].forEach(el=>el.addEventListener('change', updateNextDatesUI));
}

function updateNextDatesUI() {
  const d1 = document.getElementById('service-date').value;
  const freq = Number(document.getElementById('frequency').value || FREQUENCIES[0]);
  const nd = calculateNextDates(d1 || new Date().toISOString().slice(0,10), freq);
  document.getElementById('next-dates').innerHTML = '<strong>Next 3 dates:</strong> ' + nd.join(', ');
  const d2 = document.getElementById('service-date2').value;
  const freq2 = Number(document.getElementById('frequency2').value || FREQUENCIES[0]);
  const nd2 = calculateNextDates(d2 || new Date().toISOString().slice(0,10), freq2);
  document.getElementById('next-dates-2').innerHTML = '<strong>Next 3 dates:</strong> ' + nd2.join(', ');
}

// init defaults
(function init(){
  const today = new Date().toISOString().slice(0,10);
  document.getElementById('service-date').value = today;
  document.getElementById('service-date2').value = today;
  populateSelects();
  wireNextDates();
  updateNextDatesUI();
  updateStats();
  renderTable();
})();

