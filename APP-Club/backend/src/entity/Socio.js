const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Socio",
  tableName: "socio",
  columns: {
    id: { primary: true, type: "int", generated: true },
    nombre: { type: "varchar", nullable: true },
    apellido: { type: "varchar", nullable: true },
    mail: { type: "varchar", nullable: true },
    dni: { type: "int" },
    fecha_alta: { type: "date", nullable: true },
    fecha_baja: { type: "date", nullable: true },
    estado: { type: "varchar" },
    categoria: { type: "varchar" },
  },
  relations: {
    plan: {
      type: "many-to-one",
      target: "Plan",
      joinColumn: true,
      eager: true,
      nullable: true,
    },
    inscripciones: {
      type: "one-to-many",
      target: "Inscripcion",
      inverseSide: "socio",
    },
    reservas: {
      type: "one-to-many",
      target: "Reserva",
      inverseSide: "socio",
    },
    pagos: {
      type: "one-to-many",
      target: "Pago",
      inverseSide: "socio",
    },
    carnet: {
      type: "one-to-one",
      target: "Carnet",
      inverseSide: "socio",
    },
  },
})