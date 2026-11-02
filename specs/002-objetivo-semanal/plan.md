# Plan técnico — Spec 002: Objetivo semanal de estudio

Fuentes: `docs/constitution.md` y `specs/002-objetivo-semanal/spec.md`.
Este plan no implementa código; describe cómo se implementará respetando la constitución y cubriendo todos los RF.

## 1. Resumen de arquitectura

La funcionalidad se integra en los tres archivos base, sin archivos nuevos (RNF-1):

1. **Lógica pura en `app.js`** (módulo de funciones puras): valida el objetivo, calcula minutos de la semana, porcentaje y estado «cumplido». Reciben «hoy» como parámetro; sin DOM ni localStorage.
2. **Integración impura en `app.js`**: lee/guarda `studyWeeklyGoal` y `studySessions`, obtiene «hoy» local, llama a la lógica pura, renderiza la UI y actualiza al guardar.
3. **Presentación en `index.html` y `styles.css`**: bloque de objetivo dentro de la tarjeta de racha, campo, botón, texto «X / Y min», barra con `role="progressbar"` y mensaje de invitación.

Flujo de datos:

```text
localStorage (studySessions + studyWeeklyGoal)
   │  (app.js, capa impura)
   ▼
sesiones + hoy local + objetivo
   │
   ▼
funciones puras (minutosSemana, porcentaje, cumplido)
   │
   ▼
app.js (render)
   │
   ▼
index.html + styles.css
```

## 2. Archivos que se crean o modifican

| Archivo | Acción | Responsabilidad | RF que cubre |
|---|---|---|---|
| `app.js` | Modificar | Añadir funciones puras (validación de objetivo, minutos de la semana, porcentaje, cumplido), lectura/escritura de `studyWeeklyGoal` con respaldo, render del bloque de objetivo y actualización al guardar sesión/objetivo. | RF-1, RF-2, RF-3, RF-5, RF-6 |
| `index.html` | Modificar | Añadir el bloque de objetivo dentro de la tarjeta de racha, debajo de «Minutos esta semana»: campo numérico, botón «Guardar objetivo», texto, barra y mensaje de invitación. | RF-1, RF-2, RF-3, RF-4 |
| `styles.css` | Modificar | Estilos del bloque de objetivo, barra de progreso, estado cumplido, mensaje de invitación y responsive a 480 px. | RF-2, RF-3, RF-4 |
| `app.js` (tests) | — | Los tests de lógica van en el mismo archivo de tests existente o en `app.test.js` si ya existe; se comprueba con `node --test`. | RNF-2, RNF-3 |

No se crean archivos nuevos (RNF-1). La clave `studySessions` no cambia; se añade `studyWeeklyGoal`.

## 3. Funciones puras de lógica (`app.js`)

Todas las funciones puras viven en `app.js`, no acceden a DOM ni localStorage y no leen el reloj. Las que dependen de «hoy» lo reciben como parámetro `hoy` en formato `AAAA-MM-DD` local.

| Función | Entrada | Salida | Responsabilidad | RF |
|---|---|---|---|---|
| `validarObjetivo(texto)` | texto | `{ valido: boolean, valor: number \| null }` | Valida la cadena según CA-1.2; normaliza `"1.0"` a `1`; rechaza el resto. | RF-1 |
| `leerObjetivoGuardado(valor)` | string \| null | number \| null | Lee la clave; `null`/vacío/inválido/`0` → `null`; respaldo si inválido distinto de `0`. | RF-1, RF-6 |
| `minutosDeLaSemana(sesiones, hoy)` | sesiones, `hoy` | number | Suma minutos de la semana actual (lunes a domingo, local) de sesiones válidas; ignora inválidas, futuras y con fecha inválida. | RF-2, RF-6 |
| `porcentajeProgreso(hechos, objetivo)` | number, number | number (0–100) | `min(100, round(hechos/objetivo*100))` con redondeo estándar (`.5` hacia arriba). Si objetivo inválido → 0. | RF-2 |
| `objetivoCumplido(hechos, objetivo)` | number, number | booleano | `hechos >= objetivo` (solo si objetivo válido). | RF-2 |

### Exportación para navegador y tests

`app.js` se carga como script clásico. Al final incluirá una exportación compatible con CommonJS (`module.exports`) envuelta en `if (typeof module !== 'undefined')` para que los tests puedan usar `require`, sin bundler ni módulos ES. Esto mantiene el doble clic en `index.html`.

## 4. Algoritmo en pseudocódigo

```text
FUNCIÓN validarObjetivo(texto):
    s ← trim(texto)
    SI s = "1.0":
        DEVOLVER { valido: verdadero, valor: 1 }
    SI s NO coincide con ^[1-9][0-9]*$:
        DEVOLVER { valido: falso, valor: null }
    n ← Number(s)
    SI NO es finito(n) O n ≤ 0:
        DEVOLVER { valido: falso, valor: null }
    DEVOLVER { valido: verdadero, valor: n }
```

```text
FUNCIÓN minutosDeLaSemana(sesiones, hoy):
    lunes ← obtenerLunes(hoy)
    domingo ← sumarDias(lunes, 6)
    total ← 0
    PARA cada sesión EN sesiones:
        SI sesión NO es objeto: continuar
        SI NO esFechaValida(sesión.date): continuar
        SI NO esMinutoValido(sesión.minutes): continuar
        SI sesión.date > hoy: continuar
        SI sesión.date < lunes O sesión.date > domingo: continuar
        total ← total + sesión.minutes
    DEVOLVER total
```

```text
FUNCIÓN porcentajeProgreso(hechos, objetivo):
    SI objetivo NO válido (null o ≤ 0 o no finito): DEVOLVER 0
    SI objetivo = 0: DEVOLVER 0
    porcentaje ← (hechos / objetivo) * 100
    porcentaje ← min(100, round(porcentaje))   // .5 hacia arriba
    DEVOLVER porcentaje
```

```text
FUNCIÓN objetivoCumplido(hechos, objetivo):
    SI objetivo NO válido: DEVOLVER falso
    DEVOLVER hechos >= objetivo
```

```text
FUNCIÓN leerObjetivoGuardado(valor):
    // valor es el texto crudo de localStorage (o null)
    SI valor es null O valor = "":
        DEVOLVER null
    n ← Number(valor)
    SI NO es finito(n) O n ≤ 0:
        SI n ≠ 0 O valor ≠ "0":   // inválido distinto de 0 → respaldo
            crear copia de respaldo studyWeeklyGoal_backup_<Date.now()>
        DEVOLVER null
    DEVOLVER n
```

Reglas de fecha: se reutilizan las existentes de `app.js` (`obtenerLunes`, `sumarDias` con `setDate`); nunca UTC ni milisegundos.

## 5. Cómo se pinta en la interfaz

### 5.1 Estructura en `index.html`

Dentro de la tarjeta de racha, debajo de «Minutos esta semana», añadir un bloque con:
- Etiqueta «Objetivo semanal».
- Si no hay objetivo válido: mensaje de invitación «Fija un objetivo semanal para seguir tu progreso».
- Si hay objetivo: texto «X / Y min» (hechos / objetivo) y barra de progreso.
- Formulario inline: `<input type="number" ...>` + botón «Guardar objetivo».
- Mensaje de error (oculto por defecto) para validación fallida.

La barra: `<div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="..." aria-label="Progreso del objetivo semanal">` con ancho CSS según porcentaje.

### 5.2 Render en `app.js`

```text
FUNCIÓN renderObjetivo():
    hoy ← todayStr()
    objetivo ← leerObjetivoGuardado(localStorage.getItem('studyWeeklyGoal'))
    hechos ← minutosDeLaSemana(sesiones, hoy)
    SI objetivo es null:
        mostrar mensaje de invitación
        ocultar barra y texto de progreso
        NO emitir aria-valuenow
    SINO:
        ocultar mensaje de invitación
        mostrar texto "hechos / objetivo min"
        porcentaje ← porcentajeProgreso(hechos, objetivo)
        actualizar ancho de barra y aria-valuenow
        SI hechos >= objetivo:
            mostrar "Objetivo cumplido"
```

### 5.3 Actualización

- Al guardar sesión válida: recalcular `renderObjetivo()` sin recargar (RF-5.1).
- Al guardar objetivo válido: actualizar de inmediato (RF-5.2).
- Al cargar la página: renderizar (RF-5.3).
- No se sincroniza entre pestañas en tiempo real (caso límite).

### 5.4 Robustez de datos

- `leerObjetivoGuardado` nunca lanza; valores ilegibles (distintos de `0`) generan copia de respaldo `studyWeeklyGoal_backup_<timestamp>` sin alterar la clave original.
- `0` explícito se trata como sin objetivo sin respaldo.
- `null`/cadena vacía se tratan como ausente.
- No se modifica ni migra `studySessions`.

## 6. Decisiones técnicas justificadas y alternativas descartadas

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| Toda la lógica en `app.js`, sin archivos nuevos | RNF-1 lo exige; evita añadir módulos no autorizados. | Crear `goal.js`/`goal.test.js`: más limpio, pero viola RNF-1. |
| Validación estricta con regex `^[1-9][0-9]*$` más caso `"1.0"` | Cumple CA-1.2 al pie de la letra y evita `Number()` perdonando formatos. | Usar `Number()` y `Number.isInteger()`: aceptaría `+120`, `1.00`, ` 1.0 `. |
| Objetivo único y global (no por semana) | CA-1.6; simplifica el modelo y no requiere historial. | Objetivo por semana: más complejo y fuera de alcance. |
| Barra limitada al 100% pero texto con minutos reales | CA-2.3 y CA-2.5; evita desbordamiento visual sin perder información. | Recortar también el texto: oculta el exceso real. |
| Respaldo antes de sobrescribir datos ilegibles del objetivo | Principio 5 (datos sagrados) y CA-6.1. | Borrar la clave inválida: pierde el dato original. |
| Sin temporizador para cambio de día/semana | CA-5.1; evita actualizaciones automáticas no pedidas. | `setInterval` a medianoche: fuera de alcance. |
| Reutilizar funciones de fecha existentes de `app.js` | Evita regresiones en racha/mejor racha (CA-8.2). | Refactorizar fechas a módulo común: más limpio pero arriesgado. |

## 7. Estrategia de tests con `node --test`

### 7.1 Archivo y comandos

- Tests de lógica pura en el archivo de tests existente del proyecto (o `app.test.js` si se crea), importando con `require('./app.js')`.
- Herramientas: `node:test` y `node:assert/strict`, sin instalar nada.
- Comando: `node --test`.
- Puerta obligatoria: no se avanza si hay tests en rojo (principio 4).

### 7.2 Casos por función

| Grupo | Casos principales | RF |
|---|---|---|
| `validarObjetivo` | `"120"` válido → 120; `"1.0"` → 1; `"0120"`, `"1_000"`, `Infinity`, `NaN`, `"1 20"`, `"+120"`, `"1.00"`, `" 1.0 "`, `"+1.0"`, `"1.0 "` inválidos; `0`, negativos, decimales, vacío inválidos; desbordamiento inválido. | RF-1 |
| `minutosDeLaSemana` | Semana con sesiones: suma correcta; varios registros mismo día se suman; inválidas ignoradas; futuras ignoradas; fecha inválida ignorada; minutos inválidos ignorados; semana sin sesiones → 0; fronteras lunes/domingo incluidas. | RF-2, RF-6 |
| `porcentajeProgreso` | 0/120 → 0; 60/120 → 50; 120/120 → 100; 150/120 → 100; redondeo `.5` hacia arriba; objetivo inválido → 0. | RF-2 |
| `objetivoCumplido` | hechos >= objetivo → true; hechos < objetivo → false; objetivo inválido → false. | RF-2 |
| `leerObjetivoGuardado` | ausente → null; `""` → null; `"120"` → 120; `"0"` → null (sin respaldo); `"abc"` → null + respaldo; `"-5"` → null + respaldo. | RF-1, RF-6 |

### 7.3 Verificación manual de interfaz

Con Chrome DevTools, abriendo `index.html`:
1. El bloque aparece en la tarjeta de racha, debajo de «Minutos esta semana», ancho completo (RF-4).
2. Sin objetivo: mensaje de invitación, sin barra ni `aria-valuenow` (RF-3).
3. Fijar objetivo válido: se guarda, campo se vacía, mensaje de error se limpia, progreso se actualiza (RF-1, RF-5.2).
4. Objetivo inválido: no se guarda, se muestra error (RF-1).
5. Progreso «X / Y min» y barra con porcentaje correcto (RF-2).
6. Al alcanzar el objetivo: barra al 100% y «Objetivo cumplido»; minutos reales si se supera (RF-2).
7. Al guardar sesión: progreso se recalcula sin recargar (RF-5.1).
8. Al recargar: objetivo y progreso persisten (RF-1.4, RF-5.3).
9. Valor guardado ilegible: se trata como sin objetivo, sesiones intactas (RF-6).
10. A 480 px el bloque no desborda (RF-4).
11. Racha, mejor racha y datos guardados idénticos antes/después (CA-8.2).

## 8. Cumplimiento de la constitución

| Principio | Cómo lo cumple el plan |
|---|---|
| 1. Simplicidad primero | HTML, CSS y JS puros; sin dependencias ni build; `index.html` se abre con doble clic. |
| 2. La spec manda | El plan solo implementa RF-1 a RF-6. No añade funcionalidades. |
| 3. Lógica separada de interfaz | Funciones puras en `app.js` sin DOM ni localStorage, reciben «hoy» como parámetro. |
| 4. Tests como puerta | Tests con `node --test`; deben estar en verde antes de avanzar. |
| 5. Datos sagrados | Misma clave `studySessions`; nueva clave `studyWeeklyGoal`; fechas locales; respaldo antes de sobrescribir datos ilegibles; nunca se borran sesiones. |
| 6. Idioma | Código, interfaz y documentación en español. |

## 9. Matriz de cobertura de RF

| RF | Dónde se cubre |
|---|---|
| RF-1 Objetivo | `validarObjetivo`, `leerObjetivoGuardado`, formulario en `index.html`, eventos en `app.js`, tests de validación. |
| RF-2 Progreso semanal | `minutosDeLaSemana`, `porcentajeProgreso`, `objetivoCumplido`, render del texto y barra, tests. |
| RF-3 Sin objetivo | `leerObjetivoGuardado` → null, render condicional, mensaje de invitación, tests. |
| RF-4 Ubicación | Bloque dentro de la tarjeta de racha en `index.html`, estilos en `styles.css`. |
| RF-5 Actualización | `renderObjetivo` tras guardar sesión/objetivo y al cargar, tests manuales. |
| RF-6 Robustez | `leerObjetivoGuardado` con respaldo, filtros en `minutosDeLaSemana`, fechas locales, tests. |

## 10. Orden de implementación

1. Añadir las funciones puras a `app.js` y sus tests; ejecutar `node --test` hasta verde.
2. Añadir la estructura del bloque de objetivo en `index.html`.
3. Añadir los estilos del bloque, barra y mensaje en `styles.css`.
4. Integrar en `app.js`: lectura/escritura de `studyWeeklyGoal`, render y eventos.
5. Añadir la capa de respaldo para datos ilegibles del objetivo.
6. Actualizar `renderObjetivo` en el flujo de guardar sesión.
7. Verificar manualmente en Chrome DevTools a 480 px y comprobar que racha/mejor racha no cambian.
8. Actualizar `MEMORY.md` con el resultado.