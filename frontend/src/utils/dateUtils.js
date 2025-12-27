// Utilidades para manejo de fechas de cumpleaños
// Función para extraer día y mes de una fecha ignorando por completo la hora
const obtenerDiaMes = (fecha) => {
  // Si es un string, extraer día y mes directamente
  if (typeof fecha === 'string') {
    // Puede venir en formato YYYY-MM-DD (desde la BD)
    if (fecha.includes('-')) {
      const partes = fecha.split('-');
      if (partes.length === 3) {
        return {
          dia: parseInt(partes[2], 10),
          mes: parseInt(partes[1], 10)
        };
      }
    }
    // O puede venir en formato DD/MM/YYYY (entrada del usuario)
    if (fecha.includes('/')) {
      const partes = fecha.split('/');
      if (partes.length === 3) {
        return {
          dia: parseInt(partes[0], 10),
          mes: parseInt(partes[1], 10)
        };
      }
    }
  }
  
  // Si llegamos aquí, intentamos con Date como último recurso
  try {
    const fechaObj = new Date(fecha);
    return {
      dia: fechaObj.getDate(),
      mes: fechaObj.getMonth() + 1 // getMonth() devuelve 0-11
    };
  } catch (error) {
    console.error("Error al parsear fecha:", error);
    return null;
  }
};

// Calcular próximo cumpleaños usando solo día y mes
export const calcularProximoCumple = (fechaNacimiento) => {
  if (!fechaNacimiento) return null;
  
  // Extraer solo día y mes de la fecha de nacimiento
  const fechaNac = obtenerDiaMes(fechaNacimiento);
  if (!fechaNac) return null;
  
  // Fecha actual
  const hoy = new Date();
  const diaActual = hoy.getDate();
  const mesActual = hoy.getMonth() + 1; // getMonth() devuelve 0-11
  const anioActual = hoy.getFullYear();
  
  // Calcular el próximo cumpleaños
  let anioCumple = anioActual;
  
  // Si el cumpleaños ya pasó este año, será el próximo año
  if ((mesActual > fechaNac.mes) || 
      (mesActual === fechaNac.mes && diaActual > fechaNac.dia)) {
    anioCumple = anioActual + 1;
  }
  
  // Retornar la fecha del próximo cumpleaños (sin hora)
  return new Date(anioCumple, fechaNac.mes - 1, fechaNac.dia, 0, 0, 0, 0);
};

export const diasHastaCumple = (fechaNacimiento) => {
  if (!fechaNacimiento) return null;
  
  // Extraer solo día y mes de la fecha de nacimiento
  const fechaNac = obtenerDiaMes(fechaNacimiento);
  if (!fechaNac) return null;
  
  // Fecha actual
  const hoy = new Date();
  const diaActual = hoy.getDate();
  const mesActual = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();
  
  // Fechas para comparación (ignorando totalmente la hora)
  const fechaHoy = new Date(anioActual, mesActual - 1, diaActual, 0, 0, 0, 0);
  
  // Calcular el próximo cumpleaños
  let anioCumple = anioActual;
  
  // Si el cumpleaños ya pasó este año, será el próximo año
  if ((mesActual > fechaNac.mes) || 
      (mesActual === fechaNac.mes && diaActual > fechaNac.dia)) {
    anioCumple = anioActual + 1;
  }
  
  const fechaCumple = new Date(anioCumple, fechaNac.mes - 1, fechaNac.dia, 0, 0, 0, 0);
  
  // Calcular diferencia en días
  const MS_POR_DIA = 24 * 60 * 60 * 1000;
  const diffMs = fechaCumple.getTime() - fechaHoy.getTime();
  const dias = Math.round(diffMs / MS_POR_DIA);

  // Para debugging
  console.log({
    fechaNacimiento,
    diaExtractado: fechaNac.dia,
    mesExtractado: fechaNac.mes,
    fechaActual: `${diaActual}/${mesActual}/${anioActual}`,
    proximoCumple: fechaCumple.toISOString().split('T')[0],
    dias
  });
  
  return dias;
};

/**
 * Determina el estado visual del cumpleaños de un cliente
 * @param {string|Date} fechaNacimiento - Fecha de nacimiento del cliente
 * @param {boolean} saludado - Si el cliente fue saludado este año
 * @returns {string} El estado del cumpleaños como clase CSS
 */
export const estadoCumple = (fechaNacimiento, saludado) => {
  if (!fechaNacimiento) return 'sin-fecha';
  
  const dias = diasHastaCumple(fechaNacimiento);
  
  // Si no pudimos calcular los días, retornar sin fecha
  if (dias === null) return 'sin-fecha';
  
  if (dias === 0) return saludado ? 'hoy-saludado' : 'hoy-no-saludado';
  if (dias === 1) return saludado ? 'maniana-saludado' : 'maniana-no-saludado';
  if (dias <= 5) return saludado ? 'proximo-saludado' : 'proximo-no-saludado';
  return saludado ? 'lejano-saludado' : 'lejano';
};

// Función auxiliar para formatear fechas en formato legible
export const formatearFecha = (fecha) => {
  if (!fecha) return '';
  
  // Extraer solo día y mes sin depender de Date
  const fechaInfo = obtenerDiaMes(fecha);
  if (!fechaInfo) return 'Fecha inválida';
  
  return `${fechaInfo.dia.toString().padStart(2, '0')}/${fechaInfo.mes.toString().padStart(2, '0')}`;
};

// Función para formatear fecha completa
export const formatearFechaCompleta = (fecha) => {
  if (!fecha) return '';
  
  try {
    // Para extraer el año, necesitamos usar Date
    const d = new Date(fecha);
    const anio = d.getFullYear();
    
    // Para día y mes usamos nuestra función segura
    const fechaInfo = obtenerDiaMes(fecha);
    if (!fechaInfo) return 'Fecha inválida';
    
    return `${fechaInfo.dia.toString().padStart(2, '0')}/${fechaInfo.mes.toString().padStart(2, '0')}/${anio}`;
  } catch (error) {
    console.error("Error al formatear fecha completa:", error);
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha sin realizar conversión de zona horaria
 * Útil para fechas que vienen del backend ya en la zona horaria correcta
 * @param {string} fechaString - Fecha en formato ISO (YYYY-MM-DDTHH:mm:ss)
 * @returns {string} Fecha formateada como DD/MM/YYYY
 */
export const formatearFechaLocal = (fechaString) => {
  if (!fechaString) return '';
  
  try {
    // Extraer la parte de la fecha (antes de 'T')
    const partesFecha = fechaString.split('T')[0].split('-');
    
    if (partesFecha.length !== 3) return 'Fecha inválida';
    
    const anio = partesFecha[0];
    const mes = partesFecha[1];
    const dia = partesFecha[2];
    
    // Retornar en formato DD/MM/YYYY
    return `${dia}/${mes}/${anio}`;
  } catch (error) {
    console.error("Error al formatear fecha local:", error);
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha y hora sin realizar conversión de zona horaria
 * @param {string} fechaString - Fecha en formato ISO (YYYY-MM-DDTHH:mm:ss)
 * @returns {string} Fecha formateada como DD/MM/YYYY HH:MM
 */
export const formatearFechaHoraLocal = (fechaString) => {
  if (!fechaString) return '';
  
  try {
    // Dividir fecha y hora
    const partes = fechaString.split('T');
    if (partes.length !== 2) return 'Fecha inválida';
    
    // Procesar fecha
    const partesFecha = partes[0].split('-');
    if (partesFecha.length !== 3) return 'Fecha inválida';
    
    const anio = partesFecha[0];
    const mes = partesFecha[1];
    const dia = partesFecha[2];
    
    // Procesar hora (puede tener milisegundos y zona horaria)
    const horaCompleta = partes[1].split('.')[0]; // Eliminar milisegundos si los hay
    const partesHora = horaCompleta.split(':');
    
    if (partesHora.length < 2) return 'Fecha inválida';
    
    const hora = partesHora[0];
    const minuto = partesHora[1];
    
    // Retornar en formato DD/MM/YYYY HH:MM
    return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
  } catch (error) {
    console.error("Error al formatear fecha y hora local:", error);
    return 'Fecha inválida';
  }
};
