# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.

## Estado actual
- v1 funcionando: registrar sesiones (fecha, tema, minutos), racha actual, mejor racha, minutos de la semana, días del mes y lista de sesiones.
- Datos en localStorage.
- Conectado a GitHub (privado): origin → setasfrancox-developer/diario-de-estudios, rama main.
- Diseño renovado: fondo papel azul claro, tinta marino, acento highlighter; cadena de 7 días en el hero.

## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Mejor racha calculada siempre desde las sesiones (no guardada aparte): evita desincronización.
- No se permiten fechas futuras (max en el input + guarda en el submit): una sesión futura inflaba la mejor racha sin contar en la actual.
- Constitución aprobada en `docs/constitution.md` (6 principios): guía de lo innegociable del proyecto.
- Spec 001 (mapa de calor): 12 semanas fijas (lunes a domingo), 5 niveles por tramos fijos de minutos (0, 1-30, 31-60, 61-120, >120), detalle al tocar un día, datos inválidos ignorados sin tocarlos. Fijo y no relativo: más simple de entender y de comprobar.
- Revisión QA 2026-11-02: decisiones en la sección 10 de la spec 001. Convive con las estadísticas actuales, detalle bajo el mapa, teclado con flechas, tests `node --test` + navegador, funciones puras con «hoy», y copia de respaldo antes de sobrescribir datos ilegibles.
- Etiqueta de racha en singular cuando vale 1 ("día seguido"), igual que la mejor racha.
- Minutos semanales calculados al vuelo; semana de lunes a domingo en fecha local.
- Días del mes calculados como días únicos del mes actual (incluye futuras), en fecha local.

## Aprendizajes y errores a evitar
- Las skills se invocan con `@id`, no con `/id`.
- Las skills de Vercel instaladas y luego retiradas no aplican a esta web estática.

## Próximos pasos
- `specs/001-heat-map/spec.md` aprobada y revisada por QA el 2026-11-02; decisiones en la sección 10.
- `specs/001-heat-map/plan.md` creado: arquitectura, funciones puras, pseudocódigo, UI, tests y cobertura de RF.
- `specs/001-heat-map/tasks.md` creado: 21 tareas pequeñas con dependencias y criterios verificables.
- `AGENTS.md` actualizado: archivos autorizados por spec, `node --test`, clave `studySessions` y sin la regla absoluta de tres archivos.
- La protección de datos ilegibles queda incluida en la spec 001 (copia de respaldo antes de escribir).
- Implementación de la spec 001 completada: `heatmap.js`, `heatmap.test.js`, HTML, CSS y app.js.
- Tests: `node --test heatmap.test.js` en verde (13 tests).
- `AGENTS.md` actualizado: archivos autorizados por spec, `node --test`, clave `studySessions` y sin la regla absoluta de tres archivos.
- Siguiente paso: revisión manual en el navegador y ajustes si hace falta.
- `specs/002-objetivo-semanal` implementada y corregida tras revisión: objetivo semanal con validación, progreso, barra y respaldo. Tests: 17/17 en verde.
- `heatmap.js` eliminado: su lógica se ha integrado en `app.js` y los tests se unificaron en `app.test.js`.
- Refactor: racha, mejor racha, minutos semanales y días del mes pasan a funciones puras (sesiones, hoy) y se reutiliza la lógica de fechas de `heatmap.js`. Añadidos `README.md` y `.gitignore`.