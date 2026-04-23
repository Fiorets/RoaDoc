const express = require('express');
const path    = require('path');
const { getAllDdts, getDdtById, getNextId, createDdt, updateDdtStato, setCodiceDdt, deleteDdt, nowItalian } = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── GET /api/ddts ────────────────────────────────────────────
app.get('/api/ddts', (req, res) => {
  const { ruolo, nome } = req.query;
  let all = getAllDdts();

  if (ruolo && nome) {
    if (ruolo === 'mittente') {
      all = all.filter(d => d.mittente.nome === nome);
    } else if (ruolo === 'vettore') {
      all = all.filter(d => d.vettore.nome === nome);
    } else if (ruolo === 'destinatario') {
      all = all.filter(d => d.destinatario.nome === nome);
    }
  }

  res.json(all);
});

// ── GET /api/ddts/next-id ────────────────────────────────────
app.get('/api/ddts/next-id', (req, res) => {
  res.json({ id: getNextId() });
});

// ── GET /api/ddts/:id ────────────────────────────────────────
app.get('/api/ddts/:id', (req, res) => {
  const ddt = getDdtById(req.params.id);
  if (!ddt) return res.status(404).json({ error: 'DdT non trovato' });
  res.json(ddt);
});

// ── POST /api/ddts ───────────────────────────────────────────
app.post('/api/ddts', (req, res) => {
  const body = req.body;
  if (!body.vettore?.nome)      return res.status(400).json({ error: 'Nome vettore mancante' });
  if (!body.destinatario?.nome) return res.status(400).json({ error: 'Nome destinatario mancante' });
  if (!body.merci?.length)      return res.status(400).json({ error: 'Almeno una riga merce richiesta' });

  const n = nowItalian();
  body.timeline = [
    { label: 'Documento creato',       ts: n,    done: true  },
    { label: 'Inviato a vettore',      ts: n,    done: true  },
    { label: 'Accettato dal vettore',  ts: null, done: false },
    { label: 'Partenza — In transito', ts: null, done: false },
    { label: 'Consegna confermata',    ts: null, done: false }
  ];

  const ddt = createDdt(body);
  res.status(201).json(ddt);
});

// ── PUT /api/ddts/:id/accetta ────────────────────────────────
app.put('/api/ddts/:id/accetta', (req, res) => {
  const ddt = getDdtById(req.params.id);
  if (!ddt) return res.status(404).json({ error: 'DdT non trovato' });
  if (ddt.stato !== 'attesa_vettore') return res.status(400).json({ error: 'Azione non consentita in questo stato' });

  const tl = ddt.timeline;
  tl[2].done = true;
  tl[2].ts   = nowItalian();
  const updated = updateDdtStato(ddt.id, 'accettato', tl);
  res.json(updated);
});

// ── PUT /api/ddts/:id/transito ───────────────────────────────
app.put('/api/ddts/:id/transito', (req, res) => {
  const ddt = getDdtById(req.params.id);
  if (!ddt) return res.status(404).json({ error: 'DdT non trovato' });
  if (ddt.stato !== 'accettato') return res.status(400).json({ error: 'Azione non consentita in questo stato' });

  const tl = ddt.timeline;
  tl[3].done = true;
  tl[3].ts   = nowItalian();
  const updated = updateDdtStato(ddt.id, 'in_transito', tl);
  res.json(updated);
});

// ── PUT /api/ddts/:id/avvia-consegna ────────────────────────
// Il vettore avvia la procedura: genera il codice che apparirà
// sul dispositivo del destinatario.
app.put('/api/ddts/:id/avvia-consegna', (req, res) => {
  const ddt = getDdtById(req.params.id);
  if (!ddt) return res.status(404).json({ error: 'DdT non trovato' });
  if (ddt.stato !== 'in_transito') return res.status(400).json({ error: 'Azione consentita solo con spedizione in transito' });
  if (ddt.codice_consegna) return res.status(400).json({ error: 'Codice già generato per questo DdT' });

  // Genera codice a 6 cifre
  const codice = String(Math.floor(100000 + Math.random() * 900000));
  const updated = setCodiceDdt(ddt.id, codice);
  res.json(updated);
});

// ── PUT /api/ddts/:id/consegna ───────────────────────────────
// Il vettore inserisce il codice mostrato dal destinatario.
app.put('/api/ddts/:id/consegna', (req, res) => {
  const ddt = getDdtById(req.params.id);
  if (!ddt) return res.status(404).json({ error: 'DdT non trovato' });
  if (ddt.stato !== 'in_transito') return res.status(400).json({ error: 'Azione non consentita in questo stato' });

  if (!ddt.codice_consegna) {
    return res.status(400).json({ error: 'Avviare prima la procedura dal pulsante "Sono arrivato"' });
  }
  const { codice } = req.body;
  if (!codice) return res.status(400).json({ error: 'Codice di consegna obbligatorio' });
  if (String(codice).trim() !== String(ddt.codice_consegna).trim()) {
    return res.status(400).json({ error: 'Codice non corretto — riprova' });
  }

  const tl = ddt.timeline;
  tl[4].done = true;
  tl[4].ts   = nowItalian();
  const updated = updateDdtStato(ddt.id, 'consegnato', tl);
  res.json(updated);
});

// ── DELETE /api/ddts/:id ─────────────────────────────────────
app.delete('/api/ddts/:id', (req, res) => {
  const ddt = getDdtById(req.params.id);
  if (!ddt) return res.status(404).json({ error: 'DdT non trovato' });
  deleteDdt(req.params.id);
  res.json({ ok: true });
});

// ── GET /api/debug ───────────────────────────────────────────
app.get('/api/debug', (req, res) => {
  const all = getAllDdts();
  res.json({ totale: all.length, ids: all.map(d => ({ id: d.id, vettore: d.vettore.nome, stato: d.stato })) });
});

// ── Fallback → serve index.html per SPA ─────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✓ RoaDoc in ascolto su http://localhost:${PORT}`);
});
