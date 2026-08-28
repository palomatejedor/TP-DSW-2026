const express = require("express")
const router = express.Router()
const { AppDataSource } = require("../database")

const getActividadRepo = () => AppDataSource.getRepository("Actividad")

// GET /actividades -> incluye cupo_ocupado (cantidad de inscriptos activos, sin contar bajas)
router.get("/", async (req, res) => {
  try {
    const actividades = await getActividadRepo()
      .createQueryBuilder("actividad")
      .loadRelationCountAndMap(
        "actividad.cupo_ocupado",
        "actividad.inscripciones",
        "inscripcion",
        (qb) => qb.andWhere("inscripcion.estado != :baja", { baja: "Baja" })
      )
      .getMany()
    res.json(actividades)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const actividad = await getActividadRepo().findOneBy({ id: parseInt(req.params.id) })
    if (!actividad) return res.status(404).json({ error: "Actividad no encontrada" })
    res.json(actividad)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/", async (req, res) => {
  try {
    const actividad = getActividadRepo().create(req.body)
    const result = await getActividadRepo().save(actividad)
    res.status(201).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    await getActividadRepo().update(req.params.id, req.body)
    const actividad = await getActividadRepo().findOneBy({ id: parseInt(req.params.id) })
    res.json(actividad)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    await getActividadRepo().delete(req.params.id)
    res.json({ message: "Actividad eliminada" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router