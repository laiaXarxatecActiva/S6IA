# Objetivo

## 1. META

Añadir el campo opcional `entre` a `agregarGasto`, y hacer que `balances` (y por tanto `liquidacion`) calculen la parte de cada persona en función de `entre` en lugar de un
reparto uniforme entre todos los participantes, sin romper el comportamiento existente.

## 2. CRITERIO DE ÉXITO

<!-- EL COMANDO que devuelve 0 cuando está cumplido. Si no es un comando, no es un criterio. -->

```bash
node --test
```

Los 16 tests de `tests/tareas.test.js` deben pasar (los 10 anteriores siguen en verde,
los 6 nuevos de `entre` pasan a verde).

## 3. CONTEXTO

- Código a modificar: `lib/gastos.js`, funciones `agregarGasto` y `balances` (`liquidacion` no debería necesitar cambios propios: ya calcula a partir del resultado
  de `balances`, solo hay que verificar que sigue funcionando con los nuevos saldos).
- Contrato y reglas de negocio: `SPEC.md` §6 y §7 (ya actualizados con la especificación
  de `entre`).
- Convenciones del proyecto: CommonJS, sin dependencias externas, mensajes de `Error` exactos según la tabla de `SPEC.md` §6, redondeo solo en la salida
  (`Math.round(n*100)/100`), cálculos internos con valores exactos.
- Los tests de referencia están en `tests/tareas.test.js`, bloque
  "Ampliación — reparto parcial con 'entre' (sobre cerrado)".

## 4. RESTRICCIONES

- No tocar `tests/tareas.test.js` bajo ningún concepto (son el criterio, no el problema).
- No tocar `SPEC.md`, `GOAL.md` ni `bucle-goal.mjs`.
- No modificar `totalPorPersona` (no cambia: sigue siendo lo pagado por cada uno).
- No modificar `resumen.cuota` (sigue siendo `total / nº participantes`, no se toca).
- No cambiar los nombres ni las firmas de las 6 funciones del contrato.
- No instalar dependencias.
- No refactorizar código que no tenga relación directa con `entre`.

## 5. LÍMITE

6 intentos.

## 6. SI FALLA

Si tras 5 intentos el bucle no lo consigue, reviso manualmente el `git diff` acumulado,
identifico en qué test concreto se atasca, y decido si continúo a mano o ajusto el `GOAL.md` (por ejemplo, si el contexto no fue suficiente) antes de relanzar el bucle.
