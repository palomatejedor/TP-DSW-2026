const express = require("express")
const bcrypt = require("bcryptjs")
const router = express.Router()
const { AppDataSource } = require("../database")
const { enviarMailNuevaContraseña, generarContraseña } = require("../utils/mailer")
const { firmarToken } = require("../middleware/auth")

const getUsuarioRepo = () => AppDataSource.getRepository("Usuario")
const getSocioRepo = () => AppDataSource.getRepository("Socio")

const esHash = (texto) => typeof texto === "string" && texto.startsWith("$2")
const encriptar = (texto) => bcrypt.hash(texto, 10)

// Nunca se devuelve la contraseña
const sinContraseña = (u) => {
  const { contraseña, ...resto } = u
  return resto
}

router.get("/", async (req, res) => {
  try {
    const usuarios = await getUsuarioRepo().find()
    res.json(usuarios.map(sinContraseña))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { mail, contraseña } = req.body
    const usuario = await getUsuarioRepo().findOneBy({ mail })
    if (!usuario || !contraseña) return res.status(401).json({ error: "Email o contraseña incorrectos" })

    // Contraseñas encriptadas (nuevas) o en texto plano (cuentas viejas)
    let coincide = false
    if (esHash(usuario.contraseña)) {
      coincide = await bcrypt.compare(contraseña, usuario.contraseña)
    } else {
      coincide = usuario.contraseña === contraseña
      if (coincide) {
        // La cuenta vieja se encripta sola la primera vez que ingresa
        usuario.contraseña = await encriptar(contraseña)
        await getUsuarioRepo().save(usuario)
      }
    }
    if (!coincide) return res.status(401).json({ error: "Email o contraseña incorrectos" })

    if (usuario.estado === "Pendiente") {
      return res.status(403).json({
        pendiente: true,
        error: "Tu cuenta está pendiente de aprobación. La administración te avisará cuando puedas ingresar.",
      })
    }
    if (usuario.estado === "Rechazado") {
      return res.status(403).json({
        rechazado: true,
        error: "Tu solicitud de cuenta fue rechazada. Comunicate con la administración.",
      })
    }

    // Un socio dado de baja (inactivo) no puede ingresar a la app
    if (usuario.rol === "socio") {
      const socio = await getSocioRepo().findOneBy({ mail: usuario.mail })
      if (socio && socio.estado !== "Activo") {
        return res.status(403).json({
          inactivo: true,
          error: "Socio inactivo: no puede ingresar a la app del club. Comuníquese con el administrador.",
        })
      }
    }
    res.json({
      token: firmarToken(usuario),
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      mail: usuario.mail,
      rol: usuario.rol,
      debeCambiarClave: !!usuario.debe_cambiar_clave,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /usuarios/cambiar-contrasena
// body: { actual, nueva }  -> el usuario elige su propia contraseña (la cuenta sale del token)
router.post("/cambiar-contrasena", async (req, res) => {
  try {
    const { actual, nueva } = req.body
    const id = req.usuario.id
    if (!actual || !nueva) return res.status(400).json({ error: "Completá todos los campos" })
    if (String(nueva).length < 6) return res.status(400).json({ error: "La contraseña nueva debe tener al menos 6 caracteres" })
    if (actual === nueva) return res.status(400).json({ error: "La contraseña nueva debe ser distinta de la actual" })

    const usuario = await getUsuarioRepo().findOneBy({ id: parseInt(id) })
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" })

    const coincide = esHash(usuario.contraseña)
      ? await bcrypt.compare(actual, usuario.contraseña)
      : usuario.contraseña === actual
    if (!coincide) return res.status(400).json({ error: "La contraseña actual es incorrecta" })

    usuario.contraseña = await encriptar(String(nueva))
    usuario.debe_cambiar_clave = false
    await getUsuarioRepo().save(usuario)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---- Administradores (los crea y elimina otro administrador) ----

// GET /usuarios/admins
router.get("/admins", async (req, res) => {
  try {
    const admins = await getUsuarioRepo().find({ where: { rol: "admin" }, order: { apellido: "ASC", nombre: "ASC" } })
    res.json(admins.map(a => ({
      id: a.id, nombre: a.nombre, apellido: a.apellido, mail: a.mail, estado: a.estado,
      debe_cambiar_clave: !!a.debe_cambiar_clave,
    })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /usuarios/admins   body: { nombre, apellido, mail, contraseña (temporal) }
router.post("/admins", async (req, res) => {
  try {
    const nombre = (req.body.nombre || "").trim()
    const apellido = (req.body.apellido || "").trim()
    const mail = (req.body.mail || "").trim().toLowerCase()
    const contraseña = req.body.contraseña || ""

    if (!nombre || !apellido || !mail || !contraseña) return res.status(400).json({ error: "Completá todos los campos" })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return res.status(400).json({ error: "El formato del mail es inválido" })
    if (String(contraseña).length < 6) return res.status(400).json({ error: "La contraseña temporal debe tener al menos 6 caracteres" })

    const existente = await getUsuarioRepo().findOneBy({ mail })
    if (existente) return res.status(400).json({ error: "Ya existe una cuenta con ese mail" })

    const admin = getUsuarioRepo().create({
      nombre, apellido, mail,
      contraseña: await encriptar(String(contraseña)),
      rol: "admin",
      estado: "Activo",
      debe_cambiar_clave: true,
    })
    await getUsuarioRepo().save(admin)
    res.status(201).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /usuarios/admins/:id  (nadie puede eliminar su propia cuenta; el solicitante sale del token)
router.delete("/admins/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const solicitante = req.usuario.id
    if (id === solicitante) return res.status(400).json({ error: "No podés eliminar tu propia cuenta" })

    const admin = await getUsuarioRepo().findOneBy({ id })
    if (!admin || admin.rol !== "admin") return res.status(404).json({ error: "Administrador no encontrado" })

    const cantidad = await getUsuarioRepo().countBy({ rol: "admin" })
    if (cantidad <= 1) return res.status(400).json({ error: "Tiene que quedar al menos un administrador" })

    await getUsuarioRepo().delete(id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /usuarios/registro
// body: { mail, dni, contraseña }
// El socio tiene que haber sido cargado antes por el administrador, con ese mail y ese DNI.
router.post("/registro", async (req, res) => {
  try {
    const { mail, dni, contraseña } = req.body
    const mailLimpio = (mail || "").trim().toLowerCase()

    if (!mailLimpio || !dni || !contraseña) {
      return res.status(400).json({ error: "Completá todos los campos" })
    }
    if (String(contraseña).length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" })
    }
    if (!/^\d{7,8}$/.test(String(dni))) {
      return res.status(400).json({ error: "El DNI debe tener 7 u 8 dígitos numéricos" })
    }

    const NO_ENCONTRADO = "No encontramos tus datos. Verificá el mail y el DNI, o comunicate con la administración."

    const socio = await getSocioRepo().findOneBy({ mail: mailLimpio, dni: parseInt(dni) })
    if (!socio) return res.status(400).json({ error: NO_ENCONTRADO })

    if (socio.estado !== "Activo") {
      return res.status(403).json({ error: "Socio inactivo: comunicate con la administración." })
    }

    const hash = await encriptar(String(contraseña))
    const existente = await getUsuarioRepo().findOneBy({ mail: socio.mail })

    if (existente) {
      if (existente.estado === "Pendiente") {
        return res.status(400).json({ error: "Ya enviaste una solicitud. Esperá a que la administración la apruebe." })
      }
      if (existente.estado === "Rechazado") {
        // Puede volver a pedirla
        existente.contraseña = hash
        existente.estado = "Pendiente"
        existente.fecha_solicitud = new Date()
        await getUsuarioRepo().save(existente)
        return res.status(201).json({ ok: true, message: "Solicitud enviada. La administración debe aprobar tu cuenta." })
      }
      return res.status(400).json({
        error: "Ya tenés una cuenta. Si olvidaste tu contraseña, usá \"¿Olvidaste tu contraseña?\" en el login.",
      })
    }

    const usuario = getUsuarioRepo().create({
      nombre: socio.nombre,
      apellido: socio.apellido,
      mail: socio.mail,
      contraseña: hash,
      rol: "socio",
      estado: "Pendiente",
      fecha_solicitud: new Date(),
    })
    await getUsuarioRepo().save(usuario)
    res.status(201).json({ ok: true, message: "Solicitud enviada. La administración debe aprobar tu cuenta." })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /usuarios/solicitudes -> cuentas pendientes de aprobación (para el administrador)
router.get("/solicitudes", async (req, res) => {
  try {
    const pendientes = await getUsuarioRepo().find({ where: { estado: "Pendiente" }, order: { fecha_solicitud: "ASC" } })
    const resultado = []
    for (const u of pendientes) {
      const socio = await getSocioRepo().findOneBy({ mail: u.mail })
      resultado.push({
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        mail: u.mail,
        dni: socio ? socio.dni : null,
        fecha_solicitud: u.fecha_solicitud,
      })
    }
    res.json(resultado)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const cambiarEstadoSolicitud = (nuevoEstado) => async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const usuario = await getUsuarioRepo().findOneBy({ id })
    if (!usuario) return res.status(404).json({ error: "Solicitud no encontrada" })
    if (usuario.estado !== "Pendiente") {
      return res.status(400).json({ error: "Esta solicitud ya fue resuelta" })
    }
    await getUsuarioRepo().update(id, { estado: nuevoEstado })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

router.put("/:id/aprobar", cambiarEstadoSolicitud("Activo"))
router.put("/:id/rechazar", cambiarEstadoSolicitud("Rechazado"))

// POST /usuarios/recuperar-contrasena
// body: { numeroSocio, dni, mail }
router.post("/recuperar-contrasena", async (req, res) => {
  try {
    const { numeroSocio, dni, mail } = req.body

    if (!numeroSocio || !dni || !mail) {
      return res.status(400).json({ error: "Registro incompleto. Verifique sus datos y vuelva a intentarlo." })
    }

    const socio = await getSocioRepo().findOneBy({
      id: parseInt(numeroSocio),
      dni: parseInt(dni),
      mail,
    })

    if (!socio) {
      return res.status(400).json({ error: "Registro incompleto. Verifique sus datos y vuelva a intentarlo." })
    }

    // Busca el usuario asociado por mail (Socio y Usuario comparten el mismo mail)
    const usuario = await getUsuarioRepo().findOneBy({ mail: socio.mail })

    if (!usuario) {
      return res.status(400).json({ error: "Registro incompleto. Verifique sus datos y vuelva a intentarlo." })
    }

    const nuevaContraseña = generarContraseña()
    usuario.contraseña = await encriptar(nuevaContraseña) // se guarda encriptada; el mail lleva la clara
    await getUsuarioRepo().save(usuario)

    await enviarMailNuevaContraseña(socio.mail, socio.nombre, nuevaContraseña)

    res.json({ ok: true, message: "Tu contraseña fue enviada al correo." })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/", async (req, res) => {
  try {
    const datos = { ...req.body }
    if (datos.contraseña && !esHash(datos.contraseña)) datos.contraseña = await encriptar(datos.contraseña)
    const usuario = getUsuarioRepo().create(datos)
    const result = await getUsuarioRepo().save(usuario)
    res.status(201).json(sinContraseña(result))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const datos = { ...req.body }
    if (datos.contraseña && !esHash(datos.contraseña)) datos.contraseña = await encriptar(datos.contraseña)
    await getUsuarioRepo().update(req.params.id, datos)
    const usuario = await getUsuarioRepo().findOneBy({ id: parseInt(req.params.id) })
    res.json(sinContraseña(usuario))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    await getUsuarioRepo().delete(req.params.id)
    res.json({ message: "Usuario eliminado" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router