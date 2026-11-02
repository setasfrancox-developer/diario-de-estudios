# Especificación 001 — Mapa de calor de estudio

Estado: aprobada, incluidas las decisiones de las secciones 9 y 10 · Fecha: 2026-11-01 · Revisión QA: 2026-11-02

## 1. Contexto y objetivo

Hoy la app muestra la racha actual, la mejor racha, la cadena de 7 días, los minutos semanales y los días del mes. Ninguna de estas vistas refleja cuánto se estudió cada día ni si el hábito se mantiene a lo largo de las semanas, y una racha rota por un solo día puede desanimar.

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
El mapa cubre las últimas 12 semanas, de lunes a domingo, con las 84 celdas siempre presentes.
- **CA-1.1** El sistema deberá mostrar 84 días agrupados en 12 semanas de lunes a domingo, que terminan en la semana que contiene la fecha de hoy.
- **CA-1.2** Mientras la semana actual no haya terminado, el sistema deberá mostrar sus días posteriores a hoy como no disponibles: con tratamiento visual atenuado o tramado, sin color de intensidad, sin foco de teclado y sin permitir consultarlos.
- **CA-1.3** El sistema deberá determinar «hoy» y la fecha de cada día según la hora local del usuario.
- **CA-1.4** Cuando el periodo incluya un cambio de horario o de año, el sistema deberá seguir mostrando exactamente 84 días, sin repetir ni omitir ninguno.

### RF-2. Minutos por día
Cada día muestra la suma de los minutos de sus sesiones.
- **CA-2.1** El sistema deberá calcular el total de cada día sumando los minutos de todas las sesiones válidas de esa fecha.
- **CA-2.2** Cuando haya varias sesiones el mismo día, el sistema deberá mostrarlas como un único día con la suma de sus minutos.
- **CA-2.3** El sistema no deberá tener en cuenta en el mapa las sesiones con fecha anterior al primer día mostrado.

### RF-3. Intensidad por tramos
La intensidad depende solo de los minutos del propio día, con tramos fijos.
- **CA-3.1** Cuando el total de un día disponible sea 0 minutos, el sistema deberá mostrarlo con el nivel 0 (fondo base, sin color de estudio).
- **CA-3.2** Cuando el total esté entre 1 y 30 minutos, el sistema deberá mostrarlo con el nivel 1.
- **CA-3.3** Cuando el total esté entre 31 y 60 minutos, el sistema deberá mostrarlo con el nivel 2.
- **CA-3.4** Cuando el total esté entre 61 y 120 minutos, el sistema deberá mostrarlo con el nivel 3.
- **CA-3.5** Cuando el total sea superior a 120 minutos, el sistema deberá mostrarlo con el nivel 4, que es el máximo.
- **CA-3.6** El sistema deberá mostrar con el mismo aspecto todos los días del mismo nivel, sin que cambie por lo que ocurra en otros días.
- **CA-3.7** El sistema deberá hacer que cada nivel sea visualmente más intenso que el anterior, con una diferencia de luminosidad y no solo de tono, para que se distingan también sin percibir bien los colores.

### RF-4. Detalle de un día
- **CA-4.1** Cuando el usuario pase el puntero, toque o enfoque con el teclado un día disponible, el sistema deberá mostrar su fecha con el nombre del mes y su total de minutos. Al hacer clic, tap o enfocar, el día quedará seleccionado.
- **CA-4.2** Cuando el día disponible no tenga minutos, el sistema deberá mostrar «D de mes de AAAA · 0 min».
- **CA-4.3** El sistema deberá permitir llegar a todos los días disponibles usando solo el teclado.
- **CA-4.4** Cuando el usuario seleccione otro día, el sistema deberá mostrar solo el detalle del nuevo día.
- **CA-4.5** El sistema no deberá permitir editar ni borrar sesiones desde el mapa, ni filtrar la lista de sesiones.
- **CA-4.6** Al cargar la página, el sistema deberá seleccionar el día de hoy y mostrar su detalle.
- **CA-4.7** El sistema deberá mostrar el detalle en una línea situada bajo el mapa y encima de la leyenda, con el formato exacto «D de mes de AAAA · N min», también cuando N sea 0, y anunciarlo en una región `aria-live="polite"`.

### RF-5. Actualización
- **CA-5.1** Cuando el usuario guarde una sesión válida, el sistema deberá actualizar el mapa sin necesidad de recargar la página.
- **CA-5.2** Cuando el usuario abra o recargue la página, el sistema deberá mostrar el mapa con todas las sesiones guardadas.
- **CA-5.3** Cuando el usuario guarde una sesión, el sistema deberá volver a calcular qué día es hoy y qué 12 semanas se muestran.

### RF-6. Datos no válidos
- **CA-6.1** Si una sesión guardada tiene una fecha que no cumple exactamente `AAAA-MM-DD` con una fecha de calendario real, o unos minutos que no son un entero finito mayor que 0, entonces el sistema deberá ignorarla al construir el mapa. También deberá ignorar entradas que no sean objetos o a las que les falte `date` o `minutes`.
- **CA-6.2** Si una sesión guardada tiene una fecha posterior a hoy, entonces el sistema deberá ignorarla al construir el mapa.
- **CA-6.3** Si hay sesiones ignoradas, el sistema no deberá modificarlas ni borrarlas de lo guardado.
- **CA-6.4** Si hay sesiones ignoradas, el sistema deberá seguir mostrando el resto del mapa y el resto de la app sin errores visibles.
- **CA-6.5** Si los datos guardados no se pueden leer o no son un array, entonces el sistema deberá mostrar el mapa como si no hubiera sesiones y no deberá modificar ni borrar esos datos.
- **CA-6.6** Antes de sobrescribir datos ilegibles, el sistema deberá conservar el valor original en una clave de respaldo `studySessions_backup_<timestamp>`; solo después podrá escribir datos nuevos.

### RF-7. Sin sesiones
- **CA-7.1** Mientras no haya sesiones válidas dentro del periodo, el sistema deberá mostrar los 84 días: desde el inicio del periodo hasta hoy en nivel 0 y los posteriores a hoy como no disponibles. No deberá mostrar ningún mensaje de error.

### RF-8. Independencia del resto de la app
- **CA-8.1** El sistema no deberá cambiar el formato de las sesiones guardadas ni la clave `studySessions`.
- **CA-8.2** El sistema no deberá alterar el cálculo de la racha actual ni de la mejor racha.
- **CA-8.3** El sistema deberá mantener la cadena de 7 días, los minutos semanales y los días del mes; el mapa se añade sin sustituirlos.

### RF-9. Leyenda
- **CA-9.1** El sistema deberá mostrar bajo el mapa una leyenda con los cinco niveles (0 a 4) ordenados de menos a más, con los textos «Menos» y «Más» en los extremos.
- **CA-9.2** El sistema no deberá permitir seleccionar ni consultar los elementos de la leyenda como si fueran días.
- **CA-9.3** Cada nivel de la leyenda deberá tener una etiqueta accesible que indique su rango de minutos: «0 min», «1-30 min», «31-60 min», «61-120 min» y «más de 120 min».

### RF-10. Ubicación
- **CA-10.1** El sistema deberá mostrar el mapa en la página entre la tarjeta de racha y el formulario de nueva sesión.

## 5. Requisitos no funcionales

- **RNF-1. Stack:** sin dependencias, frameworks ni paso de build (constitución, principio 1).
- **RNF-2. Reglas aisladas:** las reglas del periodo, la suma por día y los niveles deben ser funciones puras, sin DOM ni localStorage, que reciban «hoy» como parámetro (principio 3).
- **RNF-3. Verificable sin instalar nada:** la lógica se probará con `node --test` y la interfaz se comprobará abriendo `index.html` en el navegador. Ambas verificaciones son obligatorias (principio 4).
- **RNF-4. Móvil:** con 375 px de ancho, las 12 semanas se ven completas, sin desplazamiento horizontal y dentro del ancho máximo actual de la app (480 px). En esta versión se acepta que cada día sea más pequeño que el tamaño táctil recomendado (unos 44 px); el detalle se consulta tocando y se asume el riesgo de precisión.
- **RNF-5. Accesibilidad:** el significado de un día no debe depender solo del color; cada día disponible debe tener una descripción textual (fecha y minutos) accesible con teclado y lectores de pantalla.
- **RNF-6. Idioma y fechas:** código, interfaz y documentación en español; fechas AAAA-MM-DD en hora local (principio 6).
- **RNF-7. Rendimiento:** con hasta 1.000 sesiones guardadas, el mapa deberá renderizarse en menos de 100 ms en un navegador de escritorio actual.
- **RNF-8. Datos:** el mapa solo lee las sesiones; nunca las borra ni las sobrescribe. Si los datos son ilegibles, la app conserva una copia antes de escribir (principio 5).
- **RNF-9. Estructura:** se permiten `heatmap.js` (lógica pura) y `heatmap.test.js` (`node --test`), además de los tres archivos base. Los scripts deberán cargarse de forma clásica para que `index.html` siga funcionando con doble clic.

## 6. Casos límite

- Varias sesiones el mismo día: se suman en un único día.
- Frontera entre niveles: 30 → nivel 1; 31 → nivel 2; 60 → nivel 2; 61 → nivel 3; 120 → nivel 3; 121 → nivel 4.
- Sesión de 1 minuto: nivel 1. Día con muchas horas (por ejemplo 1.440 min): nivel 4 y se muestra el total real.
- Primer día (lunes de hace 11 semanas) y último día del periodo (domingo de la semana actual).
- Cambio de horario (el 25 de octubre de 2026 cae dentro del periodo actual), cambio de año y 29 de febrero: siguen siendo 84 días distintos.
- Sesiones anteriores al periodo: siguen guardadas y no se muestran.
- Sesión con fecha futura guardada a mano: se ignora en el mapa.
- Página abierta pasada la medianoche: el mapa conserva el «hoy» anterior hasta que se recargue la página o se guarde una sesión (CA-5.3).
- Primer uso, sin ninguna sesión.
- Datos guardados ilegibles, que no son un array o con entradas mal formadas (incluidas `null`, campos ausentes y tipos incorrectos).
- Minutos decimales, `Infinity`, `NaN`, cadenas numéricas o valores enormes: se ignoran por no ser enteros finitos mayores que 0.
- Fechas de calendario imposibles como `2026-02-30` o formatos distintos de `AAAA-MM-DD`: se ignoran.
- Guardado mientras hay datos ilegibles: se crea la copia de respaldo antes de escribir.
- Varias pestañas abiertas: no se exige sincronización automática entre ellas.
- Detalle seleccionado al guardar una sesión: se conserva el día seleccionado si sigue disponible; si no, se selecciona hoy.
- Ancho menor de 375 px o zoom de texto: no se garantiza que las 12 semanas quepan sin desplazamiento.

## 7. Fuera de alcance (esta versión)

- Cambiar el número de semanas o los tramos de minutos.
- Navegar a semanas anteriores a las 12 mostradas.
- Editar o borrar sesiones desde el mapa.
- Etiquetas de meses o de días de la semana.
- Exportar el mapa como imagen.
- Modo oscuro o temas de color.
- Aviso al usuario cuando haya sesiones no válidas.
- Actualización automática del mapa al pasar la medianoche con la página abierta.
- Ampliar el tamaño de los días para cumplir el tamaño táctil recomendado.

## 8. Criterios de finalización

- Todos los criterios de aceptación (CA) se cumplen. La lógica pasa `node --test` en verde y cada CA de interfaz tiene su comprobación en el navegador, sin dependencias.
- Prueba manual a 375 px de ancho: las 12 semanas se ven completas y no hay errores en la consola.
- Con las mismas sesiones, la racha, la mejor racha y los datos guardados son idénticos antes y después de añadir el mapa.
- `AGENTS.md` (con la estructura de archivos permitida por esta spec) y `MEMORY.md` actualizados en el mismo cambio (principio 2).
- El usuario ha revisado las decisiones de las secciones 9 y 10 y las acepta.

## 9. Dudas resueltas el 2026-11-01

No quedan dudas pendientes de esta ronda. Las siete dudas del borrador se resolvieron por delegación del usuario («decide tú») el 2026-11-01:

1. **Ubicación del mapa:** entre la tarjeta de racha y el formulario (RF-10). Por qué: lo primero que se ve es el progreso y el formulario queda a mano justo debajo.
2. **Leyenda:** sí, con «Menos … Más» (RF-9). Por qué: sin ella el significado de los colores no es evidente.
3. **Medianoche con la página abierta:** no se actualiza sola; se recalcula al recargar o al guardar una sesión (CA-5.3). Por qué: es lo más simple y el caso es poco frecuente.
4. **Tamaño táctil:** se acepta en esta versión que los días sean pequeños (RNF-4). Por qué: 12 semanas caben en 375 px y el detalle también funciona con teclado.
5. **Distinguir niveles sin ver bien los colores:** los niveles difieren en luminosidad (CA-3.7) y cada día tiene descripción textual (RNF-5).
6. **Archivos nuevos:** se permiten los necesarios para separar las reglas de la interfaz y para sus comprobaciones, sin dependencias. `AGENTS.md` ya se actualizó para reflejarlo. Por qué: los principios 3 y 4 de la constitución no se pueden cumplir con solo tres archivos.
7. **Datos ilegibles sobrescritos al guardar:** se incluye en esta spec la copia de respaldo obligatoria antes de escribir (CA-6.6), para cumplir el principio 5.

## 10. Decisiones de la revisión QA (2026-11-02)

Estas decisiones prevalecen sobre cualquier ambigüedad del resto de la spec.

1. **Convivencia con la interfaz actual:** se mantienen la cadena de 7 días, los minutos semanales y los días del mes. El mapa se añade entre la tarjeta de racha y el formulario, sin sustituir nada.
2. **Días disponibles:** desde el lunes de hace 11 semanas hasta hoy, ambos inclusive, tengan o no sesiones. Los posteriores a hoy de la semana actual son no disponibles y no reciben foco.
3. **Detalle inicial:** al cargar se selecciona hoy y se muestra su detalle.
4. **Interacción:** el puntero muestra una vista previa al pasar por encima; clic, tap o foco seleccionan y el detalle persiste. No hay deselección explícita: seleccionar otro día reemplaza al anterior.
5. **Detalle:** se muestra en una línea bajo el mapa y encima de la leyenda, con formato exacto `AAAA-MM-DD · N min` (también `0 min`), dentro de una región `aria-live="polite"`.
6. **Minutos válidos:** solo enteros finitos mayores que 0. Decimales, cadenas numéricas, `Infinity`, `NaN`, negativos y 0 invalidan la sesión para el mapa.
7. **Fechas válidas:** coincidencia exacta con `^\d{4}-\d{2}-\d{2}$` y fecha de calendario real en hora local. Cualquier otra forma se ignora.
8. **Datos mal formados:** se ignoran las entradas que no sean objetos o que no tengan `date` y `minutes` válidos. Si el JSON no es un array, se considera ilegible.
9. **No disponible frente a nivel 0:** los días no disponibles usan un tratamiento visual atenuado o tramado y no son interactivos; el nivel 0 usa el fondo base. Ninguno de los dos lleva color de estudio.
10. **Teclado:** el mapa tiene un único punto de tabulación; las flechas recorren los días disponibles, Inicio/Fin van al primero/último y Enter/Espacio seleccionan. Los no disponibles se saltan.
11. **Lector de pantalla:** cada día disponible expone `AAAA-MM-DD: N minutos` como nombre accesible; el detalle se anuncia en la región viva; la leyenda tiene etiquetas accesibles por nivel.
12. **Leyenda:** incluye los niveles 0 a 4, con «Menos» y «Más» visibles en los extremos y las etiquetas accesibles de CA-9.3. No es interactiva.
13. **Rendimiento:** se considera aceptable un render inferior a 100 ms con hasta 1.000 sesiones guardadas.
14. **Móvil:** se mantiene el mapa compacto aunque las celdas queden por debajo de 44 px. El detalle se consulta tocando; se acepta el riesgo de precisión en esta versión. Por debajo de 375 px o con zoom de texto no se garantiza que quepa sin desplazamiento.
15. **Archivos:** se permiten `heatmap.js` (lógica pura) y `heatmap.test.js` (`node --test`), además de `index.html`, `styles.css` y `app.js`. Los scripts se cargan de forma clásica, sin módulos ES, para que el doble clic siga funcionando.
16. **Verificación:** `node --test` en verde para la lógica y comprobación manual en Chrome DevTools para la interfaz. Las dos son obligatorias.
17. **Funciones puras:** las reglas de periodo, suma por día y niveles reciben «hoy» como parámetro y no acceden a DOM ni localStorage.
18. **Datos ilegibles:** el mapa se muestra vacío, la app sigue funcionando y, antes de cualquier escritura, el valor original se copia a `studySessions_backup_<timestamp>`. Nunca se pierde el dato original.
19. **Almacenamiento:** clave `studySessions` y formato `{ id, date, topic, minutes }` sin cambios.
20. **Documentación:** `AGENTS.md` se actualiza para permitir los archivos autorizados por la spec, exigir `node --test`, corregir la clave de localStorage y eliminar la regla absoluta de «solo tres archivos».
21. **Selección tras guardar:** si el día seleccionado sigue disponible se conserva; si deja de estarlo, se selecciona hoy.
22. **Varias pestañas:** no se exige sincronización automática entre pestañas.
23. **Nuevas dudas:** cualquier decisión no cubierta aquí detiene la implementación y se pregunta.
