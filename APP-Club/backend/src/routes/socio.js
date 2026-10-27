const express = require("express")
const router = express.Router()
const { AppDataSource } = require("../database")

const getSocioRepo = () => AppDataSource.getRepository("Socio")

// Calcula la categoría según la fecha de nacimiento (ignora lo que mande el cliente)
function calcularCategoria(fechaNacimiento) {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--

  if (edad <= 12) return "Infantil"
  if (edad <= 17) return "Adolescente"
  if (edad <= 64) return "Adulto"
  return "Tercera edad"
}

// Valida que el titular elegido sea válido para armar/ampliar un grupo familiar.
// El apellido NO se bloquea acá (puede haber cónyuges con apellido distinto) —
// esa comparación queda solo como aviso informativo en la pantalla.
async function validarTitular(titularId, socioIdActual) {
  if (titularId === socioIdActual) {
    return "Un socio no puede ser titular de sí mismo"
  }

  const titular = await getSocioRepo().findOne({
    where: { id: titularId },
    relations: ["miembros", "titular"],
  })

  if (!titular) return "El titular seleccionado no existe"

  if (titular.categoria === "Infantil" || titular.categoria === "Adolescente") {
    return "El titular del grupo familiar debe ser mayor de edad"
  }

  if (titular.titular) {
    return "Ese socio ya pertenece a otro grupo familiar y no puede ser titular de uno nuevo"
  }

  const miembrosActuales = (titular.miembros || []).filter(m => m.id !== socioIdActual)
  const tamañoGrupo = 1 + miembrosActuales.length + 1 // titular + miembros existentes + este nuevo integrante
  if (tamañoGrupo > 5) {
    return "El grupo familiar ya alcanzó el máximo de 5 integrantes"
  }

  return null
}

// Valida que el socio que va a pasar a ser integrante de un grupo no sea, a su vez,
// titular de su propio grupo con gente a cargo (eso dejaría a esa gente "huérfana").
async function validarQueNoSeaTitularDeOtroGrupo(socioId) {
  const socio = await getSocioRepo().findOne({
    where: { id: socioId },
    relations: ["miembros"],
  })
  if (socio?.miembros?.length > 0) {
    return "Este socio ya es titular de su propio grupo familiar y no puede pasar a ser integrante de otro. Primero reasigná o disolvé su grupo."
  }
  return null
}

// Cuando un socio pasa a integrar un grupo familiar, toma el plan del titular
// y se descartan sus cuotas pendientes propias (la cuota del grupo la paga el titular).
async function heredarPlanDelTitular(socioId) {
  const socio = await getSocioRepo().findOne({ where: { id: socioId }, relations: ["titular"] })
  if (!socio || !socio.titular) return
  const titular = await getSocioRepo().findOneBy({ id: socio.titular.id })
  if (!titular || !titular.plan) return
  if (!socio.plan || socio.plan.id !== titular.plan.id) {
    await getSocioRepo().update(socioId, { plan: titular.plan })
  }
  const pagoRepo = AppDataSource.getRepository("Pago")
  const pendientes = await pagoRepo.find({ where: { socio: { id: socioId }, estado: "Pendiente" } })
  if (pendientes.length) await pagoRepo.remove(pendientes)
}

// Recalcula la categoría de todos los socios según su edad de hoy.
// Se ejecuta como máximo una vez por hora, así quien cumple años pasa solo de categoría.
let ultimaActualizacionCategorias = 0
async function actualizarCategorias() {
  const ahora = Date.now()
  if (ahora - ultimaActualizacionCategorias < 60 * 60 * 1000) return
  ultimaActualizacionCategorias = ahora

  const socios = await getSocioRepo()
    .createQueryBuilder("socio")
    .select(["socio.id", "socio.fecha_nacimiento", "socio.categoria"])
    .getMany()

  for (const s of socios) {
    if (!s.fecha_nacimiento) continue
    const nueva = calcularCategoria(s.fecha_nacimiento)
    if (nueva !== s.categoria) await getSocioRepo().update(s.id, { categoria: nueva })
  }
}

// Ya hay otro socio con ese mail
async function mailEnUso(mail, idActual) {
  if (!mail) return false
  const otro = await getSocioRepo().findOneBy({ mail })
  return !!otro && otro.id !== idActual
}

// GET /socios/sin-mail -> socios mayores de edad activos que todavía no tienen mail
// (por ejemplo, un menor que cumplió 18): necesitan uno propio para poder crear su cuenta
router.get("/sin-mail", async (req, res) => {
  try {
    await actualizarCategorias()
    const socios = await getSocioRepo()
      .createQueryBuilder("socio")
      .leftJoinAndSelect("socio.plan", "plan")
      .leftJoinAndSelect("socio.titular", "titular")
      .where("socio.estado = :estado", { estado: "Activo" })
      .andWhere("socio.categoria IN (:...cats)", { cats: ["Adulto", "Tercera edad"] })
      .andWhere("(socio.mail IS NULL OR socio.mail = '')")
      .getMany()
    res.json(socios)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /socios/by-mail/:mail  -> socio del usuario logueado (para paneles del socio)
router.get("/by-mail/:mail", async (req, res) => {
  try {
    const mail = decodeURIComponent(req.params.mail)
    const socio = await getSocioRepo().findOne({ where: { mail }, relations: ["titular"] })
    if (!socio) return res.status(404).json({ error: "Socio no encontrado" })
    res.json(socio)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /socios/:id/familia -> el grupo familiar completo (titular + miembros) al que pertenece este socio
router.get("/:id/familia", async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const socio = await getSocioRepo().findOne({ where: { id }, relations: ["titular"] })
    if (!socio) return res.status(404).json({ error: "Socio no encontrado" })

    const titularId = socio.titular ? socio.titular.id : socio.id
    const titular = await getSocioRepo().findOne({
      where: { id: titularId },
      relations: ["miembros"],
    })
    if (!titular) return res.status(404).json({ error: "Grupo familiar no encontrado" })

    res.json({ titular, miembros: titular.miembros || [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /socios?page=1&limit=10&nombre=juan&apellido=perez&dni=12345678&estado=activo&categoria=Adulto,Tercera edad
router.get("/", async (req, res) => {
  try {
    await actualizarCategorias()
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
      .leftJoinAndSelect("socio.titular", "titular")

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
      const categorias = categoria.split(",").map(c => c.trim())
      qb.andWhere("socio.categoria IN (:...categorias)", { categorias })
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

// Valida que el plan elegido corresponda al socio:
// - Plan Familiar: solo para el titular de un grupo familiar (con al menos un integrante).
// - Plan Individual: no para un titular con grupo a cargo (su grupo necesita plan familiar).
// - Un integrante (no titular) no elige plan: tiene el del titular.
async function validarPlan(socioId, planId) {
  const socio = await getSocioRepo().findOne({ where: { id: socioId }, relations: ["miembros", "titular"] })
  if (!socio) return null
  if (socio.plan && socio.plan.id === planId) return null // no cambia nada

  const plan = await AppDataSource.getRepository("Plan").findOneBy({ id: planId })
  if (!plan) return "El plan seleccionado no existe"

  if (socio.titular) {
    const titular = await getSocioRepo().findOneBy({ id: socio.titular.id })
    if (!titular?.plan || titular.plan.id !== planId) {
      return "El plan de un integrante lo define el titular de su grupo familiar"
    }
    return null
  }

  const esTitular = (socio.miembros || []).length > 0
  if (plan.tipo === "Familiar" && !esTitular) {
    return "Los planes familiares solo pueden ser contratados por el titular de un grupo familiar"
  }
  if (plan.tipo !== "Familiar" && esTitular) {
    return "Este socio es titular de un grupo familiar: su grupo necesita un plan familiar"
  }
  return null
}

router.get("/:id", async (req, res) => {
  try {
    const socio = await getSocioRepo().findOne({ where: { id: parseInt(req.params.id) }, relations: ["titular"] })
    if (!socio) return res.status(404).json({ error: "Socio no encontrado" })
    res.json(socio)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/", async (req, res) => {
  try {
    const body = { ...req.body }
    if (body.fecha_nacimiento) {
      body.categoria = calcularCategoria(body.fecha_nacimiento)
    }

    if (await mailEnUso(body.mail, null)) {
      return res.status(400).json({ error: "Ya existe un socio con ese mail" })
    }

    if (body.titular && body.titular.id) {
      const error = await validarTitular(body.titular.id, null)
      if (error) return res.status(400).json({ error })
    }

    const socio = getSocioRepo().create(body)
    const result = await getSocioRepo().save(socio)
    if (body.titular && body.titular.id) await heredarPlanDelTitular(result.id)
    res.status(201).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const body = { ...req.body }
    if (body.fecha_nacimiento) {
      body.categoria = calcularCategoria(body.fecha_nacimiento)
    }

    if (await mailEnUso(body.mail, id)) {
      return res.status(400).json({ error: "Ya existe un socio con ese mail" })
    }

    // Un socio activo no puede tener fecha de baja (al reactivarlo se borra)
    if (body.estado === "Activo") body.fecha_baja = null

    if (body.titular && body.titular.id) {
      const error = await validarTitular(body.titular.id, id)
      if (error) return res.status(400).json({ error })

      const errorPropio = await validarQueNoSeaTitularDeOtroGrupo(id)
      if (errorPropio) return res.status(400).json({ error: errorPropio })
    }

    if (body.plan && body.plan.id) {
      const errorPlan = await validarPlan(id, body.plan.id)
      if (errorPlan) return res.status(400).json({ error: errorPlan })
    }

    await getSocioRepo().update(id, body)

    // Si este socio es titular de un grupo familiar y le cambiaron el plan,
    // el mismo plan pasa a aplicarse a todos los integrantes del grupo.
    if (body.plan !== undefined) {
      const conMiembros = await getSocioRepo().findOne({ where: { id }, relations: ["miembros"] })
      if (conMiembros?.miembros?.length) {
        for (const miembro of conMiembros.miembros) {
          await getSocioRepo().update(miembro.id, { plan: body.plan })
        }
      }
    }

    // Si lo sumaron a un grupo familiar, pasa al plan del titular
    if (body.titular && body.titular.id) await heredarPlanDelTitular(id)

    const socio = await getSocioRepo().findOne({ where: { id }, relations: ["titular"] })
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