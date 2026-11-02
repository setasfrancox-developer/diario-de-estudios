# Plan técnico — Spec 001: Mapa de calor de estudio

Fuentes: `docs/constitution.md` y `specs/001-heat-map/spec.md` (incluidas las decisiones de la sección 10).
Nota: la lógica prevista para `heatmap.js` se integró finalmente en `app.js`.
Este plan no implementa código; describe cómo se implementará respetando la constitución y cubriendo todos los RF.

## 1. Resumen de arquitectura

La funcionalidad se separa en tres capas:

1. **Lógica pura** en `heatmap.js`: valida sesiones, calcula el periodo de 84 días, suma minutos por día, asigna niveles y formatea detalles. No toca DOM ni localStorage y recibe «hoy» como parámetro.
2. **Integración con la app** en `app.js`: lee y guarda localStorage, obtiene «hoy» con la fecha local, llama a la lógica pura, construye el DOM, gestiona selección/foco/teclado y actualiza el mapa al guardar.
3. **Presentación** en `index.html` y `styles.css`: estructura del mapa, leyenda, detalle y estilos de niveles, estados no disponibles, foco y responsive.

Flujo de datos:

```text
localStorage
   │  (app.js, capa impura)
   ▼
sesiones + hoy local
   │
   ▼
heatmap.js (funciones puras)
   │  { dias, semanas, inicio, fin }
   ▼
app.js (render)
   │
   ▼
index.html + styles.css
```

## 2. Archivos que se crean o modifican

| Archivo | Acción | Responsabilidad | RF que cubre |
|---|---|---|---|
| `heatmap.js` | Crear | Lógica pura del mapa: fechas, validación, suma por día, niveles, periodo, detalle y resolución de selección. Sin DOM ni localStorage. | RF-1, RF-2, RF-3, RF-4, RF-6, RF-7 |
| `heatmap.test.js` | Crear | Tests de `heatmap.js` con `node --test` y `node:assert/strict`. Sin dependencias. | RF-1, RF-2, RF-3, RF-4, RF-6, RF-7 |
| `index.html` | Modificar | Añadir la sección del mapa entre la tarjeta de racha y el formulario: contenedor del grid, detalle y leyenda. Cargar `heatmap.js` antes de `app.js` con script clásico. | RF-4, RF-9, RF-10 |
| `styles.css` | Modificar | Estilos del grid 12×7, niveles 0–4, días no disponibles, foco, detalle, leyenda y responsive a 375 px. | RF-1, RF-3, RF-4, RF-7, RF-9, RNF-4, RNF-5 |
| `app.js` | Modificar | Leer/guardar sesiones con respaldo, calcular «hoy» local, llamar a `heatmap.js`, renderizar el mapa, gestionar eventos y actualizar al guardar. Mantener intactas racha, mejor racha, cadena de 7 días, minutos semanales y días del mes. | RF-4, RF-5, RF-6, RF-8, RF-10 |
| `specs/001-heat-map/plan.md` | Crear | Este documento. | Todos |

No se crean más archivos. `AGENTS.md` y `MEMORY.md` ya se actualizaron para permitir `heatmap.js` y `heatmap.test.js`, exigir `node --test` y mantener la clave `studySessions`.

## 3. Funciones puras de lógica (`heatmap.js`)

Todas las funciones viven en `heatmap.js`, no acceden a DOM ni localStorage y no leen el reloj. Las que dependen de «hoy» lo reciben como parámetro `hoy` en formato `AAAA-MM-DD` local.

| Función | Entrada | Salida | Responsabilidad | RF |
|---|---|---|---|---|
| `esFechaValida(texto)` | texto | booleano | Comprueba formato exacto `AAAA-MM-DD` y fecha de calendario real. | RF-6 |
| `esMinutoValido(valor)` | valor | booleano | Comprueba entero finito mayor que 0. | RF-6 |
| `fechaDesdeTexto(texto)` | `AAAA-MM-DD` | fecha local | Convierte texto a fecha local a medianoche. | RF-1, RF-6 |
| `textoDesdeFecha(fecha)` | fecha local | `AAAA-MM-DD` | Convierte fecha local a texto. | RF-1, RF-6 |
| `sumarDias(texto, n)` | texto, entero | texto | Suma o resta días usando `setDate`, nunca milisegundos. | RF-1 |
| `obtenerLunes(texto)` | texto | texto | Devuelve el lunes de la semana de esa fecha. | RF-1 |
| `generarPeriodo(hoy)` | `hoy` | `{ inicio, fin, dias }` | Genera exactamente 84 días, de lunes a domingo, terminando en la semana de `hoy`. | RF-1 |
| `sumarMinutosPorDia(sesiones, hoy)` | sesiones, `hoy` | mapa fecha→minutos | Valida y suma minutos por día; ignora inválidas, futuras y fuera del periodo. | RF-2, RF-6, RF-7 |
| `calcularNivel(minutos)` | minutos | 0–4 | Aplica los tramos fijos. | RF-3 |
| `construirMapa(sesiones, hoy)` | sesiones, `hoy` | `{ inicio, fin, dias, semanas }` | Orquesta periodo, sumas, disponibilidad y niveles. | RF-1, RF-2, RF-3, RF-6, RF-7 |
| `formatearDetalle(fecha, minutos)` | fecha, minutos | texto | Devuelve `AAAA-MM-DD · N min`, incluido `0 min`. | RF-4 |
| `resolverSeleccion(fechaSeleccionada, mapa, hoy)` | fecha, mapa, `hoy` | fecha | Conserva la selección si sigue disponible; si no, devuelve `hoy`. | RF-5 |

### Exportación para navegador y tests

`heatmap.js` se cargará como script clásico y expondrá sus funciones en un espacio global, por ejemplo `Heatmap`. Al final incluirá una exportación compatible con CommonJS para que `heatmap.test.js` pueda importarlo con `require`, sin bundler ni módulos ES. Esto mantiene el doble clic en `index.html` y permite `node --test`.

## 4. Algoritmo del mapa en pseudocódigo

```text
FUNCIÓN generarPeriodo(hoy):
    lunesActual ← obtenerLunes(hoy)
    inicio ← sumarDias(lunesActual, -77)        // 11 semanas antes
    fin ← sumarDias(lunesActual, 6)             // domingo de la semana actual
    dias ← lista vacía
    cursor ← inicio

    MIENTRAS cursor ≤ fin:
        dias.agregar({
            fecha: cursor,
            esHoy: cursor = hoy,
            disponible: cursor ≤ hoy,
            minutos: 0,
            nivel: nulo
        })
        cursor ← sumarDias(cursor, 1)

    SI longitud(dias) ≠ 84:
        error de programación (no debería ocurrir)

    DEVOLVER { inicio, fin, dias }
```

```text
FUNCIÓN sumarMinutosPorDia(sesiones, hoy):
    periodo ← generarPeriodo(hoy)
    minutosPorDia ← mapa vacío

    PARA cada sesión EN sesiones:
        SI sesión NO es objeto:
            continuar
        SI NO esFechaValida(sesión.date):
            continuar
        SI NO esMinutoValido(sesión.minutes):
            continuar
        SI sesión.date > hoy:
            continuar
        SI sesión.date < periodo.inicio O sesión.date > periodo.fin:
            continuar

        minutosPorDia[sesión.date] ← minutosPorDia[sesión.date] + sesión.minutes

    DEVOLVER minutosPorDia
```

```text
FUNCIÓN calcularNivel(minutos):
    SI minutos = 0: DEVOLVER 0
    SI minutos ≤ 30: DEVOLVER 1
    SI minutos ≤ 60: DEVOLVER 2
    SI minutos ≤ 120: DEVOLVER 3
    DEVOLVER 4
```

```text
FUNCIÓN construirMapa(sesiones, hoy):
    periodo ← generarPeriodo(hoy)
    minutosPorDia ← sumarMinutosPorDia(sesiones, hoy)

    PARA cada día EN periodo.dias:
        día.minutos ← minutosPorDia[día.fecha] O 0
        SI día.disponible:
            día.nivel ← calcularNivel(día.minutos)
        SINO:
            día.nivel ← nulo

    semanas ← agrupar periodo.dias en bloques consecutivos de 7
    // 12 bloques: cada bloque es una semana de lunes a domingo

    DEVOLVER {
        inicio: periodo.inicio,
        fin: periodo.fin,
        dias: periodo.dias,
        semanas: semanas
    }
```

```text
FUNCIÓN resolverSeleccion(fechaSeleccionada, mapa, hoy):
    SI fechaSeleccionada existe Y está en mapa.dias Y es disponible:
        DEVOLVER fechaSeleccionada
    DEVOLVER hoy
```

Reglas de fecha:

- «Hoy» se calcula en `app.js` con la fecha local y se pasa como texto.
- Las conversiones usan `new Date(año, mes - 1, día)`.
- Los desplazamientos usan `setDate(getDate() ± n)`.
- Nunca se usa `toISOString()` ni `86400000`.
- El periodo se genera día a día, no restando milisegundos, para sobrevivir a cambios de hora y de año.

## 5. Cómo se pinta en la interfaz

### 5.1 Estructura en `index.html`

Entre la tarjeta de racha y el formulario se añade una sección con:

- Título «Últimas 12 semanas».
- Contenedor del mapa con `role="grid"`, `aria-rowcount="7"` y `aria-colcount="12"`.
- Línea de detalle con `aria-live="polite"`.
- Leyenda con los niveles 0–4 y los textos «Menos» y «Más».
- `heatmap.js` se carga antes de `app.js` mediante `<script src="heatmap.js"></script>` clásico.

El mapa se construye con 7 filas (días de la semana) y 12 columnas (semanas). Cada celda contiene la fecha y los minutos en su nombre accesible.

### 5.2 Render en `app.js`

```text
FUNCIÓN renderMapa():
    hoy ← todayStr()                         // fecha local
    mapa ← Heatmap.construirMapa(sesiones, hoy)
    seleccion ← Heatmap.resolverSeleccion(seleccionActual, mapa, hoy)
    seleccionActual ← seleccion

    vaciar contenedor del grid
    PARA cada semana EN mapa.semanas:
        crear fila/columna visual según el layout 12×7
        PARA cada día EN semana:
            SI día.disponible:
                crear botón con:
                    clase nivel-{día.nivel}
                    aria-label «AAAA-MM-DD: N minutos»
                    tabindex 0 solo para el día seleccionado; -1 para el resto
                    data-fecha
            SINO:
                crear celda no interactiva con:
                    clase no-disponible
                    aria-disabled true
                    sin tabindex
    actualizar detalle con formatearDetalle(seleccion, minutos)
    actualizar tabindex móvil (roving tabindex)
```

### 5.3 Estados visuales

- `nivel-0`: fondo base, sin color de estudio.
- `nivel-1` a `nivel-4`: cuatro intensidades crecientes; la diferencia principal es de luminosidad, no solo de tono.
- `no-disponible`: atenuado o tramado, sin color de estudio, sin foco.
- `seleccionado`: contorno o anillo de foco independiente del nivel.
- `:focus-visible`: contorno visible para teclado.

Los colores concretos se definen en `styles.css`; no se usan estilos inline.

### 5.4 Layout responsive

- El grid ocupa el 100 % del ancho de la tarjeta.
- 12 columnas y 7 filas con separación pequeña.
- `min-width: 0` en celdas para evitar desbordamiento.
- A 375 px no debe haber scroll horizontal.
- Se acepta que las celdas queden por debajo de 44 px, según la spec.
- La leyenda y el detalle no deben forzar ancho adicional.

### 5.5 Interacción y teclado

- `mouseover`/`mouseenter` muestra una vista previa del día.
- `mouseleave` restaura el detalle del día seleccionado.
- `click` y `tap` seleccionan el día y actualizan el detalle.
- `focusin` selecciona el día enfocado.
- Un solo punto de tabulación en el mapa (`tabindex=0` en el día seleccionado).
- Flechas: izquierda/derecha cambian de semana manteniendo el día de la semana; arriba/abajo cambian de día dentro de la semana. El movimiento salta días no disponibles.
- Inicio/Fin llevan al primer/último día disponible.
- Enter/Espacio seleccionan el día enfocado.
- Los días no disponibles no reciben foco.
- El detalle se anuncia en la región `aria-live="polite"`.

### 5.6 Actualización al guardar

```text
FUNCIÓN alGuardarSesion():
    validar y guardar la sesión como hasta ahora
    hoy ← todayStr()                         // recalcula «hoy» (CA-5.3)
    mapa ← construirMapa(sesiones, hoy)
    seleccionActual ← resolverSeleccion(seleccionActual, mapa, hoy)
    renderMapa()
```

La lista de sesiones, la racha, la mejor racha, la cadena de 7 días, los minutos semanales y los días del mes se siguen renderizando con sus funciones actuales. El mapa es una capa adicional.

### 5.7 Carga y datos ilegibles

`app.js` mantiene una capa de almacenamiento:

- `leerSesiones()` devuelve sesiones válidas y un indicador de datos ilegibles.
- Si el valor no existe, se trata como array vacío.
- Si el JSON falla o no es un array, se conserva el texto original en memoria y se marca como ilegible; el mapa se pinta con un array vacío.
- `guardarSesiones()` comprueba si hay datos ilegibles. Si los hay, copia el texto original a `studySessions_backup_<timestamp>` antes de escribir.
- Si la copia de respaldo falla, no se sobrescribe el dato original.
- La clave activa sigue siendo `studySessions` y el formato `{ id, date, topic, minutes }` no cambia.

### 5.8 Leyenda y accesibilidad

- La leyenda tiene cinco muestras, una por nivel 0–4.
- «Menos» y «Más» se muestran en los extremos.
- Cada muestra tiene etiqueta accesible: «0 min», «1-30 min», «31-60 min», «61-120 min», «más de 120 min».
- La leyenda no es interactiva ni enfocable como si fueran días.
- Cada día disponible tiene nombre accesible con fecha y minutos.
- El color no es el único canal: el detalle textual y las etiquetas cubren RNF-5.

## 6. Decisiones técnicas justificadas y alternativas descartadas

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| Crear `heatmap.js` y `heatmap.test.js` separados de `app.js` | Permite funciones puras y tests `node --test` sin DOM, como exige la constitución. | Mantener toda la lógica en `app.js`: no se podría probar sin navegador y se mezclarían capas. |
| Script clásico con exportación CommonJS | `index.html` sigue funcionando con doble clic y los tests pueden usar `require`. | Módulos ES: `file://` puede bloquear la carga y romper el doble clic. |
| Grid de 12 columnas (semanas) × 7 filas (días) | Es la lectura natural de un mapa de calor de 12 semanas y cabe en 375 px. | 7 columnas × 12 filas: más grande al tacto, pero cambia la lectura temporal y no es el formato pedido. |
| Recalcular el mapa completo en cada render | 84 celdas y hasta 1.000 sesiones son manejables; menos estado y menos errores. | Actualización incremental o caché: más compleja y con riesgo de quedarse obsoleta. |
| Estado de selección en `app.js` | La selección es interfaz, no lógica de negocio; la lógica pura solo resuelve si sigue siendo válida. | Guardar la selección en `heatmap.js` o en localStorage: mezcla responsabilidades y añade persistencia no pedida. |
| Botones nativos para días disponibles y celdas no interactivas para los no disponibles | Semántica y teclado gratuitos; los no disponibles no reciben foco. | `div` con roles manuales: más código y más fácil de romper la accesibilidad. |
| Roving tabindex con flechas | Evita 84 paradas de tabulación y cumple CA-4.3. | Todos los días con `tabindex=0`: recorrido larguísimo e incómodo. |
| Hover como vista previa y clic/foco como selección persistente | Cubre ratón, tacto y teclado sin que el detalle desaparezca al salir del día. | Solo hover: inútil en móvil y teclado; solo clic: no hay vista previa. |
| Clases CSS por nivel | Mantenimiento sencillo y colores centralizados. | Estilos inline calculados en JS: mezcla presentación con lógica y dificulta el ajuste. |
| Respaldo antes de sobrescribir datos ilegibles | Cumple «nunca se pierde una sesión» y permite que la app siga funcionando. | Bloquear el guardado: la app queda inutilizable; sobrescribir sin copia: pérdida de datos. |
| Recalcular «hoy» al guardar, sin temporizador | Cumple CA-5.3 y evita actualizaciones automáticas no pedidas. | `setInterval` a medianoche: fuera de alcance y más complejo. |
| Formatear fechas manualmente en local | Evita el desfase UTC de `toISOString()`. | `toISOString()`: puede cambiar el día según la zona horaria. |
| Mantener las funciones de fecha actuales de `app.js` y duplicar solo las necesarias en `heatmap.js` | Evita tocar la racha y la mejor racha, que deben quedar idénticas (CA-8.2). | Refactorizar todas las fechas a un único módulo: más limpio, pero aumenta el riesgo de regresión en esta spec. |
| Renderizar 12 semanas siempre, con futuros no disponibles | Cumple CA-1.1, CA-1.2 y CA-7.1 sin estados especiales. | Ocultar los días futuros: rompe la cuadrícula de 84 celdas. |

## 7. Estrategia de tests con `node --test`

### 7.1 Archivo y comandos

- Archivo: `heatmap.test.js`.
- Importación: `require('./heatmap.js')`.
- Herramientas: `node:test` y `node:assert/strict`, sin instalar nada.
- Comando completo: `node --test heatmap.test.js`.
- Comando con zona horaria fija para DST: `TZ=Europe/Madrid node --test heatmap.test.js`.
- Un solo grupo: `node --test --test-name-pattern="nivel" heatmap.test.js`.
- Puerta obligatoria: no se avanza si hay tests en rojo (principio 4).

### 7.2 Casos por función

| Grupo | Casos principales | RF |
|---|---|---|
| `esFechaValida` | Fecha válida; `2024-02-29` válida; `2026-02-29` inválida; `2026-02-30` inválida; `2026-2-3` inválida; `2026-13-01` inválida; `null`, número y texto vacío inválidos. | RF-6 |
| `esMinutoValido` | 1, 30 y 45 válidos; 0, negativos, decimales, cadenas, `NaN`, `Infinity`, `null` inválidos. | RF-6 |
| `calcularNivel` | 0→0; 1→1; 30→1; 31→2; 60→2; 61→3; 120→3; 121→4; 1.440→4. | RF-3 |
| `obtenerLunes` | Lunes devuelve el mismo lunes; domingo devuelve el lunes anterior; semana que cruza de mes. | RF-1 |
| `generarPeriodo` | `hoy=2026-11-02` produce inicio `2026-08-17`, fin `2026-11-08`, 84 días, primer lunes y último domingo; no hay fechas repetidas; incluye el 25 de octubre de 2026 (cambio de hora). | RF-1 |
| `sumarMinutosPorDia` | Varias sesiones el mismo día se suman; inválidas se ignoran; futuras se ignoran; anteriores al periodo se ignoran; fecha en el primer y último día se incluye. | RF-2, RF-6 |
| `construirMapa` | Sin sesiones: 84 días, pasados y hoy en nivel 0, futuros no disponibles; con sesiones: niveles correctos; día de 1.440 min en nivel 4; no muta la entrada; dos llamadas iguales dan el mismo resultado. | RF-1, RF-2, RF-3, RF-6, RF-7 |
| `formatearDetalle` | `2026-11-02, 0` → `2026-11-02 · 0 min`; `2026-11-02, 45` → `2026-11-02 · 45 min`. | RF-4 |
| `resolverSeleccion` | Selección disponible se conserva; selección futura o fuera del periodo se cambia por `hoy`. | RF-5 |
| Rendimiento funcional | `construirMapa` con 1.000 sesiones termina y suma correctamente; la medición de <100 ms se comprueba manualmente en el navegador para no introducir un test frágil. | RNF-7 |

### 7.3 Verificación manual de interfaz

Con Chrome DevTools, abriendo `index.html`:

1. La sección aparece entre la tarjeta de racha y el formulario (RF-10).
2. Hay 84 celdas en 12 semanas de lunes a domingo (RF-1).
3. Los futuros de la semana actual se ven distintos del nivel 0 y no se pueden enfocar ni consultar (RF-1, RF-7).
4. Los niveles 1–4 se distinguen por luminosidad (RF-3).
5. El detalle muestra fecha y minutos, incluido `0 min` (RF-4).
6. Se puede recorrer con teclado y el foco es visible (RF-4, RNF-5).
7. La leyenda muestra los cinco niveles, «Menos»/«Más» y etiquetas accesibles (RF-9).
8. Al guardar una sesión, el mapa se actualiza sin recargar y se recalcula «hoy» (RF-5).
9. Al recargar, el mapa conserva las sesiones (RF-5).
10. A 375 px no hay scroll horizontal y la consola no muestra errores (RNF-4).
11. Las estadísticas anteriores siguen iguales (RF-8).
12. Con datos ilegibles en localStorage, el mapa se ve vacío y el dato original se conserva en la clave de respaldo al guardar (RF-6, RNF-8).

## 8. Cumplimiento de la constitución

| Principio | Cómo lo cumple el plan |
|---|---|
| 1. Simplicidad primero | HTML, CSS y JS puros; sin dependencias ni build; scripts clásicos; `index.html` sigue abriéndose con doble clic. |
| 2. La spec manda | El plan solo implementa RF-1 a RF-10 y las decisiones de la sección 10. No añade funcionalidades. |
| 3. Lógica separada de interfaz | `heatmap.js` contiene funciones puras, sin DOM ni localStorage, y recibe «hoy» como parámetro. `app.js` hace la integración impura. |
| 4. Tests como puerta | `heatmap.test.js` con `node --test`; los tests deben estar en verde antes de avanzar. La interfaz se verifica además en el navegador. |
| 5. Datos sagrados | Misma clave `studySessions` y mismo formato; fechas locales; copia de respaldo antes de sobrescribir datos ilegibles; nunca se borran sesiones. |
| 6. Idioma | Nombres de funciones, código, interfaz y documentación en español. |

## 9. Matriz de cobertura de RF

| RF | Dónde se cubre |
|---|---|
| RF-1 Periodo | `generarPeriodo`, `construirMapa`, render del grid, tests de periodo y DST. |
| RF-2 Minutos por día | `sumarMinutosPorDia`, `construirMapa`, detalle, tests de suma y sesiones múltiples. |
| RF-3 Intensidad | `calcularNivel`, clases `nivel-0` a `nivel-4`, tests de fronteras. |
| RF-4 Detalle | `formatearDetalle`, render del detalle, eventos de ratón/tacto/teclado, tests de formato. |
| RF-5 Actualización | `renderMapa` tras guardar, recálculo de «hoy», `resolverSeleccion`, verificación manual. |
| RF-6 Datos no válidos | `esFechaValida`, `esMinutoValido`, filtros de `sumarMinutosPorDia`, capa de almacenamiento y respaldo. |
| RF-7 Sin sesiones | `construirMapa` con array vacío, render de nivel 0 y no disponibles, tests. |
| RF-8 Independencia | `app.js` conserva las funciones actuales de racha, mejor racha, cadena de 7 días, minutos semanales y días del mes. |
| RF-9 Leyenda | Sección de leyenda en `index.html`, estilos en `styles.css`, etiquetas accesibles, verificación manual. |
| RF-10 Ubicación | La sección del mapa se inserta entre la tarjeta de racha y el formulario. |

## 10. Orden de implementación

1. Crear `heatmap.js` con las funciones puras y `heatmap.test.js` con los casos de la sección 7.
2. Ejecutar `node --test heatmap.test.js` hasta tener todo en verde.
3. Añadir la estructura del mapa, detalle y leyenda en `index.html`.
4. Añadir los estilos de grid, niveles, no disponibles, foco, detalle y leyenda en `styles.css`.
5. Integrar `heatmap.js` en `app.js`: carga, render, eventos, teclado y actualización al guardar.
6. Añadir la capa de respaldo para datos ilegibles.
7. Verificar manualmente en Chrome DevTools a 375 px y comprobar que las estadísticas anteriores no cambian.
8. Actualizar `MEMORY.md` con el resultado y cualquier decisión nueva.
