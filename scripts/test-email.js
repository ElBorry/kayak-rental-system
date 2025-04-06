// scripts/test-email.js
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log("Configuración de correo:");
    console.log({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.EMAIL_USER,
            pass: "********" // No mostrar la contraseña real
        }
    });

    // Crear transportador
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        logger: true,
        debug: true
    });

    try {
        // Verificar conexión
        console.log("Verificando conexión...");
        await transporter.verify();
        console.log("Servidor listo para enviar mensajes");

        // Enviar correo de prueba
        console.log("Enviando correo de prueba...");
        const info = await transporter.sendMail({
            from: `"Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Enviar a ti mismo para prueba
            subject: "Test Nodemailer",
            text: "Este es un correo de prueba desde el sistema de Alquiler de Kayaks",
            html: "<b>Este es un correo de prueba desde el sistema de Alquiler de Kayaks</b>"
        });

        console.log("Mensaje enviado:", info.messageId);
        console.log("Vista previa:", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error en la prueba:", error);
        if (error.code) {
            console.error("Código de error:", error.code);
        }
        if (error.command) {
            console.error("Comando fallido:", error.command);
        }
    }
}

testEmail();