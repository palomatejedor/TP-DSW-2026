const express = require("express")
const router = express.Router()
const { AppDataSource } = require("../database")

const getUsuarioRepo = () => AppDataSource.getRepository("Usuario")

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
    res.json({ id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, rol: usuario.rol })
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