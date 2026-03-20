# Roadmap del Proyecto

## Estado Actual

El proyecto ha completado la Fase 3. La autenticación está integrada con InsForge, incluyendo sincronización de perfiles en la base de datos y seguridad RLS. El catálogo y el carrito utilizan datos reales.

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

### Fase 4: Funcionalidades de Compras

- [ ] **Carrito**: Persistencia del carrito en servidor (sincronizado entre dispositivos).
- [ ] **Favoritos**: CRUD de favoritos vinculado via base de datos.
- [ ] **Checkout**: Creación de órdenes reales y validación de stock.
- [ ] **Historial**: Visualización de órdenes pasadas desde la BD.

### Fase 5: Polish & QA

- [ ] Manejo de errores amigable en Frontend.
- [ ] Validaciones de stock en tiempo real.
- [ ] Optimización de cargas (Lazy loading imágenes).
