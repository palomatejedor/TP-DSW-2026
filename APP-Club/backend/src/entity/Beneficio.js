const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Beneficio",
  tableName: "beneficio",
  columns: {
    id: { primary: true, type: "int", generated: true },
    nombre: { type: "varchar" },
    descripcion: { type: "varchar" },
    estado: { type: "varchar" },
  },
})