const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
})

function generarContraseña(longitud = 10) {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  let contraseña = ""
  for (let i = 0; i < longitud; i++) {
    contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
  }
  return contraseña
}

async function enviarMailNuevaContraseña(destinatario, nombre, nuevaContraseña) {
  const mailOptions = {
    from: `"Sports Club" <${process.env.MAIL_USER}>`,
    to: destinatario,
    subject: "Recuperación de contraseña - Sports Club",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Sports Club</h2>
        <p>Hola ${nombre || ""},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Tu nueva contraseña es:</p>
        <p style="font-size: 20px; font-weight: bold; background: #f0f0f0; padding: 12px 16px; border-radius: 8px; letter-spacing: 1px;">
          ${nuevaContraseña}
        </p>
        <p>Te recomendamos ingresar y cambiarla apenas puedas.</p>
        <p style="color: #888; font-size: 0.85rem;">Si no solicitaste este cambio, contactá al administrador del club.</p>
      </div>
    `,
  }
  return transporter.sendMail(mailOptions)
}

module.exports = { enviarMailNuevaContraseña, generarContraseña }