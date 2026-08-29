const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Socio",
  tableName: "socio",
  columns: {
    id: { primary: true, type: "int", generated: true },
    nombre: { type: "varchar", nullable: true },
    apellido: { type: "varchar", nullable: true },
    mail: { type: "varchar", nullable: true, unique: true },
    dni: { type: "int", unique: true },
    fecha_alta: { type: "date", nullable: true },
    fecha_nacimiento: { type: "date", nullable: true },
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
    // Titular del grupo familiar al que pertenece este socio (null = independiente o es el titular).
    // OJO: sin eager (a diferencia de "plan") porque al ser una relación que apunta a la misma
    // entidad Socio, con eager:true TypeORM entra en loop infinito al armar la consulta.
    // Por eso, en socio.js se pide explícitamente con leftJoinAndSelect o relations: ["titular"]
    // en cada lugar donde hace falta.
    titular: {
      type: "many-to-one",
      target: "Socio",
      joinColumn: true,
      nullable: true,
    },
    // Integrantes del grupo familiar, si este socio es el titular
    miembros: {
      type: "one-to-many",
      target: "Socio",
      inverseSide: "titular",
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