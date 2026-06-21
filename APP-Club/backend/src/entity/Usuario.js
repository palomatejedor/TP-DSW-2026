const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Usuario",
  tableName: "usuario",
  columns: {
    id: { primary: true, type: "int", generated: true },
    nombre: { type: "varchar" },
    apellido: { type: "varchar" },
    mail: { type: "varchar", unique: true },
    contraseña: { type: "varchar" },
    rol: { type: "varchar" },
  },
  relations: {
    socio: {
      type: "one-to-one",
      target: "Socio",
      inverseSide: "usuario",
    },
  },
})