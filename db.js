const fs   = require('fs');
const path = require('path');

const DATA_FILE = process.env.DATA_FILE || '/tmp/roadoc-data.json';

function load() {
  if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  return { ddts: [] };
}
function save(db) { fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8'); }

// Helper timeline
function makeTl(stato, created, accepted, transit, delivered) {
  return [
    { label: 'Documento creato',       ts: created,                                              done: true },
    { label: 'Inviato a vettore',      ts: created,                                              done: true },
    { label: 'Accettato dal vettore',  ts: stato === 'attesa_vettore' ? null : accepted,         done: stato !== 'attesa_vettore' },
    { label: 'Partenza — In transito', ts: (stato === 'in_transito' || stato === 'consegnato') ? transit : null,   done: stato === 'in_transito' || stato === 'consegnato' },
    { label: 'Consegna confermata',    ts: stato === 'consegnato' ? delivered : null,             done: stato === 'consegnato' }
  ];
}

// Aziende protagoniste
const ACME  = { nome: 'Acme Ceramiche Srl',  piva: 'IT02345678901', indirizzo: 'Via Roma 15, 41100 Modena' };
const TRANS = { nome: 'Trans Adriatica Srl', piva: 'IT09876543210' };
const BAYER = { nome: 'Bayern Handel GmbH',  piva: 'DE345678901',   paese: 'Germania', indirizzo: 'Müllerstr. 42, 80469 München' };

// Aziende terze — mittenti
const CER_EM = { nome: 'Ceramiche Emiliane SpA',       piva: 'IT03456789012', indirizzo: 'Via Emilia 45, 41012 Carpi (MO)' };
const PAV_IT = { nome: 'Pavimenti & Rivestimenti Srl', piva: 'IT04567890123', indirizzo: 'Via della Ceramica 8, 44042 Cento (FE)' };
const MARMI  = { nome: 'Marmi & Pietre del Sud Srl',   piva: 'IT05678901234', indirizzo: 'Viale Industria 12, 70124 Bari' };

// Aziende terze — vettori
const LOG_PAD    = { nome: 'Logistica Padana Srl',    piva: 'IT06789012345' };
const SPED_NE    = { nome: 'Spedizioni Nord Est Srl', piva: 'IT07890123456' };
const TRASPOROMA = { nome: 'TraspoRoma Express Srl',  piva: 'IT08901234567' };

// Aziende terze — destinatari
const SCHMIDT = { nome: 'Schmidt Keramik GmbH',  piva: 'DE456789012',   paese: 'Germania', indirizzo: 'Frankfurter Str. 88, 60311 Frankfurt' };
const PARIS   = { nome: 'Paris Carrelage SARL',  piva: 'FR56789012345', paese: 'Francia',  indirizzo: '24 Rue du Commerce, 75015 Paris' };
const IBERIAN = { nome: 'Iberian Trade SL',      piva: 'ES678901234B',  paese: 'Spagna',   indirizzo: 'Calle Mayor 56, 28013 Madrid' };
const NORDIC  = { nome: 'Nordic Import AB',      piva: 'SE7890123456',  paese: 'Svezia',   indirizzo: 'Kungsgatan 14, 11156 Stockholm' };
const WIEN    = { nome: 'Wien Handel GmbH',      piva: 'AT890123456',   paese: 'Austria',  indirizzo: 'Mariahilfer Str. 45, 1060 Wien' };

const db = load();
if (db.ddts.length === 0) {
  db.ddts = [

    // ═══════════════════════════════════════════════════════
    // GRUPPO 1 — Acme → Trans Adriatica → Bayern (15 DDT)
    // ═══════════════════════════════════════════════════════
    {
      id: 'DDT-2024-0001', data: '15/10/2024', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Piastrelle gres porcellanato 60×60', qty: 48, unita: 'colli', peso: '960 kg' }],
      noteVettore: '', noteDestinazione: 'Consegnare al magazzino A',
      timeline: makeTl('consegnato','15/10/2024 08:15','15/10/2024 09:30','15/10/2024 11:00','17/10/2024 14:20'),
      created_at: '2024-10-15T08:15:00.000Z'
    },
    {
      id: 'DDT-2024-0002', data: '28/10/2024', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Ceramica pavimento effetto pietra 30×60', qty: 36, unita: 'colli', peso: '720 kg' }],
      noteVettore: 'Fragile', noteDestinazione: '',
      timeline: makeTl('consegnato','28/10/2024 07:45','28/10/2024 08:50','28/10/2024 10:30','30/10/2024 11:15'),
      created_at: '2024-10-28T07:45:00.000Z'
    },
    {
      id: 'DDT-2024-0003', data: '08/11/2024', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Maioliche decorate 20×20', qty: 20, unita: 'colli', peso: '280 kg' }],
      noteVettore: '', noteDestinazione: 'Ritiro su appuntamento',
      timeline: makeTl('consegnato','08/11/2024 09:00','08/11/2024 10:15','08/11/2024 14:00','11/11/2024 10:30'),
      created_at: '2024-11-08T09:00:00.000Z'
    },
    {
      id: 'DDT-2024-0004', data: '20/11/2024', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Klinker per esterni 30×30', qty: 60, unita: 'colli', peso: '1.200 kg' }],
      noteVettore: 'Merce pesante — pallet rinforzati', noteDestinazione: '',
      timeline: makeTl('consegnato','20/11/2024 08:30','20/11/2024 09:45','20/11/2024 13:00','22/11/2024 15:00'),
      created_at: '2024-11-20T08:30:00.000Z'
    },
    {
      id: 'DDT-2024-0005', data: '04/12/2024', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Rivestimento murale effetto marmo 30×90', qty: 24, unita: 'colli', peso: '480 kg' }],
      noteVettore: '', noteDestinazione: 'Consegnare al magazzino B',
      timeline: makeTl('consegnato','04/12/2024 10:00','04/12/2024 11:20','04/12/2024 15:30','06/12/2024 12:00'),
      created_at: '2024-12-04T10:00:00.000Z'
    },
    {
      id: 'DDT-2024-0006', data: '17/12/2024', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Piastrelle effetto legno 20×120', qty: 30, unita: 'colli', peso: '540 kg' }],
      noteVettore: 'Fragile — non capovolgere', noteDestinazione: '',
      timeline: makeTl('consegnato','17/12/2024 08:00','17/12/2024 09:10','17/12/2024 12:00','19/12/2024 10:45'),
      created_at: '2024-12-17T08:00:00.000Z'
    },
    {
      id: 'DDT-2025-0001', data: '10/01/2025', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Ceramica tecnica antiscivolo 45×45', qty: 40, unita: 'colli', peso: '800 kg' }],
      noteVettore: '', noteDestinazione: 'Apertura magazzino h 8-17',
      timeline: makeTl('consegnato','10/01/2025 09:30','10/01/2025 10:40','10/01/2025 14:00','13/01/2025 11:00'),
      created_at: '2025-01-10T09:30:00.000Z'
    },
    {
      id: 'DDT-2025-0002', data: '23/01/2025', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Monoporosa bianca 25×38', qty: 15, unita: 'colli', peso: '210 kg' }],
      noteVettore: '', noteDestinazione: '',
      timeline: makeTl('consegnato','23/01/2025 07:50','23/01/2025 09:00','23/01/2025 11:30','25/01/2025 14:30'),
      created_at: '2025-01-23T07:50:00.000Z'
    },
    {
      id: 'DDT-2025-0003', data: '06/02/2025', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Gres porcellanato effetto cemento 60×60', qty: 42, unita: 'colli', peso: '840 kg' }],
      noteVettore: 'Attenzione: merce fragile', noteDestinazione: 'Consegnare al magazzino B',
      timeline: makeTl('consegnato','06/02/2025 08:20','06/02/2025 09:35','06/02/2025 13:00','08/02/2025 10:20'),
      created_at: '2025-02-06T08:20:00.000Z'
    },
    {
      id: 'DDT-2025-0004', data: '20/02/2025', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Listelli decorativi misti', qty: 10, unita: 'colli', peso: '120 kg' }],
      noteVettore: '', noteDestinazione: '',
      timeline: makeTl('consegnato','20/02/2025 10:00','20/02/2025 11:15','20/02/2025 15:00','22/02/2025 12:30'),
      created_at: '2025-02-20T10:00:00.000Z'
    },
    {
      id: 'DDT-2025-0005', data: '05/03/2025', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Piastrelle gres porcellanato 80×80', qty: 32, unita: 'colli', peso: '960 kg' }],
      noteVettore: 'Merce pesante', noteDestinazione: 'Consegnare al magazzino A',
      timeline: makeTl('consegnato','05/03/2025 08:45','05/03/2025 10:00','05/03/2025 13:30','07/03/2025 11:45'),
      created_at: '2025-03-05T08:45:00.000Z'
    },
    {
      id: 'DDT-2025-0006', data: '18/03/2025', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Ceramica pavimento effetto pietra 30×60', qty: 28, unita: 'colli', peso: '560 kg' }],
      noteVettore: '', noteDestinazione: '',
      timeline: makeTl('consegnato','18/03/2025 09:10','18/03/2025 10:25','18/03/2025 14:00','20/03/2025 10:00'),
      created_at: '2025-03-18T09:10:00.000Z'
    },
    {
      id: 'DDT-2025-0007', data: '01/04/2025', stato: 'consegnato',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Klinker per esterni 30×30', qty: 50, unita: 'colli', peso: '1.000 kg' }],
      noteVettore: 'Merce pesante — pallet rinforzati', noteDestinazione: 'Consegnare al magazzino B',
      timeline: makeTl('consegnato','01/04/2025 08:00','01/04/2025 09:20','01/04/2025 11:00','03/04/2025 13:00'),
      created_at: '2025-04-01T08:00:00.000Z'
    },
    {
      id: 'DDT-2025-0008', data: '10/04/2025', stato: 'in_transito',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Piastrelle ceramica 60×60', qty: 24, unita: 'colli', peso: '480 kg' }],
      noteVettore: 'Fragile — maneggiare con cura', noteDestinazione: 'Consegnare al magazzino B',
      timeline: makeTl('in_transito','10/04/2025 08:30','10/04/2025 09:15','10/04/2025 10:00', null),
      created_at: '2025-04-10T08:30:00.000Z'
    },
    {
      id: 'DDT-2025-0009', data: '14/04/2025', stato: 'attesa_vettore',
      mittente: ACME, vettore: TRANS, destinatario: BAYER,
      merci: [{ desc: 'Maioliche decorate 20×20', qty: 18, unita: 'colli', peso: '252 kg' }],
      noteVettore: '', noteDestinazione: '',
      timeline: makeTl('attesa_vettore','14/04/2025 11:00', null, null, null),
      created_at: '2025-04-14T11:00:00.000Z'
    },

    // ═══════════════════════════════════════════════════════
    // GRUPPO 2 — Acme mittente, altri vettori/destinatari (5 DDT)
    // ═══════════════════════════════════════════════════════
    {
      id: 'DDT-2024-0007', data: '05/11/2024', stato: 'consegnato',
      mittente: ACME, vettore: LOG_PAD, destinatario: SCHMIDT,
      merci: [{ desc: 'Piastrelle gres porcellanato 60×60', qty: 36, unita: 'colli', peso: '720 kg' }],
      noteVettore: '', noteDestinazione: '',
      timeline: makeTl('consegnato','05/11/2024 08:30','05/11/2024 10:00','05/11/2024 13:00','07/11/2024 12:00'),
      created_at: '2024-11-05T08:30:00.000Z'
    },
    {
      id: 'DDT-2024-0008', data: '19/11/2024', stato: 'consegnato',
      mittente: ACME, vettore: SPED_NE, destinatario: PARIS,
      merci: [{ desc: 'Rivestimento murale effetto marmo 30×90', qty: 20, unita: 'colli', peso: '400 kg' }],
      noteVettore: 'Fragile', noteDestinazione: '',
      timeline: makeTl('consegnato','19/11/2024 09:00','19/11/2024 10:30','19/11/2024 14:00','22/11/2024 10:00'),
      created_at: '2024-11-19T09:00:00.000Z'
    },
    {
      id: 'DDT-2025-0010', data: '12/02/2025', stato: 'consegnato',
      mittente: ACME, vettore: TRASPOROMA, destinatario: IBERIAN,
      merci: [{ desc: 'Ceramica tecnica antiscivolo 45×45', qty: 30, unita: 'colli', peso: '600 kg' }],
      noteVettore: '', noteDestinazione: 'Consegna mattutina',
      timeline: makeTl('consegnato','12/02/2025 08:00','12/02/2025 09:15','12/02/2025 12:30','15/02/2025 11:00'),
      created_at: '2025-02-12T08:00:00.000Z'
    },
    {
      id: 'DDT-2025-0011', data: '25/03/2025', stato: 'in_transito',
      mittente: ACME, vettore: LOG_PAD, destinatario: NORDIC,
      merci: [{ desc: 'Piastrelle effetto legno 20×120', qty: 24, unita: 'colli', peso: '432 kg' }],
      noteVettore: 'Fragile — non capovolgere', noteDestinazione: '',
      timeline: makeTl('in_transito','25/03/2025 09:00','25/03/2025 10:20','25/03/2025 14:00', null),
      created_at: '2025-03-25T09:00:00.000Z'
    },
    {
      id: 'DDT-2025-0012', data: '12/04/2025', stato: 'accettato',
      mittente: ACME, vettore: SPED_NE, destinatario: WIEN,
      merci: [{ desc: 'Gres porcellanato effetto cemento 60×60', qty: 38, unita: 'colli', peso: '760 kg' }],
      noteVettore: '', noteDestinazione: 'Consegnare al magazzino centrale',
      timeline: makeTl('accettato','12/04/2025 10:30','12/04/2025 11:45', null, null),
      created_at: '2025-04-12T10:30:00.000Z'
    },

    // ═══════════════════════════════════════════════════════
    // GRUPPO 3 — Trans Adriatica vettore, altri mittenti/destinatari (5 DDT)
    // ═══════════════════════════════════════════════════════
    {
      id: 'DDT-2024-0009', data: '12/11/2024', stato: 'consegnato',
      mittente: CER_EM, vettore: TRANS, destinatario: SCHMIDT,
      merci: [{ desc: 'Ceramica da pavimento effetto pietra', qty: 44, unita: 'colli', peso: '880 kg' }],
      noteVettore: 'Merce pesante', noteDestinazione: '',
      timeline: makeTl('consegnato','12/11/2024 08:00','12/11/2024 09:30','12/11/2024 12:00','14/11/2024 13:00'),
      created_at: '2024-11-12T08:00:00.000Z'
    },
    {
      id: 'DDT-2024-0010', data: '26/11/2024', stato: 'consegnato',
      mittente: PAV_IT, vettore: TRANS, destinatario: PARIS,
      merci: [{ desc: 'Maioliche decorate 20×20', qty: 25, unita: 'colli', peso: '350 kg' }],
      noteVettore: '', noteDestinazione: 'Orario ritiro: 9-17',
      timeline: makeTl('consegnato','26/11/2024 10:00','26/11/2024 11:20','26/11/2024 15:00','28/11/2024 11:30'),
      created_at: '2024-11-26T10:00:00.000Z'
    },
    {
      id: 'DDT-2025-0013', data: '14/01/2025', stato: 'consegnato',
      mittente: MARMI, vettore: TRANS, destinatario: NORDIC,
      merci: [{ desc: 'Granito grigio levigato 60×60', qty: 22, unita: 'colli', peso: '550 kg' }],
      noteVettore: 'Merce molto pesante — 2 operatori per scarico', noteDestinazione: '',
      timeline: makeTl('consegnato','14/01/2025 07:30','14/01/2025 08:45','14/01/2025 11:00','17/01/2025 10:00'),
      created_at: '2025-01-14T07:30:00.000Z'
    },
    {
      id: 'DDT-2025-0014', data: '28/03/2025', stato: 'in_transito',
      mittente: CER_EM, vettore: TRANS, destinatario: IBERIAN,
      merci: [{ desc: 'Klinker per esterni 30×30', qty: 55, unita: 'colli', peso: '1.100 kg' }],
      noteVettore: 'Merce pesante', noteDestinazione: 'Consegna su appuntamento',
      timeline: makeTl('in_transito','28/03/2025 09:30','28/03/2025 10:45','28/03/2025 14:30', null),
      created_at: '2025-03-28T09:30:00.000Z'
    },
    {
      id: 'DDT-2025-0015', data: '11/04/2025', stato: 'attesa_vettore',
      mittente: PAV_IT, vettore: TRANS, destinatario: WIEN,
      merci: [{ desc: 'Monoporosa bianca 25×38', qty: 18, unita: 'colli', peso: '252 kg' }],
      noteVettore: '', noteDestinazione: '',
      timeline: makeTl('attesa_vettore','11/04/2025 14:00', null, null, null),
      created_at: '2025-04-11T14:00:00.000Z'
    },

    // ═══════════════════════════════════════════════════════
    // GRUPPO 4 — Bayern destinatario, altri mittenti/vettori (5 DDT)
    // ═══════════════════════════════════════════════════════
    {
      id: 'DDT-2024-0011', data: '22/10/2024', stato: 'consegnato',
      mittente: CER_EM, vettore: LOG_PAD, destinatario: BAYER,
      merci: [{ desc: 'Ceramica da pavimento effetto legno 20×120', qty: 28, unita: 'colli', peso: '504 kg' }],
      noteVettore: '', noteDestinazione: 'Consegnare al magazzino A',
      timeline: makeTl('consegnato','22/10/2024 08:45','22/10/2024 10:00','22/10/2024 13:00','24/10/2024 11:00'),
      created_at: '2024-10-22T08:45:00.000Z'
    },
    {
      id: 'DDT-2024-0012', data: '06/12/2024', stato: 'consegnato',
      mittente: PAV_IT, vettore: TRASPOROMA, destinatario: BAYER,
      merci: [{ desc: 'Rivestimento murale effetto marmo 30×90', qty: 16, unita: 'colli', peso: '320 kg' }],
      noteVettore: 'Fragile', noteDestinazione: '',
      timeline: makeTl('consegnato','06/12/2024 09:15','06/12/2024 10:30','06/12/2024 14:00','09/12/2024 12:00'),
      created_at: '2024-12-06T09:15:00.000Z'
    },
    {
      id: 'DDT-2025-0016', data: '16/01/2025', stato: 'consegnato',
      mittente: MARMI, vettore: SPED_NE, destinatario: BAYER,
      merci: [{ desc: 'Granito grigio levigato 60×60', qty: 18, unita: 'colli', peso: '450 kg' }],
      noteVettore: 'Merce molto pesante', noteDestinazione: 'Consegnare al magazzino B',
      timeline: makeTl('consegnato','16/01/2025 08:00','16/01/2025 09:20','16/01/2025 12:30','18/01/2025 10:30'),
      created_at: '2025-01-16T08:00:00.000Z'
    },
    {
      id: 'DDT-2025-0017', data: '02/04/2025', stato: 'in_transito',
      mittente: CER_EM, vettore: LOG_PAD, destinatario: BAYER,
      merci: [{ desc: 'Piastrelle gres porcellanato 80×80', qty: 30, unita: 'colli', peso: '900 kg' }],
      noteVettore: 'Merce pesante', noteDestinazione: 'Consegnare al magazzino A',
      timeline: makeTl('in_transito','02/04/2025 08:30','02/04/2025 09:45','02/04/2025 13:00', null),
      created_at: '2025-04-02T08:30:00.000Z'
    },
    {
      id: 'DDT-2025-0018', data: '13/04/2025', stato: 'accettato',
      mittente: PAV_IT, vettore: TRASPOROMA, destinatario: BAYER,
      merci: [{ desc: 'Ceramica tecnica antiscivolo 45×45', qty: 35, unita: 'colli', peso: '700 kg' }],
      noteVettore: '', noteDestinazione: '',
      timeline: makeTl('accettato','13/04/2025 10:00','13/04/2025 11:15', null, null),
      created_at: '2025-04-13T10:00:00.000Z'
    }
  ];

  save(db);
  console.log(`✓ ${db.ddts.length} DDT demo inizializzati`);
}

function nowItalian() {
  const d = new Date();
  return d.toLocaleDateString('it-IT') + ' ' +
         d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

function getAllDdts() {
  return load().ddts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
    noteVettore: data.noteVettore || '', noteDestinazione: data.noteDestinazione || '',
    timeline: data.timeline, created_at: new Date().toISOString() };
  db.ddts.unshift(ddt);
  save(db);
  return ddt;
}

function updateDdtStato(id, stato, timeline) {
  const db = load(); const idx = db.ddts.findIndex(d => d.id === id);
  if (idx === -1) return null;
  db.ddts[idx].stato = stato; db.ddts[idx].timeline = timeline;
  save(db); return db.ddts[idx];
}

function deleteDdt(id) {
  const db = load(); db.ddts = db.ddts.filter(d => d.id !== id); save(db);
}

module.exports = { getAllDdts, getDdtById, getNextId, createDdt, updateDdtStato, deleteDdt, nowItalian };
