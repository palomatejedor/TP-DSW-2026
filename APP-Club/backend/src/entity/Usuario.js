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
    // Activo | Pendiente (esperando aprobación del administrador) | Rechazado
    // Las cuentas que ya existen quedan como Activo.
    estado: { type: "varchar", default: "Activo" },
    // Cuándo el socio pidió su cuenta (solo las creadas con "Registrarme")
    fecha_solicitud: { type: "datetime", nullable: true },
  },
  relations: {
    socio: {
      type: "one-to-one",
      target: "Socio",
      inverseSide: "usuario",
    },
  },
})