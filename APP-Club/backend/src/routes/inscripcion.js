const express = require("express")
const router = express.Router()
const { AppDataSource } = require("../database")

const getInscripcionRepo = () => AppDataSource.getRepository("Inscripcion")
const getSocioRepo = () => AppDataSource.getRepository("Socio")
const getActividadRepo = () => AppDataSource.getRepository("Actividad")

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

// Edad en años cumplidos a partir de la fecha de nacimiento
function edadDe(fechaNacimiento) {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--
  return edad
}

function textoRangoEdades(a) {
  const min = a.edad_minima || 0
  if (a.edad_maxima == null) return min > 0 ? `desde ${min} años` : "todas las edades"
  return `de ${min} a ${a.edad_maxima} años`
}

// Reglas para inscribirse a una actividad. Devuelve el mensaje de error, o null si está todo bien.
async function validarInscripcion(socioId, actividadId) {
  const socio = await getSocioRepo().findOne({ where: { id: socioId }, relations: ["titular"] })
  if (!socio) return "El socio no existe"
  if (socio.estado !== "Activo") return "El socio está inactivo y no puede inscribirse a actividades"

  // Hace falta un plan: el propio, o el de su titular si integra un grupo familiar
  let plan = socio.plan
  if (!plan && socio.titular) {
    const titular = await getSocioRepo().findOneBy({ id: socio.titular.id })
    plan = titular ? titular.plan : null
  }
  if (!plan) return "Para inscribirse a una actividad hace falta tener un plan"

  const actividad = await getActividadRepo().findOneBy({ id: actividadId })
  if (!actividad) return "La actividad no existe"
  if (actividad.estado !== "Activo") return "La actividad no está disponible"

  // La edad del socio tiene que estar dentro del rango de la actividad
  if (socio.fecha_nacimiento) {
    const edad = edadDe(socio.fecha_nacimiento)
    const min = actividad.edad_minima || 0
    if (edad < min || (actividad.edad_maxima != null && edad > actividad.edad_maxima)) {
      return `Esta actividad es para personas ${textoRangoEdades(actividad)}`
    }
  }

  const inscripciones = await getInscripcionRepo().find({
    where: { actividad: { id: actividadId } },
  })
  const vigentes = inscripciones.filter(i => i.estado !== "Baja")
  if (vigentes.some(i => i.socio && i.socio.id === socioId)) return "El socio ya está inscripto en esta actividad"
  if (vigentes.length >= actividad.cupo_maximo) return "La actividad no tiene cupo disponible"

  return null
}

router.post("/", async (req, res) => {
  try {
    const socioId = req.body.socio && req.body.socio.id
    const actividadId = req.body.actividad && req.body.actividad.id
    if (!socioId || !actividadId) {
      return res.status(400).json({ error: "Faltan el socio o la actividad" })
    }

    const errorInscripcion = await validarInscripcion(parseInt(socioId), parseInt(actividadId))
    if (errorInscripcion) return res.status(400).json({ error: errorInscripcion })

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