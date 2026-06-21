const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Plan",
  tableName: "plan",
  columns: {
    id: { primary: true, type: "int", generated: true },
    nombre: { type: "varchar" },
    descripcion: { type: "varchar" },
    estado: { type: "varchar" },
    precio: { type: "int" },
  },
})