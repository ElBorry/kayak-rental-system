import nodemailer from "nodemailer"

// Configurar transporte de correo
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    // Añadir opciones de depuración
    logger: process.env.NODE_ENV !== "production",
    debug: process.env.NODE_ENV !== "production"
})

export async function sendPasswordResetEmail(email: string, resetLink: string) {
    try {
        // Verificar conexión antes de enviar
        await transporter.verify()
        console.log("Conexión con el servidor de correo verificada")

        const info = await transporter.sendMail({
            from: `"Alquiler de Kayaks" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Restablecimiento de contraseña - Sistema de Alquiler de Kayaks",
            text: `Hola,

Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:

${resetLink}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, puedes ignorar este correo.

Saludos,
Equipo de Alquiler de Kayaks`,
            html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0c7bb3;">Restablecimiento de Contraseña</h2>
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <p style="margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #0c7bb3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Restablecer Contraseña
          </a>
        </p>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <p>Saludos,<br>Equipo de Alquiler de Kayaks</p>
      </div>
    `,
        })

        console.log(`Correo de restablecimiento enviado a: ${email}, ID: ${info.messageId}`)
        return true
    } catch (error) {
        console.error("Error al enviar correo de restablecimiento:", error)
        throw error
    }
}