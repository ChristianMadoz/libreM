# Mercado Libre Clone

Este proyecto es un clon funcional de Mercado Libre, desarrollado con una arquitectura moderna de **Full Stack** separando el frontend y backend.

## 🛠 Tecnologías Utilizadas

### Backend
- **Python** & **FastAPI**: Para la creación de una API RESTful rápida y eficiente.
- **MongoDB** & **Motor**: Base de datos NoSQL con driver asíncrono.
- **Pydantic**: Validación de datos y esquemas.
- **Uvicorn**: Servidor ASGI para producción.
- **Emergent Auth**: Autenticación integrada.

### Frontend
- **React**: Biblioteca para construir la interfaz de usuario.
- **Tailwind CSS**: Framework de utilidad para el diseño y estilos.
- **Radix UI**: Primitivas de UI accesibles para componentes como diálogos, menús, etc.
- **Lucide React**: Iconografía moderna.
- **Axios**: Cliente HTTP para comunicación con el backend.
- **React Router**: Manejo de rutas y navegación.
- **Zod**: Validación de esquemas en el cliente.

## 📂 Estructura del Proyecto

```
/
├── backend/          # Servidor API (FastAPI)
├── frontend/         # Cliente Web (React)
├── contracts.md      # Documentación de Contratos de API y Modelos de Datos
└── README.md         # Documentación del Proyecto
```

## ✨ Funcionalidades

- **Catálogo de Productos**: Listado con filtros (categoría, búsqueda, precio, ordenamiento).
- **Detalle de Producto**: Información completa, imágenes y opciones de compra.
- **Carrito de Compras**: Agregar, actualizar cantidad y eliminar productos.
- **Checkout**: Proceso de compra y generación de órdenes.
- **Favoritos**: Gestión de lista de deseos.
- **Historial de Órdenes**: Visualización de compras anteriores.
- **Autenticación**: Inicio de sesión seguro con Google.

## 🚀 Instalación y Configuración

### Prerrequisitos
- Python 3.8+
- Node.js & Yarn
- MongoDB (local o Atlas)

### Configuración del Backend

1. Navega al directorio del backend:
   ```bash
   cd backend
   ```

2. (Opcional) Crea y activa un entorno virtual:
   ```bash
   python -m venv venv
   # En Windows:
   .\venv\Scripts\activate
   # En macOS/Linux:
   source venv/bin/activate
   ```

3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Configura las variables de entorno:
   Asegúrate de tener un archivo `.env` con las variables necesarias (ver `server.py` para referencia, ej. `MONGO_URL`, `DB_NAME`).

5. Ejecuta el servidor de desarrollo:
   ```bash
   uvicorn server:app --reload
   ```
   El backend correrá en `http://localhost:8000`.

### Configuración del Frontend

1. Navega al directorio del frontend:
   ```bash
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   yarn install
   ```

3. Ejecuta el servidor de desarrollo:
   ```bash
   yarn start
   ```
   La aplicación se abrirá en `http://localhost:3000`.

## 📚 Documentación de API

Para detalles sobre los endpoints, formatos de respuesta y modelos de datos, consulta el archivo [`contracts.md`](./contracts.md).

## 🧪 Tests

Puedes revisar los resultados de las pruebas en `test_result.md` (si está disponible) o ejecutar los tests del backend con `pytest` si están configurados.
