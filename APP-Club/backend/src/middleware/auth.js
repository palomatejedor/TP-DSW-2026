const jwt = require("jsonwebtoken")
const { AppDataSource } = require("../database")

// El socio dura 15 minutos (igual que el límite del frontend); el administrador, una hora
const DURACION_SOCIO = "15m"
const DURACION_ADMIN = "1h"

const secreto = () => {
  if (!process.env.JWT_SECRET) throw new Error("Falta JWT_SECRET en el archivo .env del backend")
  return process.env.JWT_SECRET
}

// Se llama al iniciar sesión: devuelve el token firmado
function firmarToken(usuario) {
  return jwt.sign({ id: usuario.id, mail: usuario.mail, rol: usuario.rol }, secreto(), { expiresIn: usuario.rol === "socio" ? DURACION_SOCIO : DURACION_ADMIN })
}

// Pedidos que no necesitan sesión
const PUBLICAS = [
  ["POST", "/usuarios/login"],
  ["POST", "/usuarios/registro"],
  ["POST", "/usuarios/recuperar-contrasena"],
]

const deny = (res, status, error) => res.status(status).json({ error })

// Socio (de la tabla socio) que corresponde a la cuenta que hace el pedido
async function miSocio(req) {
  if (req._miSocio === undefined) {
    req._miSocio = await AppDataSource.getRepository("Socio").findOne({
      where: { mail: req.usuario.mail },
      relations: ["titular"],
    })
  }
  return req._miSocio
}

const grupoDe = (socio) => (socio.titular ? socio.titular.id : socio.id)

// ¿El socio con ese id es la persona logueada o parte de su mismo grupo familiar?
async function esDeMiGrupo(req, socioId) {
  const yo = await miSocio(req)
  if (!yo || !socioId) return false
  if (yo.id === socioId) return true
  const otro = await AppDataSource.getRepository("Socio").findOne({ where: { id: socioId }, relations: ["titular"] })
  return !!otro && grupoDe(otro) === grupoDe(yo)
}

// Control de acceso: se ejecuta antes de todas las rutas
async function controlDeAcceso(req, res, next) {
  try {
    if (req.method === "OPTIONS") return next()
    const ruta = req.path.replace(/\/+$/, "") || "/"
    const metodo = req.method

    if (PUBLICAS.some(([m, r]) => m === metodo && r === ruta)) return next()

    // 1) Tiene que haber un token válido
    const cabecera = req.headers.authorization || ""
    const token = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : null
    if (!token) return deny(res, 401, "Necesitás iniciar sesión")
    try {
      req.usuario = jwt.verify(token, secreto())
    } catch {
      return deny(res, 401, "Tu sesión venció. Volvé a iniciar sesión")
    }

    // 2) Cualquier usuario logueado puede cambiar su propia contraseña
    if (metodo === "POST" && ruta === "/usuarios/cambiar-contrasena") return next()

    // 3) El administrador accede a todo lo demás
    if (req.usuario.rol === "admin") return next()
    if (req.usuario.rol !== "socio") return deny(res, 403, "No tenés permiso para hacer esto")

    // 4) El socio solo accede a lo suyo
    const partes = ruta.split("/").filter(Boolean) // ["socios", "5", "familia"]
    const [recurso, a, b] = partes

    // Catálogos: solo lectura
    if (metodo === "GET" && ["actividades", "planes", "beneficios"].includes(recurso)) return next()

    if (recurso === "socios") {
      if (metodo === "GET" && a === "by-mail" && b) {
        if (decodeURIComponent(b).toLowerCase() === String(req.usuario.mail).toLowerCase()) return next()
        return deny(res, 403, "No tenés permiso para ver los datos de otro socio")
      }
      const id = parseInt(a)
      if (metodo === "GET" && id && (!b || b === "familia")) {
        if (await esDeMiGrupo(req, id)) return next()
        return deny(res, 403, "No tenés permiso para ver los datos de otro socio")
      }
      if (metodo === "PUT" && id && !b) {
        // Un socio solo puede elegir su plan (o el de su grupo), nada más
        const campos = Object.keys(req.body || {})
        if (campos.length === 1 && campos[0] === "plan" && await esDeMiGrupo(req, id)) return next()
        return deny(res, 403, "No tenés permiso para modificar esos datos")
      }
    }

    if (recurso === "inscripciones") {
      if (metodo === "GET") return next()
      if (metodo === "POST" && !a) {
        const socioId = parseInt(req.body && req.body.socio && req.body.socio.id)
        if (await esDeMiGrupo(req, socioId)) return next()
        return deny(res, 403, "Solo podés inscribir a las personas de tu grupo")
      }
      if (metodo === "PUT" && a) {
        const insc = await AppDataSource.getRepository("Inscripcion").findOne({ where: { id: parseInt(a) }, relations: ["socio"] })
        const campos = Object.keys(req.body || {})
        if (insc && insc.socio && campos.length === 1 && campos[0] === "estado" && await esDeMiGrupo(req, insc.socio.id)) return next()
        return deny(res, 403, "No tenés permiso para modificar esta inscripción")
      }
    }

    if (recurso === "pagos") {
      if (metodo === "GET" && a === "socio" && b) {
        if (await esDeMiGrupo(req, parseInt(b))) return next()
        return deny(res, 403, "No tenés permiso para ver estas cuotas")
      }
      if (metodo === "PUT" && b === "pagar") {
        const yo = await miSocio(req)
        const pago = await AppDataSource.getRepository("Pago").findOne({ where: { id: parseInt(a) }, relations: ["socio"] })
        if (yo && pago && pago.socio && pago.socio.id === yo.id) return next()
        return deny(res, 403, "No tenés permiso para pagar esta cuota")
      }
    }

    return deny(res, 403, "No tenés permiso para hacer esto")
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { firmarToken, controlDeAcceso }