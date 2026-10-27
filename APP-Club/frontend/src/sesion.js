// La sesión del socio dura una hora desde que inicia sesión
export const DURACION_SESION_SOCIO = 15 * 60 * 1000

// Milisegundos que le quedan a la sesión del socio (los admins no vencen)
export function tiempoRestante(usuario) {
  if (!usuario || usuario.rol !== 'socio') return Infinity
  if (!usuario.inicioSesion) return 0
  return usuario.inicioSesion + DURACION_SESION_SOCIO - Date.now()
}

export function sesionVencida(usuario) {
  return tiempoRestante(usuario) <= 0
}

// Cierra la sesión y deja la marca para que el login avise por qué
export function cerrarPorVencimiento() {
  localStorage.removeItem('usuario')
  localStorage.setItem('sesionExpirada', '1')
}
