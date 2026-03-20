# Roadmap del Proyecto

## Estado Actual

El proyecto ha completado todas las fases del roadmap. Todas las funcionalidades están integradas con InsForge y el frontend está optimizado para producción.

## Fases del Proyecto

### Fase 1: Fundamentos y Configuración (✅ Completado)

- [x] Inicialización del proyecto (React + FastAPI).
- [x] Configuración de Tailwind CSS y Radix UI.
- [x] Definición de esquemas y modelos (`models.py`).
- [x] Creación de documentación básica (`README.md`, `contracts.md`).

### Fase 2: Backend y Base de Datos (✅ Completado)

- [x] **Configuración BD**: Verificar conexión y tablas en PostgreSQL (InsForge).
- [x] **Seed Data**: Ejecutar `backend/seed_db.js` (Node.js workaround) para poblar la base de datos.
- [x] **Productos**: Confirmar que los endpoints de productos lean de PostgreSQL en lugar de mocks.
- [x] **Categorías**: Confirmar que los endpoints de categorías lean de PostgreSQL.

### Fase 3: Autenticación y Usuarios (✅ Completado)

- [x] **Auth**: Integración completa de Google Identity (vía SDK).
- [x] **Persistencia**: Guardar usuarios en tabla `users` mediante `syncProfile`.
- [x] **Sesiones**: Manejo seguro de tokens de sesión integrado con el SDK.
- [x] **Seguridad**: Políticas RLS implementadas para proteger perfiles.

### Fase 4: Funcionalidades de Compras (✅ Completado)

- [x] **Carrito**: Persistencia del carrito en servidor (sincronizado entre dispositivos).
- [x] **Favoritos**: CRUD de favoritos vinculado via base de datos.
- [x] **Checkout**: Creación de órdenes reales y validación de stock.
- [x] **Historial**: Visualización de órdenes pasadas desde la BD.

### Fase 5: Polish & QA (✅ Completado)

- [x] Manejo de errores amigable en Frontend (ErrorBoundary).
- [x] Validaciones de stock en tiempo real.
- [x] Optimización de cargas (Lazy loading imágenes).
