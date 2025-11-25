# 🏆 SportMetrics Pro

**"Predict the Game. Understand the Performance."**

SportMetrics Pro es una plataforma integral de **analítica deportiva y predicción con Inteligencia Artificial** enfocada en la LigaPro Ecuabet. Combina ingeniería de datos histórica, simulación estadística y visualización de datos moderna para ofrecer insights profundos sobre equipos, jugadores y entrenadores.

## 🛠️ Tech Stack

**Arquitectura:** Monolito Modular (Frontend + Backend desacoplados).

| Dominio          | Tecnologías                                                                      |
| :--------------- | :------------------------------------------------------------------------------- |
| **Frontend**     | Vue 3 (Composition API), Vite, Tailwind CSS v3, Axios, Phosphor Icons, Chart.js. |
| **Backend**      | Node.js, Express.js, PostgreSQL (pg-pool).                                       |
| **Database**     | Supabase (PostgreSQL Cloud), Row Level Security.                                 |
| **Data Science** | Algoritmos de Distribución de Poisson, Gaussian Randomization.                   |
| **DevOps**       | Render (Backend), Vercel (Frontend), GitHub Actions (Futuro).                    |

---

## 🧠 Módulos de Inteligencia (Core Features)

### 1. 🔮 Match Prediction Engine (AI)

El corazón del proyecto. Un motor matemático que predice resultados futuros.

- **Modelo:** Basado en la **Distribución de Poisson**.
- **Lógica:** Calcula la fuerza de ataque y defensa de cada equipo basándose en sus últimos 20 partidos.
- **Output:** Genera probabilidades porcentuales (Win/Draw/Loss), Goles Esperados (xG) y una explicación textual automática del pronóstico.

### 2. 🧬 Smart Data Engineering (ETL)

Sistema avanzado de ingesta de datos para superar las limitaciones de APIs gratuitas.

- **Time-Shift Algorithm:** Ingesta datos reales de temporadas pasadas (2023) y los proyecta matemáticamente al presente (2025) para mantener la coherencia del calendario.
- **Fuzzy Name Matching:** Algoritmo de normalización y diccionario de mapeo para vincular datos de distintas fuentes que tienen nombres ligeramente diferentes (Ej: "Macará" vs "Macara").

### 3. ⚽ Player Performance Engine

Sistema de simulación de estadísticas individuales.

- Genera métricas realistas (Goles, Asistencias, Rating) utilizando **distribuciones normales (Gaussianas)** ajustadas por la posición del jugador (Delantero, Medio, Defensa).
- Calcula el **Impact Score** único para cada jugador.

### 4. 👔 Coach Intelligence

Analiza el comportamiento táctico de los directores técnicos.

- Clasifica el estilo de juego (_Ofensivo, Defensivo, Pragmático_) analizando promedios de goles y win-rates reales.

---

## 📂 Estructura del Proyecto

```bash
SportMetrics-Pro/
├── backend/            # API RESTful (Node.js + Express)
│   ├── src/
│   │   ├── api/        # Endpoints
│   │   ├── domain/     # Lógica de negocio (Team, Player, Coach, Match)
│   │   ├── ml/         # Motor de Machine Learning
│   │   ├── jobs/       # Scripts de ETL y Seeders
│   │   └── config/     # Configuración de DB
│
└── frontend/           # SPA (Vue 3 + Vite)
    ├── src/
    │   ├── views/      # Páginas (Home, TeamDetail, Predictor)
    │   ├── services/   # Conexión con Axios
    │   └── assets/     # Estilos Tailwind
```

---

## ⚡ Instalación y Despliegue Local

Sigue estos pasos para correr el proyecto completo en tu máquina.

### Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL (o cuenta en Supabase)
- Git

### 1\. Clonar el repositorio

```bash
git clone https://github.com/marceloavila11/sportmetrics-pro.git
cd sportmetrics-pro
```

### 2\. Configurar el Backend

```bash
cd backend
npm install

# Crear archivo .env basado en tus credenciales de base de datos
# PORT=3000
# DATABASE_URL=...
# API_FOOTBALL_KEY=...
```

**Poblar la Base de Datos (ETL):**

```bash
# Paso 1: Generar estructura y partidos simulados
npm run seed:smart

# Paso 2: Importar plantillas reales (API) con fallback inteligente
npm run import:squads

# Paso 3: Generar estadísticas de rendimiento
npm run seed:stats
```

**Iniciar Servidor:**

```bash
npm run dev
# El servidor correrá en http://localhost:3000
```

### 3\. Configurar el Frontend

Abre una **nueva terminal**:

```bash
cd frontend
npm install

# Iniciar Cliente
npm run dev
# La web correrá en http://localhost:5173
```

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT - siéntete libre de usarlo para aprendizaje.

---

Desarrollado con ❤️ y ☕ por **Jose Marcelo Avila**.
