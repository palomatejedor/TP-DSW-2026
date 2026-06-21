const express = require("express")
const cors = require("cors")
require("dotenv").config()
const { AppDataSource } = require("./database")

const app = express()
app.use(cors())
app.use(express.json())

// Rutas
const socioRoutes = require("./routes/socio")
const actividadRoutes = require("./routes/actividad")
const planRoutes = require("./routes/plan")
const inscripcionRoutes = require("./routes/inscripcion")
const usuarioRoutes = require("./routes/usuario")
const beneficioRoutes = require("./routes/beneficio")

app.use("/socios", socioRoutes)
app.use("/actividades", actividadRoutes)
app.use("/planes", planRoutes)
app.use("/inscripciones", inscripcionRoutes)
app.use("/usuarios", usuarioRoutes)
app.use("/beneficios", beneficioRoutes)

const PORT = process.env.PORT || 3000

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Conectado a la base de datos")
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error("❌ Error al conectar la base de datos:", err)
  })