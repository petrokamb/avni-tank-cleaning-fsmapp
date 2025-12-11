
// Simple static app storing entries in localStorage
const STORAGE_KEY = "avni_service_entries_v1";

function readEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch(e) {
    return [];
  }
}
function writeEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

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

function renderTable(filterText='') {
  const tbody = document.querySelector('#logs-table tbody');
  tbody.innerHTML = '';
  const entries = readEntries().slice().reverse(); // newest first
  entries.forEach((e, idx) => {
    if(filterText) {
      const combined = (e.customer + ' ' + e.notes).toLowerCase();
      if(!combined.includes(filterText.toLowerCase())) return;
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${entries.length - idx}</td>
      <td>${escapeHtml(e.customer)}</td>
      <td>${e.date}</td>
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

// form submit
function addEntryFromForm(customerEl, dateEl, statusEl, notesEl) {
  const customer = customerEl.value.trim();
  const date = dateEl.value;
  const status = statusEl.value;
  const notes = notesEl.value.trim();
  if(!customer || !date) {
    showToast('Please enter customer and date');
    return;
  }
  const entries = readEntries();
  entries.push({customer, date, status, notes, createdAt: new Date().toISOString()});
  writeEntries(entries);
  customerEl.value=''; notesEl.value='';
  // reset second form if needed
  updateStats();
  renderTable();
  showToast('Entry added');
}

// wire first form
document.getElementById('entry-form').addEventListener('submit', e=>{
  e.preventDefault();
  addEntryFromForm(document.getElementById('customer'), document.getElementById('service-date'), document.getElementById('status'), document.getElementById('notes'));
});

// second quick form
document.getElementById('entry-form-2').addEventListener('submit', e=>{
  e.preventDefault();
  addEntryFromForm(document.getElementById('customer2'), document.getElementById('service-date2'), document.getElementById('status2'), document.getElementById('notes2'));
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
  const hdr = ['Customer','Date','Status','Notes','CreatedAt'];
  const rows = entries.map(e => [e.customer, e.date, e.status, e.notes || '', e.createdAt || '']);
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

// init defaults
(function init(){
  // set default date today for forms
  const today = new Date().toISOString().slice(0,10);
  document.getElementById('service-date').value = today;
  document.getElementById('service-date2').value = today;
  updateStats();
  renderTable();
})();
