# Diario de Estudio

Web estática para registrar sesiones de estudio y ver la racha de días seguidos estudiando.

## Cómo usarla

1. Abre `index.html` con doble clic en el navegador.
2. Registra una sesión (fecha, tema, minutos).
3. Los datos se guardan en `localStorage` (clave `studySessions`) y no se pierden al recargar.

## Funcionalidades

- Racha actual y mejor racha.
- Mapa de calor de las últimas 12 semanas.
- Minutos estudiados esta semana y días estudiados este mes.
- Objetivo semanal de minutos con barra de progreso.
- Lista de sesiones, de la más reciente a la más antigua.

## Tests

```sh
node --test
```

## Notas

- Fechas siempre en hora local del usuario (`AAAA-MM-DD`), nunca UTC.
- Sin dependencias, frameworks ni paso de build.