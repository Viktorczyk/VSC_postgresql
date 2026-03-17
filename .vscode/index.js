// index.js
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Jeśli potrzebne: ssl: { rejectUnauthorized: false }
});

const app = express();

// parse form and json bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id,name,email FROM public.test1');
    res.json(rows);
  } catch (err) {
    console.error('DB error', err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/users/html', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id,name,email FROM public.test1');
    const rowsHtml = rows.map(r => `<tr><td>${r.id}</td><td>${r.name}</td><td>${escapeHtml(r.email)}</td></tr>`).join('');
    res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Users</title></head><body><table border="1"><tr><th>ID</th><th>Name</th><th>Email</th></tr>${rowsHtml}</table></body></html>`);
  } catch (err) {
    console.error('DB error', err);
    res.status(500).send('DB error');
  }
});

// Form to add a new user
app.get('/users/form', (req, res) => {
  res.send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Dodaj użytkownika</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    :root{--bg:#f6f8fa;--card:#ffffff;--accent:#1e88e5;--muted:#6b7280}
    *{box-sizing:border-box}
    body{font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;background:var(--bg);margin:0;padding:32px;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .card{width:100%;max-width:640px;background:var(--card);padding:28px;border-radius:12px;box-shadow:0 10px 30px rgba(2,6,23,0.06)}
    h1{margin:0 0 8px;font-size:20px;color:#0f172a}
    p.lead{margin:0 0 18px;color:var(--muted)}
    .field{margin-top:12px}
    label{display:block;font-size:13px;color:var(--muted);margin-bottom:6px}
    input[type="text"],input[type="email"]{width:100%;padding:12px 14px;border:1px solid #e6e9ef;border-radius:8px;font-size:15px}
    .actions{margin-top:18px;display:flex;gap:10px;align-items:center}
    button.primary{background:var(--accent);color:#fff;border:none;padding:10px 16px;border-radius:10px;cursor:pointer;font-weight:600}
    button.secondary{background:#eef2ff;border:none;padding:9px 14px;border-radius:10px;cursor:pointer;color:#123}
    .success{color:#16a34a;margin-left:12px;font-weight:600}
    small.note{display:block;margin-top:10px;color:#94a3b8}
    @media(max-width:520px){.card{padding:18px}}
  </style>
</head>
<body>
  <div class="card">
    <h1>Dodaj nowego użytkownika</h1>
    <p class="lead">Wypełnij poniższy formularz, aby dodać użytkownika do tabeli.</p>
    <form method="post" action="/users" id="addUserForm">
      <div class="field">
        <label for="name">Imię i nazwisko</label>
        <input id="name" name="name" type="text" required placeholder="Jan Kowalski">
      </div>
      <div class="field">
        <label for="email">Adres e‑mail</label>
        <input id="email" name="email" type="email" required placeholder="jan@example.com">
      </div>
      <div class="actions">
        <button class="primary" type="submit" id="submitBtn">Dodaj użytkownika</button>
        <button type="button" class="secondary" onclick="location.href='/users/html'">Anuluj</button>
        <span id="msg" class="success" style="display:none">Dodano &#10003;</span>
      </div>
      <small class="note">Po dodaniu nastąpi przekierowanie do listy użytkowników.</small>
    </form>
  </div>

  <script>
    const form = document.getElementById('addUserForm');
    const btn = document.getElementById('submitBtn');
    const msg = document.getElementById('msg');
    form.addEventListener('submit', ()=>{ btn.disabled=true; btn.textContent='Wysyłanie...'; msg.style.display='none'; });
  </script>
</body>
</html>`);
});

// Handle form submit and insert into DB
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO public.test1(name,email) VALUES($1,$2) RETURNING id,name,email',
      [name, email]
    );
    // after insert redirect to HTML list
    res.redirect('/users/html');
  } catch (err) {
    console.error('DB error', err);
    res.status(500).send('DB error');
  }
});

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

// Apartment selection and detailed booking forms
app.get('/bookings/choose', (req, res) => {
  res.send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Wybierz apartament</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:Segoe UI,Helvetica,Arial,sans-serif;background:#f6f8fa;margin:0;padding:40px;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .box{background:#fff;padding:28px;border-radius:12px;box-shadow:0 10px 30px rgba(2,6,23,0.06);max-width:520px;width:100%}
    h1{margin:0 0 12px}
    .list{display:flex;gap:12px}
    a.card{flex:1;padding:14px;border-radius:8px;text-decoration:none;color:#0b1f3a;background:#f8fafc;border:1px solid #e6eefb;display:block;text-align:center}
    a.card:hover{box-shadow:0 6px 18px rgba(2,6,23,0.06)}
  </style>
</head>
<body>
  <div class="box">
    <h1>Wybierz apartament do rezerwacji</h1>
    <div class="list">
      <a class="card" href="/booking/ap1/form">Apartament 1</a>
      <a class="card" href="/booking/ap2/form">Apartament 2</a>
    </div>
  </div>
</body>
</html>`);
});

// Form for Apartment 1
app.get('/booking/ap1/form', (req, res) => {
  res.send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rezerwacja — Apartament 1</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    :root{--accent:#0d6efd;--muted:#6b7280}
    body{font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;background:#f6f8fa;margin:0;padding:32px}
    .card{max-width:720px;margin:0 auto;background:#fff;padding:22px;border-radius:10px;box-shadow:0 8px 24px rgba(2,6,23,0.06)}
    label{display:block;margin-top:10px;color:var(--muted)}
    input[type=text],input[type=date]{width:100%;padding:10px;border:1px solid #e6e9ef;border-radius:8px;margin-top:6px}
    .row{display:flex;gap:12px;flex-wrap:wrap}
    .row .col{flex:1;min-width:180px}
    .actions{margin-top:14px}
    .note{color:var(--muted);font-size:13px}
    .avail{margin-top:8px;font-weight:600}
  </style>
</head>
<body>
  <div class="card">
    <h1>Rezerwacja — Apartament 1</h1>
    <form id="apForm" method="post" action="/booking/ap1">
      <div class="row" style="flex-direction:column">
        <div class="col"><label>Nazwisko<input name="last_name" type="text" required></label></div>
        <div class="col"><label>Imię<input name="first_name" type="text" required></label></div>
      </div>

      <div class="row">
        <div class="col"><label>Termin od<input name="date_from" type="date" required></label></div>
        <div class="col"><label>Termin do<input name="date_to" type="date" required></label></div>
      </div>

      <label><input type="checkbox" name="deposit" value="1"> Czy zaliczka</label>
      <label><input id="jacCheck" type="checkbox" name="jacuzzi" value="1"> Chcę jacuzzi</label>

      <div id="jacStatus" class="avail" style="display:none"></div>

      <div class="actions">
        <button type="submit" class="primary">Zarezerwuj</button>
        <button type="button" onclick="location.href='/bookings/choose'">Anuluj</button>
      </div>
      <p class="note">Jeśli wybierzesz jacuzzi, system sprawdzi jego dostępność w podanym terminie.</p>
    </form>
  </div>

  <script>
    const jacCheck = document.getElementById('jacCheck');
    const form = document.getElementById('apForm');
    const jacStatus = document.getElementById('jacStatus');
    const dateFrom = form.elements['date_from'];
    const dateTo = form.elements['date_to'];

    async function checkJac(){
      jacStatus.style.display='none';
      if(!jacCheck.checked) return true;
      const f = dateFrom.value, t = dateTo.value;
      if(!f || !t) return true;
      jacStatus.textContent='Sprawdzanie dostępności...'; jacStatus.style.display='block';
      try{
        const res = await fetch('/booking/jacuuzi/check?from=' + encodeURIComponent(f) + '&to=' + encodeURIComponent(t));
        const data = await res.json();
        if(data.available){ jacStatus.textContent='Jacuzzi dostępne'; jacStatus.style.color='green'; return true; }
        else{ jacStatus.textContent='Jacuzzi NIEDOSTĘPNE w tym terminie'; jacStatus.style.color='red'; return false; }
      }catch(e){ jacStatus.textContent='Błąd sprawdzania dostępności'; jacStatus.style.color='orange'; return false; }
    }

    jacCheck.addEventListener('change', ()=>{ checkJac(); });
    dateFrom.addEventListener('change', ()=>{ if(jacCheck.checked) checkJac(); });
    dateTo.addEventListener('change', ()=>{ if(jacCheck.checked) checkJac(); });

    form.addEventListener('submit', async (ev)=>{
      if(jacCheck.checked){
        const ok = await checkJac();
        if(!ok){ ev.preventDefault(); alert('Jacuzzi zajęte w wybranym terminie.'); }
      }
    });
  </script>
</body>
</html>`);
});

// Form for Apartment 2 (same fields)
app.get('/booking/ap2/form', (req, res) => {
  res.send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rezerwacja — Apartament 2</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;background:#f6f8fa;margin:0;padding:32px}
    .card{max-width:720px;margin:0 auto;background:#fff;padding:22px;border-radius:10px;box-shadow:0 8px 24px rgba(2,6,23,0.06)}
    label{display:block;margin-top:10px;color:#6b7280}
    input[type=text],input[type=date]{width:100%;padding:10px;border:1px solid #e6e9ef;border-radius:8px;margin-top:6px}
    .row{display:flex;gap:12px;flex-wrap:wrap}
    .row .col{flex:1;min-width:180px}
    .actions{margin-top:14px}
    .avail{margin-top:8px;font-weight:600}
  </style>
</head>
<body>
  <div class="card">
    <h1>Rezerwacja — Apartament 2</h1>
    <form id="apForm2" method="post" action="/booking/ap2">
      <div class="row" style="flex-direction:column">
        <div class="col"><label>Nazwisko<input name="last_name" type="text" required></label></div>
        <div class="col"><label>Imię<input name="first_name" type="text" required></label></div>
      </div>

      <div class="row">
        <div class="col"><label>Termin od<input name="date_from" type="date" required></label></div>
        <div class="col"><label>Termin do<input name="date_to" type="date" required></label></div>
      </div>

      <label><input type="checkbox" name="deposit" value="1"> Czy zaliczka</label>
      <label><input id="jacCheck2" type="checkbox" name="jacuzzi" value="1"> Chcę jacuzzi</label>

      <div id="jacStatus2" class="avail" style="display:none"></div>

      <div class="actions">
        <button type="submit" class="primary">Zarezerwuj</button>
        <button type="button" onclick="location.href='/bookings/choose'">Anuluj</button>
      </div>
    </form>
  </div>

  <script>
    const form2 = document.getElementById('apForm2');
    const jacCheck2 = document.getElementById('jacCheck2');
    const dateFrom2 = form2.elements['date_from'];
    const dateTo2 = form2.elements['date_to'];
    const jacStatus2 = document.getElementById('jacStatus2');
    async function checkJac2(){
      jacStatus2.style.display='none';
      if(!jacCheck2.checked) return true;
      const f = dateFrom2.value, t = dateTo2.value;
      if(!f || !t) return true;
      jacStatus2.textContent='Sprawdzanie dostępności...'; jacStatus2.style.display='block';
      try{
        const res = await fetch('/booking/jacuuzi/check?from=' + encodeURIComponent(f) + '&to=' + encodeURIComponent(t));
        const data = await res.json();
        if(data.available){ jacStatus2.textContent='Jacuzzi dostępne'; jacStatus2.style.color='green'; return true; }
        else{ jacStatus2.textContent='Jacuzzi NIEDOSTĘPNE w tym terminie'; jacStatus2.style.color='red'; return false; }
      }catch(e){ jacStatus2.textContent='Błąd sprawdzania dostępności'; jacStatus2.style.color='orange'; return false; }
    }
    jacCheck2.addEventListener('change', ()=>{ checkJac2(); });
    dateFrom2.addEventListener('change', ()=>{ if(jacCheck2.checked) checkJac2(); });
    dateTo2.addEventListener('change', ()=>{ if(jacCheck2.checked) checkJac2(); });
    form2.addEventListener('submit', async (ev)=>{ if(jacCheck2.checked){ const ok = await checkJac2(); if(!ok){ ev.preventDefault(); alert('Jacuzzi zajęte w wybranym terminie.'); } } });
  </script>
</body>
</html>`);
});

// Endpoint to check jacuzzi availability between two dates (expects YYYY-MM-DD)
app.get('/booking/jacuuzi/check', async (req, res) => {
  const { from, to } = req.query;
  if(!from || !to) return res.status(400).json({ error: 'missing from/to' });
  try{
    const q = `SELECT COUNT(*)::int AS cnt FROM public.booking_jacuuzi WHERE (date_from <= $2::date) AND (date_to >= $1::date)`;
    const { rows } = await pool.query(q, [from, to]);
    const available = rows[0].cnt === 0;
    res.json({ available });
  }catch(err){ console.error('Jac check error', err); res.status(500).json({ error: 'DB error' }); }
});

// POST handlers for apartments (store date ranges)
app.post('/booking/ap1', async (req, res) => {
  const { first_name, last_name, date_from, date_to, deposit, jacuzzi } = req.body;
  try{
    await pool.query(
      'INSERT INTO public.booking_ap1(first_name,last_name,date_from,date_to,deposit,jacuzzi) VALUES($1,$2,$3,$4,$5,$6)',
      [first_name,last_name,date_from,date_to, !!deposit, !!jacuzzi]
    );
    res.redirect('/bookings/choose');
  }catch(err){ console.error('/booking/ap1', err); res.status(500).send('DB error'); }
});

app.post('/booking/ap2', async (req, res) => {
  const { first_name, last_name, date_from, date_to, deposit, jacuzzi } = req.body;
  try{
    await pool.query(
      'INSERT INTO public.booking_ap2(first_name,last_name,date_from,date_to,deposit,jacuzzi) VALUES($1,$2,$3,$4,$5,$6)',
      [first_name,last_name,date_from,date_to, !!deposit, !!jacuzzi]
    );
    res.redirect('/bookings/choose');
  }catch(err){ console.error('/booking/ap2', err); res.status(500).send('DB error'); }
});

// Keep legacy jacuzzi POST if needed (simple single-day booking)
app.post('/booking/jacuuzi', async (req, res) => {
  const { name, date, time, hours } = req.body;
  try{
    await pool.query('INSERT INTO public.booking_jacuuzi(name, date, time, hours) VALUES($1,$2,$3,$4)', [name,date,time,hours]);
    res.redirect('/bookings/choose');
  }catch(err){ console.error('DB error /booking/jacuuzi', err); res.status(500).send('DB error'); }
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on ${port}`));

process.on('SIGINT', async () => { await pool.end(); server.close(() => process.exit(0)); });