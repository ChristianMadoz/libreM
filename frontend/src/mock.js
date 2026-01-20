// Mock data para Mercado Libre Clone

export const mockCategories = [
  { id: 1, name: 'Tecnología', icon: 'Laptop' },
  { id: 2, name: 'Hogar y Muebles', icon: 'Home' },
  { id: 3, name: 'Deportes y Fitness', icon: 'Dumbbell' },
  { id: 4, name: 'Moda', icon: 'Shirt' },
  { id: 5, name: 'Electrodomésticos', icon: 'Refrigerator' },
  { id: 6, name: 'Juguetes', icon: 'Gamepad2' },
  { id: 7, name: 'Belleza', icon: 'Sparkles' },
  { id: 8, name: 'Libros', icon: 'Book' },
  { id: 9, name: 'Construcción', icon: 'Hammer' },
  { id: 10, name: 'Automotriz', icon: 'Car' },
];

export const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    price: 1299.99,
    originalPrice: 1499.99,
    discount: 13,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80',
    category: 'Tecnología',
    categoryId: 1,
    freeShipping: true,
    rating: 4.8,
    reviews: 2847,
    sold: 1523,
    stock: 45,
    description: 'iPhone 15 Pro Max con sistema de cámara avanzado, chip A17 Pro y diseño de titanio. Pantalla Super Retina XDR de 6.7 pulgadas.',
    features: ['256GB almacenamiento', 'Cámara 48MP', 'Chip A17 Pro', '5G', 'Titanio'],
    colors: ['Natural', 'Azul', 'Blanco', 'Negro'],
    seller: 'Apple Store Oficial',
    verified: true
  },
  {
    id: 2,
    name: 'Samsung Smart TV 55" 4K UHD',
    price: 549.99,
    originalPrice: 799.99,
    discount: 31,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80',
    category: 'Tecnología',
    categoryId: 1,
    freeShipping: true,
    rating: 4.6,
    reviews: 1234,
    sold: 856,
    stock: 23,
    description: 'Smart TV Samsung 55 pulgadas con resolución 4K UHD, HDR y sistema operativo Tizen.',
    features: ['55 pulgadas', '4K UHD', 'HDR10+', 'Smart TV', 'WiFi'],
    colors: ['Negro'],
    seller: 'Samsung Official',
    verified: true
  },
  {
    id: 3,
    name: 'Sony PlayStation 5 Digital Edition',
    price: 449.99,
    originalPrice: null,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80',
    category: 'Tecnología',
    categoryId: 1,
    freeShipping: true,
    rating: 4.9,
    reviews: 5678,
    sold: 3421,
    stock: 12,
    description: 'PlayStation 5 Edición Digital con SSD ultra rápido y compatibilidad con juegos PS4.',
    features: ['SSD 825GB', 'Ray Tracing', '4K 120fps', 'Control DualSense', 'Sin lector'],
    colors: ['Blanco'],
    seller: 'Sony Gaming',
    verified: true
  },
  {
    id: 4,
    name: 'MacBook Air M2 13" 256GB',
    price: 1099.00,
    originalPrice: 1199.00,
    discount: 8,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
    category: 'Tecnología',
    categoryId: 1,
    freeShipping: true,
    rating: 4.9,
    reviews: 1876,
    sold: 943,
    stock: 34,
    description: 'MacBook Air con chip M2, pantalla Liquid Retina de 13.6 pulgadas y hasta 18 horas de batería.',
    features: ['Chip M2', '8GB RAM', '256GB SSD', '13.6 pulgadas', 'Touch ID'],
    colors: ['Plata', 'Gris espacial', 'Oro', 'Azul medianoche'],
    seller: 'Apple Store',
    verified: true
  },
  {
    id: 5,
    name: 'Sofá Seccional Moderno 3 Plazas',
    price: 899.99,
    originalPrice: 1299.99,
    discount: 31,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
    category: 'Hogar y Muebles',
    categoryId: 2,
    freeShipping: true,
    rating: 4.5,
    reviews: 456,
    sold: 234,
    stock: 8,
    description: 'Sofá seccional moderno de 3 plazas con tapizado de tela premium y estructura de madera maciza.',
    features: ['Tela premium', '3 plazas', 'Cojines removibles', 'Estructura madera', 'Moderno'],
    colors: ['Gris', 'Beige', 'Azul marino'],
    seller: 'Muebles Premium',
    verified: false
  },
  {
    id: 6,
    name: 'Nike Air Max 90 Running Shoes',
    price: 129.99,
    originalPrice: 160.00,
    discount: 19,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    category: 'Deportes y Fitness',
    categoryId: 3,
    freeShipping: true,
    rating: 4.7,
    reviews: 3421,
    sold: 2876,
    stock: 156,
    description: 'Zapatillas Nike Air Max 90 con amortiguación Air visible y diseño icónico.',
    features: ['Air Max', 'Suela de goma', 'Mesh transpirable', 'Running', 'Unisex'],
    colors: ['Blanco/Negro', 'Negro', 'Azul', 'Rojo'],
    seller: 'Nike Official',
    verified: true
  },
  {
    id: 7,
    name: 'Cámara Canon EOS R6 Mark II',
    price: 2499.00,
    originalPrice: null,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1606980441434-a72d0e8d4954?w=500&q=80',
    category: 'Tecnología',
    categoryId: 1,
    freeShipping: true,
    rating: 4.9,
    reviews: 876,
    sold: 423,
    stock: 15,
    description: 'Cámara mirrorless full-frame con sensor de 24.2MP, vídeo 4K y estabilización de 5 ejes.',
    features: ['24.2MP', '4K 60fps', 'Estabilización 5 ejes', 'WiFi', 'Full Frame'],
    colors: ['Negro'],
    seller: 'Canon Store',
    verified: true
  },
  {
    id: 8,
    name: 'Samsung Galaxy S24 Ultra 512GB',
    price: 1199.99,
    originalPrice: 1399.99,
    discount: 14,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80',
    category: 'Tecnología',
    categoryId: 1,
    freeShipping: true,
    rating: 4.8,
    reviews: 2134,
    sold: 1567,
    stock: 67,
    description: 'Galaxy S24 Ultra con S Pen integrado, cámara de 200MP y pantalla Dynamic AMOLED 2X.',
    features: ['512GB', 'Cámara 200MP', 'S Pen', '5G', 'Titanio'],
    colors: ['Titanio Negro', 'Titanio Gris', 'Titanio Violeta'],
    seller: 'Samsung Official',
    verified: true
  },
  {
    id: 9,
    name: 'Refrigerador LG Side by Side 601L',
    price: 1899.99,
    originalPrice: 2299.99,
    discount: 17,
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&q=80',
    category: 'Electrodomésticos',
    categoryId: 5,
    freeShipping: true,
    rating: 4.6,
    reviews: 567,
    sold: 234,
    stock: 12,
    description: 'Refrigerador LG Side by Side con dispensador de agua y hielo, tecnología Inverter.',
    features: ['601L', 'Inverter', 'Dispensador', 'No Frost', 'Smart Diagnosis'],
    colors: ['Acero inoxidable'],
    seller: 'LG Electronics',
    verified: true
  },
  {
    id: 10,
    name: 'Bicicleta Mountain Bike Rodado 29',
    price: 599.99,
    originalPrice: 799.99,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500&q=80',
    category: 'Deportes y Fitness',
    categoryId: 3,
    freeShipping: true,
    rating: 4.5,
    reviews: 789,
    sold: 456,
    stock: 23,
    description: 'Bicicleta Mountain Bike rodado 29 con cuadro de aluminio y cambios Shimano 21 velocidades.',
    features: ['Rodado 29', 'Aluminio', 'Shimano 21v', 'Frenos disco', 'Suspensión'],
    colors: ['Negro/Rojo', 'Negro/Azul', 'Blanco/Negro'],
    seller: 'BikeStore Pro',
    verified: false
  },
  {
    id: 11,
    name: 'Auriculares Sony WH-1000XM5',
    price: 349.99,
    originalPrice: 399.99,
    discount: 13,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80',
    category: 'Tecnología',
    categoryId: 1,
    freeShipping: true,
    rating: 4.9,
    reviews: 4567,
    sold: 3421,
    stock: 89,
    description: 'Auriculares inalámbricos con cancelación de ruido líder en la industria y 30 horas de batería.',
    features: ['Cancelación ruido', '30h batería', 'Bluetooth 5.2', 'LDAC', 'Multipunto'],
    colors: ['Negro', 'Plata'],
    seller: 'Sony Audio',
    verified: true
  },
  {
    id: 12,
    name: 'Silla Gamer Ergonómica RGB',
    price: 299.99,
    originalPrice: 449.99,
    discount: 33,
    image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500&q=80',
    category: 'Hogar y Muebles',
    categoryId: 2,
    freeShipping: true,
    rating: 4.4,
    reviews: 1234,
    sold: 876,
    stock: 34,
    description: 'Silla gamer ergonómica con iluminación RGB, reposabrazos 4D y reclinable hasta 180°.',
    features: ['RGB', 'Reclinable 180°', 'Reposabrazos 4D', 'Cuero PU', 'Ergonómica'],
    colors: ['Negro/Rojo', 'Negro/Azul', 'Negro/Rosa'],
    seller: 'Gaming Gear',
    verified: false
  }
];

export const getMockUser = () => {
  const user = localStorage.getItem('mockUser');
  return user ? JSON.parse(user) : null;
};

export const setMockUser = (user) => {
  if (user) {
    localStorage.setItem('mockUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('mockUser');
  }
};

export const getMockCart = () => {
  const cart = localStorage.getItem('mockCart');
  return cart ? JSON.parse(cart) : [];
};

export const setMockCart = (cart) => {
  localStorage.setItem('mockCart', JSON.stringify(cart));
};

export const getMockFavorites = () => {
  const favorites = localStorage.getItem('mockFavorites');
  return favorites ? JSON.parse(favorites) : [];
};

export const setMockFavorites = (favorites) => {
  localStorage.setItem('mockFavorites', JSON.stringify(favorites));
};

export const getMockOrders = () => {
  const orders = localStorage.getItem('mockOrders');
  return orders ? JSON.parse(orders) : [];
};

export const setMockOrders = (orders) => {
  localStorage.setItem('mockOrders', JSON.stringify(orders));
};