# 📩 Requisito nuevo del cliente

> **No abrir hasta que lo diga el formador.**

---

Han pasado dos horas desde la reunión. El cliente escribe:

> «Se nos ha olvidado una cosa importante. **No todos los gastos son de todos.**
> El taxi al aeropuerto lo cogimos tres, no cinco. Las copas fueron solo los que salieron.
> Y a veces alguien invita: paga él, pero se reparte entre los demás.
>
> Necesitamos poder decir, en cada gasto, **entre quiénes se reparte**. Si no decimos nada,
> que se reparta entre todos como hasta ahora, que la mayoría son así.»

---

## Especificación del cambio

`agregarGasto(grupo, gasto)` acepta un campo **opcional** más:

```js
agregarGasto(grupo, { concepto, importe, pagadoPor, entre });
```

**`entre`** — array de nombres entre los que se reparte **ese** gasto.

| Regla | Detalle |
|---|---|
| Si no se indica | El gasto se reparte entre **todos** los participantes, como hasta ahora |
| Contenido | Nombres que estén en `grupo.participantes`, **sin duplicados**, **al menos uno** |
| Quien paga | **No** tiene por qué estar en `entre` (puede invitar) |
| Si algo falla | Lanza `Error` y **no** añade el gasto |
| Guardado | Si se indica, el gasto guardado incluye `entre` con esa lista |

### Qué se ve afectado

- **`balances`** — lo que le tocaba a cada uno ya no es «total ÷ personas»: es la suma de
  su parte en **cada gasto en el que participa**.
- **`liquidacion`** — se calcula igual, pero partiendo de los nuevos balances.
- **`totalPorPersona`** — **no cambia**: sigue siendo lo que ha pagado cada uno.
- **`resumen`** — `cuota` sigue siendo el reparto medio (`total ÷ participantes`). No lo toques.

### Ejemplo

```
Grupo: Ana, Luis, Marta
Gasto 1: "Taxi", 20 €, paga Ana, entre [Ana, Luis]
Gasto 2: "Casa",  30 €, paga Marta   (sin 'entre' → entre todos)

Le tocaba:  Ana 10+10=20 · Luis 10+10=20 · Marta 0+10=10
Ha pagado:  Ana 20 · Luis 0 · Marta 30

balances    → { Ana: 0, Luis: -20, Marta: 20 }
liquidacion → [ { de: "Luis", a: "Marta", importe: 20 } ]
```

---

## Cómo se hace esto (y por qué te lo cuento)

Esto es exactamente lo que pasa en un proyecto real: el requisito llega **después** de que
el código funcione. Tienes dos horas de trabajo hechas y un cliente cambiando las reglas.

1. **Antes de tocar nada:** `node --test`. ¿Verde? Esa es tu red.
2. Actualiza la `SPEC.md`. Si la spec no cambia, el agente trabajará con la vieja.
3. Abre un issue nuevo y trabaja como has trabajado todo el día: rama, agentes, PR, review.
4. **Los tests que ya tenías tienen que seguir pasando.** Si tu cambio los rompe, no has
   ampliado: has estropeado. Eso vale más que la funcionalidad nueva.
5. Si te va justo de tiempo: escribe primero un test de lo nuevo en rojo y lánzalo en bucle.

> ⚠️ El error más caro de esta última hora es **empezar a tocar código sin haber comprobado
> que estabas en verde**. Si no sabes de dónde partes, no sabrás qué has roto.
