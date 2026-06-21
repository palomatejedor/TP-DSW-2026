const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Actividad",
  tableName: "actividad",
  columns: {
    id: { primary: true, type: "int", generated: true },
    nombre: { type: "varchar" },
    descripcion: { type: "varchar" },
    dias: { type: "varchar" },
    horario: { type: "varchar" },
    cupo_maximo: { type: "int" },
    estado: { type: "varchar" },
  },
  relations: {
    inscripciones: {
      type: "one-to-many",
      target: "Inscripcion",
      inverseSide: "actividad",
    },
  },
})