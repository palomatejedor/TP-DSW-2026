const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Plan",
  tableName: "plan",
  columns: {
    id: { primary: true, type: "int", generated: true },
    nombre: { type: "varchar" },
    descripcion: { type: "varchar" },
    estado: { type: "varchar" },
    precio: { type: "int" },
    // Individual | Familiar (los familiares solo los puede contratar un titular de grupo familiar)
    tipo: { type: "varchar", default: "Individual" },
    // Mensual | Anual (define cada cuánto se genera la cuota)
    periodicidad: { type: "varchar", default: "Mensual" },
  },
})