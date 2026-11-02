// Lógica pura del mapa de calor. No toca DOM ni localStorage.
// Las funciones que dependen de "hoy" lo reciben como parámetro en formato AAAA-MM-DD.

function esFechaValida(texto) {
  if (typeof texto !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const partes = texto.split('-').map(Number);
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  return fecha.getFullYear() === partes[0] &&
         fecha.getMonth() === partes[1] - 1 &&
         fecha.getDate() === partes[2];
}

function esMinutoValido(valor) {
  return Number.isInteger(valor) && Number.isFinite(valor) && valor > 0;
}

function fechaDesdeTexto(texto) {
  const partes = texto.split('-').map(Number);
  return new Date(partes[0], partes[1] - 1, partes[2]);
}

function textoDesdeFecha(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function sumarDias(texto, n) {
  const fecha = fechaDesdeTexto(texto);
  fecha.setDate(fecha.getDate() + n);
  return textoDesdeFecha(fecha);
}

function obtenerLunes(texto) {
  const fecha = fechaDesdeTexto(texto);
  const desplazamiento = (fecha.getDay() + 6) % 7;
  fecha.setDate(fecha.getDate() - desplazamiento);
  return textoDesdeFecha(fecha);
}

function generarPeriodo(hoy) {
  if (!esFechaValida(hoy)) {
    throw new Error('hoy inválido');
  }
  const lunesActual = obtenerLunes(hoy);
  const inicio = sumarDias(lunesActual, -77);
  const fin = sumarDias(lunesActual, 6);
  const dias = [];
  let cursor = inicio;

  while (cursor <= fin) {
    dias.push({
      fecha: cursor,
      esHoy: cursor === hoy,
      disponible: cursor <= hoy,
      minutos: 0,
      nivel: cursor <= hoy ? 0 : null
    });
    cursor = sumarDias(cursor, 1);
  }

  if (dias.length !== 84) {
    throw new Error('periodo inválido');
  }

  return { inicio: inicio, fin: fin, dias: dias };
}

function calcularNivel(minutos) {
  if (minutos <= 0) return 0;
  if (minutos <= 30) return 1;
  if (minutos <= 60) return 2;
  if (minutos <= 120) return 3;
  return 4;
}

function sumarMinutosPorDia(sesiones, hoy) {
  const periodo = generarPeriodo(hoy);
  const mapa = new Map();

  if (!Array.isArray(sesiones)) {
    return mapa;
  }

  for (let i = 0; i < sesiones.length; i++) {
    const sesion = sesiones[i];
    if (!sesion || typeof sesion !== 'object') continue;
    if (!esFechaValida(sesion.date)) continue;
    if (!esMinutoValido(sesion.minutes)) continue;
    if (sesion.date > hoy) continue;
    if (sesion.date < periodo.inicio || sesion.date > periodo.fin) continue;

    const actual = mapa.get(sesion.date) || 0;
    mapa.set(sesion.date, actual + sesion.minutes);
  }

  return mapa;
}

function construirMapa(sesiones, hoy) {
  const periodo = generarPeriodo(hoy);
  const minutosPorDia = sumarMinutosPorDia(sesiones, hoy);

  const dias = periodo.dias.map(function (dia) {
    const minutos = minutosPorDia.get(dia.fecha) || 0;
    return {
      fecha: dia.fecha,
      esHoy: dia.esHoy,
      disponible: dia.disponible,
      minutos: minutos,
      nivel: dia.disponible ? calcularNivel(minutos) : null
    };
  });

  const semanas = [];
  for (let i = 0; i < dias.length; i += 7) {
    semanas.push(dias.slice(i, i + 7));
  }

  return {
    inicio: periodo.inicio,
    fin: periodo.fin,
    dias: dias,
    semanas: semanas
  };
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function formatearDetalle(fecha, minutos) {
  const partes = fecha.split('-');
  const dia = Number(partes[2]);
  const mes = MESES[Number(partes[1]) - 1];
  const anio = partes[0];
  return dia + ' de ' + mes + ' de ' + anio + ' · ' + minutos + ' min';
}

function resolverSeleccion(fechaSeleccionada, mapa, hoy) {
  if (fechaSeleccionada && mapa && Array.isArray(mapa.dias)) {
    for (let i = 0; i < mapa.dias.length; i++) {
      const dia = mapa.dias[i];
      if (dia.fecha === fechaSeleccionada && dia.disponible) {
        return fechaSeleccionada;
      }
    }
  }
  return hoy;
}

const Heatmap = {
  esFechaValida: esFechaValida,
  esMinutoValido: esMinutoValido,
  fechaDesdeTexto: fechaDesdeTexto,
  textoDesdeFecha: textoDesdeFecha,
  sumarDias: sumarDias,
  obtenerLunes: obtenerLunes,
  generarPeriodo: generarPeriodo,
  calcularNivel: calcularNivel,
  sumarMinutosPorDia: sumarMinutosPorDia,
  construirMapa: construirMapa,
  formatearDetalle: formatearDetalle,
  resolverSeleccion: resolverSeleccion
};

if (typeof globalThis !== 'undefined') {
  globalThis.Heatmap = Heatmap;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Heatmap;
}