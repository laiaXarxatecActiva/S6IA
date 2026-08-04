# Encargo del cliente — «Reparto de gastos del viaje»

> Esto es lo único que te doy. **No es una spec**: es lo que te contaría un cliente
> en una reunión de veinte minutos. Tu primer trabajo es convertirlo en una `SPEC.md`
> con la que un agente pueda trabajar sin preguntarte nada.

---

## Lo que dice el cliente

«Somos un grupo de amigos que viajamos juntos un par de veces al año y siempre acabamos
con el mismo lío: uno paga la gasolina, otro la cena, otro la casa rural, y al volver
nadie sabe quién le debe qué a quién. Acabamos haciendo cuentas en el móvil y siempre
se nos escapa algo.

Lo que necesitamos es algo donde ir apuntando cada gasto —qué fue, cuánto costó y quién
lo pagó— y que al final nos diga dos cosas: cuánto ha puesto cada uno de más o de menos,
y sobre todo **la lista de transferencias que hay que hacer para quedar en paz**, lo más
corta posible. Nada de que cada uno le pague un poco a cada uno.

De momento no queremos ni app ni base de datos: con que funcione la lógica y podamos
fiarnos de los números, nos vale. Ah, y que avise cuando metemos una tontería, porque
seguro que alguien apunta un gasto de cero euros o pone el nombre mal.»

---

## Anexo técnico — API pública OBLIGATORIA

El cliente no sabe nada de esto, pero tu equipo sí: el módulo se va a integrar con otro
sistema, así que **estos nombres y estas firmas no se negocian**. Si cambias un nombre,
la integración falla.

Fichero: **`lib/gastos.js`**, CommonJS (`module.exports = { ... }`), sin dependencias externas.

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

### Regla de redondeo (una sola, para todo el proyecto)

> Se calcula con los valores **exactos** y se redondea **solo el resultado final** de cada
> función, con `Math.round(n * 100) / 100`.

### `crearGrupo(nombre, participantes)`

- `nombre`: texto no vacío.
- `participantes`: array de **2 o más** nombres, textos no vacíos, **sin duplicados**
  (`"Ana"` y `"ana"` son personas distintas).
- Devuelve: `{ nombre, participantes, gastos: [] }`.
- Lanza `Error` si algo de lo anterior no se cumple.

### `agregarGasto(grupo, gasto)`

- `gasto`: `{ concepto, importe, pagadoPor }`.
  - `concepto`: texto no vacío.
  - `importe`: número finito **mayor que 0**.
  - `pagadoPor`: tiene que ser uno de los participantes del grupo.
- Añade a `grupo.gastos` el objeto `{ id, concepto, importe, pagadoPor }`, donde `id` es
  correlativo empezando en **1**.
- Devuelve el grupo.
- Lanza `Error` si algo no cumple **y en ese caso no añade nada** (el grupo se queda igual).

### `totalPorPersona(grupo)`

- Devuelve un objeto `{ participante: totalPagado }` con **todos** los participantes,
  incluidos los que no han pagado nada (valor `0`).

### `balances(grupo)`

- Devuelve `{ participante: saldo }`, donde `saldo = lo que ha pagado − lo que le tocaba`.
- Lo que le tocaba = total del grupo dividido entre el número de participantes.
- Positivo = le deben dinero. Negativo = debe dinero.

### `liquidacion(grupo)`

- Devuelve un array de objetos **exactamente** con esta forma: `{ de, a, importe }`.
- `de` paga a `a` esa cantidad. Solo importes mayores que 0.
- **Lo más corta posible**: el que más debe le paga al que más ha puesto, y así
  sucesivamente hasta que todo el mundo quede a cero.
- Ordenada por `importe` de mayor a menor; si dos importes empatan, por `de` alfabético.
- Si no hay nada que liquidar, devuelve `[]`. Las diferencias de 1 céntimo o menos se ignoran.

### `resumen(grupo)`

- Devuelve `{ total, cuota, numGastos, participantes }`:
  `total` gastado, `cuota` que le toca a cada uno, número de gastos y número de personas.

---

## Ejemplos oficiales (estos van a estar en la corrección)

**Ejemplo 1 — reparto redondo**

```
Grupo: Ana, Luis, Marta
Gasto: "Casa rural", 30 €, paga Ana

balances    → { Ana: 20, Luis: -10, Marta: -10 }
liquidacion → [ { de: "Luis", a: "Ana", importe: 10 },
                { de: "Marta", a: "Ana", importe: 10 } ]
```

**Ejemplo 2 — reparto con decimales**

```
Grupo: Ana, Luis, Marta
Gasto: "Gasolina", 10 €, paga Ana

balances    → { Ana: 6.67, Luis: -3.33, Marta: -3.33 }
liquidacion → [ { de: "Luis", a: "Ana", importe: 3.33 },
                { de: "Marta", a: "Ana", importe: 3.33 } ]
```

**Ejemplo 3 — grupo vacío**

```
Grupo: Ana, Luis  ·  sin gastos

balances    → { Ana: 0, Luis: 0 }
liquidacion → []
resumen     → { total: 0, cuota: 0, numGastos: 0, participantes: 2 }
```
