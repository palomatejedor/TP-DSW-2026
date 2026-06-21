const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Inscripcion",
  tableName: "inscripcion",
  columns: {
    id: { primary: true, type: "int", generated: true },
    fecha: { type: "date" },
    estado: { type: "varchar" },
  },
  relations: {
    socio: {
      type: "many-to-one",
      target: "Socio",
      joinColumn: true,
      eager: true,
    },
    actividad: {
      type: "many-to-one",
      target: "Actividad",
      joinColumn: true,
      eager: true,
    },
  },
})