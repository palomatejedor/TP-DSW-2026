const BASE_URL = "http://localhost:3000"

export const api = {
  // Socios
  getSocios: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return fetch(`${BASE_URL}/socios?${query}`).then(r => r.json())
  },
  getSocioByMail: (mail) => fetch(`${BASE_URL}/socios/by-mail/${encodeURIComponent(mail)}`).then(r => r.json()),
  createSocio: (data) => fetch(`${BASE_URL}/socios`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  updateSocio: (id, data) => fetch(`${BASE_URL}/socios/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  deleteSocio: (id) => fetch(`${BASE_URL}/socios/${id}`, { method: "DELETE" }).then(r => r.json()),

  // Actividades
  getActividades: () => fetch(`${BASE_URL}/actividades`).then(r => r.json()),
  createActividad: (data) => fetch(`${BASE_URL}/actividades`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  updateActividad: (id, data) => fetch(`${BASE_URL}/actividades/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  deleteActividad: (id) => fetch(`${BASE_URL}/actividades/${id}`, { method: "DELETE" }).then(r => r.json()),

  // Planes
  getPlanes: () => fetch(`${BASE_URL}/planes`).then(r => r.json()),
  createPlan: (data) => fetch(`${BASE_URL}/planes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  updatePlan: (id, data) => fetch(`${BASE_URL}/planes/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  deletePlan: (id) => fetch(`${BASE_URL}/planes/${id}`, { method: "DELETE" }).then(r => r.json()),

  // Inscripciones
  getInscripciones: () => fetch(`${BASE_URL}/inscripciones`).then(r => r.json()),
  createInscripcion: (data) => fetch(`${BASE_URL}/inscripciones`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  updateInscripcion: (id, data) => fetch(`${BASE_URL}/inscripciones/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  deleteInscripcion: (id) => fetch(`${BASE_URL}/inscripciones/${id}`, { method: "DELETE" }).then(r => r.json()),

  // Beneficios
  getBeneficios: () => fetch(`${BASE_URL}/beneficios`).then(r => r.json()),
  createBeneficio: (data) => fetch(`${BASE_URL}/beneficios`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  updateBeneficio: (id, data) => fetch(`${BASE_URL}/beneficios/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  deleteBeneficio: (id) => fetch(`${BASE_URL}/beneficios/${id}`, { method: "DELETE" }).then(r => r.json()),

  // Login
  login: (mail, contraseña) => fetch(`${BASE_URL}/usuarios/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mail, contraseña }) }).then(r => r.json()),

  // Recuperar contraseña
  recuperarContrasena: (numeroSocio, dni, mail) => fetch(`${BASE_URL}/usuarios/recuperar-contrasena`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ numeroSocio, dni, mail })
  }).then(r => r.json()),
}