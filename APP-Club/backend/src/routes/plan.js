const express = require("express")
const router = express.Router()
const { AppDataSource } = require("../database")

const getPlanRepo = () => AppDataSource.getRepository("Plan")

router.get("/", async (req, res) => {
  try {
    const planes = await getPlanRepo().find()
    res.json(planes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const plan = await getPlanRepo().findOneBy({ id: parseInt(req.params.id) })
    if (!plan) return res.status(404).json({ error: "Plan no encontrado" })
    res.json(plan)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/", async (req, res) => {
  try {
    const plan = getPlanRepo().create(req.body)
    const result = await getPlanRepo().save(plan)
    res.status(201).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    await getPlanRepo().update(req.params.id, req.body)
    const plan = await getPlanRepo().findOneBy({ id: parseInt(req.params.id) })
    res.json(plan)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    await getPlanRepo().delete(req.params.id)
    res.json({ message: "Plan eliminado" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router