# Tareas — Spec 002: Objetivo semanal de estudio

Ordenadas por dependencia. Cada tarea es pequeña (20–30 min). Marcar con `[x]` al completar.

## Tareas

- [ ] T1. Añadir `validarObjetivo(texto)` a `app.js` (función pura). RF: RF-1. Hecho cuando: devuelve `{valido, valor}` según CA-1.2, incluyendo normalización de `"1.0"` a `1` y rechazo del resto.
- [ ] T2. Añadir `minutosDeLaSemana(sesiones, hoy)` a `app.js` (función pura). RF: RF-2, RF-6. Hecho cuando: suma minutos de la semana local (lunes–domingo), ignora sesiones inválidas, futuras y con fecha inválida, y devuelve 0 si no hay sesiones.
- [ ] T3. Añadir `porcentajeProgreso(hechos, objetivo)` y `objetivoCumplido(hechos, objetivo)` a `app.js`. RF: RF-2. Hecho cuando: porcentaje = min(100, round(hechos/objetivo*100)) con `.5` hacia arriba; devuelve 0 si objetivo inválido; cumplido es booleano.
- [ ] T4. Añadir `leerObjetivoGuardado(valor)` a `app.js` con respaldo para inválidos distintos de `0`. RF: RF-1, RF-6. Hecho cuando: `null`/vacío/`0` → null (sin respaldo); inválido distinto de `0` → null + copia `studyWeeklyGoal_backup_<timestamp>`; válido → número.
- [ ] T5. Exportar las funciones puras para tests (CommonJS envuelto). RF: RNF-2, RNF-3. Hecho cuando: `node --test` puede hacer `require('./app.js')` y llamar a las funciones.
- [ ] T6. Escribir tests en el archivo de tests con casos de la sección 7.2 del plan. RF: RF-1, RF-2, RF-6. Hecho cuando: `node --test` en verde para todas las funciones nuevas.
- [ ] T7. Añadir el bloque de objetivo en `index.html` dentro de la tarjeta de racha, debajo de «Minutos esta semana»: campo numérico, botón «Guardar objetivo», texto «X / Y min», barra con `role="progressbar"`, mensaje de invitación y mensaje de error. RF: RF-1, RF-2, RF-3, RF-4. Hecho cuando: la estructura existe y la barra expone `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (solo si objetivo válido) y `aria-label`.
- [ ] T8. Añadir estilos en `styles.css` para el bloque, la barra, el estado cumplido, el mensaje de invitación y responsive a 480 px. RF: RF-2, RF-3, RF-4. Hecho cuando: el bloque no desborda a 480 px y la barra se llena según porcentaje.
- [ ] T9. Implementar `renderObjetivo()` en `app.js` que lea objetivo y sesiones, calcule progreso y pinte UI condicionalmente. RF: RF-2, RF-3, RF-5.3. Hecho cuando: sin objetivo muestra invitación y oculta barra/`aria-valuenow`; con objetivo muestra texto y barra; al cumplir muestra «Objetivo cumplido».
- [ ] T10. Implementar guardado del objetivo: validar, guardar en `studyWeeklyGoal`, limpiar campo y error, actualizar progreso. RF: RF-1, RF-5.2. Hecho cuando: objetivo válido se persiste, campo se vacía y progreso se actualiza de inmediato; inválido muestra error sin guardar.
- [ ] T11. Llamar a `renderObjetivo()` al guardar una sesión válida y al cargar la página. RF: RF-5.1, RF-5.3. Hecho cuando: guardar sesión recalcula el progreso sin recargar; al cargar se renderiza.
- [ ] T12. Verificación manual en Chrome DevTools a 480 px: progreso, cumplido, invitación, error, persistencia, racha/mejor racha inalterados. RF: todos. Hecho cuando: todos los puntos de la sección 7.3 del plan se cumplen y la consola no muestra errores.
- [ ] T13. Actualizar `MEMORY.md` con el resultado y decisiones. Hecho cuando: `MEMORY.md` refleja el estado tras implementar la spec 002.