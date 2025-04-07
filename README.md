# Sistema de Alquiler de Kayaks

Aplicación web para la gestión de alquileres de kayaks, desarrollada con Next.js, MongoDB y Tailwind CSS.

## Características

- **Gestión de alquileres**: Crear, visualizar y finalizar alquileres
- **Panel de administración**: Estadísticas, reportes y gestión de usuarios
- **Autenticación**: Sistema completo con roles (administrador/empleado)
- **Recuperación de contraseñas**: Mediante envío de correos electrónicos
- **Persistencia de datos**: Almacenamiento en MongoDB
- **Diseño responsive**: Adaptable a dispositivos móviles y escritorio

## Tecnologías utilizadas

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: API Routes de Next.js
- **Base de datos**: MongoDB
- **Autenticación**: JWT (JSON Web Tokens)
- **Envío de correos**: Nodemailer con Gmail

## Requisitos previos

- Node.js 18 o superior
- MongoDB (local o Atlas)
- Cuenta de Gmail para el envío de correos

## Configuración

1. Clona el repositorio:
2. Instala las dependencias:
   npm install
3. Crea un archivo `.env.local` con las siguientes variables:
   MONGODB_URI=tu_uri_de_mongodb
   JWT_SECRET=tu_clave_secreta_para_jwt
   NEXT_PUBLIC_APP_URL=[http://localhost:3000](http://localhost:3000)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=[tu_correo@gmail.com](mailto:tu_correo@gmail.com)
   EMAIL_PASSWORD=tu_contraseña_de_aplicación
4. Ejecuta el script de inicialización de la base de datos:
   node scripts/seed-users.js
5. Inicia la aplicación en modo desarrollo:
   npm run dev


## Despliegue en producción

Para desplegar la aplicación en producción:

1. Construye la aplicación:
   npm run build
2. Inicia el servidor de producción:
   npm start


## Credenciales de prueba

- **Administrador**: admin@kayak.com / password
- **Empleado**: employee@kayak.com / password

## Licencia

ElBorry


