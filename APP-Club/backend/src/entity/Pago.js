const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Pago",
  tableName: "pago",
  columns: {
    id: { primary: true, type: "int", generated: true },
    // Mes al que corresponde la cuota, con formato "AAAA-MM" (ej: "2026-10")
    periodo: { type: "varchar", nullable: true },
    // Fecha en que se pagó. Queda vacía mientras la cuota está pendiente
    fecha: { type: "date", nullable: true },
    monto: { type: "int" },
    // Pendiente | Pagada
    estado: { type: "varchar" },
  },
  relations: {
    socio: {
      type: "many-to-one",
      target: "Socio",
      joinColumn: true,
      eager: true,
    },
  },
})