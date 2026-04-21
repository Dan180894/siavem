# SIAVEM

Sistema de Administración de Vehículos Municipales.

API REST y cliente web para la gestión integral de la flota vehicular de una municipalidad: registro de vehículos, control de mantenimientos, gestión de empleados y generación de reportes.

## Stack Tecnológico

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL + Prisma
- **Testing:** Vitest (unit tests) + Playwright (E2E tests)

## Estructura del Proyecto
siavem/
├── backend/    # API REST (Node.js + Express)
├── frontend/   # Cliente web (React + Vite)
└── README.md

## Instalación

### Backend
```bash
cd backend
npm install
cp .env.example .env   # Configurar variables de entorno
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Testing

### Unit tests (API)
```bash
cd backend
npm test              # Correr tests una vez
npm run test:watch    # Correr tests en modo watch
```

### E2E tests (Interfaz)
```bash
cd frontend
npx playwright test           # Correr todos los tests
npx playwright test --ui      # Modo visual interactivo
npx playwright show-report    # Ver reporte HTML
```

## Autora

Daniela Chaves Aguirre 