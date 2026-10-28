const express = require("express")
const cors = require("cors")
const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require("./swagger")
require("dotenv").config()
const { AppDataSource } = require("./database")
const { controlDeAcceso } = require("./middleware/auth")

if (!process.env.JWT_SECRET) {
  console.error("❌ Falta JWT_SECRET en el archivo .env del backend")
  process.exit(1)
}

const app = express()
app.use(cors())
app.use(express.json())


// documentacion OpenAPI con Swagger UI
app.use("/api-docs", swaggerUi.serve)
app.get("/api-docs", swaggerUi.setup(swaggerSpec))

// Seguridad: desde acá, todo pedido necesita un token válido (salvo ingresar, registrarse y recuperar contraseña)
app.use(controlDeAcceso)

// Rutas
const socioRoutes = require("./routes/socio")
const actividadRoutes = require("./routes/actividad")
const planRoutes = require("./routes/plan")
const inscripcionRoutes = require("./routes/inscripcion")
const usuarioRoutes = require("./routes/usuario")
const beneficioRoutes = require("./routes/beneficio")
const pagoRoutes = require("./routes/pago")

app.use("/socios", socioRoutes)
app.use("/actividades", actividadRoutes)
app.use("/planes", planRoutes)
app.use("/inscripciones", inscripcionRoutes)
app.use("/usuarios", usuarioRoutes)
app.use("/beneficios", beneficioRoutes)
app.use("/pagos", pagoRoutes)

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