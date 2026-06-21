const express = require("express")
const router = express.Router()
const { AppDataSource } = require("../database")

const getInscripcionRepo = () => AppDataSource.getRepository("Inscripcion")

router.get("/", async (req, res) => {
  try {
    const inscripciones = await getInscripcionRepo().find()
    res.json(inscripciones)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const inscripcion = await getInscripcionRepo().findOneBy({ id: parseInt(req.params.id) })
    if (!inscripcion) return res.status(404).json({ error: "Inscripción no encontrada" })
    res.json(inscripcion)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/", async (req, res) => {
  try {
    const inscripcion = getInscripcionRepo().create(req.body)
    const result = await getInscripcionRepo().save(inscripcion)
    res.status(201).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    await getInscripcionRepo().update(req.params.id, req.body)
    const inscripcion = await getInscripcionRepo().findOneBy({ id: parseInt(req.params.id) })
    res.json(inscripcion)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    await getInscripcionRepo().delete(req.params.id)
    res.json({ message: "Inscripción eliminada" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router