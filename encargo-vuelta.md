# Encargo — vuelta 1 de 5

Estás dentro de un bucle automático de objetivo.

## OBJETIVO

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

## ESTADO ACTUAL

El criterio de éxito NO se cumple. Este comando ha fallado:

    node --test

Su salida ha sido:

```
✔ crearGrupo devuelve el grupo con gastos vacío (4.845237ms)
✔ crearGrupo rechaza menos de 2 participantes (1.017986ms)
✔ crearGrupo rechaza participantes duplicados (0.539846ms)
✔ crearGrupo distingue mayúsculas: 'Ana' y 'ana' son personas distintas (0.372894ms)
✔ agregarGasto añade el gasto con id correlativo desde 1 (0.703282ms)
✔ agregarGasto rechaza importe <= 0 y no modifica el grupo (0.41412ms)
✔ agregarGasto rechaza un pagador que no es participante (0.436787ms)
✔ Ejemplo 1: balances y liquidacion con reparto exacto (25.077101ms)
✔ Ejemplo 2: balances y liquidacion con decimales (0.969144ms)
✔ Ejemplo 3: grupo sin gastos (1.060221ms)
✖ agregarGasto acepta 'entre' y lo guarda en el gasto (3.054ms)
✖ agregarGasto rechaza 'entre' vacío (0.722986ms)
✖ agregarGasto rechaza 'entre' con alguien fuera del grupo (0.590678ms)
✖ agregarGasto rechaza duplicados en 'entre' (0.605661ms)
✖ Ejemplo oficial del sobre: balances y liquidacion con 'entre' parcial (1.279873ms)
✔ balances sin 'entre' sigue funcionando como antes (Ejemplo 1 de SPEC.md) (0.466593ms)
ℹ tests 16
ℹ suites 0
ℹ pass 11
ℹ fail 5
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 223.541569

✖ failing tests:

test at tests/tareas.test.js:126:1
✖ agregarGasto acepta 'entre' y lo guarda en el gasto (3.054ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  
  + undefined
  - [
  -   'Ana',
  -   'Luis'
  - ]
  
      at TestContext.<anonymous> (/home/laia/Desktop/Xarxatecactiva2026/Programacion/S6IA/tests/tareas.test.js:129:10)
      at Test.runInAsyncScope (node:async_hooks:226:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: undefined,
    expected: [ 'Ana', 'Luis' ],
    operator: 'deepStrictEqual',
    diff: 'simple'
  }

test at tests/tareas.test.js:132:1
✖ agregarGasto rechaza 'entre' vacío (0.722986ms)
  AssertionError [ERR_ASSERTION]: Missing expected exception.
      at TestContext.<anonymous> (/home/laia/Desktop/Xarxatecactiva2026/Programacion/S6IA/tests/tareas.test.js:134:10)
      at Test.runInAsyncScope (node:async_hooks:226:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: undefined,
    expected: /'entre' no puede estar vacío/,
    operator: 'throws',
    diff: 'simple'
  }

test at tests/tareas.test.js:140:1


[...salida recortada, 2753 caracteres más]
```

## LO QUE TIENES QUE HACER

1. Lee el error y di en UNA frase cuál crees que es la causa.
2. Haz el cambio MÍNIMO en el código que la corrija.
3. Nada más. No refactorices de propina, no toques ficheros que no hagan falta.

## PROHIBIDO

- Modificar, borrar o desactivar los tests. Son el criterio, no el problema.
- Cambiar el comando de verificación.
- Dar por bueno el trabajo sin ejecutar el comando de verificación.
