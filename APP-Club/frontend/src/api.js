const BASE_URL = "http://localhost:3000"

// Todos los pedidos pasan por acá: se agrega el token de la sesión y,
// si el servidor dice que la sesión no existe o venció, se vuelve al login.
const pedir = (ruta, opciones = {}) => {
  let token = null
  try { token = JSON.parse(localStorage.getItem("usuario") || "null")?.token } catch { /* sin sesión */ }
  const headers = { ...(opciones.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  return fetch(`${BASE_URL}${ruta}`, { ...opciones, headers }).then(async (r) => {
    const data = await r.json()
    if (r.status === 401 && ruta !== "/usuarios/login") {
      localStorage.removeItem("usuario")
      localStorage.setItem("sesionExpirada", "1")
      window.location.href = "/"
    }
    return data
  })
}

export const api = {
  // Socios
  getSocios: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return pedir(`/socios?${query}`)
  },
  getSociosSinMail: () => pedir(`/socios/sin-mail`),
  getSocioByMail: (mail) => pedir(`/socios/by-mail/${encodeURIComponent(mail)}`),
  getFamilia: (id) => pedir(`/socios/${id}/familia`),
  createSocio: (data) => pedir(`/socios`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  updateSocio: (id, data) => pedir(`/socios/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  deleteSocio: (id) => pedir(`/socios/${id}`, { method: "DELETE" }),

  // Actividades
  getActividades: () => pedir(`/actividades`),
  createActividad: (data) => pedir(`/actividades`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  updateActividad: (id, data) => pedir(`/actividades/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  deleteActividad: (id) => pedir(`/actividades/${id}`, { method: "DELETE" }),

  // Planes
  getPlanes: () => pedir(`/planes`),
  createPlan: (data) => pedir(`/planes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  updatePlan: (id, data) => pedir(`/planes/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  deletePlan: (id) => pedir(`/planes/${id}`, { method: "DELETE" }),

  // Inscripciones
  getInscripciones: () => pedir(`/inscripciones`),
  createInscripcion: (data) => pedir(`/inscripciones`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  updateInscripcion: (id, data) => pedir(`/inscripciones/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  deleteInscripcion: (id) => pedir(`/inscripciones/${id}`, { method: "DELETE" }),

  // Beneficios
  getBeneficios: () => pedir(`/beneficios`),
  createBeneficio: (data) => pedir(`/beneficios`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  updateBeneficio: (id, data) => pedir(`/beneficios/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  deleteBeneficio: (id) => pedir(`/beneficios/${id}`, { method: "DELETE" }),

  // Pagos / cuotas
  getPagos: () => pedir(`/pagos`),
  getCuotasSocio: (id) => pedir(`/pagos/socio/${id}`),
  pagarCuota: (id) => pedir(`/pagos/${id}/pagar`, { method: "PUT" }),

  // Registro de cuentas de socio (con aprobación del administrador)
  registrarse: (mail, dni, contraseña) => pedir(`/usuarios/registro`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mail, dni, contraseña }) }),
  getSolicitudes: () => pedir(`/usuarios/solicitudes`),
  aprobarSolicitud: (id) => pedir(`/usuarios/${id}/aprobar`, { method: "PUT" }),
  rechazarSolicitud: (id) => pedir(`/usuarios/${id}/rechazar`, { method: "PUT" }),

  // Administradores y cambio de contraseña
  getAdmins: () => pedir(`/usuarios/admins`),
  crearAdmin: (data) => pedir(`/usuarios/admins`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  eliminarAdmin: (id) => pedir(`/usuarios/admins/${id}`, { method: "DELETE" }),
  cambiarContrasena: (actual, nueva) => pedir(`/usuarios/cambiar-contrasena`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actual, nueva }) }),

  // Login
  login: (mail, contraseña) => pedir(`/usuarios/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mail, contraseña }) }),

  // Recuperar contraseña
  recuperarContrasena: (numeroSocio, dni, mail) => pedir(`/usuarios/recuperar-contrasena`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ numeroSocio, dni, mail })
  }),
}