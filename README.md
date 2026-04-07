# BildyApp API

API REST para la gestion de albaranes de obra. Modulo de gestion de usuarios con registro, autenticacion, onboarding y administracion de cuentas.

## Nota sobre el idioma

Todo el código fuente de la aplicación, los nombres de variables, funciones y los mensajes de respuesta de la API están escritos en inglés. Esto responde a la convención estándar en el desarrollo de software y buenas prácticas profesionales, donde el código siempre se redacta en inglés para garantizar su accesibilidad y mantenimiento en cualquier entorno laboral.

## Tecnologias

- Node.js 22+ (ESM)
- Express 5
- MongoDB Atlas + Mongoose
- JWT (jsonwebtoken) + bcryptjs
- Zod (validacion)
- Multer (subida de archivos)
- Helmet, express-rate-limit, express-mongo-sanitize

## Instalacion

```bash
git clone https://github.com/alexsancheez/Intermedia-Backend.git
cd Intermedia-Backend
npm install
```

## Configuracion

Crea un archivo `.env` basado en `.env.example`:

```
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/bildyapp
JWT_ACCESS_SECRET=tu_secreto_access
JWT_REFRESH_SECRET=tu_secreto_refresh
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

## Ejecucion

```bash
npm run dev
```

## Endpoints

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| POST | /api/user/register | Registro de usuario | No |
| PUT | /api/user/validation | Validar email | Si |
| POST | /api/user/login | Login | No |
| PUT | /api/user/register | Datos personales (onboarding) | Si |
| PATCH | /api/user/company | Crear/unirse a empresa | Si |
| PATCH | /api/user/logo | Subir logo de empresa | Si |
| GET | /api/user | Obtener usuario con populate | Si |
| POST | /api/user/refresh | Renovar access token | No |
| POST | /api/user/logout | Cerrar sesion | Si |
| DELETE | /api/user | Eliminar usuario (?soft=true) | Si |
| POST | /api/user/invite | Invitar compañero (solo admin) | Si |
| PUT | /api/user/password | Cambiar contraseña | Si |

## Estructura del proyecto

```
src/
├── config/
│   └── index.js
├── controllers/
│   └── user.controller.js
├── middleware/
│   ├── auth.middleware.js
│   ├── error-handler.js
│   ├── role.middleware.js
│   ├── upload.js
│   └── validate.js
├── models/
│   ├── User.js
│   └── Company.js
├── routes/
│   └── user.routes.js
├── services/
│   └── notification.service.js
├── utils/
│   └── AppError.js
├── validators/
│   └── user.validator.js
├── app.js
└── index.js
```
