const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'roadoc.db');
const db = new Database(DB_PATH);

// ── Schema ──────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS ddts (
    id                TEXT PRIMARY KEY,
    data              TEXT NOT NULL,
    mittente          TEXT NOT NULL,
    vettore           TEXT NOT NULL,
    destinatario      TEXT NOT NULL,
    merci             TEXT NOT NULL,
    stato             TEXT NOT NULL,
    note_vettore      TEXT DEFAULT '',
    note_destinazione TEXT DEFAULT '',
    timeline          TEXT NOT NULL,
    created_at        TEXT DEFAULT (datetime('now'))
  )
`);

// ── Seed dati demo (solo se db vuoto) ───────────────────────
function nowStr(date, time) {
  return `${date} ${time}`;
}

const count = db.prepare('SELECT COUNT(*) as c FROM ddts').get().c;
if (count === 0) {
  const ins = db.prepare(`
    INSERT INTO ddts (id, data, mittente, vettore, destinatario, merci, stato, note_vettore, note_destinazione, timeline)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedData = [
    {
      id: 'DDT-2025-0001',
      data: '10/04/2025',
      mittente:     { nome: 'Acme Ceramiche Srl',  piva: 'IT02345678901', indirizzo: 'Via Roma 15, 41100 Modena' },
      vettore:      { nome: 'Trans Adriatica Srl', piva: 'IT09876543210' },
      destinatario: { nome: 'Bayern Handel GmbH',  paese: 'Germania', indirizzo: 'Müllerstr. 42, 80469 München' },
      merci:        [{ desc: 'Piastrelle ceramica 60×60', qty: 24, unita: 'colli', peso: '480 kg' }],
      stato:        'in_transito',
      noteVettore:  'Fragile — maneggiare con cura',
      noteDestinazione: 'Consegnare al magazzino B',
      timeline: [
        { label: 'Documento creato',       ts: '10/04/2025 08:30', done: true  },
        { label: 'Inviato a vettore',      ts: '10/04/2025 08:31', done: true  },
        { label: 'Accettato dal vettore',  ts: '10/04/2025 09:15', done: true  },
        { label: 'Partenza — In transito', ts: '10/04/2025 10:00', done: true  },
        { label: 'Consegna confermata',    ts: null,               done: false }
      ]
    },
    {
      id: 'DDT-2025-0002',
      data: '12/04/2025',
      mittente:     { nome: 'Acme Ceramiche Srl',  piva: 'IT02345678901', indirizzo: 'Via Roma 15, 41100 Modena' },
      vettore:      { nome: 'Trans Adriatica Srl', piva: 'IT09876543210' },
      destinatario: { nome: 'Müller GmbH',          paese: 'Germania', indirizzo: 'Hauptstr. 12, 10115 Berlin' },
      merci:        [{ desc: 'Maioliche decorate', qty: 15, unita: 'colli', peso: '210 kg' }],
      stato:        'attesa_vettore',
      noteVettore:  '',
      noteDestinazione: '',
      timeline: [
        { label: 'Documento creato',       ts: '12/04/2025 14:20', done: true  },
        { label: 'Inviato a vettore',      ts: '12/04/2025 14:21', done: true  },
        { label: 'Accettato dal vettore',  ts: null,               done: false },
        { label: 'Partenza — In transito', ts: null,               done: false },
        { label: 'Consegna confermata',    ts: null,               done: false }
      ]
    },
    {
      id: 'DDT-2025-0003',
      data: '05/04/2025',
      mittente:     { nome: 'Acme Ceramiche Srl',  piva: 'IT02345678901', indirizzo: 'Via Roma 15, 41100 Modena' },
      vettore:      { nome: 'Adriatic Cargo Srl',  piva: 'IT11223344556' },
      destinatario: { nome: 'Bayern Handel GmbH',  paese: 'Austria', indirizzo: 'Ringstraße 4, 1010 Wien' },
      merci:        [{ desc: 'Ceramiche da pavimento', qty: 30, unita: 'colli', peso: '620 kg' }],
      stato:        'consegnato',
      noteVettore:  '',
      noteDestinazione: 'Disponibile dal lunedì mattina',
      timeline: [
        { label: 'Documento creato',       ts: '05/04/2025 07:00', done: true },
        { label: 'Inviato a vettore',      ts: '05/04/2025 07:01', done: true },
        { label: 'Accettato dal vettore',  ts: '05/04/2025 07:45', done: true },
        { label: 'Partenza — In transito', ts: '05/04/2025 09:00', done: true },
        { label: 'Consegna confermata',    ts: '07/04/2025 11:30', done: true }
      ]
    }
  ];

  const insertMany = db.transaction((rows) => {
    for (const d of rows) {
      ins.run(
        d.id, d.data,
        JSON.stringify(d.mittente),
        JSON.stringify(d.vettore),
        JSON.stringify(d.destinatario),
        JSON.stringify(d.merci),
        d.stato,
        d.noteVettore,
        d.noteDestinazione,
        JSON.stringify(d.timeline)
      );
    }
  });
  insertMany(seedData);
  console.log('✓ Dati demo inseriti nel database');
}

// ── Helper: timestamp italiano ───────────────────────────────
function nowItalian() {
  const d = new Date();
  return d.toLocaleDateString('it-IT') + ' ' +
         d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

// ── Helper: parse riga db → oggetto ─────────────────────────
function parseRow(row) {
  return {
    id:               row.id,
    data:             row.data,
    mittente:         JSON.parse(row.mittente),
    vettore:          JSON.parse(row.vettore),
    destinatario:     JSON.parse(row.destinatario),
    merci:            JSON.parse(row.merci),
    stato:            row.stato,
    noteVettore:      row.note_vettore,
    noteDestinazione: row.note_destinazione,
    timeline:         JSON.parse(row.timeline),
    created_at:       row.created_at
  };
}

// ── Queries ──────────────────────────────────────────────────
function getAllDdts() {
  return db.prepare('SELECT * FROM ddts ORDER BY created_at DESC').all().map(parseRow);
}

function getDdtById(id) {
  const row = db.prepare('SELECT * FROM ddts WHERE id = ?').get(id);
  return row ? parseRow(row) : null;
}

function getNextId() {
  const year = new Date().getFullYear();
  const last = db.prepare(`SELECT id FROM ddts WHERE id LIKE 'DDT-${year}-%' ORDER BY id DESC LIMIT 1`).get();
  const seq = last ? parseInt(last.id.split('-')[2]) + 1 : 1;
  return `DDT-${year}-${String(seq).padStart(4, '0')}`;
}

function createDdt(data) {
  const id = getNextId();
  db.prepare(`
    INSERT INTO ddts (id, data, mittente, vettore, destinatario, merci, stato, note_vettore, note_destinazione, timeline)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.data,
    JSON.stringify(data.mittente),
    JSON.stringify(data.vettore),
    JSON.stringify(data.destinatario),
    JSON.stringify(data.merci),
    'attesa_vettore',
    data.noteVettore || '',
    data.noteDestinazione || '',
    JSON.stringify(data.timeline)
  );
  return getDdtById(id);
}

function updateDdtStato(id, stato, timeline) {
  db.prepare('UPDATE ddts SET stato = ?, timeline = ? WHERE id = ?').run(
    stato,
    JSON.stringify(timeline),
    id
  );
  return getDdtById(id);
}

module.exports = { getAllDdts, getDdtById, getNextId, createDdt, updateDdtStato, nowItalian };
