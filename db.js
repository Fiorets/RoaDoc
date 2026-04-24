const fs   = require('fs');
const path = require('path');

const DATA_FILE = process.env.DATA_FILE || '/tmp/roadoc-data-v4.json';

function load() {
  if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  return { ddts: [] };
}
function save(db) { fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8'); }

function makeTl(stato, created, accepted, transit, delivered) {
  return [
    { label: 'Documento creato',       ts: created,                                                              done: true  },
    { label: 'Inviato a vettore',      ts: created,                                                              done: true  },
    { label: 'Accettato dal vettore',  ts: stato === 'attesa_vettore' ? null : accepted,                         done: stato !== 'attesa_vettore' },
    { label: 'Partenza — In transito', ts: (stato === 'in_transito' || stato === 'consegnato') ? transit : null, done: stato === 'in_transito' || stato === 'consegnato' },
    { label: 'Consegna confermata',    ts: stato === 'consegnato' ? delivered : null,                            done: stato === 'consegnato' }
  ];
}

// ── Aziende protagoniste ───────────────────────────────────
const ACME  = { nome: 'Acme Ceramiche Srl',      piva: 'IT02345678901', indirizzo: 'Via Roma 15, 41100 Modena' };
const TRANS = { nome: 'Trans Adriatica Srl',     piva: 'IT09876543210' };
const LOMB  = { nome: 'Lombarda Ceramiche SpA',  piva: 'IT11223344556', indirizzo: 'Via Montenapoleone 8, 20121 Milano' };

// ── Aziende terze — mittenti ───────────────────────────────
const CER_EM = { nome: 'Ceramiche Emiliane SpA',       piva: 'IT03456789012', indirizzo: 'Via Emilia 45, 41012 Carpi (MO)' };
const PAV_IT = { nome: 'Pavimenti & Rivestimenti Srl', piva: 'IT04567890123', indirizzo: 'Via della Ceramica 8, 44042 Cento (FE)' };
const MARMI  = { nome: 'Marmi & Pietre del Sud Srl',   piva: 'IT05678901234', indirizzo: 'Viale Industria 12, 70124 Bari' };

// ── Aziende terze — vettori ───────────────────────────────
const LOG_PAD    = { nome: 'Logistica Padana Srl',    piva: 'IT06789012345' };
const SPED_NE    = { nome: 'Spedizioni Nord Est Srl', piva: 'IT07890123456' };
const TRASPOROMA = { nome: 'TraspoRoma Express Srl',  piva: 'IT08901234567' };

// ── Aziende terze — destinatari ──────────────────────────
const ROMANO  = { nome: 'Romano & Figli Srl',           piva: 'IT22334455667', indirizzo: 'Via Appia 234, 00178 Roma' };
const VENEZIA = { nome: 'Venezia Import Srl',           piva: 'IT33445566778', indirizzo: 'Calle Larga 45, 30124 Venezia' };
const MERIDI  = { nome: 'Meridionale Commerciale Srl',  piva: 'IT44556677889', indirizzo: 'Via Marina 67, 90133 Palermo' };
const PIEMON  = { nome: 'Piemonte Distribuzione SpA',   piva: 'IT55667788990', indirizzo: 'Corso Francia 23, 10138 Torino' };
const TRIES   = { nome: 'Triestina Commercio Srl',      piva: 'IT66778899001', indirizzo: 'Via Roma 56, 34100 Trieste' };

const db = load();
if (db.ddts.length === 0) {
  // ── Autisti e mezzi ───────────────────────────────────────
  const A_FERRETTI = { autista: 'Marco Ferretti',  targa_1: 'FN392BK', targa_2: 'XA453RK' };
  const A_BIANCHI  = { autista: 'Luigi Bianchi',   targa_1: 'HB519GH', targa_2: 'XB382MN' };
  const A_ROSSI    = { autista: 'Giovanni Rossi',  targa_1: 'GV789FG', targa_2: 'XA562FP' };
  const A_CONTI    = { autista: 'Andrea Conti',    targa_1: 'FE456HK', targa_2: 'XB789LG' };
  const A_MARI     = { autista: 'Roberto Mari',    targa_1: 'EM234GH', targa_2: 'XA567BT' };

  db.ddts = [

    // ═══════════════════════════════════════════════════════════════════
    // GRUPPO 1 — Acme → Trans Adriatica → Bayern  (15 DDT — Anno 2026)
    // ═══════════════════════════════════════════════════════════════════

    // ── Gennaio 2026 — FATTURATI ──────────────────────────
    {
      id: 'DDT-2026-0001', data: '08/01/2026', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      ...A_FERRETTI,
      merci: [{ desc: 'Piastrelle gres porcellanato 60×60', qty: 48, unita: 'colli', peso: '960 kg' }],
      noteVettore: '', noteDestinazione: 'Consegnare al magazzino A',
      timeline: makeTl('consegnato','08/01/2026 08:15','08/01/2026 09:30','08/01/2026 11:00','10/01/2026 14:20'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2026-01-08T08:15:00.000Z'
    },
    {
      id: 'DDT-2026-0002', data: '20/01/2026', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      ...A_BIANCHI,
      merci: [{ desc: 'Ceramica pavimento effetto pietra 30×60', qty: 36, unita: 'colli', peso: '720 kg' }],
      noteVettore: 'Fragile', noteDestinazione: '',
      timeline: makeTl('consegnato','20/01/2026 07:45','20/01/2026 08:50','20/01/2026 10:30','22/01/2026 11:15'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2026-01-20T07:45:00.000Z'
    },

    // ── Febbraio 2026 — FATTURATI ─────────────────────────
    {
      id: 'DDT-2026-0003', data: '03/02/2026', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      ...A_FERRETTI,
      merci: [{ desc: 'Maioliche decorate 20×20', qty: 20, unita: 'colli', peso: '280 kg' }],
      noteVettore: '', noteDestinazione: 'Ritiro su appuntamento',
      timeline: makeTl('consegnato','03/02/2026 09:00','03/02/2026 10:15','03/02/2026 14:00','05/02/2026 10:30'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2026-02-03T09:00:00.000Z'
    },
    {
      id: 'DDT-2026-0004', data: '17/02/2026', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      ...A_BIANCHI,
      merci: [{ desc: 'Klinker per esterni 30×30', qty: 60, unita: 'colli', peso: '1.200 kg' }],
      noteVettore: 'Merce pesante — pallet rinforzati', noteDestinazione: '',
      timeline: makeTl('consegnato','17/02/2026 08:30','17/02/2026 09:45','17/02/2026 13:00','19/02/2026 15:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2026-02-17T08:30:00.000Z'
    },
    {
      id: 'DDT-2026-0005', data: '27/02/2026', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      ...A_FERRETTI,
      merci: [{ desc: 'Rivestimento murale effetto marmo 30×90', qty: 24, unita: 'colli', peso: '480 kg' }],
      noteVettore: '', noteDestinazione: 'Consegnare al magazzino B',
      timeline: makeTl('consegnato','27/02/2026 10:00','27/02/2026 11:20','27/02/2026 15:30','02/03/2026 12:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2026-02-27T10:00:00.000Z'
    },

    // ── Marzo 2026 — FATTURATI ────────────────────────────
    {
      id: 'DDT-2026-0006', data: '05/03/2026', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      ...A_BIANCHI,
      merci: [{ desc: 'Piastrelle effetto legno 20×120', qty: 30, unita: 'colli', peso: '540 kg' }],
      noteVettore: 'Fragile — non capovolgere', noteDestinazione: '',
      timeline: makeTl('consegnato','05/03/2026 08:00','05/03/2026 09:10','05/03/2026 12:00','07/03/2026 10:45'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2026-03-05T08:00:00.000Z'
    },
    {
      id: 'DDT-2026-0007', data: '16/03/2026', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      ...A_FERRETTI,
      merci: [{ desc: 'Ceramica tecnica antiscivolo 45×45', qty: 40, unita: 'colli', peso: '800 kg' }],
      noteVettore: '', noteDestinazione: 'Apertura magazzino h 8-17',
      timeline: makeTl('consegnato','16/03/2026 09:30','16/03/2026 10:40','16/03/2026 14:00','18/03/2026 11:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2026-03-16T09:30:00.000Z'
    },
    {
      id: 'DDT-2026-0008', data: '27/03/2026', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      ...A_BIANCHI,
      merci: [{ desc: 'Gres porcellanato effetto cemento 60×60', qty: 42, unita: 'colli', peso: '840 kg' }],
      noteVettore: 'Attenzione: merce fragile', noteDestinazione: 'Consegnare al magazzino B',
      timeline: makeTl('consegnato','27/03/2026 08:20','27/03/2026 09:35','27/03/2026 13:00','30/03/2026 10:20'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2026-03-27T08:20:00.000Z'
    },

    // ── Aprile 2026 — DA FATTURARE ────────────────────────
    {
      id: 'DDT-2026-0009', data: '02/04/2026', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      ...A_FERRETTI,
      merci: [{ desc: 'Listelli decorativi misti', qty: 10, unita: 'colli', peso: '120 kg' }],
      noteVettore: '', noteDestinazione: '',
      timeline: makeTl('consegnato','02/04/2026 10:00','02/04/2026 11:15','02/04/2026 15:00','04/04/2026 12:30'),
      codice_consegna: null, stato_fatturazione: 'da_fatturare', created_at: '2026-04-02T10:00:00.000Z'
    },
    {
      id: 'DDT-2026-0010', data: '09/04/2026', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      ...A_BIANCHI,
      merci: [{ desc: 'Piastrelle gres porcellanato 80×80', qty: 32, unita: 'colli', peso: '960 kg' }],
      noteVettore: 'Merce pesante', noteDestinazione: 'Consegnare al magazzino A',
      timeline: makeTl('consegnato','09/04/2026 08:45','09/04/2026 10:00','09/04/2026 13:30','11/04/2026 11:45'),
      codice_consegna: null, stato_fatturazione: 'da_fatturare', created_at: '2026-04-09T08:45:00.000Z'
    },
    {
      id: 'DDT-2026-0011', data: '15/04/2026', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      ...A_FERRETTI,
      merci: [{ desc: 'Ceramica pavimento effetto pietra 30×60', qty: 28, unita: 'colli', peso: '560 kg' }],
      noteVettore: '', noteDestinazione: '',
      timeline: makeTl('consegnato','15/04/2026 09:10','15/04/2026 10:25','15/04/2026 14:00','17/04/2026 10:00'),
      codice_consegna: null, stato_fatturazione: 'da_fatturare', created_at: '2026-04-15T09:10:00.000Z'
    },
    {
      id: 'DDT-2026-0012', data: '18/04/2026', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      ...A_BIANCHI,
      merci: [{ desc: 'Klinker per esterni 30×30', qty: 50, unita: 'colli', peso: '1.000 kg' }],
      noteVettore: 'Merce pesante — pallet rinforzati', noteDestinazione: 'Consegnare al magazzino B',
      timeline: makeTl('consegnato','18/04/2026 08:00','18/04/2026 09:20','18/04/2026 11:00','19/04/2026 13:00'),
      codice_consegna: null, stato_fatturazione: 'da_fatturare', created_at: '2026-04-18T08:00:00.000Z'
    },

    // ── Questa settimana (attivi) ─────────────────────────
    {
      id: 'DDT-2026-0013', data: '21/04/2026', stato: 'in_transito',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      ...A_FERRETTI,
      merci: [{ desc: 'Piastrelle ceramica 60×60', qty: 24, unita: 'colli', peso: '480 kg' }],
      noteVettore: 'Fragile — maneggiare con cura', noteDestinazione: 'Consegnare al magazzino B',
      timeline: makeTl('in_transito','21/04/2026 08:30','21/04/2026 09:15','21/04/2026 10:00', null),
      codice_consegna: '482931', stato_fatturazione: null, created_at: '2026-04-21T08:30:00.000Z'
    },
    {
      id: 'DDT-2026-0014', data: '22/04/2026', stato: 'accettato',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      ...A_BIANCHI,
      merci: [{ desc: 'Monoporosa bianca 25×38', qty: 18, unita: 'colli', peso: '252 kg' }],
      noteVettore: '', noteDestinazione: '',
      timeline: makeTl('accettato','22/04/2026 10:30','22/04/2026 11:45', null, null),
      codice_consegna: null, stato_fatturazione: null, created_at: '2026-04-22T10:30:00.000Z'
    },
    {
      id: 'DDT-2026-0015', data: '24/04/2026', stato: 'attesa_vettore',
      mittente: ACME, vettore: TRANS, destinatario: LOMB,
      autista: null, targa_1: null, targa_2: null,
      merci: [{ desc: 'Maioliche decorate 20×20', qty: 15, unita: 'colli', peso: '210 kg' }],
      noteVettore: '', noteDestinazione: '',
      timeline: makeTl('attesa_vettore','24/04/2026 09:00', null, null, null),
      codice_consegna: null, stato_fatturazione: null, created_at: '2026-04-24T09:00:00.000Z'
    },

    // ═══════════════════════════════════════════════════════════════════
    // GRUPPO 2 — Acme mittente · altri vettori/destinatari (5 DDT 2025)
    // ═══════════════════════════════════════════════════════════════════
    {
      id: 'DDT-2025-0001', data: '12/03/2025', stato: 'consegnato',
      mittente: ACME, vettore: LOG_PAD, destinatario: ROMANO,
      ...A_ROSSI,
      merci: [{ desc: 'Piastrelle gres porcellanato 60×60', qty: 36, unita: 'colli', peso: '720 kg' }],
      noteVettore: '', noteDestinazione: '',
      timeline: makeTl('consegnato','12/03/2025 08:30','12/03/2025 10:00','12/03/2025 13:00','14/03/2025 12:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-03-12T08:30:00.000Z'
    },
    {
      id: 'DDT-2025-0002', data: '05/05/2025', stato: 'consegnato',
      mittente: ACME, vettore: SPED_NE, destinatario: VENEZIA,
      ...A_CONTI,
      merci: [{ desc: 'Rivestimento murale effetto marmo 30×90', qty: 20, unita: 'colli', peso: '400 kg' }],
      noteVettore: 'Fragile', noteDestinazione: '',
      timeline: makeTl('consegnato','05/05/2025 09:00','05/05/2025 10:30','05/05/2025 14:00','08/05/2025 10:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-05-05T09:00:00.000Z'
    },
    {
      id: 'DDT-2025-0003', data: '18/07/2025', stato: 'consegnato',
      mittente: ACME, vettore: TRASPOROMA, destinatario: MERIDI,
      ...A_MARI,
      merci: [{ desc: 'Ceramica tecnica antiscivolo 45×45', qty: 30, unita: 'colli', peso: '600 kg' }],
      noteVettore: '', noteDestinazione: 'Consegna mattutina',
      timeline: makeTl('consegnato','18/07/2025 08:00','18/07/2025 09:15','18/07/2025 12:30','21/07/2025 11:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-07-18T08:00:00.000Z'
    },
    {
      id: 'DDT-2025-0004', data: '09/09/2025', stato: 'consegnato',
      mittente: ACME, vettore: LOG_PAD, destinatario: PIEMON,
      ...A_ROSSI,
      merci: [{ desc: 'Piastrelle effetto legno 20×120', qty: 24, unita: 'colli', peso: '432 kg' }],
      noteVettore: 'Fragile — non capovolgere', noteDestinazione: '',
      timeline: makeTl('consegnato','09/09/2025 09:00','09/09/2025 10:20','09/09/2025 14:00','12/09/2025 10:30'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-09-09T09:00:00.000Z'
    },
    {
      id: 'DDT-2025-0005', data: '20/11/2025', stato: 'consegnato',
      mittente: ACME, vettore: SPED_NE, destinatario: TRIES,
      ...A_CONTI,
      merci: [{ desc: 'Gres porcellanato effetto cemento 60×60', qty: 38, unita: 'colli', peso: '760 kg' }],
      noteVettore: '', noteDestinazione: 'Consegnare al magazzino centrale',
      timeline: makeTl('consegnato','20/11/2025 10:30','20/11/2025 11:45','20/11/2025 15:00','23/11/2025 12:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-11-20T10:30:00.000Z'
    },

    // ═══════════════════════════════════════════════════════════════════
    // GRUPPO 3 — Trans Adriatica vettore · altri mittenti/dest. (5 DDT 2025)
    // ═══════════════════════════════════════════════════════════════════
    {
      id: 'DDT-2025-0006', data: '14/02/2025', stato: 'consegnato',
      mittente: CER_EM, vettore: TRANS, destinatario: ROMANO,
      ...A_FERRETTI,
      merci: [{ desc: 'Ceramica da pavimento effetto pietra', qty: 44, unita: 'colli', peso: '880 kg' }],
      noteVettore: 'Merce pesante', noteDestinazione: '',
      timeline: makeTl('consegnato','14/02/2025 08:00','14/02/2025 09:30','14/02/2025 12:00','17/02/2025 13:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-02-14T08:00:00.000Z'
    },
    {
      id: 'DDT-2025-0007', data: '08/04/2025', stato: 'consegnato',
      mittente: PAV_IT, vettore: TRANS, destinatario: VENEZIA,
      ...A_BIANCHI,
      merci: [{ desc: 'Maioliche decorate 20×20', qty: 25, unita: 'colli', peso: '350 kg' }],
      noteVettore: '', noteDestinazione: 'Orario ritiro: 9-17',
      timeline: makeTl('consegnato','08/04/2025 10:00','08/04/2025 11:20','08/04/2025 15:00','10/04/2025 11:30'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-04-08T10:00:00.000Z'
    },
    {
      id: 'DDT-2025-0008', data: '23/06/2025', stato: 'consegnato',
      mittente: MARMI, vettore: TRANS, destinatario: PIEMON,
      ...A_FERRETTI,
      merci: [{ desc: 'Granito grigio levigato 60×60', qty: 22, unita: 'colli', peso: '550 kg' }],
      noteVettore: 'Merce molto pesante — 2 operatori per scarico', noteDestinazione: '',
      timeline: makeTl('consegnato','23/06/2025 07:30','23/06/2025 08:45','23/06/2025 11:00','26/06/2025 10:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-06-23T07:30:00.000Z'
    },
    {
      id: 'DDT-2025-0009', data: '11/08/2025', stato: 'consegnato',
      mittente: CER_EM, vettore: TRANS, destinatario: MERIDI,
      ...A_BIANCHI,
      merci: [{ desc: 'Klinker per esterni 30×30', qty: 55, unita: 'colli', peso: '1.100 kg' }],
      noteVettore: 'Merce pesante', noteDestinazione: 'Consegna su appuntamento',
      timeline: makeTl('consegnato','11/08/2025 09:30','11/08/2025 10:45','11/08/2025 14:30','14/08/2025 12:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-08-11T09:30:00.000Z'
    },
    {
      id: 'DDT-2025-0010', data: '15/10/2025', stato: 'consegnato',
      mittente: PAV_IT, vettore: TRANS, destinatario: TRIES,
      ...A_FERRETTI,
      merci: [{ desc: 'Monoporosa bianca 25×38', qty: 18, unita: 'colli', peso: '252 kg' }],
      noteVettore: '', noteDestinazione: '',
      timeline: makeTl('consegnato','15/10/2025 14:00','15/10/2025 15:10','15/10/2025 17:00','17/10/2025 11:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-10-15T14:00:00.000Z'
    },

    // ═══════════════════════════════════════════════════════════════════
    // GRUPPO 4 — Bayern Handel destinatario · altri mitt./vettori (5 DDT 2025)
    // ═══════════════════════════════════════════════════════════════════
    {
      id: 'DDT-2025-0011', data: '20/01/2025', stato: 'consegnato',
      mittente: CER_EM, vettore: LOG_PAD, destinatario: LOMB,
      ...A_ROSSI,
      merci: [{ desc: 'Ceramica da pavimento effetto legno 20×120', qty: 28, unita: 'colli', peso: '504 kg' }],
      noteVettore: '', noteDestinazione: 'Consegnare al magazzino A',
      timeline: makeTl('consegnato','20/01/2025 08:45','20/01/2025 10:00','20/01/2025 13:00','22/01/2025 11:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-01-20T08:45:00.000Z'
    },
    {
      id: 'DDT-2025-0012', data: '18/03/2025', stato: 'consegnato',
      mittente: PAV_IT, vettore: TRASPOROMA, destinatario: LOMB,
      ...A_MARI,
      merci: [{ desc: 'Rivestimento murale effetto marmo 30×90', qty: 16, unita: 'colli', peso: '320 kg' }],
      noteVettore: 'Fragile', noteDestinazione: '',
      timeline: makeTl('consegnato','18/03/2025 09:15','18/03/2025 10:30','18/03/2025 14:00','20/03/2025 12:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-03-18T09:15:00.000Z'
    },
    {
      id: 'DDT-2025-0013', data: '07/05/2025', stato: 'consegnato',
      mittente: MARMI, vettore: SPED_NE, destinatario: LOMB,
      ...A_CONTI,
      merci: [{ desc: 'Granito grigio levigato 60×60', qty: 18, unita: 'colli', peso: '450 kg' }],
      noteVettore: 'Merce molto pesante', noteDestinazione: 'Consegnare al magazzino B',
      timeline: makeTl('consegnato','07/05/2025 08:00','07/05/2025 09:20','07/05/2025 12:30','09/05/2025 10:30'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-05-07T08:00:00.000Z'
    },
    {
      id: 'DDT-2025-0014', data: '14/08/2025', stato: 'consegnato',
      mittente: CER_EM, vettore: LOG_PAD, destinatario: LOMB,
      ...A_ROSSI,
      merci: [{ desc: 'Piastrelle gres porcellanato 80×80', qty: 30, unita: 'colli', peso: '900 kg' }],
      noteVettore: 'Merce pesante', noteDestinazione: 'Consegnare al magazzino A',
      timeline: makeTl('consegnato','14/08/2025 08:30','14/08/2025 09:45','14/08/2025 13:00','18/08/2025 11:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-08-14T08:30:00.000Z'
    },
    {
      id: 'DDT-2025-0015', data: '06/11/2025', stato: 'consegnato',
      mittente: PAV_IT, vettore: TRASPOROMA, destinatario: LOMB,
      ...A_MARI,
      merci: [{ desc: 'Ceramica tecnica antiscivolo 45×45', qty: 35, unita: 'colli', peso: '700 kg' }],
      noteVettore: '', noteDestinazione: '',
      timeline: makeTl('consegnato','06/11/2025 10:00','06/11/2025 11:15','06/11/2025 14:00','08/11/2025 12:00'),
      codice_consegna: null, stato_fatturazione: 'fatturato', created_at: '2025-11-06T10:00:00.000Z'
    }
  ];

  save(db);
  console.log(`✓ ${db.ddts.length} DDT demo inizializzati`);
}

function nowItalian() {
  const d = new Date();
  const tz = { timeZone: 'Europe/Rome' };
  return d.toLocaleDateString('it-IT', tz) + ' ' +
         d.toLocaleTimeString('it-IT', { ...tz, hour: '2-digit', minute: '2-digit' });
}

function getAllDdts() {
  const db = load();
  // Migrazione automatica: aggiunge campi mancanti ai DDT esistenti
  let changed = false;
  db.ddts = db.ddts.map(d => {
    const u = { ...d };
    if (u.autista          === undefined) { u.autista  = null; changed = true; }
    if (u.targa_1          === undefined) { u.targa_1  = null; changed = true; }
    if (u.targa_2          === undefined) { u.targa_2  = null; changed = true; }
    if (u.stato_fatturazione === undefined) {
      u.stato_fatturazione = u.stato === 'consegnato' ? 'da_fatturare' : null;
      changed = true;
    }
    if (u.luogo_carico   === undefined) { u.luogo_carico   = u.mittente?.indirizzo   || null; changed = true; }
    if (u.luogo_consegna === undefined) { u.luogo_consegna = u.destinatario?.indirizzo || null; changed = true; }
    return u;
  });
  if (changed) save(db);
  return db.ddts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getDdtById(id) {
  return load().ddts.find(d => d.id === id) || null;
}

function getNextId() {
  const year = new Date().getFullYear();
  const all  = load().ddts.filter(d => d.id.startsWith(`DDT-${year}-`));
  const max  = all.reduce((m, d) => { const n = parseInt(d.id.split('-')[2]); return n > m ? n : m; }, 0);
  return `DDT-${year}-${String(max + 1).padStart(4, '0')}`;
}

function createDdt(data) {
  const db  = load();
  const ddt = { id: getNextId(), data: data.data, mittente: data.mittente, vettore: data.vettore,
    destinatario: data.destinatario, merci: data.merci, stato: 'attesa_vettore',
    autista: data.autista || null, targa_1: data.targa_1 || null,
    targa_2: data.targa_2 || null,
    luogo_carico:   data.luogo_carico   || data.mittente?.indirizzo   || null,
    luogo_consegna: data.luogo_consegna || data.destinatario?.indirizzo || null,
    noteVettore: data.noteVettore || '', noteDestinazione: data.noteDestinazione || '',
    timeline: data.timeline, codice_consegna: null,
    stato_fatturazione: null, created_at: new Date().toISOString() };
  db.ddts.unshift(ddt);
  save(db);
  return ddt;
}

function updateFatturazione(id, stato) {
  const db = load(); const idx = db.ddts.findIndex(d => d.id === id);
  if (idx === -1) return null;
  db.ddts[idx].stato_fatturazione = stato;
  save(db); return db.ddts[idx];
}

function updateDdtStato(id, stato, timeline) {
  const db = load(); const idx = db.ddts.findIndex(d => d.id === id);
  if (idx === -1) return null;
  db.ddts[idx].stato = stato; db.ddts[idx].timeline = timeline;
  save(db); return db.ddts[idx];
}

function setCodiceDdt(id, codice) {
  const db = load(); const idx = db.ddts.findIndex(d => d.id === id);
  if (idx === -1) return null;
  db.ddts[idx].codice_consegna = codice;
  save(db); return db.ddts[idx];
}

function deleteDdt(id) {
  const db = load(); db.ddts = db.ddts.filter(d => d.id !== id); save(db);
}

module.exports = { getAllDdts, getDdtById, getNextId, createDdt, updateDdtStato, setCodiceDdt, updateFatturazione, deleteDdt, nowItalian };
