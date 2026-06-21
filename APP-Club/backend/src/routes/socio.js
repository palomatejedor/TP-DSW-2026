const express = require("express")
const router = express.Router()
const { AppDataSource } = require("../database")

const getSocioRepo = () => AppDataSource.getRepository("Socio")

router.get("/", async (req, res) => {
  try {
    const socios = await getSocioRepo().find()
    res.json(socios)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const socio = await getSocioRepo().findOneBy({ id: parseInt(req.params.id) })
    if (!socio) return res.status(404).json({ error: "Socio no encontrado" })
    res.json(socio)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/", async (req, res) => {
  try {
    const socio = getSocioRepo().create(req.body)
    const result = await getSocioRepo().save(socio)
    res.status(201).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    await getSocioRepo().update(req.params.id, req.body)
    const socio = await getSocioRepo().findOneBy({ id: parseInt(req.params.id) })
    res.json(socio)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    await getSocioRepo().delete(req.params.id)
    res.json({ message: "Socio eliminado" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router