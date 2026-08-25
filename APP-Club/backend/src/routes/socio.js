const express = require("express")
const router = express.Router()
const { AppDataSource } = require("../database")

const getSocioRepo = () => AppDataSource.getRepository("Socio")

// GET /socios/by-mail/:mail  -> socio del usuario logueado (para paneles del socio)
router.get("/by-mail/:mail", async (req, res) => {
  try {
    const mail = decodeURIComponent(req.params.mail)
    const socio = await getSocioRepo().findOneBy({ mail })
    if (!socio) return res.status(404).json({ error: "Socio no encontrado" })
    res.json(socio)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /socios?page=1&limit=10&nombre=juan&apellido=perez&dni=12345678&estado=activo&categoria=mayor
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      nombre,
      apellido,
      dni,
      estado,
      categoria,
    } = req.query

    const pageNum = Math.max(parseInt(page) || 1, 1)
    const limitNum = Math.max(parseInt(limit) || 10, 1)
    const skip = (pageNum - 1) * limitNum

    const qb = getSocioRepo()
      .createQueryBuilder("socio")
      .leftJoinAndSelect("socio.plan", "plan")

    if (nombre) {
      qb.andWhere("socio.nombre LIKE :nombre", { nombre: `%${nombre}%` })
    }
    if (apellido) {
      qb.andWhere("socio.apellido LIKE :apellido", { apellido: `%${apellido}%` })
    }
    if (dni) {
      qb.andWhere("CAST(socio.dni AS CHAR) LIKE :dni", { dni: `%${dni}%` })
    }
    if (estado) {
      qb.andWhere("socio.estado = :estado", { estado })
    }
    if (categoria) {
      qb.andWhere("socio.categoria = :categoria", { categoria })
    }

    qb.orderBy("socio.apellido", "ASC")
      .addOrderBy("socio.nombre", "ASC")
      .skip(skip)
      .take(limitNum)

    const [socios, total] = await qb.getManyAndCount()

    res.json({
      data: socios,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    })
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