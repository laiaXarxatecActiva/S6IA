# SPEC.md — Reparto de gastos del viaje

Especificación cerrada para implementar `lib/gastos.js`. Esta spec resuelve todas las
ambigüedades del encargo original; el agente no debe tomar decisiones de diseño no
recogidas aquí.

---

## 1. Alcance del entregable

- `lib/gastos.js` — módulo CommonJS, sin dependencias externas.
- `package.json` — con `"engines": { "node": ">=18" }` (probado en Node v26.5.1).
- Tests con `node:test` (+ `node:assert/strict`), incluyendo obligatoriamente los 3
  ejemplos oficiales del encargo como casos de test.
- `README.md` para el cliente: qué es, cómo instalarlo/usarlo, ejemplo mínimo de uso
  de las 6 funciones.
- **No** se construye app, CLI, base de datos ni persistencia (ni LocalStorage, que
  además no existe en Node.js). El estado del grupo vive solo en memoria, en el
  objeto devuelto por `crearGrupo`.

---

## 2. API pública (no negociable)

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

## 3. Regla de redondeo

Todos los cálculos internos se hacen con los valores **exactos** (sin redondear en
pasos intermedios). El redondeo con `Math.round(n * 100) / 100` se aplica **solo** al
construir el valor de salida que ve el usuario: cada `saldo` de `balances`, cada `importe` de `liquidacion`, cada valor de `totalPorPersona`, y `total`/`cuota` de `resumen`.

## 4. Validación de nombres (participantes y `pagadoPor`)

Aplica a los nombres de `participantes` en `crearGrupo` y, por herencia, a `pagadoPor` en `agregarGasto` (que además debe coincidir con un participante ya
existente).

- Se hace `trim()` antes de cualquier validación o comparación.
- Longitud tras el trim: entre 1 y 50 caracteres.
- Se permiten letras (incluyendo tildes y ñ/Ñ), espacios, apóstrofos y guiones
  (nombres compuestos: `"Ana María"`, `"Jean-Paul"`, `"O'Connor"`).
- Se rechazan caracteres especiales/de control: `< > $ % " { } ; \ /` y similares.
- Regex de validación: `^[\p{L}\p{M} '-]{1,50}$` (unicode, tras `trim()`).
- La comparación de duplicados en `crearGrupo` es sensible a mayúsculas/minúsculas
  tras el trim (`"Ana"` y `"ana"` siguen siendo personas distintas).

## 5. Validación de `importe`

- Debe ser `typeof === "number"`, finito (`Number.isFinite`), y `> 0`.
- No se aceptan strings numéricos (`"10"` es inválido), `NaN` ni `Infinity`.
- Puede tener cualquier número de decimales de entrada; el redondeo solo se aplica
  a los valores de salida (ver §3).

## 6. Mensajes de error (texto exacto)

Todas las validaciones lanzan `Error` con estos mensajes exactos:

| Caso                                                                                      | Mensaje                                   |
| ----------------------------------------------------------------------------------------- | ----------------------------------------- |
| `crearGrupo`: nombre de grupo vacío                                                       | `"Nombre de grupo inválido"`              |
| `crearGrupo`: menos de 2 participantes                                                    | `"Se necesitan al menos 2 participantes"` |
| `crearGrupo`/`agregarGasto`: nombre inválido (vacío, >50 chars, caracteres no permitidos) | `"Nombre inválido"`                       |
| `crearGrupo`: participantes duplicados                                                    | `"Participante duplicado"`                |
| `agregarGasto`: concepto vacío                                                            | `"Concepto inválido"`                     |
| `agregarGasto`: importe no numérico/no finito/≤0                                          | `"Importe inválido"`                      |
| `agregarGasto`: `pagadoPor` no es un participante del grupo                               | `"Pagador no reconocido"`                 |

Si `agregarGasto` lanza error, `grupo.gastos` no se modifica.

## 7. Funciones — comportamiento detallado

### `crearGrupo(nombre, participantes)`

Valida nombre y lista de participantes (§4, §6), aplica `trim()` a cada nombre, y
devuelve `{ nombre, participantes, gastos: [] }` con los nombres ya limpios (trim
aplicado) y en el mismo orden en que se pasaron.

### `agregarGasto(grupo, gasto)`

Valida `concepto`, `importe`, `pagadoPor` (§5, §6). Si todo es válido, añade `{ id, concepto, importe, pagadoPor }` a `grupo.gastos`, con `id` correlativo
empezando en 1 (`grupo.gastos.length + 1`). Devuelve el grupo modificado.

### `totalPorPersona(grupo)`

Devuelve `{ participante: totalPagado }` para **todos** los participantes (0 si no
pagaron nada), **en el mismo orden que `grupo.participantes`**. Valores redondeados
según §3.

### `balances(grupo)`

`saldo = totalPagado - cuota`, donde `cuota = total del grupo / nº participantes` (valor exacto usado en el cálculo interno). Devuelve `{ participante: saldo }` en el
orden de `grupo.participantes`, con `saldo` redondeado según §3.

### `liquidacion(grupo)`

Algoritmo greedy determinista:

1. Calcular los saldos **exactos** (sin redondear) de cada participante.
2. Separar en deudores (saldo < 0) y acreedores (saldo > 0), ignorando saldos cuyo
   valor absoluto sea ≤ 0.01 (se consideran saldados).
3. En cada paso: tomar el deudor con mayor deuda absoluta y el acreedor con mayor
   crédito. En caso de empate de varios deudores (o varios acreedores) con el mismo
   valor absoluto, se elige el que va primero alfabéticamente por nombre.
4. Generar una transferencia `{ de, a, importe }` por el mínimo entre la deuda y el
   crédito enfrentados (valor exacto). Reducir ambos saldos exactos en esa cantidad.
5. El `importe` de la transferencia se redondea (§3) solo al añadirla al resultado
   final; los saldos internos siguen sin redondear durante todo el proceso.
6. Repetir hasta que no queden deudores/acreedores con saldo absoluto > 0.01.
7. Ordenar el array resultante por `importe` descendente; en caso de empate, por `de` alfabético.
8. Si no hay nada que liquidar, devolver `[]`.

### `resumen(grupo)`

Devuelve `{ total, cuota, numGastos, participantes }`:

- `total`: suma de todos los importes, redondeada (§3).
- `cuota`: `total exacto / nº participantes`, redondeada (§3).
- `numGastos`: `grupo.gastos.length`.
- `participantes`: `grupo.participantes.length`.

---

## 8. Casos de test obligatorios (ejemplos oficiales)

**Ejemplo 1**

```
crearGrupo("Viaje", ["Ana", "Luis", "Marta"])
agregarGasto(..., { concepto: "Casa rural", importe: 30, pagadoPor: "Ana" })

balances    → { Ana: 20, Luis: -10, Marta: -10 }
liquidacion → [ { de: "Luis", a: "Ana", importe: 10 },
                { de: "Marta", a: "Ana", importe: 10 } ]
```

**Ejemplo 2**

```
crearGrupo("Viaje", ["Ana", "Luis", "Marta"])
agregarGasto(..., { concepto: "Gasolina", importe: 10, pagadoPor: "Ana" })

balances    → { Ana: 6.67, Luis: -3.33, Marta: -3.33 }
liquidacion → [ { de: "Luis", a: "Ana", importe: 3.33 },
                { de: "Marta", a: "Ana", importe: 3.33 } ]
```

**Ejemplo 3**

```
crearGrupo("Viaje", ["Ana", "Luis"])  // sin gastos

balances    → { Ana: 0, Luis: 0 }
liquidacion → []
resumen     → { total: 0, cuota: 0, numGastos: 0, participantes: 2 }
```

Además de estos tres, se deben añadir tests de cada validación de §6 (un test por
mensaje de error) y un test de nombre inválido por longitud/caracteres especiales.
