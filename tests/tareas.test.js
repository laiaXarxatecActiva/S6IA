// tests/gastos.test.js — el CRITERIO. Esto es lo que decide si el objetivo está cumplido.
// Los tests de este fichero los escribe @tester a partir de SPEC.md. El bucle NO puede tocarlos
// (permission: edit: {"tests/**": "deny"} en el agente @goal).

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  crearGrupo,
  agregarGasto,
  totalPorPersona,
  balances,
  liquidacion,
  resumen,
} = require("../lib/gastos");

// ─── Fase 2 — contrato base (SPEC.md §7 y §8) ───

test("crearGrupo devuelve el grupo con gastos vacío", () => {
  const grupo = crearGrupo("Viaje", ["Ana", "Luis", "Marta"]);
  assert.deepEqual(grupo.participantes, ["Ana", "Luis", "Marta"]);
  assert.deepEqual(grupo.gastos, []);
});

test("crearGrupo rechaza menos de 2 participantes", () => {
  assert.throws(
    () => crearGrupo("Viaje", ["Ana"]),
                /Se necesitan al menos 2 participantes/
  );
});

test("crearGrupo rechaza participantes duplicados", () => {
  assert.throws(
    () => crearGrupo("Viaje", ["Ana", "Ana"]),
                /Participante duplicado/
  );
});

test("crearGrupo distingue mayúsculas: 'Ana' y 'ana' son personas distintas", () => {
  const grupo = crearGrupo("Viaje", ["Ana", "ana"]);
  assert.deepEqual(grupo.participantes, ["Ana", "ana"]);
});

test("agregarGasto añade el gasto con id correlativo desde 1", () => {
  let grupo = crearGrupo("Viaje", ["Ana", "Luis", "Marta"]);
  grupo = agregarGasto(grupo, { concepto: "Casa rural", importe: 30, pagadoPor: "Ana" });
  assert.equal(grupo.gastos.length, 1);
  assert.equal(grupo.gastos[0].id, 1);
});

test("agregarGasto rechaza importe <= 0 y no modifica el grupo", () => {
  const grupo = crearGrupo("Viaje", ["Ana", "Luis"]);
  assert.throws(
    () => agregarGasto(grupo, { concepto: "Nada", importe: 0, pagadoPor: "Ana" }),
                /Importe inválido/
  );
  assert.equal(grupo.gastos.length, 0);
});

test("agregarGasto rechaza un pagador que no es participante", () => {
  const grupo = crearGrupo("Viaje", ["Ana", "Luis"]);
  assert.throws(
    () => agregarGasto(grupo, { concepto: "Cena", importe: 20, pagadoPor: "Pedro" }),
                /Pagador no reconocido/
  );
});

// ─── Ejemplo oficial 1 — reparto redondo (SPEC.md §8) ───

test("Ejemplo 1: balances y liquidacion con reparto exacto", () => {
  let grupo = crearGrupo("Viaje", ["Ana", "Luis", "Marta"]);
  grupo = agregarGasto(grupo, { concepto: "Casa rural", importe: 30, pagadoPor: "Ana" });

  assert.deepEqual(balances(grupo), { Ana: 20, Luis: -10, Marta: -10 });
  assert.deepEqual(liquidacion(grupo), [
    { de: "Luis", a: "Ana", importe: 10 },
    { de: "Marta", a: "Ana", importe: 10 },
  ]);
});

// ─── Ejemplo oficial 2 — reparto con decimales (SPEC.md §8) ───

test("Ejemplo 2: balances y liquidacion con decimales", () => {
  let grupo = crearGrupo("Viaje", ["Ana", "Luis", "Marta"]);
  grupo = agregarGasto(grupo, { concepto: "Gasolina", importe: 10, pagadoPor: "Ana" });

  assert.deepEqual(balances(grupo), { Ana: 6.67, Luis: -3.33, Marta: -3.33 });
  assert.deepEqual(liquidacion(grupo), [
    { de: "Luis", a: "Ana", importe: 3.33 },
    { de: "Marta", a: "Ana", importe: 3.33 },
  ]);
});

// ─── Ejemplo oficial 3 — grupo vacío (SPEC.md §8) ───

test("Ejemplo 3: grupo sin gastos", () => {
  const grupo = crearGrupo("Viaje", ["Ana", "Luis"]);

  assert.deepEqual(balances(grupo), { Ana: 0, Luis: 0 });
  assert.deepEqual(liquidacion(grupo), []);
  assert.deepEqual(resumen(grupo), {
    total: 0,
    cuota: 0,
    numGastos: 0,
    participantes: 2,
  });
});

// ══════════════════════════════════════════════════════════════════════════
// A partir de aquí, la funcionalidad que TODAVÍA NO EXISTE.
// Esto es lo que el bucle-goal tiene que conseguir que pase en la Fase 3.
//
// ⚠️ PLANTILLA — sustituye este bloque por los tests reales en cuanto abras
// el sobre cerrado. El requisito nuevo lo decide el cliente en clase; no se
// conoce de antemano. Escribe tú estos tests EN ROJO antes de tocar
// lib/gastos.js, tal como indica la Fase 3 del reto.
// ══════════════════════════════════════════════════════════════════════════

// test("<nombre descriptivo del requisito nuevo>", () => {
//   // 1. Preparar el grupo/gasto de partida con las funciones ya existentes.
//   // 2. Llamar a la función nueva o al comportamiento ampliado.
//   // 3. Afirmar el resultado exacto, igual que en los ejemplos oficiales de arriba.
// });
