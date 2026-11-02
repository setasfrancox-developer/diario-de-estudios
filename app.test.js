const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  validarObjetivo,
  minutosDeLaSemana,
  porcentajeProgreso,
  objetivoCumplido,
  leerObjetivoGuardado,
  esObjetivoIlegible,
  computeStreak,
  computeBestStreak,
  computeMonthDays,
  esFechaValida,
  esMinutoValido,
  calcularNivel,
  obtenerLunes,
  generarPeriodo,
  sumarMinutosPorDia,
  construirMapa,
  formatearDetalle,
  resolverSeleccion
} = require('./app.js');

const HOY = '2026-11-02';

test('validarObjetivo valida y normaliza', function () {
  assert.deepEqual(validarObjetivo('120'), { valido: true, valor: 120 });
  assert.deepEqual(validarObjetivo('1.0'), { valido: true, valor: 1 });
  assert.deepEqual(validarObjetivo('0120'), { valido: false, valor: null });
  assert.deepEqual(validarObjetivo('1_000'), { valido: false, valor: null });
  assert.deepEqual(validarObjetivo('Infinity'), { valido: false, valor: null });
  assert.deepEqual(validarObjetivo('NaN'), { valido: false, valor: null });
  assert.deepEqual(validarObjetivo('1 20'), { valido: false, valor: null });
  assert.deepEqual(validarObjetivo('+120'), { valido: false, valor: null });
  assert.deepEqual(validarObjetivo('1.00'), { valido: false, valor: null });
  assert.deepEqual(validarObjetivo(' 1.0 '), { valido: false, valor: null });
  assert.deepEqual(validarObjetivo('0'), { valido: false, valor: null });
  assert.deepEqual(validarObjetivo('-5'), { valido: false, valor: null });
  assert.deepEqual(validarObjetivo(''), { valido: false, valor: null });
});

test('minutosDeLaSemana suma y filtra', function () {
  const sesiones = [
    { date: '2026-11-02', minutes: 30 },
    { date: '2026-11-02', minutes: 15 },
    { date: '2026-11-01', minutes: 45 },
    { date: '2026-11-03', minutes: 20 },
    { date: '2026-11-02', minutes: 0 },
    { date: '2026-11-02', minutes: '10' },
    { date: '2026-10-31', minutes: 120 },
    { date: '2026-13-01', minutes: 10 },
    null
  ];
  assert.equal(minutosDeLaSemana(sesiones, HOY), 45);
});

test('porcentajeProgreso y objetivoCumplido', function () {
  assert.equal(porcentajeProgreso(0, 120), 0);
  assert.equal(porcentajeProgreso(60, 120), 50);
  assert.equal(porcentajeProgreso(120, 120), 100);
  assert.equal(porcentajeProgreso(150, 120), 100);
  assert.equal(porcentajeProgreso(1, 3), 33);
  assert.equal(porcentajeProgreso(2, 3), 67);
  assert.equal(porcentajeProgreso(10, null), 0);
  assert.equal(objetivoCumplido(120, 120), true);
  assert.equal(objetivoCumplido(100, 120), false);
  assert.equal(objetivoCumplido(10, null), false);
});

test('leerObjetivoGuardado y esObjetivoIlegible', function () {
  assert.equal(leerObjetivoGuardado(null), null);
  assert.equal(leerObjetivoGuardado(''), null);
  assert.equal(leerObjetivoGuardado('0'), null);
  assert.equal(leerObjetivoGuardado('120'), 120);
  assert.equal(esObjetivoIlegible('abc'), true);
  assert.equal(esObjetivoIlegible('0'), false);
  assert.equal(esObjetivoIlegible(null), false);
});

test('computeStreak calcula racha y tolera datos corruptos', function () {
  const sesiones = [
    { date: '2026-11-02', minutes: 30 },
    { date: '2026-11-01', minutes: 20 },
    { date: '2026-10-31', minutes: 10 },
    null,
    { date: '2026-10-29', minutes: 5 },
    { date: 'invalida', minutes: 5 }
  ];
  assert.equal(computeStreak(sesiones, '2026-11-02'), 3);
  assert.equal(computeStreak([], '2026-11-02'), 0);
  assert.equal(computeStreak(null, '2026-11-02'), 0);
  assert.equal(computeStreak(sesiones, '2026-11-03'), 3);
});

test('computeBestStreak calcula la mejor racha histórica', function () {
  const sesiones = [
    { date: '2026-10-30', minutes: 10 },
    { date: '2026-10-31', minutes: 10 },
    { date: '2026-11-01', minutes: 10 },
    { date: '2026-11-02', minutes: 10 },
    { date: '2026-11-05', minutes: 10 },
    { date: '2026-11-06', minutes: 10 }
  ];
  assert.equal(computeBestStreak(sesiones, '2026-11-02'), 4);
  assert.equal(computeBestStreak([], '2026-11-02'), 0);
});

test('computeMonthDays cuenta días únicos del mes', function () {
  const sesiones = [
    { date: '2026-11-02', minutes: 30 },
    { date: '2026-11-02', minutes: 10 },
    { date: '2026-11-01', minutes: 20 },
    { date: '2026-10-31', minutes: 5 },
    null
  ];
  assert.equal(computeMonthDays(sesiones, '2026-11-02'), 2);
  assert.equal(computeMonthDays([], '2026-11-02'), 0);
});


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
  const hoy = periodo.dias.find(function (d) { return d.fecha === HOY; });
  assert.equal(hoy.esHoy, true);
  assert.equal(hoy.disponible, true);
});

test('generarPeriodo incluye el cambio de hora', function () {
  const periodo = generarPeriodo(HOY);
  const fechas = periodo.dias.map(function (d) { return d.fecha; });
  assert.equal(fechas.includes('2026-10-25'), true);
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