const { DataSource } = require("typeorm")
require("dotenv").config()

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [require("./entity/Usuario"),
              require("./entity/Socio"),
              require("./entity/Plan"),
              require("./entity/Actividad"),
              require("./entity/Inscripcion"),
              require("./entity/Reserva"),
              require("./entity/Pago"),
              require("./entity/Beneficio"),
              require("./entity/Carnet")],
})

module.exports = { AppDataSource }