const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  validarObjetivo,
  minutosDeLaSemana,
  porcentajeProgreso,
  objetivoCumplido,
  leerObjetivoGuardado,
  esObjetivoIlegible
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
  assert.equal(computeStreak(sesiones, '2026-11-03'), 0);
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