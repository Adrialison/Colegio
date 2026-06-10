# 🏫 Sistema de Gestión Escolar - API REST

API REST profesional construida con **Node.js**, **Express** y **PostgreSQL** (Sequelize ORM) para la gestión integral de un colegio.

---

## 📋 Tabla de Contenidos

- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Ejecución](#-ejecución)
- [Seed de datos](#-seed-de-datos-de-prueba)
- [Autenticación JWT](#-autenticación-jwt)
- [Endpoints](#-endpoints)
- [Roles y Permisos](#-roles-y-permisos)

---

## 🛠 Tecnologías

| Tecnología | Uso |
|------------|-----|
| Node.js | Runtime del servidor |
| Express | Framework HTTP |
| PostgreSQL | Base de datos relacional |
| Sequelize | ORM para PostgreSQL |
| JWT | Autenticación basada en tokens |
| bcryptjs | Encriptación de contraseñas |
| Helmet | Headers de seguridad HTTP |
| CORS | Control de acceso cross-origin |
| Morgan | Logger de requests HTTP |

---

## 📁 Arquitectura

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Configuración de Sequelize + PostgreSQL
│   ├── controllers/
│   │   ├── authController.js     # Login, Register, Profile
│   │   ├── adminController.js    # CRUD usuarios, pagos, comunicados, cursos
│   │   ├── teacherController.js  # Notas, asistencias
│   │   └── studentController.js  # Consultas propias (notas, pagos, asistencias)
│   ├── middlewares/
│   │   ├── auth.js               # verifyToken + checkRole
│   │   └── errorHandler.js       # Manejo centralizado de errores
│   ├── models/
│   │   ├── index.js              # Asociaciones entre modelos
│   │   ├── User.js               # Usuario (ADMIN, TEACHER, STUDENT)
│   │   ├── Student.js            # Perfil de alumno (1:1 con User)
│   │   ├── Curso.js              # Curso / Asignatura
│   │   ├── Nota.js               # Calificación (0-20)
│   │   ├── Pago.js               # Pagos
│   │   ├── Asistencia.js         # Registro de asistencia
│   │   └── Comunicado.js         # Comunicados / Avisos
│   ├── routes/
│   │   ├── index.js              # Router central
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── adminRoutes.js        # /api/admin/*
│   │   ├── teacherRoutes.js      # /api/teacher/*
│   │   └── studentRoutes.js      # /api/student/*
│   ├── services/
│   │   └── academicService.js    # Recálculo de promedio
│   ├── app.js                    # Configuración de Express
│   ├── server.js                 # Punto de entrada
│   └── seed.js                   # Datos de prueba
├── .env                          # Variables de entorno
├── .env.example                  # Plantilla de variables
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Instalación

```bash
# 1. Clonar repositorio
git clone <URL_DEL_REPO>
cd backend

# 2. Instalar dependencias
npm install
```

---

## ⚙️ Configuración

1. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Edita `.env` con tus credenciales de PostgreSQL:
```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=colegio_db
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
JWT_SECRET=tu_clave_secreta_super_larga
JWT_EXPIRES_IN=8h
NODE_ENV=development
```

3. Crea la base de datos en PostgreSQL:
```sql
CREATE DATABASE colegio_db;
```

> **Nota:** Las tablas se crean automáticamente al iniciar el servidor gracias a `sequelize.sync({ alter: true })`.

---

## ▶️ Ejecución

```bash
# Modo desarrollo (con hot reload)
npm run dev

# Modo producción
npm start
```

El servidor arranca en `http://localhost:4000`.

---

## 🌱 Seed de Datos de Prueba

```bash
npm run seed
```

Esto crea los siguientes usuarios de prueba:

| Rol | Email | Contraseña |
|-----|-------|------------|
| 👑 ADMIN | `admin@colegio.com` | `Admin123!` |
| 👨‍🏫 TEACHER | `profesor@colegio.com` | `Profesor123!` |
| 🎓 STUDENT | `alumno@colegio.com` | `Alumno123!` |

También crea cursos, notas, pagos, asistencias y comunicados de ejemplo.

---

## 🔐 Autenticación JWT

### ¿Cómo funciona?

1. **Login**: Envías `email` y `password` a `POST /api/auth/login`.
2. **Recibes un token**: La respuesta incluye un JWT.
3. **Usa el token**: En todas las rutas protegidas, incluye el token en el header `Authorization`.

### ¿Cómo enviar el token en el Header?

```
Authorization: Bearer <tu_token_aquí>
```

### Ejemplo con cURL:

```bash
# 1. Login (obtener token)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@colegio.com","password":"Admin123!"}'

# 2. Usar el token en una ruta protegida
curl -X GET http://localhost:4000/api/admin/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."
```

### Ejemplo con Postman / Thunder Client:

1. Hacer `POST` a `http://localhost:4000/api/auth/login` con body JSON:
   ```json
   {
     "email": "admin@colegio.com",
     "password": "Admin123!"
   }
   ```
2. Copiar el `token` de la respuesta.
3. En la siguiente petición, ir a la pestaña **Headers** y agregar:
   - **Key**: `Authorization`
   - **Value**: `Bearer <token_copiado>`

### Ejemplo con JavaScript (Fetch):

```javascript
// Login
const loginRes = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@colegio.com',
    password: 'Admin123!'
  })
});
const { data } = await loginRes.json();
const token = data.token;

// Usar token en rutas protegidas
const usersRes = await fetch('http://localhost:4000/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const users = await usersRes.json();
```

### Ejemplo con Axios:

```javascript
import axios from 'axios';

// Login
const { data } = await axios.post('http://localhost:4000/api/auth/login', {
  email: 'admin@colegio.com',
  password: 'Admin123!'
});
const token = data.data.token;

// Configurar Axios globalmente
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Ahora todas las peticiones incluyen el token
const users = await axios.get('http://localhost:4000/api/admin/users');
```

---

## 📡 Endpoints

### Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión | ❌ |
| POST | `/api/auth/register` | Registrar usuario | ❌ |
| GET | `/api/auth/profile` | Ver perfil propio | ✅ |

### Administrador (`/api/admin`) — Solo ADMIN

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/users` | Listar usuarios (paginado) |
| GET | `/api/admin/users/:id` | Obtener usuario por ID |
| POST | `/api/admin/users` | Crear usuario |
| PUT | `/api/admin/users/:id` | Actualizar usuario |
| DELETE | `/api/admin/users/:id` | Desactivar usuario |
| PUT | `/api/admin/students/:studentId/pago` | Cambiar estado de pago |
| GET | `/api/admin/comunicados` | Listar comunicados |
| POST | `/api/admin/comunicados` | Crear comunicado |
| GET | `/api/admin/cursos` | Listar cursos |
| POST | `/api/admin/cursos` | Crear curso |

### Profesor (`/api/teacher`) — TEACHER + ADMIN

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/teacher/notas` | Registrar nota |
| GET | `/api/teacher/notas` | Listar notas (filtros) |
| PUT | `/api/teacher/notas/:id` | Actualizar nota |
| POST | `/api/teacher/asistencias` | Registrar asistencia |
| GET | `/api/teacher/asistencias` | Listar asistencias (filtros) |
| GET | `/api/teacher/students` | Listar alumnos |

### Alumno (`/api/student`) — STUDENT + ADMIN

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/student/profile` | Ver mi perfil |
| GET | `/api/student/notas` | Ver mis notas |
| GET | `/api/student/asistencias` | Ver mis asistencias |
| GET | `/api/student/pagos` | Ver mis pagos |
| GET | `/api/student/comunicados` | Ver comunicados activos |

### Health Check

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servidor |

---

## 🔒 Roles y Permisos

| Rol | Acceso |
|-----|--------|
| **ADMIN** | Acceso total a todas las rutas |
| **TEACHER** | Gestión de notas y asistencias |
| **STUDENT** | Solo lectura de sus propios datos |

### Flujo de Autorización:

```
Request → verifyToken (JWT válido?) → checkRole (rol permitido?) → Controller
```

---

## 🧪 Ejemplos de Body JSON

### Registrar usuario
```json
POST /api/auth/register
{
  "email": "nuevo@colegio.com",
  "password": "Password123!",
  "nombre": "Pedro",
  "apellido": "López",
  "role": "STUDENT",
  "grado": "4to",
  "seccion": "B"
}
```

### Registrar nota
```json
POST /api/teacher/notas
{
  "studentId": 1,
  "cursoId": 1,
  "valor": 18.5,
  "trimestre": "PRIMERO",
  "comentario": "Excelente desempeño"
}
```

### Registrar asistencia
```json
POST /api/teacher/asistencias
{
  "studentId": 1,
  "cursoId": 1,
  "fecha": "2026-03-12",
  "estado": "PRESENTE"
}
```

### Actualizar estado de pago
```json
PUT /api/admin/students/1/pago
{
  "estadoPago": true
}
```

### Crear comunicado
```json
POST /api/admin/comunicados
{
  "titulo": "Reunión de padres",
  "contenido": "Se convoca a reunión general el día viernes 15 de marzo.",
  "tipo": "GENERAL"
}
```

---

## 📝 Licencia

ISC
