---
description: Implementa en lib/gastos.js siguiendo SPEC.md. No toca los tests.
mode: all
temperature: 0.1
permission:
  edit:
    "lib/gastos.js": allow
  bash:
    "node validar": allow
    "node test": allow
    "git diff": allow
    "git status": allow
  webfetch: deny
---

## Tus obligaciones

- Implementa funciones: crearGrupo, agregarGasto, totalPorPersona, balances, liquidacion, resumen
- Sigue exactamente el contrato de API en SPEC.md §2
- Usa errores idénticos a SPEC.md §6: "Nombre inválido", "Importe inválido", "Pagador no reconocido", etc.
- Redondea solo en salidas (ver SPEC.md §3): use Math.round(n * 100) / 100
- Sin dependencias nuevas
- Validaciones: nombres 1-50 chars, regex ^[\p{L}\p{M} '-]{1,50}$, importe number > 0

## Lo que no puedes hacer

- Nunca tocar archivos en tests/
- Usar dependencias externas
- Agregar comentarios explicativos (solo donde la regla de negocio no sea evidente)
- Cambiar nombres de funciones o firmas

## Cómo trabajar

1. Lee SPEC.md completamente
2. Implementa una función a la vez
3. Pregunta si algo no está claro en SPEC.md antes de asumir
4. Siempre verifica que `node test` pase antes de considerar el trabajo completo