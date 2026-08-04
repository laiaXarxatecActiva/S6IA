# AGENTS.md

Reglas del proyecto para los agentes (`@programador`, `@tester`, `@revisor`, `@goal`).
El contrato funcional completo está en `SPEC.md` — este documento no lo repite, solo
fija cómo se trabaja sobre él.

## Qué es este repo

Módulo de reparto de gastos entre amigos. Lógica pura, sin interfaz y sin base de
datos. Todo el estado vive en memoria, en el objeto que devuelve `crearGrupo`.

## Stack y restricciones técnicas

- JavaScript, Node.js **>= 18** (probado en v26.5.1).
- CommonJS (`require` / `module.exports`), **sin dependencias externas** — tampoco de
  desarrollo salvo el runner de tests.
- Tests con el módulo nativo `node:test` + `node:assert/strict`. No se añade Jest,
  Mocha ni ningún otro framework.
- Nada de servidor, CLI, base de datos ni persistencia (LocalStorage incluido). El
  único punto de entrada es `require('./lib/gastos.js')`.

## Estructura del repo

```
lib/gastos.js     ← implementación, único fichero de producción
tests/            ← tests con node:test
SPEC.md           ← contrato funcional (fuente de verdad)
AGENTS.md         ← este fichero
README.md         ← para el cliente
GOAL.md           ← criterio de la Fase 3, cuando aplique
```

## Quién puede tocar qué

- `@programador` implementa en `lib/gastos.js`. **No modifica `tests/`** bajo
  ningún concepto, ni siquiera para "arreglar" un test que falla — si un test falla,
  el problema está en la implementación o hay que preguntar, no se toca el test.
- `@tester` escribe y mantiene los tests en `tests/`, incluyendo obligatoriamente
  los 3 ejemplos oficiales de `SPEC.md` §8.
- `@revisor` revisa el `diff` del PR contra `SPEC.md`: nombres de la API exactos,
  mensajes de error exactos (§6), redondeo solo en la salida (§3). No mezcla nada
  que no pueda explicar.
- `@goal` (Fase 3, sobre cerrado): trabaja con `permission: edit: {"tests/**": "deny"}`. Puede leer los tests para saber qué
  tiene que cumplir, pero no puede editarlos ni borrarlos para forzar que pasen.

## Contrato de la API (no negociable)

Los nombres exactos están en `SPEC.md` §2:

```js
module.exports = {
  crearGrupo,
  agregarGasto,
  totalPorPersona,
  balances,
  liquidacion,
  resumen,
};
```

Ningún agente cambia estos nombres ni sus firmas por iniciativa propia. Si algo del
brief parece pedir un cambio, se refleja primero en `SPEC.md` y luego en el código.

## Flujo de trabajo

1. Un issue = una unidad de trabajo pequeña (una función o un grupo de validaciones
   relacionadas), nunca "implementar todo el módulo" en un solo issue.
2. Rama por issue: `feat/<nombre-corto>` o `fix/<nombre-corto>`.
3. Commits en formato `feat: <descripción> (#<issue>)` o `fix: <descripción> (#<issue>)`.
   Sin commits sueltos directamente en `main`.
4. Todo cambio pasa por PR — revisado antes de mergear, nunca autofusionado sin que
   tú hayas leído el `git diff`.
5. `node --test` en verde antes de abrir el PR y antes de mergear.

## Fase 3 — sobre cerrado

Antes de tocar una sola línea: `node --test` tiene que estar en verde. Si no lo
está, se arregla eso primero, no se empieza la ampliación sobre una base rota.
El criterio de éxito de `GOAL.md` es siempre un comando ejecutable (p. ej. `node --test` con un test concreto en verde), nunca una descripción cualitativa.

## Estilo

- Errores: `Error` con el mensaje exacto definido en `SPEC.md` §6, sin texto
  adicional.
- Sin comentarios explicando lo obvio; sí un comentario breve donde la regla de
  negocio no sea evidente a simple vista (p. ej. el criterio de desempate del
  algoritmo greedy de `liquidacion`).
- Sin dependencias nuevas sin que quede reflejado y justificado aquí primero.