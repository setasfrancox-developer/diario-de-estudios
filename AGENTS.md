# AGENTS.md — Diario de Estudio

Web para registrar sesiones de estudio y ver la racha de días seguidos estudiando. Para un solo usuario, sin backend ni cuentas.

## Stack y estructura
- HTML, CSS y JavaScript puros, sin frameworks ni dependencias.
- Solo tres archivos: `index.html`, `styles.css`, `app.js`.
- `index.html`: estructura y formulario (fecha, tema, minutos).
- `styles.css`: estilos, diseño responsive (max-width 480px).
- `app.js`: lógica, validación, racha, render y persistencia.

## Comandos
- No hay build ni tests. Abrir `index.html` con doble clic en el navegador.

## Convenciones
- Textos de interfaz en español.
- Fechas en formato `YYYY-MM-DD` y siempre en zona horaria local (nunca UTC).
- Sin añadir archivos, dependencias ni librerías.
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
- Al terminar, resume que has cambiado y cualquier desicion que deba revisar.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
  porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
  dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Comandos
- Tests: `node --test`

## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código.

## Límites
- ✅ Siempre: modificar los tres archivos existentes, mantener el diseño responsive.
- ✅ Siempre: actualizar 'MEMORY.MD' al terminar cada tarea
- ⚠ Pregunta antes: crear archivos, cambiar el formato de los datos guardados.
- 🚫 Nunca:  añadir dependencias, frameworks o paso de build.

## Verificación
- No hay tests automáticos. Después de cada cambio, verifica con el MCP de Chrome
DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la
vista móvil.
-Para empezar de cero: DevTools - Application - Local Storage - borrar clave 'diario-estudio-sesiones'.