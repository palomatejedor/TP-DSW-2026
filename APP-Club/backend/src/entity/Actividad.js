const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Actividad",
  tableName: "actividad",
  columns: {
    id: { primary: true, type: "int", generated: true },
    nombre: { type: "varchar" },
    descripcion: { type: "varchar" },
    dias: { type: "varchar" },
    horario_desde: { type: "time" },
    horario_hasta: { type: "time" },
    cupo_maximo: { type: "int" },
    // Rango de edades (en años cumplidos). Sin edad máxima = sin límite superior.
    // Las actividades que ya existían quedan para todas las edades.
    edad_minima: { type: "int", default: 0 },
    edad_maxima: { type: "int", nullable: true },
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