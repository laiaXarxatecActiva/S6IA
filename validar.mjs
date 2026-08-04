#!/usr/bin/env node
/**
 * validar.mjs — Checklist automática de la entrega
 * Curso de IA y VibeCoding · Sesión 6 · Xavi García
 *
 * QUÉ ES
 *   El mismo principio de la sesión 5: en vez de preguntarle a alguien si tu
 *   entrega está bien, lo pregunta un comando que devuelve 0 o no.
 *
 * QUÉ NO ES
 *   Una nota. Esto comprueba que no te has dejado nada por el camino; NO comprueba
 *   que tu código sea correcto. Eso lo dicen los tests de aceptación, que hoy no ves.
 *
 * USO
 *   node validar.mjs
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const RAIZ = process.cwd();
const require = createRequire(import.meta.url);

const resultados = [];

function comprobar(nombre, obligatorio, fn) {
  let ok = false;
  let detalle = "";
  try {
    const r = fn();
    if (typeof r === "object" && r !== null) {
      ok = r.ok;
      detalle = r.detalle ?? "";
    } else {
      ok = Boolean(r);
    }
  } catch (e) {
    ok = false;
    detalle = String(e.message).split("\n")[0];
  }
  resultados.push({ nombre, obligatorio, ok, detalle });
}

// ── Herramientas ──────────────────────────────────────────────

function hay(...ruta) {
  return existsSync(join(RAIZ, ...ruta));
}

function leer(...ruta) {
  return readFileSync(join(RAIZ, ...ruta), "utf8");
}

function ficherosDe(dir, filtro = () => true) {
  const ruta = join(RAIZ, dir);
  if (!existsSync(ruta) || !statSync(ruta).isDirectory()) return [];
  return readdirSync(ruta).filter(filtro);
}

function git(args) {
  const r = spawnSync("git", args, { encoding: "utf8", cwd: RAIZ });
  return { ok: r.status === 0, salida: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim() };
}

function palabras(texto) {
  return texto.replace(/<!--[\s\S]*?-->/g, "").split(/\s+/).filter(Boolean).length;
}

// ── 1. Documentación del proyecto ─────────────────────────────

comprobar("SPEC.md existe y tiene contenido propio", true, () => {
  if (!hay("SPEC.md")) return { ok: false, detalle: "no existe SPEC.md" };
  const n = palabras(leer("SPEC.md"));
  return { ok: n >= 150, detalle: `${n} palabras (mínimo razonable: 150)` };
});

comprobar("AGENTS.md existe", true, () => hay("AGENTS.md"));

comprobar("ENTREGA.md relleno", true, () => {
  if (!hay("ENTREGA.md")) return { ok: false, detalle: "no existe ENTREGA.md" };
  const texto = leer("ENTREGA.md");
  const sinComentarios = texto.replace(/<!--[\s\S]*?-->/g, "");
  const n = palabras(sinComentarios);
  const marcadas = (texto.match(/- \[x\]/gi) ?? []).length;
  return {
    ok: n >= 180 && marcadas >= 1,
    detalle: `${n} palabras propias · ${marcadas} casillas marcadas`,
  };
});

// ── 2. Estructura y agentes ───────────────────────────────────

comprobar("lib/gastos.js existe", true, () => hay("lib", "gastos.js"));

comprobar("Hay tests propios en tests/", true, () => {
  const t = ficherosDe("tests", (f) => f.endsWith(".test.js") || f.endsWith(".test.mjs"));
  return { ok: t.length >= 1, detalle: `${t.length} fichero(s) de test` };
});

comprobar("Agentes programador, tester y revisor", true, () => {
  const agentes = ficherosDe(".opencode/agents", (f) => f.endsWith(".md")).map((f) =>
    f.replace(/\.md$/, "").toLowerCase()
  );
  const faltan = ["programador", "tester", "revisor"].filter((a) => !agentes.includes(a));
  return {
    ok: faltan.length === 0,
    detalle: faltan.length ? `faltan: ${faltan.join(", ")}` : agentes.join(", "),
  };
});

// ── 3. El contrato ────────────────────────────────────────────

const CONTRATO = [
  "crearGrupo",
  "agregarGasto",
  "totalPorPersona",
  "balances",
  "liquidacion",
  "resumen",
];

let modulo = null;

comprobar("lib/gastos.js exporta las 6 funciones del contrato", true, () => {
  modulo = require(resolve(RAIZ, "lib", "gastos.js"));
  const faltan = CONTRATO.filter((f) => typeof modulo[f] !== "function");
  return {
    ok: faltan.length === 0,
    detalle: faltan.length ? `faltan o no son funciones: ${faltan.join(", ")}` : "las 6",
  };
});

comprobar("Prueba de humo del contrato", true, () => {
  if (!modulo) return { ok: false, detalle: "no se pudo cargar el módulo" };
  const fallos = [];

  const g = modulo.crearGrupo("Viaje", ["Ana", "Luis", "Marta"]);
  if (!Array.isArray(g?.gastos)) fallos.push("crearGrupo no devuelve { gastos: [] }");

  modulo.agregarGasto(g, { concepto: "Casa rural", importe: 30, pagadoPor: "Ana" });
  if (g.gastos.length !== 1) fallos.push("agregarGasto no añade el gasto al grupo");
  if (g.gastos[0]?.id !== 1) fallos.push("el primer gasto no tiene id 1");

  const b = modulo.balances(g);
  if (b?.Ana !== 20 || b?.Luis !== -10) {
    fallos.push(`balances del ejemplo 1 incorrectos: ${JSON.stringify(b)}`);
  }

  const l = modulo.liquidacion(g);
  if (!Array.isArray(l) || l.length !== 2) {
    fallos.push(`liquidacion del ejemplo 1 debería tener 2 pagos: ${JSON.stringify(l)}`);
  }

  let lanza = false;
  try {
    modulo.agregarGasto(g, { concepto: "X", importe: -5, pagadoPor: "Ana" });
  } catch {
    lanza = true;
  }
  if (!lanza) fallos.push("agregarGasto no lanza Error con un importe negativo");

  return { ok: fallos.length === 0, detalle: fallos.join(" · ") || "ejemplos 1 y validación OK" };
});

comprobar("node --test pasa en verde", true, () => {
  const r = spawnSync("node", ["--test"], { encoding: "utf8", cwd: RAIZ });
  const salida = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const fallos = Number(salida.match(/^# fail (\d+)/m)?.[1] ?? 0);
  const pasan = Number(salida.match(/^# pass (\d+)/m)?.[1] ?? 0);
  return {
    ok: r.status === 0 && pasan > 0,
    detalle: pasan === 0 ? "no se ha ejecutado ningún test" : `${pasan} pass · ${fallos} fail`,
  };
});

// ── 4. El proceso: git y GitHub ───────────────────────────────

comprobar("Es un repositorio git", true, () => git(["rev-parse", "--is-inside-work-tree"]).ok);

comprobar("Remoto en GitHub configurado", true, () => {
  const r = git(["remote", "-v"]);
  return { ok: r.ok && /github\.com/i.test(r.salida), detalle: r.salida.split("\n")[0] ?? "" };
});

comprobar("Al menos 2 Pull Requests mezclados", true, () => {
  const r = git(["log", "--merges", "--oneline"]);
  const n = r.ok && r.salida ? r.salida.split("\n").filter(Boolean).length : 0;
  return { ok: n >= 2, detalle: `${n} merge(s) en el historial` };
});

comprobar("Commits convencionales con número de issue", false, () => {
  const r = git(["log", "--oneline", "--no-merges", "-30"]);
  const lineas = r.salida.split("\n").filter(Boolean);
  const buenos = lineas.filter((l) =>
    /(feat|fix|test|docs|refactor|chore)(\(.+\))?:/i.test(l) && /#\d+/.test(l)
  ).length;
  return {
    ok: lineas.length > 0 && buenos >= Math.min(3, lineas.length),
    detalle: `${buenos} de ${lineas.length} commits con formato y (#issue)`,
  };
});

comprobar("Nada sin subir ni sin commitear", true, () => {
  const sucio = git(["status", "--porcelain"]).salida;
  const rama = git(["status", "-sb"]).salida.split("\n")[0] ?? "";
  const pendiente = /\[ahead \d+/.test(rama);
  return {
    ok: sucio === "" && !pendiente,
    detalle: [sucio ? "hay cambios sin commitear" : "", pendiente ? "hay commits sin push" : ""]
      .filter(Boolean)
      .join(" · ") || "limpio y subido",
  };
});

// ── 5. El bucle por objetivo ──────────────────────────────────

comprobar("GOAL.md escrito con criterio ejecutable", true, () => {
  if (!hay("GOAL.md")) return { ok: false, detalle: "no existe GOAL.md" };
  const texto = leer("GOAL.md");
  const tieneComando = /```[\s\S]*?(node|npm|npx|gh)[\s\S]*?```/.test(texto);
  const n = palabras(texto);
  return {
    ok: tieneComando && n >= 60,
    detalle: tieneComando ? `${n} palabras` : "no veo un comando en un bloque de código",
  };
});

comprobar("bitacora-bucle.md: el bucle se ha lanzado de verdad", true, () => {
  if (!hay("bitacora-bucle.md")) return { ok: false, detalle: "no existe bitacora-bucle.md" };
  const texto = leer("bitacora-bucle.md");
  const vueltas = (texto.match(/### Vuelta/g) ?? []).length;
  const seco = /MODO ENSAYO/.test(texto);
  return {
    ok: vueltas >= 1 && !/^\s*$/.test(texto),
    detalle: `${vueltas} vuelta(s)${seco ? " · ojo: hay ensayos en seco en la bitácora" : ""}`,
  };
});

comprobar("Los tests están protegidos por permisos", false, () => {
  const ruta = join(RAIZ, ".opencode", "agents", "goal.md");
  if (!existsSync(ruta)) return { ok: false, detalle: "no hay agente goal" };
  const texto = readFileSync(ruta, "utf8");
  return {
    ok: /tests\/\*\*.*deny/s.test(texto) || /"tests\/\*\*"\s*:\s*deny/.test(texto),
    detalle: "busco tests/** : deny en el agente goal",
  };
});

// ── Informe ───────────────────────────────────────────────────

const ancho = Math.max(...resultados.map((r) => r.nombre.length)) + 2;
console.log("\n  CHECKLIST DE ENTREGA — Reto final\n");

for (const r of resultados) {
  const icono = r.ok ? "✅" : r.obligatorio ? "❌" : "⚠️ ";
  const detalle = r.detalle ? `  → ${r.detalle}` : "";
  console.log(`  ${icono} ${r.nombre.padEnd(ancho)}${detalle}`);
}

const obligatorios = resultados.filter((r) => r.obligatorio);
const fallanObligatorios = obligatorios.filter((r) => !r.ok);
const opcionalesFallan = resultados.filter((r) => !r.obligatorio && !r.ok);

console.log(
  `\n  ${obligatorios.length - fallanObligatorios.length} de ${obligatorios.length} obligatorios` +
    (opcionalesFallan.length ? ` · ${opcionalesFallan.length} recomendación(es) sin cumplir` : "")
);

if (fallanObligatorios.length === 0) {
  console.log("\n  ✅ Entrega completa. Ahora léela tú: que esté todo no quiere decir que esté bien.\n");
  process.exit(0);
}

console.log("\n  ❌ Te falta esto:");
for (const r of fallanObligatorios) console.log(`     · ${r.nombre}`);
console.log("");
process.exit(1);
