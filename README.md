# Reto final — Sesión 6 · Curso de IA y VibeCoding

Esta carpeta es tu **punto de partida**, no tu proyecto. Cópiala entera a una carpeta
nueva, ponle el nombre que quieras y ahí dentro montas tu repositorio.

```bash
# 1. Copia esta carpeta a tu sitio de trabajo y entra
cd gastos-viaje

# 2. Arranca el repositorio
git init -b main
gh repo create gastos-viaje --private --source=. --remote=origin

# 3. Comprueba que tienes lo tuyo funcionando
node -v
opencode --version
gh auth status
```

## Qué hay aquí

| Fichero                    | Para qué                                                               |
| -------------------------- | ---------------------------------------------------------------------- |
| `BRIEF.md`                 | El encargo del cliente. **Léelo dos veces.** De aquí sale tu `SPEC.md` |
| `validar.mjs`              | Comprueba tú mismo si tu entrega cumple. Lánzalo cuantas veces quieras |
| `bucle-goal.mjs`           | El bucle de objetivo de la sesión 5, listo para usar                   |
| `.opencode/agents/goal.md` | El agente del bucle, con los tests protegidos                          |
| `plantillas/GOAL.md`       | La plantilla de objetivo de 6 puntos                                   |
| `ENTREGA.md`               | Tu autoinforme. Se entrega relleno                                     |

## Lo que TÚ tienes que crear

- `SPEC.md` — la especificación, escrita por ti a partir del brief
- `AGENTS.md` — las reglas del proyecto para los agentes
- `.opencode/agents/` — tus agentes: `programador`, `tester`, `revisor` (y los que quieras)
- `lib/gastos.js` — el código
- `tests/` — tus tests
- `GOAL.md` + `bitacora-bucle.md` — el objetivo que has lanzado en bucle y lo que pasó

## Comprobarte a ti mismo

```bash
node --test        # tus tests
node validar.mjs   # la checklist de entrega
```

`validar.mjs` **no te pone nota**: comprueba que no te has dejado nada. Que salga todo
en verde no significa que el código sea correcto — eso lo dicen otros tests que hoy no ves.

### 
