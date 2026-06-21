const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Carnet",
  tableName: "carnet",
  columns: {
    id: { primary: true, type: "int", generated: true },
    numero: { type: "varchar" },
    fecha_emision: { type: "date" },
    estado: { type: "varchar" },
  },
  relations: {
    socio: {
      type: "one-to-one",
      target: "Socio",
      joinColumn: true,
      eager: true,
    },
  },
})