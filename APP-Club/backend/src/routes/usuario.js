const express = require("express")
const router = express.Router()
const { AppDataSource } = require("../database")
const { enviarMailNuevaContraseña, generarContraseña } = require("../utils/mailer")

const getUsuarioRepo = () => AppDataSource.getRepository("Usuario")
const getSocioRepo = () => AppDataSource.getRepository("Socio")

router.get("/", async (req, res) => {
  try {
    const usuarios = await getUsuarioRepo().find()
    res.json(usuarios)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { mail, contraseña } = req.body
    const usuario = await getUsuarioRepo().findOneBy({ mail, contraseña })
    if (!usuario) return res.status(401).json({ error: "Email o contraseña incorrectos" })
    res.json({ id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, mail: usuario.mail, rol: usuario.rol })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

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
    usuario.contraseña = nuevaContraseña
    await getUsuarioRepo().save(usuario)

    await enviarMailNuevaContraseña(socio.mail, socio.nombre, nuevaContraseña)

    res.json({ ok: true, message: "Tu contraseña fue enviada al correo." })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/", async (req, res) => {
  try {
    const usuario = getUsuarioRepo().create(req.body)
    const result = await getUsuarioRepo().save(usuario)
    res.status(201).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    await getUsuarioRepo().update(req.params.id, req.body)
    const usuario = await getUsuarioRepo().findOneBy({ id: parseInt(req.params.id) })
    res.json(usuario)
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