# 🎬 CineLog — Web App de Catálogo de Películas

Aplicación web full-stack para gestionar tu catálogo personal de películas y series.

## Arquitectura

```
cine-catalogo/
├── backend/          ← API REST (Node.js + TypeScript + Express)
│   └── src/
│       ├── app.ts
│       ├── config/   ← MySQL + MongoDB
│       ├── middlewares/
│       ├── models/
│       │   ├── mysql/    ← 10 tablas Sequelize
│       │   └── mongo/    ← 2 colecciones Mongoose
│       └── routes/
└── src/              ← Frontend (React + TypeScript + Vite)
    ├── pages/
    ├── components/
    └── services/
```

## Bases de Datos (12 tablas totales)

### MySQL — 10 tablas relacionales
| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Cuentas de usuario |
| `peliculas_series` | Catálogo de películas/series (ref a OMDb) |
| `listas_usuario` | Lista personal (por_ver / visto / favorito) |
| `resenas` | Reseñas con texto y calificación 1-10 |
| `historial_visto` | Historial de visualización |
| `generos` | Géneros cinematográficos |
| `pelicula_genero` | Relación N:M película-género |
| `notificaciones` | Notificaciones del sistema |
| `recomendaciones` | Recomendaciones entre usuarios |
| `calificaciones` | Calificaciones sin texto (1-10 por película) |

### MongoDB — 2 colecciones NoSQL
| Colección | Descripción |
|-----------|-------------|
| `MovieDetail` | Caché de detalles completos desde OMDb API |
| `ActivityLog` | Registro de actividad (login, registro, etc.) |

## Tecnologías

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + TypeScript + Express
- **BD Relacional:** MySQL (Sequelize ORM)
- **BD No-Relacional:** MongoDB Atlas (Mongoose)
- **Auth:** JWT
- **API externa:** OMDb API

## Cómo correr el proyecto

### Backend
```bash
cd backend
npm install
npm run dev       # Usa ts-node + nodemon
```

### Frontend
```bash
npm install
npm run dev       # Abre en http://localhost:5173
```

### Variables de entorno (`backend/.env`)
```env
PORT=3001
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=****
MYSQL_DATABASE=cinelog
MONGO_URI=mongodb+srv://...
JWT_SECRET=cinelog_secret_key
OMDB_KEY=tu_api_key
```

## Funcionalidades

- ✅ Registro e inicio de sesión con JWT
- ✅ Página de inicio con películas destacadas y tendencias
- ✅ Búsqueda de películas y series (via OMDb API)
- ✅ Detalle completo de cada película con sinopsis, reparto, director
- ✅ Sistema de reseñas con calificación de estrellas (1-10)
- ✅ Agregar/editar/eliminar reseñas propias
- ✅ Dar like a reseñas de otros usuarios
- ✅ Listas personales (por ver, visto, favorito)
- ✅ Historial de visualización
- ✅ Notificaciones del sistema
- ✅ Recomendaciones entre usuarios
- ✅ Calificaciones independientes (sin reseña)
