const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  esFechaValida,
  esMinutoValido,
  calcularNivel,
  obtenerLunes,
  generarPeriodo,
  sumarMinutosPorDia,
  construirMapa,
  formatearDetalle,
  resolverSeleccion
} = require('./heatmap.js');

const HOY = '2026-11-02';

test('esFechaValida acepta fecha válida y rechaza inválidas', function () {
  assert.equal(esFechaValida('2026-11-02'), true);
  assert.equal(esFechaValida('2024-02-29'), true);
  assert.equal(esFechaValida('2026-02-29'), false);
  assert.equal(esFechaValida('2026-02-30'), false);
  assert.equal(esFechaValida('2026-2-3'), false);
  assert.equal(esFechaValida('2026-13-01'), false);
  assert.equal(esFechaValida(null), false);
  assert.equal(esFechaValida(20261102), false);
  assert.equal(esFechaValida(''), false);
});

test('esMinutoValido acepta enteros positivos y rechaza el resto', function () {
  assert.equal(esMinutoValido(1), true);
  assert.equal(esMinutoValido(30), true);
  assert.equal(esMinutoValido(45), true);
  assert.equal(esMinutoValido(0), false);
  assert.equal(esMinutoValido(-1), false);
  assert.equal(esMinutoValido(1.5), false);
  assert.equal(esMinutoValido('30'), false);
  assert.equal(esMinutoValido(NaN), false);
  assert.equal(esMinutoValido(Infinity), false);
  assert.equal(esMinutoValido(null), false);
});

test('calcularNivel aplica los tramos fijos', function () {
  assert.equal(calcularNivel(0), 0);
  assert.equal(calcularNivel(1), 1);
  assert.equal(calcularNivel(30), 1);
  assert.equal(calcularNivel(31), 2);
  assert.equal(calcularNivel(60), 2);
  assert.equal(calcularNivel(61), 3);
  assert.equal(calcularNivel(120), 3);
  assert.equal(calcularNivel(121), 4);
  assert.equal(calcularNivel(1440), 4);
});

test('obtenerLunes devuelve el lunes de la semana', function () {
  assert.equal(obtenerLunes('2026-11-02'), '2026-11-02');
  assert.equal(obtenerLunes('2026-11-08'), '2026-11-02');
  assert.equal(obtenerLunes('2026-11-01'), '2026-10-26');
  assert.equal(obtenerLunes('2026-10-26'), '2026-10-26');
});

test('generarPeriodo genera 84 días de lunes a domingo', function () {
  const periodo = generarPeriodo(HOY);
  assert.equal(periodo.inicio, '2026-08-17');
  assert.equal(periodo.fin, '2026-11-08');
  assert.equal(periodo.dias.length, 84);
  assert.equal(periodo.dias[0].fecha, '2026-08-17');
  assert.equal(periodo.dias[83].fecha, '2026-11-08');
  assert.equal(periodo.dias[0].esHoy, false);
  const hoy = periodo.dias.find(function (d) { return d.fecha === HOY; });
  assert.equal(hoy.esHoy, true);
  assert.equal(hoy.disponible, true);
});

test('generarPeriodo incluye el cambio de hora', function () {
  const periodo = generarPeriodo(HOY);
  const fechas = periodo.dias.map(function (d) { return d.fecha; });
  assert.equal(fechas.includes('2026-10-25'), true);
  assert.equal(fechas.includes('2026-10-24'), true);
  assert.equal(fechas.includes('2026-10-26'), true);
  assert.equal(new Set(fechas).size, 84);
});

test('sumarMinutosPorDia suma, ignora inválidas, futuras y fuera de periodo', function () {
  const sesiones = [
    { date: '2026-11-02', minutes: 30 },
    { date: '2026-11-02', minutes: 15 },
    { date: '2026-11-01', minutes: 45 },
    { date: '2026-11-03', minutes: 20 },
    { date: '2026-11-02', minutes: 0 },
    { date: '2026-11-02', minutes: '10' },
    { date: '2026-11-04', minutes: 10 },
    { date: '2020-01-01', minutes: 60 },
    { date: '2026-11-02', topic: 'x' },
    null
  ];
  const mapa = sumarMinutosPorDia(sesiones, HOY);
  assert.equal(mapa.get('2026-11-02'), 45);
  assert.equal(mapa.get('2026-11-01'), 45);
  assert.equal(mapa.has('2026-11-03'), false);
  assert.equal(mapa.has('2026-11-04'), false);
  assert.equal(mapa.has('2020-01-01'), false);
});

test('construirMapa con array vacío deja pasados en nivel 0 y futuros no disponibles', function () {
  const mapa = construirMapa([], HOY);
  assert.equal(mapa.dias.length, 84);
  const hoy = mapa.dias.find(function (d) { return d.fecha === HOY; });
  assert.equal(hoy.minutos, 0);
  assert.equal(hoy.nivel, 0);
  assert.equal(hoy.disponible, true);
  const futuro = mapa.dias.find(function (d) { return d.fecha === '2026-11-03'; });
  assert.equal(futuro.disponible, false);
  assert.equal(futuro.nivel, null);
});

test('construirMapa suma sesiones y asigna niveles', function () {
  const sesiones = [
    { date: '2026-11-02', minutes: 20 },
    { date: '2026-11-02', minutes: 20 },
    { date: '2026-11-01', minutes: 45 },
    { date: '2026-10-31', minutes: 120 },
    { date: '2026-10-30', minutes: 121 }
  ];
  const mapa = construirMapa(sesiones, HOY);
  const hoy = mapa.dias.find(function (d) { return d.fecha === '2026-11-02'; });
  assert.equal(hoy.minutos, 40);
  assert.equal(hoy.nivel, 2);
  assert.equal(mapa.dias.find(function (d) { return d.fecha === '2026-11-01'; }).nivel, 2);
  assert.equal(mapa.dias.find(function (d) { return d.fecha === '2026-10-31'; }).nivel, 3);
  assert.equal(mapa.dias.find(function (d) { return d.fecha === '2026-10-30'; }).nivel, 4);
  assert.equal(mapa.semanas.length, 12);
  assert.equal(mapa.semanas[0].length, 7);
});

test('construirMapa no muta la entrada ni repite resultados', function () {
  const sesiones = [{ date: '2026-11-02', minutes: 30 }];
  const copia = JSON.parse(JSON.stringify(sesiones));
  const mapa1 = construirMapa(sesiones, HOY);
  const mapa2 = construirMapa(sesiones, HOY);
  assert.deepEqual(sesiones, copia);
  assert.equal(mapa1.dias[mapa1.dias.length - 1].fecha, mapa2.dias[mapa2.dias.length - 1].fecha);
  assert.equal(mapa1.dias.find(function (d) { return d.fecha === '2026-11-02'; }).minutos,
               mapa2.dias.find(function (d) { return d.fecha === '2026-11-02'; }).minutos);
});

test('formatearDetalle produce el formato con nombre de mes', function () {
  assert.equal(formatearDetalle('2026-11-02', 0), '2 de noviembre de 2026 · 0 min');
  assert.equal(formatearDetalle('2026-11-02', 45), '2 de noviembre de 2026 · 45 min');
});

test('resolverSeleccion conserva o resetea la selección', function () {
  const mapa = construirMapa([], HOY);
  assert.equal(resolverSeleccion('2026-11-02', mapa, HOY), '2026-11-02');
  assert.equal(resolverSeleccion('2026-11-03', mapa, HOY), HOY);
  assert.equal(resolverSeleccion(null, mapa, HOY), HOY);
});

test('construirMapa funciona con 1000 sesiones', function () {
  const sesiones = [];
  for (let i = 0; i < 1000; i++) {
    sesiones.push({ date: '2026-11-02', minutes: 1 });
  }
  const mapa = construirMapa(sesiones, HOY);
  assert.equal(mapa.dias.find(function (d) { return d.fecha === '2026-11-02'; }).minutos, 1000);
});