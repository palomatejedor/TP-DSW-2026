const express = require("express")
const router = express.Router()
const { AppDataSource } = require("../database")

const getBeneficioRepo = () => AppDataSource.getRepository("Beneficio")

router.get("/", async (req, res) => {
  try {
    const beneficios = await getBeneficioRepo().find()
    res.json(beneficios)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/", async (req, res) => {
  try {
    const beneficio = getBeneficioRepo().create(req.body)
    const result = await getBeneficioRepo().save(beneficio)
    res.status(201).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    await getBeneficioRepo().update(req.params.id, req.body)
    const beneficio = await getBeneficioRepo().findOneBy({ id: parseInt(req.params.id) })
    res.json(beneficio)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    await getBeneficioRepo().delete(req.params.id)
    res.json({ message: "Beneficio eliminado" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router