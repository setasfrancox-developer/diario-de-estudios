# Tareas — Spec 001: Mapa de calor de estudio

Cada tarea debe durar entre 20 y 30 minutos. Orden de dependencia: de arriba a abajo. No se avanza con tests en rojo (principio 4).

- [x] **T1. Preparar `heatmap.js` y `heatmap.test.js`.**
  - Crear ambos archivos vacíos con exportación compatible con navegador y `require`.
  - RF: RNF-2, RNF-3.
  - Hecho cuando: `node --test heatmap.test.js` ejecuta sin errores de carga y los archivos existen.

- [ ] **T2. Implementar `esFechaValida(texto)`.**
  - Validar formato exacto `AAAA-MM-DD` y fecha de calendario real.
  - RF: RF-6.
  - Hecho cuando: los tests de fechas válidas e inválidas pasan.

- [ ] **T3. Implementar `esMinutoValido(valor)`.**
  - Validar entero finito mayor que 0.
  - RF: RF-6.
  - Hecho cuando: los tests de minutos válidos e inválidos pasan.

- [ ] **T4. Implementar `obtenerLunes(texto)` y `sumarDias(texto, n)`.**
  - Usar `Date` local y `setDate`, nunca milisegundos.
  - RF: RF-1.
  - Hecho cuando: los tests de lunes, días anteriores y días posteriores pasan.

- [ ] **T5. Implementar `generarPeriodo(hoy)`.**
  - Generar exactamente 84 días de lunes a domingo, terminando en la semana de `hoy`.
  - RF: RF-1.
  - Hecho cuando: los tests del periodo, DST, cambio de año y 29 de febrero pasan.

- [ ] **T6. Implementar `calcularNivel(minutos)`.**
  - Aplicar los tramos 0, 1–30, 31–60, 61–120, >120.
  - RF: RF-3.
  - Hecho cuando: los tests de fronteras pasan.

- [ ] **T7. Implementar `sumarMinutosPorDia(sesiones, hoy)`.**
  - Validar entradas, ignorar inválidas, futuras y anteriores al periodo, y sumar por día.
  - RF: RF-2, RF-6, RF-7.
  - Hecho cuando: los tests de suma, entradas inválidas, futuras y fuera del periodo pasan.

- [ ] **T8. Implementar `construirMapa(sesiones, hoy)`.**
  - Orquestar periodo, sumas, disponibilidad y niveles.
  - RF: RF-1, RF-2, RF-3, RF-6, RF-7.
  - Hecho cuando: los tests de mapa vacío, mapa con sesiones, no mutación y determinismo pasan.

- [ ] **T9. Implementar `formatearDetalle(fecha, minutos)` y `resolverSeleccion(fechaSeleccionada, mapa, hoy)`.**
  - Formato exacto `AAAA-MM-DD · N min`; conservar o resetear la selección.
  - RF: RF-4, RF-5.
  - Hecho cuando: los tests de formato y resolución de selección pasan.

- [ ] **T10. Añadir test de rendimiento funcional.**
  - Comprobar que `construirMapa` termina correctamente con 1.000 sesiones.
  - RF: RNF-7.
  - Hecho cuando: el test pasa y no introduce fragilidad en la suite.

- [ ] **T11. Ejecutar `node --test heatmap.test.js` hasta tener todo en verde.**
  - Corregir cualquier test fallido antes de seguir.
  - RF: RF-1, RF-2, RF-3, RF-4, RF-6, RF-7, RNF-3.
  - Hecho cuando: todos los tests pasan y no hay tests en rojo.

- [ ] **T12. Añadir la sección del mapa en `index.html`.**
  - Insertar grid, detalle y leyenda entre la tarjeta de racha y el formulario.
  - Cargar `heatmap.js` antes de `app.js`.
  - RF: RF-4, RF-9, RF-10.
  - Hecho cuando: la página abre sin errores de consola y la sección aparece en el lugar indicado.

- [ ] **T13. Añadir estilos del mapa en `styles.css`.**
  - Grid 12×7, niveles 0–4, no disponibles, foco, detalle, leyenda y responsive a 375 px.
  - RF: RF-1, RF-3, RF-4, RF-7, RF-9, RNF-4, RNF-5.
  - Hecho cuando: las 12 semanas se ven completas sin scroll horizontal a 375 px.

- [ ] **T14. Integrar el render del mapa en `app.js`.**
  - Pintar el mapa inicial con las sesiones guardadas.
  - RF: RF-1, RF-2, RF-3, RF-4, RF-7, RF-10.
  - Hecho cuando: el mapa muestra el nivel correcto para un día con sesión guardada.

- [ ] **T15. Añadir interacción del mapa en `app.js`.**
  - Vista previa al pasar el puntero, selección por clic/tap/foco, teclado con flechas, Inicio/Fin, Enter/Espacio y roving tabindex.
  - RF: RF-4, RF-5.
  - Hecho cuando: se puede recorrer y seleccionar días disponibles solo con teclado.

- [ ] **T16. Actualizar el mapa al guardar una sesión.**
  - Recalcular «hoy», reconstruir el mapa y conservar o resetear la selección.
  - RF: RF-5.
  - Hecho cuando: al guardar una sesión, el mapa cambia sin recargar la página.

- [ ] **T17. Añadir la capa de almacenamiento con respaldo.**
  - Leer datos ilegibles sin sobrescribirlos y guardar una copia antes de escribir.
  - RF: RF-6, RNF-8.
  - Hecho cuando: con datos ilegibles en localStorage, el mapa queda vacío y el dato original se conserva en la clave de respaldo al guardar.

- [ ] **T18. Verificar que el resto de la app no cambia.**
  - Comprobar racha, mejor racha, cadena de 7 días, minutos semanales y días del mes.
  - RF: RF-8.
  - Hecho cuando: con las mismas sesiones, esos valores son idénticos antes y después de añadir el mapa.

- [ ] **T19. Prueba manual en Chrome DevTools.**
  - Probar a 375 px, teclado, consola, detalle, leyenda, guardar, recargar y datos ilegibles.
  - RF: RF-1, RF-3, RF-4, RF-5, RF-7, RF-9, RF-10, RNF-4, RNF-5.
  - Hecho cuando: todas las comprobaciones pasan sin errores en la consola.

- [ ] **T20. Actualizar `MEMORY.md`.**
  - Registrar resultado, decisiones nuevas y el estado del proyecto.
  - Hecho cuando: `MEMORY.md` refleja la implementación terminada y sigue por debajo de ~50 líneas.

- [ ] **T21. Ejecutar verificación final.**
  - Ejecutar `node --test` y revisar la interfaz una última vez.
  - RF: RNF-3, RNF-4.
  - Hecho cuando: los tests están en verde y la app abre con doble clic sin errores.