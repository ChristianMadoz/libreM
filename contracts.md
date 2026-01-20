# Contratos Backend - Mercado Libre Clone

## 1. API Contracts

### Authentication
- `POST /api/auth/google` - Autenticación con Google OAuth (Emergent Auth)
  - Response: `{ user: {...}, token: string }`
- `GET /api/auth/me` - Obtener usuario actual
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ user: {...} }`

### Products
- `GET /api/products` - Listar todos los productos
  - Query params: `?category=1&search=iphone&minPrice=100&maxPrice=1000&sort=price-asc`
  - Response: `{ products: [...] }`
- `GET /api/products/:id` - Obtener detalle de producto
  - Response: `{ product: {...} }`
- `GET /api/categories` - Listar categorías
  - Response: `{ categories: [...] }`

### Cart (requiere autenticación)
- `GET /api/cart` - Obtener carrito del usuario
  - Response: `{ cart: { items: [...], total: number } }`
- `POST /api/cart` - Agregar producto al carrito
  - Body: `{ productId, quantity, color }`
  - Response: `{ cart: {...} }`
- `PUT /api/cart/:itemId` - Actualizar cantidad
  - Body: `{ quantity }`
  - Response: `{ cart: {...} }`
- `DELETE /api/cart/:itemId` - Eliminar item del carrito
  - Response: `{ cart: {...} }`
- `DELETE /api/cart` - Vaciar carrito
  - Response: `{ success: true }`

### Favorites (requiere autenticación)
- `GET /api/favorites` - Obtener favoritos del usuario
  - Response: `{ favorites: [productId, ...] }`
- `POST /api/favorites/:productId` - Agregar a favoritos
  - Response: `{ favorites: [...] }`
- `DELETE /api/favorites/:productId` - Quitar de favoritos
  - Response: `{ favorites: [...] }`

### Orders (requiere autenticación)
- `POST /api/orders` - Crear orden (checkout)
  - Body: `{ shippingData: {...}, paymentData: {...} }`
  - Response: `{ order: {...} }`
- `GET /api/orders` - Listar órdenes del usuario
  - Response: `{ orders: [...] }`
- `GET /api/orders/:id` - Obtener detalle de orden
  - Response: `{ order: {...} }`

## 2. Datos Mockeados a Reemplazar

### En mock.js:
- `mockProducts` → Migrar a colección `products` en MongoDB
- `mockCategories` → Migrar a colección `categories` en MongoDB
- `getMockUser/setMockUser` → Reemplazar con autenticación real y colección `users`
- `getMockCart/setMockCart` → Reemplazar con colección `carts` asociada a usuario
- `getMockFavorites/setMockFavorites` → Reemplazar con campo `favorites` en colección `users`
- `getMockOrders/setMockOrders` → Reemplazar con colección `orders`

## 3. Implementación Backend

### Modelos MongoDB

#### User
```
{
  _id: ObjectId,
  googleId: string,
  email: string,
  name: string,
  picture: string,
  favorites: [ObjectId], // referencias a productos
  createdAt: Date
}
```

#### Product
```
{
  _id: ObjectId,
  name: string,
  price: number,
  originalPrice: number | null,
  discount: number,
  image: string,
  category: string,
  categoryId: number,
  freeShipping: boolean,
  rating: number,
  reviews: number,
  sold: number,
  stock: number,
  description: string,
  features: [string],
  colors: [string],
  seller: string,
  verified: boolean
}
```

#### Category
```
{
  _id: ObjectId,
  id: number,
  name: string,
  icon: string
}
```

#### Cart
```
{
  _id: ObjectId,
  userId: ObjectId,
  items: [{
    productId: ObjectId,
    quantity: number,
    color: string,
    addedAt: Date
  }],
  updatedAt: Date
}
```

#### Order
```
{
  _id: ObjectId,
  userId: ObjectId,
  orderNumber: string,
  items: [{
    productId: ObjectId,
    name: string,
    price: number,
    quantity: number,
    color: string,
    image: string
  }],
  shipping: {
    fullName: string,
    email: string,
    phone: string,
    address: string,
    city: string,
    province: string,
    postalCode: string
  },
  payment: {
    method: string,
    status: string
  },
  total: number,
  status: string, // 'pending', 'confirmed', 'shipped', 'delivered'
  createdAt: Date
}
```

### Lógica de Negocio
- Validación de stock antes de agregar al carrito
- Cálculo automático de totales en carrito
- Generación de número de orden único
- Reducción de stock al confirmar orden
- Middleware de autenticación JWT

### Manejo de Errores
- 400: Bad Request (datos inválidos)
- 401: Unauthorized (sin token o token inválido)
- 404: Not Found (recurso no encontrado)
- 500: Internal Server Error (errores del servidor)

## 4. Integración Frontend-Backend

### Cambios en Frontend:

1. **Crear servicio API** (`/frontend/src/services/api.js`):
   - Axios instance con baseURL y manejo de tokens
   - Interceptors para agregar Authorization header
   - Funciones para todos los endpoints

2. **Reemplazar mock.js**:
   - `Home.jsx`: Usar `api.getProducts()` y `api.getCategories()`
   - `ProductDetail.jsx`: Usar `api.getProduct(id)`
   - `Cart.jsx`: Usar `api.getCart()`, `api.updateCart()`, etc.
   - `Favorites.jsx`: Usar `api.getFavorites()`, `api.toggleFavorite()`
   - `Checkout.jsx`: Usar `api.createOrder()`
   - `Orders.jsx`: Usar `api.getOrders()`
   - `Login.jsx`: Usar `api.googleLogin()` con Emergent Auth

3. **Context para Auth** (`/frontend/src/context/AuthContext.jsx`):
   - Manejo de estado de usuario autenticado
   - Almacenamiento de token en localStorage
   - Funciones login/logout
   - Provider para toda la app

4. **Context para Cart** (`/frontend/src/context/CartContext.jsx`):
   - Estado global del carrito sincronizado con backend
   - Funciones para operaciones de carrito

5. **Protección de rutas**:
   - Crear `PrivateRoute` component
   - Proteger `/checkout`, `/orders`

### Flujo de Datos:
```
Frontend Component → API Service → Backend Endpoint → MongoDB → Response → Update UI State
```

### Autenticación:
```
Login → Google OAuth (Emergent) → Get Token → Store Token → Use in API calls
```

## 5. Seed Data
Crear script para poblar la BD con los productos y categorías mock iniciales.
