# AGENTS.md — Diario de Estudio

Web para registrar sesiones de estudio y ver la racha de días seguidos estudiando. Para un solo usuario, sin backend ni cuentas.

## Stack y estructura
- HTML, CSS y JavaScript puros, sin frameworks ni dependencias.
- Tres archivos base: `index.html`, `styles.css`, `app.js`.
- Archivos adicionales solo si la spec activa los autoriza (por ejemplo, `heatmap.js` y `heatmap.test.js`).
- `index.html`: estructura y formulario (fecha, tema, minutos).
- `styles.css`: estilos, diseño responsive (max-width 480px).
- `app.js`: lógica, validación, racha, render y persistencia.

## Comandos
- Tests de lógica: `node --test`.
- Abrir `index.html` con doble clic en el navegador.

## Convenciones
- Textos de interfaz en español.
- Fechas en formato `YYYY-MM-DD` y siempre en zona horaria local (nunca UTC).
- Sin dependencias ni librerías. Archivos nuevos solo si la spec los autoriza.
- Código simple y legible.

## Reglas de dominio / trampas conocidas
- Un día cuenta si tiene al menos una sesión.
- La racha son los días consecutivos con sesión que terminan hoy.
- Si hoy aún no se ha estudiado pero ayer sí, la racha sigue viva hasta que termine el día.
- Varios registros el mismo día no aumentan la racha.
- Los datos se guardan en `localStorage` bajo la clave `studySessions`.

## Forma de trabajar
- Haz solo lo que se te pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y directos. Explicar al terminar qué se hizo.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
  porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
  dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código.

## Límites
- ✅ Siempre: mantener los tres archivos base, el diseño responsive y `MEMORY.md` actualizado.
- ✅ Siempre: mantener la lógica en funciones puras que reciben «hoy» y tienen tests con `node --test`.
- ⚠ Pregunta antes: crear archivos no previstos por la spec o cambiar el formato de los datos guardados.
- 🚫 Nunca: añadir dependencias, frameworks o paso de build; usar UTC para fechas.

## Verificación
- Lógica: `node --test` en verde.
- Interfaz: abre `index.html` con el MCP de Chrome DevTools, prueba la funcionalidad, revisa la consola y comprueba la vista móvil.
- Para empezar de cero: DevTools → Application → Local Storage → borrar la clave `studySessions`.