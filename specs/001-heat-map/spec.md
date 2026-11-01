# Especificación 001 — Mapa de calor de estudio

Estado: borrador pendiente de aprobación · Fecha: 2026-11-01

## 1. Contexto y objetivo

Hoy la app muestra la racha actual y la mejor racha. Ambas solo dicen si un día cuenta o no: no reflejan cuánto se estudió ni si el hábito se mantiene a lo largo de las semanas, y una racha rota por un solo día puede desanimar.

**Objetivo:** que el usuario vea de un vistazo su constancia y su dedicación de las últimas 12 semanas, con cada día más intenso cuantos más minutos estudió. **Por qué:** dar una imagen completa del hábito (no solo de la cadena actual) ayuda a mantener la motivación y a detectar semanas flojas.

## 2. Usuarios

- **Estudiante:** único usuario de la app, sin cuenta; la usa en móvil o en ordenador.
- **Mantenedor principiante:** persona que empieza a programar y debe poder entender, probar y mantener esta funcionalidad sin herramientas externas (constitución, principios 1 y 4).

## 3. Historias de usuario

- **HU-1.** Como estudiante, quiero ver mis últimas 12 semanas en una sola vista para saber si estoy siendo constante.
- **HU-2.** Como estudiante, quiero que los días con más minutos se vean más intensos para distinguir de un vistazo los días fuertes de los flojos.
- **HU-3.** Como estudiante, quiero consultar los minutos exactos de un día para no depender solo del color.
- **HU-4.** Como estudiante, quiero que el mapa se actualice al guardar una sesión para ver el efecto de inmediato.
- **HU-5.** Como mantenedor principiante, quiero reglas claras y comprobables para verificar la funcionalidad abriendo un archivo en el navegador.

## 4. Requisitos funcionales

Notación EARS: «El sistema deberá…» (siempre), «Cuando…» (evento), «Mientras…» (estado), «Si…, entonces…» (situación no deseada).

### RF-1. Periodo mostrado
El mapa cubre las últimas 12 semanas, de lunes a domingo, incluida la semana actual completa.
- **CA-1.1** El sistema deberá mostrar 84 días agrupados en 12 semanas de lunes a domingo, que terminan en la semana que contiene la fecha de hoy.
- **CA-1.2** Mientras la semana actual no haya terminado, el sistema deberá mostrar sus días posteriores a hoy como no disponibles: sin color de intensidad y sin permitir consultarlos.
- **CA-1.3** El sistema deberá determinar «hoy» y la fecha de cada día según la hora local del usuario.
- **CA-1.4** Cuando el periodo incluya un cambio de horario o de año, el sistema deberá seguir mostrando exactamente 84 días, sin repetir ni omitir ninguno.

### RF-2. Minutos por día
Cada día muestra la suma de los minutos de sus sesiones.
- **CA-2.1** El sistema deberá calcular el total de cada día sumando los minutos de todas las sesiones válidas de esa fecha.
- **CA-2.2** Cuando haya varias sesiones el mismo día, el sistema deberá mostrarlas como un único día con la suma de sus minutos.
- **CA-2.3** El sistema no deberá tener en cuenta en el mapa las sesiones con fecha anterior al primer día mostrado.

### RF-3. Intensidad por tramos
La intensidad depende solo de los minutos del propio día, con tramos fijos.
- **CA-3.1** Cuando el total de un día sea 0 minutos, el sistema deberá mostrarlo con el nivel 0 (sin color de estudio).
- **CA-3.2** Cuando el total esté entre 1 y 30 minutos, el sistema deberá mostrarlo con el nivel 1.
- **CA-3.3** Cuando el total esté entre 31 y 60 minutos, el sistema deberá mostrarlo con el nivel 2.
- **CA-3.4** Cuando el total esté entre 61 y 120 minutos, el sistema deberá mostrarlo con el nivel 3.
- **CA-3.5** Cuando el total sea superior a 120 minutos, el sistema deberá mostrarlo con el nivel 4, que es el máximo.
- **CA-3.6** El sistema deberá mostrar con el mismo aspecto todos los días del mismo nivel, sin que cambie por lo que ocurra en otros días.
- **CA-3.7** El sistema deberá hacer que cada nivel sea visualmente más intenso que el anterior.

### RF-4. Detalle de un día
- **CA-4.1** Cuando el usuario toque, señale o enfoque con el teclado un día disponible, el sistema deberá mostrar su fecha en formato AAAA-MM-DD y su total de minutos, por ejemplo «2026-10-30 · 45 min».
- **CA-4.2** Cuando el día disponible no tenga minutos, el sistema deberá mostrar «0 min».
- **CA-4.3** El sistema deberá permitir llegar a todos los días disponibles usando solo el teclado.
- **CA-4.4** Cuando el usuario seleccione otro día, el sistema deberá mostrar solo el detalle del nuevo día.
- **CA-4.5** El sistema no deberá permitir editar ni borrar sesiones desde el mapa, ni filtrar la lista de sesiones.

### RF-5. Actualización
- **CA-5.1** Cuando el usuario guarde una sesión válida, el sistema deberá actualizar el mapa sin necesidad de recargar la página.
- **CA-5.2** Cuando el usuario abra o recargue la página, el sistema deberá mostrar el mapa con todas las sesiones guardadas.

### RF-6. Datos no válidos
- **CA-6.1** Si una sesión guardada tiene una fecha que no es una fecha válida AAAA-MM-DD, o unos minutos que no son un número mayor que 0, entonces el sistema deberá ignorarla al construir el mapa.
- **CA-6.2** Si una sesión guardada tiene una fecha posterior a hoy, entonces el sistema deberá ignorarla al construir el mapa.
- **CA-6.3** Si hay sesiones ignoradas, el sistema no deberá modificarlas ni borrarlas de lo guardado.
- **CA-6.4** Si hay sesiones ignoradas, el sistema deberá seguir mostrando el resto del mapa y el resto de la app sin errores visibles.
- **CA-6.5** Si los datos guardados no se pueden leer, entonces el sistema deberá mostrar el mapa como si no hubiera sesiones y el mapa no deberá modificar ni borrar esos datos.

### RF-7. Sin sesiones
- **CA-7.1** Mientras no haya sesiones válidas dentro del periodo, el sistema deberá mostrar los 84 días en nivel 0 (los futuros de la semana actual, como no disponibles) y no deberá mostrar ningún mensaje de error.

### RF-8. Independencia del resto de la app
- **CA-8.1** El sistema no deberá cambiar el formato de las sesiones guardadas.
- **CA-8.2** El sistema no deberá alterar el cálculo de la racha actual ni de la mejor racha.

## 5. Requisitos no funcionales

- **RNF-1. Stack:** sin dependencias, frameworks ni paso de build (constitución, principio 1).
- **RNF-2. Reglas aisladas:** las reglas del periodo, la suma por día y los niveles deben poder comprobarse sin interfaz (principio 3).
- **RNF-3. Verificable sin instalar nada:** cada criterio de aceptación debe tener una comprobación que se ejecute abriendo un archivo en el navegador (principio 4).
- **RNF-4. Móvil:** con 375 px de ancho, las 12 semanas se ven completas, sin desplazamiento horizontal y dentro del ancho máximo actual de la app (480 px).
- **RNF-5. Accesibilidad:** el significado de un día no debe depender solo del color; cada día disponible debe tener una descripción textual (fecha y minutos) accesible con teclado y lectores de pantalla.
- **RNF-6. Idioma y fechas:** textos en español y fechas AAAA-MM-DD en hora local (principio 6).
- **RNF-7. Rendimiento:** sin retraso perceptible con cientos de sesiones guardadas.
- **RNF-8. Datos:** el mapa solo lee las sesiones; nunca las borra ni las sobrescribe (principio 5).

## 6. Casos límite

- Varias sesiones el mismo día: se suman en un único día.
- Frontera entre niveles: 30 → nivel 1; 31 → nivel 2; 60 → nivel 2; 61 → nivel 3; 120 → nivel 3; 121 → nivel 4.
- Sesión de 1 minuto: nivel 1. Día con muchas horas (por ejemplo 1.440 min): nivel 4 y se muestra el total real.
- Primer día (lunes de hace 11 semanas) y último día del periodo (domingo de la semana actual).
- Cambio de horario (el 25 de octubre de 2026 cae dentro del periodo actual) y cambio de año: siguen siendo 84 días distintos.
- Sesiones anteriores al periodo: siguen guardadas y no se muestran.
- Sesión con fecha futura guardada a mano: se ignora en el mapa.
- Primer uso, sin ninguna sesión.
- Datos guardados ilegibles o con entradas mal formadas.

## 7. Fuera de alcance (esta versión)

- Cambiar el número de semanas o los tramos de minutos.
- Navegar a semanas anteriores a las 12 mostradas.
- Editar o borrar sesiones desde el mapa.
- Etiquetas de meses o de días de la semana.
- Exportar el mapa como imagen.
- Modo oscuro o temas de color.
- Aviso al usuario cuando haya sesiones no válidas.

## 8. Criterios de finalización

- Todos los criterios de aceptación (CA) se cumplen y cada uno tiene su comprobación en el navegador, sin dependencias.
- Prueba manual a 375 px de ancho: las 12 semanas se ven completas y no hay errores en la consola.
- Con las mismas sesiones, la racha, la mejor racha y los datos guardados son idénticos antes y después de añadir el mapa.
- `AGENTS.md` y `MEMORY.md` actualizados en el mismo cambio (principio 2).
- Las dudas abiertas están resueltas o aceptadas expresamente por el usuario.
- El usuario ha aprobado esta especificación.

## 9. Dudas abiertas

- **[NECESITA ACLARACIÓN]** Posición del mapa en la página. Propuesta: entre la tarjeta de racha y el formulario.
- **[NECESITA ACLARACIÓN]** ¿Debe haber una leyenda que explique los niveles (por ejemplo, «Menos … Más»)? No está en el alcance ni fuera de él.
- **[NECESITA ACLARACIÓN]** Si la página queda abierta pasada la medianoche, ¿debe cambiar sola el «hoy» del mapa o basta con recargar o guardar una sesión?
- **[NECESITA ACLARACIÓN]** Con 12 columnas en 375 px, cada día mide bastante menos que el tamaño táctil recomendado (unos 44 px). ¿Se acepta para esta versión?
- **[NECESITA ACLARACIÓN]** Para quien no distingue bien los colores, ¿basta con el detalle textual (RNF-5) o se necesita otra señal visual entre niveles?
- **[NECESITA ACLARACIÓN]** `AGENTS.md` dice «solo tres archivos» y pide preguntar antes de crear archivos, pero los principios 3 y 4 de la constitución probablemente exigen archivos nuevos. ¿Se permiten?
- **[NECESITA ACLARACIÓN]** Hoy, si los datos guardados no se pueden leer, la app los sobrescribe al guardar la siguiente sesión (choca con el principio 5). Esta spec no lo cubre: ¿se trata en una spec aparte?
