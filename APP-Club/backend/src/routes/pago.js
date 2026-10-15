const express = require("express")
const router = express.Router()
const { AppDataSource } = require("../database")

const getPagoRepo = () => AppDataSource.getRepository("Pago")
const getSocioRepo = () => AppDataSource.getRepository("Socio")

const dosDigitos = (n) => String(n).padStart(2, "0")

// "2026-10"
const periodoActual = () => {
  const h = new Date()
  return `${h.getFullYear()}-${dosDigitos(h.getMonth() + 1)}`
}

// "2026"
const anioActual = () => String(new Date().getFullYear())

// "2026-10-15"
const hoy = () => {
  const h = new Date()
  return `${h.getFullYear()}-${dosDigitos(h.getMonth() + 1)}-${dosDigitos(h.getDate())}`
}

// Una cuota pendiente de un mes anterior está vencida
const formatear = (p) => ({
  id: p.id,
  periodo: p.periodo,
  fecha: p.fecha,
  monto: p.monto,
  estado: p.estado,
  vencida: p.estado === "Pendiente" && !!p.periodo && (
    p.periodo.length === 4 ? p.periodo < anioActual() : p.periodo < periodoActual()
  ),
  socio: p.socio ? { id: p.socio.id, nombre: p.socio.nombre, apellido: p.socio.apellido } : null,
})

// Crea la cuota del mes actual si todavía no existe.
// El monto sale del precio del plan del socio.
async function asegurarCuotaDelMes(socio) {
  if (!socio.plan || socio.estado !== "Activo") return
  // Plan anual: una cuota por año ("2026"). Plan mensual: una por mes ("2026-10")
  const periodo = socio.plan.periodicidad === "Anual" ? anioActual() : periodoActual()
  // Plan familiar: el precio es por integrante (titular + miembros activos)
  let integrantes = 1
  if (socio.plan.tipo === "Familiar") {
    integrantes += await getSocioRepo().count({ where: { titular: { id: socio.id }, estado: "Activo" } })
  }
  const precio = Math.round(Number(socio.plan.precio) || 0) * integrantes

  const existente = await getPagoRepo().findOne({ where: { socio: { id: socio.id }, periodo } })

  if (!existente) {
    const cuota = getPagoRepo().create({
      socio: { id: socio.id },
      periodo,
      monto: precio,
      estado: "Pendiente",
      fecha: null,
    })
    await getPagoRepo().save(cuota)
  } else if (existente.estado === "Pendiente" && existente.monto !== precio) {
    // Si cambió de plan antes de pagar, la cuota pendiente toma el precio nuevo
    await getPagoRepo().update(existente.id, { monto: precio })
  }
}

// GET /pagos  (administrador): todas las cuotas
router.get("/", async (req, res) => {
  try {
    // Los miembros de un grupo familiar no pagan: paga el titular
    const socios = await getSocioRepo().find({ where: { estado: "Activo" }, relations: ["titular"] })
    for (const s of socios.filter(s => !s.titular)) {
      await asegurarCuotaDelMes(s)
    }
    const pagos = await getPagoRepo().find({ order: { periodo: "DESC", id: "DESC" } })
    res.json(pagos.map(formatear))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /pagos/socio/:id  (cuotas de un socio)
router.get("/socio/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const socio = await getSocioRepo().findOne({ where: { id }, relations: ["titular"] })
    if (!socio) return res.status(404).json({ error: "Socio no encontrado" })

    // Miembro de un grupo familiar: la cuota la paga el titular
    if (socio.titular) {
      const titular = await getSocioRepo().findOneBy({ id: socio.titular.id })
      return res.json({
        pagaTitular: true,
        titular: titular ? { nombre: titular.nombre, apellido: titular.apellido } : null,
        plan: socio.plan || null,
        cuotas: [],
      })
    }

    await asegurarCuotaDelMes(socio)
    const cuotas = await getPagoRepo().find({
      where: { socio: { id } },
      order: { periodo: "DESC", id: "DESC" },
    })
    const integrantes = socio.plan && socio.plan.tipo === "Familiar"
      ? 1 + await getSocioRepo().count({ where: { titular: { id: socio.id }, estado: "Activo" } })
      : 1
    res.json({
      pagaTitular: false,
      titular: null,
      plan: socio.plan || null,
      integrantes,
      cuotas: cuotas.map(formatear),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /pagos/:id/pagar  (pago simulado)
router.put("/:id/pagar", async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const pago = await getPagoRepo().findOneBy({ id })
    if (!pago) return res.status(404).json({ error: "Cuota no encontrada" })
    if (pago.estado === "Pagada") return res.status(400).json({ error: "Esta cuota ya está pagada" })

    await getPagoRepo().update(id, { estado: "Pagada", fecha: hoy() })
    const actualizado = await getPagoRepo().findOneBy({ id })
    res.json(formatear(actualizado))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router