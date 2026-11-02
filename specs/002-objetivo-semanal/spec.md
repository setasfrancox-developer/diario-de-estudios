# Especificación 002 — Objetivo semanal de estudio

Estado: borrador · Fecha: 2026-11-02

## 1. Contexto y objetivo

La app muestra la racha, los minutos semanales y los días del mes, pero no hay una meta que el usuario se ponga a sí mismo. Sin un objetivo explícito, el número semanal de minutos no dice si se está cumpliendo o no.

**Objetivo:** permitir fijar cuántos minutos quiere estudiar cada semana y ver cuánto lleva, para motivarse a cumplirlo. **Por qué:** una meta personal visible y un progreso medible aumentan la motivación y permiten detectar semanas que van por debajo del plan.

## 2. Usuarios

- **Estudiante:** único usuario, sin cuenta; móvil o escritorio.

## 3. Historias de usuario

- **HU-1.** Como estudiante, quiero fijar cuántos minutos quiero estudiar esta semana para tener una meta clara.
- **HU-2.** Como estudiante, quiero ver cuántos minutos llevo y cuántos me faltan para saber si voy bien.
- **HU-3.** Como estudiante, quiero poder cambiar el objetivo en cualquier momento si mis circunstancias cambian.
- **HU-4.** Como estudiante, quiero una señal visual de progreso para sentirme motivado.

## 4. Requisitos funcionales

Notación EARS: «El sistema deberá…» (siempre), «Cuando…» (evento), «Mientras…» (estado), «Si…, entonces…» (situación no deseada).

### RF-1. Objetivo
- **CA-1.1** El sistema deberá permitir fijar un objetivo de minutos por semana mediante un campo numérico y un botón «Guardar objetivo».
- **CA-1.2** El objetivo deberá ser un número entero mayor que 0, sin máximo artificial: se acepta cualquier entero finito positivo. La entrada se valida tras quitar espacios al inicio y final; se acepta solo si es un entero positivo sin signo, sin `e`, `+`, `-`, comas ni puntos decimales (salvo la cadena exacta `"1.0"`, que se normaliza a `1`; cualquier otra cadena con punto, ceros finales, espacios o signos se rechaza). Se rechazan `0120`, `1_000`, `Infinity`, `NaN`, `1 20`, `+120`, `1.00`, ` 1.0 `, `+1.0`, `1.0 ` y similares. Si el valor desborda (no finito), se trata como inválido. Los valores 0, negativos, decimales distintos de entero, vacíos o no numéricos no se guardarán y se mostrará un mensaje de error.- **CA-1.3** El usuario podrá cambiar el objetivo en cualquier momento; el nuevo valor sustituye al anterior (sin historial).
- **CA-1.4** El sistema deberá recordar el objetivo entre sesiones. Clave exacta de `localStorage`: `studyWeeklyGoal`. Se guarda como número serializado como cadena numérica (p. ej. `"120"`) y se lee con `Number`; no altera el formato de las sesiones ni la clave `studySessions`.
- **CA-1.5** Al guardar un objetivo válido, el mensaje de error se limpia y el campo de entrada se vacía.
- **CA-1.6** El objetivo es único y global (no varía por semana): se aplica a la semana actual y a todas las futuras hasta que se cambie.

### RF-2. Progreso semanal
- **CA-2.1** El sistema deberá mostrar los minutos estudiados en la semana actual (lunes a domingo, fecha local), los mismos que cuenta «Minutos esta semana»: se suman todos los registros de la semana, sin deduplicar por día. Las sesiones con minutos inválidos o fecha no válida se ignoran al calcular el progreso semanal.
- **CA-2.2** El sistema deberá mostrar el objetivo fijado y el progreso como «X / Y min» (hechos / objetivo).
- **CA-2.3** El sistema deberá mostrar una barra de progreso que se llene conforme avanza la semana, con porcentaje = min(100, round(hechos/objetivo*100)) usando redondeo estándar (`.5` hacia arriba).
- **CA-2.4** Cuando los minutos hechos superen o igualen el objetivo, la barra quedará completa (100%) y el sistema indicará «Objetivo cumplido». La barra expone `role="progressbar"`, `aria-valuenow` (solo si hay objetivo válido; si no hay objetivo válido no se emite), `aria-valuemin` y `aria-valuemax`, además de `aria-label`.- **CA-2.5** Si los minutos hechos superan el objetivo, el texto seguirá mostrando los minutos reales hechos (no se recorta), solo la barra se limita al 100%.

### RF-3. Sin objetivo
- **CA-3.1** Mientras no haya objetivo fijado (clave ausente o valor inválido, incluido `0` guardado explícitamente), el sistema mostrará un mensaje que invite a fijar uno, en lugar del progreso y la barra. La barra de progreso no se renderiza (o se renderiza oculta) y no se emite `aria-valuenow`.

### RF-4. Ubicación
- **CA-4.1** El sistema mostrará el objetivo semanal en la tarjeta de racha, debajo de «Minutos esta semana», ocupando el ancho completo de la tarjeta.

### RF-5. Actualización
- **CA-5.1** Cuando el usuario guarde una sesión válida, el sistema recalculará el progreso de la semana actual sin recargar la página. Si la página permanece abierta al cambiar de día/semana, el progreso conserva la semana calculada hasta recargar o guardar una sesión.
- **CA-5.2** Cuando el usuario cambie el objetivo (guardar válido), el sistema actualizará el progreso mostrado de inmediato.
- **CA-5.3** La barra y el texto se renderizan también al cargar la página.

### RF-6. Robustez
- **CA-6.1** Si el valor guardado en la clave del objetivo es ilegible o inválido, se tratará como «sin objetivo» sin borrar la clave ni datos de sesiones; no se lanzará error. `null` o cadena vacía se tratan como ausente. Un `0` guardado explícitamente se trata como sin objetivo y, al leer, se ignora sin borrar la clave ni respaldarla. Para valores inválidos distintos de `0`, se crea una copia de respaldo en `localStorage` bajo la clave `studyWeeklyGoal_backup_<timestamp>` (donde `<timestamp>` es la marca temporal en milisegundos del instante de detección, `Date.now()`), con formato idéntico al original (cadena), sin alterar el formato de datos ni la clave original.- **CA-6.2** El cálculo del progreso no modifica ni migra `studySessions`.
- **CA-6.3** Las sesiones con fecha futura, fecha inválida o minutos inválidos se ignoran en el cálculo de la semana actual.
- **CA-6.4** La semana se calcula por fecha local (lunes a domingo), incluyendo los cambios de horario de verano; no se usa UTC.

## 5. Requisitos no funcionales

- **RNF-1. Stack:** sin dependencias, frameworks ni paso de build; sin archivos nuevos, toda la lógica en `app.js`.
- **RNF-2. Lógica pura:** el cálculo del progreso (minutos hechos, porcentaje, cumplido) debe ser una función pura que reciba «hoy» como parámetro, las sesiones y el objetivo, sin DOM ni localStorage.
- **RNF-3. Verificación:** la lógica se prueba con `node --test`; la interfaz se comprueba abriendo `index.html`.
- **RNF-4. Idioma y fechas:** español; fechas en hora local.
- **RNF-5. Datos:** el objetivo se guarda sin cambiar el formato de las sesiones ni la clave `studySessions`.

## 6. Casos límite

- Objetivo de 1 minuto: se cumple con una sola sesión de 1 minuto.
- Varios registros el mismo día: los minutos se suman.
- Semana sin sesiones: progreso 0, barra 0%.
- Minutos hechos superan el objetivo: barra al 100% y estado «cumplido»; minutos mostrados reales.
- Cambio de objetivo a mitad de semana: el progreso se recalcula contra el nuevo objetivo.
- Cambio de objetivo sin guardar sesión nueva en la misma semana: el progreso se recalcula contra el nuevo objetivo.
- Página abierta pasada la medianoche: el progreso conserva la semana anterior hasta recargar o guardar una sesión.
- Sin objetivo fijado: se muestra el mensaje de invitación.
- Objetivo inválido (0, negativo, decimal, vacío, no numérico): no se guarda y se muestra error.
- Valor guardado ilegible: se trata como sin objetivo, sin perder sesiones.
- Objetivo muy grande: porcentaje 0 hasta acumular minutos; sin desbordamiento de la barra.
- Objetivo guardado como 0 explícito: se trata como sin objetivo.
- Sesiones con fecha futura o inválida: se ignoran.
- Múltiples pestañas: no se sincroniza en tiempo real; cada pestaña refleja su estado al recargar.
- Suma de minutos muy grande: se usa número JS (seguro hasta 2^53-1).
- Accesibilidad: la barra de progreso expone `role="progressbar"`, `aria-valuenow`, `aria-valuemin` y `aria-valuemax`.
- Vista móvil: el bloque de objetivo se apila dentro de la tarjeta de racha sin desbordar.
- Entrada `1.0`: se normaliza a `1` y se acepta.

## 7. Fuera de alcance (esta versión)

- Objetivos por día o por mes.
- Historial de objetivos pasados.
- Notificaciones o recordatorios.
- Objetivos compartidos o por tema.
- Celebración animada más allá de un texto.
- Borrar/resetear el objetivo (se cambia sobrescribiendo).
- Edición o borrado de sesiones.

## 8. Criterios de finalización

- Todos los CA se cumplen; la lógica pasa `node --test` en verde y la interfaz se comprueba en el navegador.
- Con las mismas sesiones, la racha, la mejor racha y los datos guardados son idénticos antes y después de añadir el objetivo.
- `AGENTS.md` y `MEMORY.md` actualizados si la spec introduce archivos nuevos o cambia reglas permanentes.