const STORAGE_KEY = 'studySessions';
const STORAGE_GOAL_KEY = 'studyWeeklyGoal';

const HM = (typeof require === 'function')
  ? require('./heatmap.js')
  : (typeof globalThis !== 'undefined' ? globalThis.Heatmap : {});

let sesionesIlegibles = false;
let textoIlegible = null;

function loadSessions() {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      sesionesIlegibles = true;
      textoIlegible = raw;
      return [];
    }
    return parsed;
  } catch (e) {
    sesionesIlegibles = true;
    textoIlegible = raw;
    return [];
  }
}

function saveSessions(sessions) {
  if (typeof localStorage === 'undefined') return;
  if (sesionesIlegibles && textoIlegible !== null) {
    try {
      localStorage.setItem(STORAGE_KEY + '_backup_' + Date.now(), textoIlegible);
      sesionesIlegibles = false;
      textoIlegible = null;
    } catch (e) {
      return;
    }
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    return;
  }
}

let sessions = (typeof localStorage !== 'undefined') ? loadSessions() : [];
let seleccionMapa = null;
let mapaActual = null;

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function esFechaValida(texto) {
  return HM.esFechaValida(texto);
}

function esMinutoValido(valor) {
  return HM.esMinutoValido(valor);
}

function fechaDesdeTexto(texto) {
  return HM.fechaDesdeTexto(texto);
}

function textoDesdeFecha(fecha) {
  return HM.textoDesdeFecha(fecha);
}

function diasValidos(sesiones) {
  const conjunto = new Set();
  if (!Array.isArray(sesiones)) return conjunto;
  for (let i = 0; i < sesiones.length; i++) {
    const sesion = sesiones[i];
    if (!sesion || typeof sesion !== 'object') continue;
    if (HM.esFechaValida(sesion.date)) {
      conjunto.add(sesion.date);
    }
  }
  return conjunto;
}

function computeStreak(sesiones, hoy) {
  const days = diasValidos(sesiones);
  const today = (hoy === undefined) ? todayStr() : hoy;
  if (!HM.esFechaValida(today)) return 0;

  let cursor = null;
  if (days.has(today)) {
    cursor = today;
  } else {
    const yd = HM.fechaDesdeTexto(today);
    yd.setDate(yd.getDate() - 1);
    const ys = HM.textoDesdeFecha(yd);
    if (days.has(ys)) {
      cursor = ys;
    } else {
      return 0;
    }
  }

  let count = 0;
  let cur = cursor;
  while (days.has(cur)) {
    count++;
    const d = HM.fechaDesdeTexto(cur);
    d.setDate(d.getDate() - 1);
    cur = HM.textoDesdeFecha(d);
  }
  return count;
}

function computeBestStreak(sesiones, hoy) {
  const days = Array.from(diasValidos(sesiones)).sort();
  if (days.length === 0) return 0;

  let best = 1;
  let current = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = HM.fechaDesdeTexto(days[i - 1]);
    prev.setDate(prev.getDate() + 1);
    if (HM.textoDesdeFecha(prev) === days[i]) {
      current++;
      if (current > best) best = current;
    } else {
      current = 1;
    }
  }
  return best;
}

function minutosDeLaSemana(sesiones, hoy) {
  if (!HM.esFechaValida(hoy)) return 0;
  const lunes = HM.obtenerLunes(hoy);
  const domingo = HM.sumarDias(lunes, 6);
  let total = 0;

  if (!Array.isArray(sesiones)) return total;

  for (let i = 0; i < sesiones.length; i++) {
    const sesion = sesiones[i];
    if (!sesion || typeof sesion !== 'object') continue;
    if (!HM.esFechaValida(sesion.date)) continue;
    if (!HM.esMinutoValido(sesion.minutes)) continue;
    if (sesion.date > hoy) continue;
    if (sesion.date < lunes || sesion.date > domingo) continue;
    total += sesion.minutes;
  }

  return total;
}

function porcentajeProgreso(hechos, objetivo) {
  if (!HM.esMinutoValido(objetivo)) return 0;
  const porcentaje = (hechos / objetivo) * 100;
  return Math.min(100, Math.round(porcentaje));
}

function objetivoCumplido(hechos, objetivo) {
  return HM.esMinutoValido(objetivo) && hechos >= objetivo;
}

function computeMonthDays(sesiones, hoy) {
  if (!HM.esFechaValida(hoy)) return 0;
  const month = hoy.slice(0, 7);
  let total = 0;

  diasValidos(sesiones).forEach(function (day) {
    if (day.slice(0, 7) === month) {
      total++;
    }
  });

  return total;
}

function validarObjetivo(texto) {
  const s = String(texto == null ? '' : texto);
  if (s === '1.0') return { valido: true, valor: 1 };
  if (!/^[1-9][0-9]*$/.test(s)) return { valido: false, valor: null };
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return { valido: false, valor: null };
  return { valido: true, valor: n };
}

function esObjetivoIlegible(valor) {
  if (valor === null || valor === undefined || valor === '') return false;
  const n = Number(valor);
  if (n === 0 && (valor === '0' || valor === 0)) return false;
  return !Number.isFinite(n) || !Number.isInteger(n) || n <= 0;
}

function leerObjetivoGuardado(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  if (n === 0) return null;
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) return null;
  return n;
}

function renderMapa() {
  const grid = document.getElementById('heatmap-grid');
  const detail = document.getElementById('heatmap-detail');
  const legend = document.getElementById('heatmap-legend');
  if (!grid || !detail || !legend) return;

  const hoy = todayStr();
  mapaActual = Heatmap.construirMapa(sessions, hoy);
  seleccionMapa = Heatmap.resolverSeleccion(seleccionMapa, mapaActual, hoy);

  grid.innerHTML = '';
  for (let fila = 0; fila < 7; fila++) {
    const filaEl = document.createElement('div');
    filaEl.className = 'heatmap-row';
    filaEl.setAttribute('role', 'row');
    for (let col = 0; col < 12; col++) {
      const dia = mapaActual.semanas[col][fila];
      const celda = document.createElement(dia.disponible ? 'button' : 'span');
      celda.className = 'heatmap-cell ' +
        (dia.disponible ? 'heatmap-cell--available nivel-' + dia.nivel : 'heatmap-cell--unavailable');
      celda.dataset.fecha = dia.fecha;
      celda.style.gridColumn = String(col + 1);
      celda.style.gridRow = String(fila + 1);
      celda.setAttribute('aria-colindex', String(col + 1));
      celda.setAttribute('aria-rowindex', String(fila + 1));
      celda.setAttribute('role', 'gridcell');

      if (dia.disponible) {
        celda.type = 'button';
        celda.setAttribute('aria-label', dia.fecha + ': ' + dia.minutos + ' minutos');
        celda.tabIndex = dia.fecha === seleccionMapa ? 0 : -1;
        if (dia.fecha === seleccionMapa) {
          celda.classList.add('heatmap-cell--selected');
        }
      } else {
        celda.tabIndex = -1;
        celda.setAttribute('aria-disabled', 'true');
      }

      filaEl.appendChild(celda);
    }
    grid.appendChild(filaEl);
  }

  const diaSeleccionado = mapaActual.dias.find(function (d) { return d.fecha === seleccionMapa; });
  const minutosSeleccionados = diaSeleccionado ? diaSeleccionado.minutos : 0;
  detail.textContent = Heatmap.formatearDetalle(seleccionMapa, minutosSeleccionados);

  legend.innerHTML = '';
  const etiquetas = ['0 min', '1-30 min', '31-60 min', '61-120 min', 'más de 120 min'];
  const menos = document.createElement('span');
  menos.className = 'heatmap-legend__label';
  menos.textContent = 'Menos';
  legend.appendChild(menos);

  for (let nivel = 0; nivel <= 4; nivel++) {
    const muestra = document.createElement('span');
    muestra.className = 'heatmap-legend__swatch nivel-' + nivel;
    muestra.setAttribute('aria-label', etiquetas[nivel]);
    legend.appendChild(muestra);
  }

  const mas = document.createElement('span');
  mas.className = 'heatmap-legend__label';
  mas.textContent = 'Más';
  legend.appendChild(mas);
}

function seleccionarDiaHeatmap(fecha) {
  if (!mapaActual) return;
  const dia = mapaActual.dias.find(function (d) { return d.fecha === fecha && d.disponible; });
  if (!dia) return;

  const anterior = document.querySelector('.heatmap-cell--selected');
  if (anterior) anterior.classList.remove('heatmap-cell--selected');

  const nueva = document.querySelector('[data-fecha="' + fecha + '"].heatmap-cell--available');
  if (nueva) {
    nueva.classList.add('heatmap-cell--selected');
    document.querySelectorAll('.heatmap-cell--available').forEach(function (c) { c.tabIndex = -1; });
    nueva.tabIndex = 0;
  }

  seleccionMapa = fecha;
  const detail = document.getElementById('heatmap-detail');
  if (detail) {
    detail.textContent = Heatmap.formatearDetalle(fecha, dia.minutos);
  }
}

function renderObjetivo() {
  const objetivoRaw = (typeof localStorage !== 'undefined') ? localStorage.getItem(STORAGE_GOAL_KEY) : null;
  const objetivo = leerObjetivoGuardado(objetivoRaw);
  const hechos = minutosDeLaSemana(sessions, todayStr());

  const invite = document.getElementById('goal-invite');
  const progress = document.getElementById('goal-progress');
  const text = document.getElementById('goal-text');
  const bar = document.getElementById('goal-bar');
  const fill = document.getElementById('goal-bar-fill');
  const complete = document.getElementById('goal-complete');

  if (objetivo === null) {
    if (invite) invite.hidden = false;
    if (progress) progress.hidden = true;
    if (bar) bar.removeAttribute('aria-valuenow');
    return;
  }

  if (invite) invite.hidden = true;
  if (progress) progress.hidden = false;
  if (text) text.textContent = hechos + ' / ' + objetivo + ' min';

  const porcentaje = porcentajeProgreso(hechos, objetivo);
  if (fill) fill.style.width = porcentaje + '%';
  if (bar) bar.setAttribute('aria-valuenow', String(porcentaje));
  if (complete) complete.hidden = !objetivoCumplido(hechos, objetivo);
}

function guardarObjetivo(texto) {
  const resultado = validarObjetivo(texto);
  const error = document.getElementById('goal-error');
  const input = document.getElementById('goal-input');

  if (!resultado.valido) {
    if (error) error.textContent = 'Introduce un número entero mayor que 0.';
    return;
  }

  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_GOAL_KEY);
    if (raw !== null && raw !== '' && esObjetivoIlegible(raw)) {
      try {
        localStorage.setItem(STORAGE_GOAL_KEY + '_backup_' + Date.now(), raw);
      } catch (e) {
        if (error) error.textContent = 'No se pudo guardar el objetivo.';
        return;
      }
    }
    try {
      localStorage.setItem(STORAGE_GOAL_KEY, String(resultado.valor));
    } catch (e) {
      if (error) error.textContent = 'No se pudo guardar el objetivo.';
      return;
    }
  }

  if (input) input.value = '';
  if (error) error.textContent = '';
  renderObjetivo();
}

function renderStreaks() {
  const current = computeStreak(sessions, todayStr());
  const best = computeBestStreak(sessions, todayStr());
  document.getElementById('streak').textContent = current;
  document.getElementById('streak-label').textContent = current === 1 ? 'día seguido' : 'días seguidos';
  document.getElementById('best-streak').textContent = best;
  document.getElementById('week-minutes').textContent = minutosDeLaSemana(sessions, todayStr());
  const monthDays = computeMonthDays(sessions, todayStr());
  document.getElementById('month-days').textContent = monthDays;
}

function renderSessions() {
  const list = document.getElementById('sessions');
  list.innerHTML = '';

  if (sessions.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Todavía no hay sesiones.';
    list.appendChild(li);
    return;
  }

  const sorted = sessions.slice().sort(function (a, b) {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return b.id - a.id;
  });

  sorted.forEach(function (s) {
    const li = document.createElement('li');
    li.className = 'session-item';

    const left = document.createElement('div');
    const topic = document.createElement('div');
    topic.className = 'session-topic';
    topic.textContent = s.topic;
    const meta = document.createElement('div');
    meta.className = 'session-meta';
    meta.textContent = s.date + ' · ' + s.minutes + ' min';
    left.appendChild(topic);
    left.appendChild(meta);

    li.appendChild(left);
    list.appendChild(li);
  });
}

function render() {
  renderStreaks();
  renderMapa();
  renderObjetivo();
  renderSessions();
}

if (typeof document !== 'undefined') {
  const form = document.getElementById('session-form');
  const dateInput = document.getElementById('date');
  const topicInput = document.getElementById('topic');
  const minutesInput = document.getElementById('minutes');

  dateInput.value = todayStr();
  dateInput.max = todayStr();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const date = dateInput.value;
    const topic = topicInput.value.trim();
    const minutes = Number(minutesInput.value);

    if (!date || !topic || !(minutes > 0) || date > todayStr()) {
      return;
    }

    sessions = (typeof localStorage !== 'undefined') ? loadSessions() : sessions;
    sessions.push({
      id: Date.now(),
      date: date,
      topic: topic,
      minutes: minutes
    });
    saveSessions(sessions);
    render();

    topicInput.value = '';
    minutesInput.value = '';
    dateInput.value = todayStr();
    dateInput.max = todayStr();
  });

  const goalForm = document.getElementById('goal-form');
  const goalInput = document.getElementById('goal-input');
  if (goalForm) {
    goalForm.addEventListener('submit', function (e) {
      e.preventDefault();
      guardarObjetivo(goalInput ? goalInput.value : '');
    });
  }

  const heatmapGrid = document.getElementById('heatmap-grid');
  if (heatmapGrid) {
    heatmapGrid.addEventListener('mouseover', function (e) {
      const celda = e.target.closest('.heatmap-cell--available');
      if (!celda || !mapaActual) return;
      const dia = mapaActual.dias.find(function (d) { return d.fecha === celda.dataset.fecha; });
      if (!dia) return;
      const detail = document.getElementById('heatmap-detail');
      if (detail) {
        detail.textContent = Heatmap.formatearDetalle(celda.dataset.fecha, dia.minutos);
      }
    });

    heatmapGrid.addEventListener('mouseleave', function () {
      if (!mapaActual) return;
      const detail = document.getElementById('heatmap-detail');
      const dia = mapaActual.dias.find(function (d) { return d.fecha === seleccionMapa; });
      if (detail && dia) {
        detail.textContent = Heatmap.formatearDetalle(seleccionMapa, dia.minutos);
      }
    });

    heatmapGrid.addEventListener('click', function (e) {
      const celda = e.target.closest('.heatmap-cell--available');
      if (celda) {
        seleccionarDiaHeatmap(celda.dataset.fecha);
      }
    });

    heatmapGrid.addEventListener('focusin', function (e) {
      const celda = e.target.closest('.heatmap-cell--available');
      if (celda) {
        seleccionarDiaHeatmap(celda.dataset.fecha);
      }
    });

    heatmapGrid.addEventListener('keydown', function (e) {
      if (!mapaActual) return;
      const activo = document.activeElement;
      if (!activo || !activo.classList.contains('heatmap-cell--available')) return;

      const fecha = activo.dataset.fecha;
      const indice = mapaActual.dias.findIndex(function (d) { return d.fecha === fecha; });
      if (indice < 0) return;

      let objetivo = null;
      if (e.key === 'ArrowRight') objetivo = indice + 7;
      else if (e.key === 'ArrowLeft') objetivo = indice - 7;
      else if (e.key === 'ArrowDown') objetivo = indice + 1;
      else if (e.key === 'ArrowUp') objetivo = indice - 1;
      else if (e.key === 'Home') {
        objetivo = mapaActual.dias.findIndex(function (d) { return d.disponible; });
      } else if (e.key === 'End') {
        for (let i = mapaActual.dias.length - 1; i >= 0; i--) {
          if (mapaActual.dias[i].disponible) { objetivo = i; break; }
        }
      } else {
        return;
      }

      if (objetivo === null) return;
      while (objetivo >= 0 && objetivo < mapaActual.dias.length && !mapaActual.dias[objetivo].disponible) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'End') objetivo++;
        else objetivo--;
      }

      if (objetivo < 0 || objetivo >= mapaActual.dias.length) return;
      if (!mapaActual.dias[objetivo].disponible) return;

      e.preventDefault();
      const nuevaFecha = mapaActual.dias[objetivo].fecha;
      const boton = heatmapGrid.querySelector('[data-fecha="' + nuevaFecha + '"]');
      if (boton) boton.focus();
    });
  }

  render();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validarObjetivo: validarObjetivo,
    minutosDeLaSemana: minutosDeLaSemana,
    porcentajeProgreso: porcentajeProgreso,
    objetivoCumplido: objetivoCumplido,
    leerObjetivoGuardado: leerObjetivoGuardado,
    esObjetivoIlegible: esObjetivoIlegible,
    computeStreak: computeStreak,
    computeBestStreak: computeBestStreak,
    computeMonthDays: computeMonthDays
  };
}