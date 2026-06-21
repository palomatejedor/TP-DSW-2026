const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Pago",
  tableName: "pago",
  columns: {
    id: { primary: true, type: "int", generated: true },
    fecha: { type: "date" },
    monto: { type: "int" },
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