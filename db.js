const fs   = require('fs');
const path = require('path');

const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');

// ── Carica o inizializza il database JSON ────────────────────
function load() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return { ddts: [] };
}

function save(db) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
}

// ── Seed dati demo (solo al primo avvio) ─────────────────────
const db = load();
if (db.ddts.length === 0) {
  db.ddts = [
    {
      id: 'DDT-2025-0001', data: '10/04/2025',
      mittente:     { nome: 'Acme Ceramiche Srl',  piva: 'IT02345678901', indirizzo: 'Via Roma 15, 41100 Modena' },
      vettore:      { nome: 'Trans Adriatica Srl', piva: 'IT09876543210' },
      destinatario: { nome: 'Bayern Handel GmbH',  paese: 'Germania', indirizzo: 'Müllerstr. 42, 80469 München' },
      merci:        [{ desc: 'Piastrelle ceramica 60×60', qty: 24, unita: 'colli', peso: '480 kg' }],
      stato: 'in_transito',
      noteVettore: 'Fragile — maneggiare con cura',
      noteDestinazione: 'Consegnare al magazzino B',
      timeline: [
        { label: 'Documento creato',       ts: '10/04/2025 08:30', done: true  },
        { label: 'Inviato a vettore',      ts: '10/04/2025 08:31', done: true  },
        { label: 'Accettato dal vettore',  ts: '10/04/2025 09:15', done: true  },
        { label: 'Partenza — In transito', ts: '10/04/2025 10:00', done: true  },
        { label: 'Consegna confermata',    ts: null,               done: false }
      ],
      created_at: '2025-04-10T08:30:00.000Z'
    },
    {
      id: 'DDT-2025-0002', data: '12/04/2025',
      mittente:     { nome: 'Acme Ceramiche Srl',  piva: 'IT02345678901', indirizzo: 'Via Roma 15, 41100 Modena' },
      vettore:      { nome: 'Trans Adriatica Srl', piva: 'IT09876543210' },
      destinatario: { nome: 'Müller GmbH',          paese: 'Germania', indirizzo: 'Hauptstr. 12, 10115 Berlin' },
      merci:        [{ desc: 'Maioliche decorate', qty: 15, unita: 'colli', peso: '210 kg' }],
      stato: 'attesa_vettore',
      noteVettore: '', noteDestinazione: '',
      timeline: [
        { label: 'Documento creato',       ts: '12/04/2025 14:20', done: true  },
        { label: 'Inviato a vettore',      ts: '12/04/2025 14:21', done: true  },
        { label: 'Accettato dal vettore',  ts: null,               done: false },
        { label: 'Partenza — In transito', ts: null,               done: false },
        { label: 'Consegna confermata',    ts: null,               done: false }
      ],
      created_at: '2025-04-12T14:20:00.000Z'
    },
    {
      id: 'DDT-2025-0003', data: '05/04/2025',
      mittente:     { nome: 'Acme Ceramiche Srl',  piva: 'IT02345678901', indirizzo: 'Via Roma 15, 41100 Modena' },
      vettore:      { nome: 'Adriatic Cargo Srl',  piva: 'IT11223344556' },
      destinatario: { nome: 'Bayern Handel GmbH',  paese: 'Austria', indirizzo: 'Ringstraße 4, 1010 Wien' },
      merci:        [{ desc: 'Ceramiche da pavimento', qty: 30, unita: 'colli', peso: '620 kg' }],
      stato: 'consegnato',
      noteVettore: '', noteDestinazione: 'Disponibile dal lunedì mattina',
      timeline: [
        { label: 'Documento creato',       ts: '05/04/2025 07:00', done: true },
        { label: 'Inviato a vettore',      ts: '05/04/2025 07:01', done: true },
        { label: 'Accettato dal vettore',  ts: '05/04/2025 07:45', done: true },
        { label: 'Partenza — In transito', ts: '05/04/2025 09:00', done: true },
        { label: 'Consegna confermata',    ts: '07/04/2025 11:30', done: true }
      ],
      created_at: '2025-04-05T07:00:00.000Z'
    }
  ];
  save(db);
  console.log('✓ Dati demo inizializzati');
}

// ── Helper: timestamp italiano ───────────────────────────────
function nowItalian() {
  const d = new Date();
  return d.toLocaleDateString('it-IT') + ' ' +
         d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

// ── Queries ──────────────────────────────────────────────────
function getAllDdts() {
  return load().ddts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getDdtById(id) {
  return load().ddts.find(d => d.id === id) || null;
}

function getNextId() {
  const year = new Date().getFullYear();
  const db   = load();
  const same = db.ddts.filter(d => d.id.startsWith(`DDT-${year}-`));
  const max  = same.reduce((m, d) => {
    const n = parseInt(d.id.split('-')[2]);
    return n > m ? n : m;
  }, 0);
  return `DDT-${year}-${String(max + 1).padStart(4, '0')}`;
}

function createDdt(data) {
  const db  = load();
  const id  = getNextId();
  const ddt = {
    id,
    data:             data.data,
    mittente:         data.mittente,
    vettore:          data.vettore,
    destinatario:     data.destinatario,
    merci:            data.merci,
    stato:            'attesa_vettore',
    noteVettore:      data.noteVettore      || '',
    noteDestinazione: data.noteDestinazione || '',
    timeline:         data.timeline,
    created_at:       new Date().toISOString()
  };
  db.ddts.unshift(ddt);
  save(db);
  return ddt;
}

function updateDdtStato(id, stato, timeline) {
  const db  = load();
  const idx = db.ddts.findIndex(d => d.id === id);
  if (idx === -1) return null;
  db.ddts[idx].stato    = stato;
  db.ddts[idx].timeline = timeline;
  save(db);
  return db.ddts[idx];
}

module.exports = { getAllDdts, getDdtById, getNextId, createDdt, updateDdtStato, nowItalian };
