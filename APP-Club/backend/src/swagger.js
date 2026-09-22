const swaggerJsdoc = require("swagger-jsdoc")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Club",
      version: "1.0.0",
      description: "Documentación de la API REST de la aplicación de gestión del club",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],
  },

  apis: ["./src/routes/*.js"],
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec