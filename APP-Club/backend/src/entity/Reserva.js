const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Reserva",
  tableName: "reserva",
  columns: {
    id: { primary: true, type: "int", generated: true },
    fecha: { type: "date" },
    horario: { type: "varchar" },
    espacio: { type: "varchar" },
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