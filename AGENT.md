# Agent Notes & Context

Este archivo contiene notas de contexto para el agente AI (Antigravity) y reglas específicas del proyecto.

## 🤖 Identidad y Rol

- **Rol**: Agente de Desarrollo Full Stack Senior.
- **Objetivo**: Completar la migración de un clon de Mercado Libre de Mocks a Producción.

## 📍 Reglas del Proyecto

1. **Prioridad de Archivos**:
   - `contracts.md`: Fuente de verdad para la API.
   - `ROADMAP.md`: Fuente de verdad para el progreso.
   - `task.md`: (Interno) Para tracking granular de sesiones.

2. **Backend (FastAPI)**:
   - Mantener consistencia con Pydantic models.
   - Usar `motor` para todas las operaciones de BD (asíncrono).
   - No hardcodear credenciales, usar `.env`.

3. **Frontend (React)**:
   - Usar Tailwind CSS para estilos.
   - Componentes funcionales con Hooks.
   - Mantener la separación de lógica en servicios API.

## 📝 Notas de Implementación

- **Seed Data**: Existe un script `backend/seed.py`. Debe ejecutarse al iniciar configuración de BD nueva.
- **Auth**: El sistema usa Emergent Auth (Google). No modificar el flujo de tokens sin consultar `server.py`.

## 🔄 Comandos Comunes

- Backend: `uvicorn server:app --reload`
- Frontend: `npm start` o `yarn start`
