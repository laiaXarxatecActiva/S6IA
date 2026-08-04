// lib/gastos.js
// Implementation of the expense sharing module as per SPEC.md

const ROUNDED = (n) => Math.round(n * 100) / 100;

// Validation regex for names (letters, accents, spaces, apostrophes, hyphens)
const NAME_REGEX = /^[\p{L}\p{M} '-]{1,50}$/u;

// Error messages (exact strings from SPEC.md §6)
const ERRORS = {
  INVALID_GROUP_NAME: "Nombre de grupo inv\u00e1lido",
  TOO_FEW_PARTICIPANTS: "Se necesitan al menos 2 participantes",
  INVALID_NAME: "Nombre inv\u00e1lido",
  DUPLICATE_PARTICIPANT: "Participante duplicado",
  INVALID_CONCEPT: "Concepto inv\u00e1lido",
  INVALID_AMOUNT: "Importe inv\u00e1lido",
  UNKNOWN_PAYER: "Pagador no reconocido",
};

function trimName(name) {
  return typeof name === "string" ? name.trim() : "";
}

function validateName(name) {
  const trimmed = trimName(name);
  if (!trimmed || trimmed.length > 50 || !NAME_REGEX.test(trimmed)) {
    throw new Error(ERRORS.INVALID_NAME);
  }
  return trimmed;
}

function validateGroupName(name) {
  const trimmed = trimName(name);
  if (!trimmed) {
    throw new Error(ERRORS.INVALID_GROUP_NAME);
  }
  return trimmed;
}

function validateParticipants(participants) {
  if (!Array.isArray(participants) || participants.length < 2) {
    throw new Error(ERRORS.TOO_FEW_PARTICIPANTS);
  }
  const cleaned = participants.map(validateName);
  const seen = new Set();
  for (const p of cleaned) {
    if (seen.has(p)) {
      throw new Error(ERRORS.DUPLICATE_PARTICIPANT);
    }
    seen.add(p);
  }
  return cleaned;
}

function validateConcept(concept) {
  const trimmed = trimName(concept);
  if (!trimmed) {
    throw new Error(ERRORS.INVALID_CONCEPT);
  }
  return trimmed;
}

function validateAmount(amount) {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    throw new Error(ERRORS.INVALID_AMOUNT);
  }
  return amount;
}

function validatePayer(payer, participants) {
  const trimmed = trimName(payer);
  if (!participants.includes(trimmed)) {
    throw new Error(ERRORS.UNKNOWN_PAYER);
  }
  return trimmed;
}

// Public API
function crearGrupo(nombre, participantes) {
  const groupName = validateGroupName(nombre);
  const cleanedParticipants = validateParticipants(participantes);
  return {
    nombre: groupName,
    participantes: cleanedParticipants,
    gastos: [],
  };
}

function agregarGasto(grupo, gasto) {
  if (!grupo || !Array.isArray(grupo.participantes)) {
    throw new Error("Grupo inválido");
  }
  const { concepto, importe, pagadoPor } = gasto;
  const cleanedConcept = validateConcept(concepto);
  const cleanedAmount = validateAmount(importe);
  const cleanedPayer = validatePayer(pagadoPor, grupo.participantes);
  const newGasto = {
    id: grupo.gastos.length + 1,
    concepto: cleanedConcept,
    importe: cleanedAmount,
    pagadoPor: cleanedPayer,
  };
  grupo.gastos.push(newGasto);
  return grupo;
}

function totalPorPersona(grupo) {
  const totals = {};
  for (const p of grupo.participantes) {
    totals[p] = 0;
  }
  for (const g of grupo.gastos) {
    if (totals.hasOwnProperty(g.pagadoPor)) {
      totals[g.pagadoPor] += g.importe;
    }
  }
  const result = {};
  for (const p of grupo.participantes) {
    result[p] = ROUNDED(totals[p]);
  }
  return result;
}

function balances(grupo) {
  const total = grupo.gastos.reduce((sum, g) => sum + g.importe, 0);
  const cuota = total / grupo.participantes.length;
  const result = {};
  for (const p of grupo.participantes) {
    const pagado = grupo.gastos
      .filter((g) => g.pagadoPor === p)
      .reduce((sum, g) => sum + g.importe, 0);
    const saldo = pagado - cuota;
    result[p] = ROUNDED(saldo);
  }
  return result;
}

function liquidacion(grupo) {
  // Compute exact balances
  const total = grupo.gastos.reduce((sum, g) => sum + g.importe, 0);
  const cuota = total / grupo.participantes.length;
  const exactBalances = {};
  for (const p of grupo.participantes) {
    const pagado = grupo.gastos
      .filter((g) => g.pagadoPor === p)
      .reduce((sum, g) => sum + g.importe, 0);
    exactBalances[p] = pagado - cuota;
  }
  const deudores = [];
  const acreedores = [];
  for (const [p, bal] of Object.entries(exactBalances)) {
    if (bal < -0.01) {
      deudores.push({ name: p, saldo: bal });
    } else if (bal > 0.01) {
      acreedores.push({ name: p, saldo: bal });
    }
  }
  // Sort deudores by most negative (ascending), tie alphabetical
  deudores.sort((a, b) => {
    if (a.saldo !== b.saldo) return a.saldo - b.saldo;
    return a.name.localeCompare(b.name);
  });
  // Sort acreedores by most positive (descending), tie alphabetical
  acreedores.sort((a, b) => {
    if (a.saldo !== b.saldo) return b.saldo - a.saldo;
    return a.name.localeCompare(b.name);
  });
  const transfers = [];
  while (deudores.length && acreedores.length) {
    const de = deudores[0];
    const a = acreedores[0];
    const amount = Math.min(-de.saldo, a.saldo);
    transfers.push({ de: de.name, a: a.name, importe: ROUNDED(amount) });
    de.saldo += amount;
    a.saldo -= amount;
    if (de.saldo >= -0.01) deudores.shift();
    if (a.saldo <= 0.01) acreedores.shift();
  }
  // Sort result by importe descending, tie by de alphabetical
  transfers.sort((x, y) => {
    if (x.importe !== y.importe) return y.importe - x.importe;
    return x.de.localeCompare(y.de);
  });
  return transfers;
}

function resumen(grupo) {
  const total = grupo.gastos.reduce((sum, g) => sum + g.importe, 0);
  const cuota = total / grupo.participantes.length;
  return {
    total: ROUNDED(total),
    cuota: ROUNDED(cuota),
    numGastos: grupo.gastos.length,
    participantes: grupo.participantes.length,
  };
}

module.exports = {
  crearGrupo,
  agregarGasto,
  totalPorPersona,
  balances,
  liquidacion,
  resumen,
};
