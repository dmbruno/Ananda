<div align="center">

# 🛍️ Ananda ERP

### Sistema de Gestión para Comercios Retail & Textil · Retail & Textile Business Management System

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2.8-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Production-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant_Design-5.x-0170FE?style=for-the-badge&logo=antdesign&logoColor=white)

</div>

---

## 🇦🇷 Español

**Ananda** es un sistema ERP completo diseñado para pequeños y medianos comercios del rubro textil/retail. Permite gestionar ventas, stock, clientes, cajas y análisis de negocio desde una interfaz moderna y responsive.

---

## 🇺🇸 English

**Ananda** is a full-featured ERP system designed for small and medium-sized retail/textile businesses. It enables managing sales, inventory, customers, cash registers, and business analytics from a modern, responsive interface.

---

## ✨ Funcionalidades / Features

### 🛒 Nueva Venta / New Sale
- Carrito de compras interactivo con búsqueda de productos en tiempo real
- Selección de cliente con búsqueda integrada
- Múltiples métodos de pago: **efectivo, tarjeta y transferencia** (individuales o combinados)
- Generación automática de comprobante de venta
- ---
- Interactive shopping cart with real-time product search
- Client selection with integrated search
- Multiple payment methods: **cash, card, and transfer** (individual or combined)
- Automatic sale receipt generation

### 📊 Panel de Ventas / Sales Dashboard
- Gráficos de ventas por período (diario, semanal, mensual)
- Últimas ventas con detalle expandible
- Top productos más vendidos
- Resumen financiero en tiempo real
- ---
- Sales charts by period (daily, weekly, monthly)
- Latest sales with expandable detail
- Top best-selling products
- Real-time financial summary

### 📦 Gestión de Stock / Inventory Management
- Catálogo completo con SKU, categoría, subcategoría, talle, color, marca y temporada
- Control de precios: costo, venta y margen
- Alertas de stock mínimo
- Ajuste masivo de precios por categoría o marca
- Carga de imágenes vía Cloudinary
- ---
- Full catalog with SKU, category, subcategory, size, color, brand, and season
- Price control: cost, sale price, and margin
- Minimum stock alerts
- Bulk price adjustment by category or brand
- Image upload via Cloudinary

### 👥 Clientes / Customers
- Registro completo con cumpleaños y datos de contacto
- **Integración WhatsApp**: envío de mensajes promocionales y de cumpleaños directamente desde la app
- Estados de cliente (activo/inactivo)
- Historial de compras por cliente
- ---
- Full registry with birthdays and contact details
- **WhatsApp Integration**: send promotional and birthday messages directly from the app
- Customer status (active/inactive)
- Purchase history per customer

### 🗂️ Ventas Históricas / Historical Sales
- 238+ registros con filtros por fecha, cliente y método de pago
- Vista detallada de cada venta
- Exportación y visualización de comprobantes
- ---
- 238+ records with filters by date, client, and payment method
- Detailed view of each sale
- Receipt export and visualization

### 🏦 Gestión de Cajas / Cash Register Management
- Apertura y cierre de caja con monto inicial
- Control de diferencias (real vs. esperado)
- Resumen financiero por método de pago
- Historial completo de movimientos
- ---
- Cash register opening and closing with initial amount
- Discrepancy control (actual vs. expected)
- Financial summary by payment method
- Complete transaction history

---

## 📸 Screenshots

### 🛒 Nueva Venta / New Sale
![Nueva Venta](screenshots/01-nueva-venta.png)

### 📊 Panel de Ventas / Sales Dashboard
![Panel de Ventas](screenshots/02-panel-ventas.png)

### 🛒 Carrito de Compras / Shopping Cart
![Carrito](screenshots/03-carrito.png)

### 📦 Stock — Lista de Productos / Product List
![Stock Lista](screenshots/04-stock-lista.png)

### ➕ Stock — Nuevo Producto / New Product
![Nuevo Producto](screenshots/05-stock-nuevo-producto.png)

### 🔍 Stock — Detalle de Producto / Product Detail
![Detalle Producto](screenshots/06-stock-detalle.png)

### 📊 Stock — Resumen Total / Total Summary
![Stock Total](screenshots/07-stock-total.png)

### 🏷️ Categorías / Categories
![Categorías](screenshots/08-categorias.png)

### 👥 Gestión de Clientes / Customer Management
![Clientes](screenshots/09-clientes.png)

### 💬 Mensaje WhatsApp / WhatsApp Message
![WhatsApp](screenshots/10-mensaje-whatsapp.png)

### 🗂️ Ventas Históricas / Historical Sales
![Ventas Históricas](screenshots/11-ventas-historicas.png)

### 📋 Lista de Clientes / Customer List
![Lista Clientes](screenshots/12-clientes-lista.png)

### 🏦 Gestión de Cajas / Cash Register
![Cajas](screenshots/13-cajas.png)

### 🔒 Cerrar Caja / Close Register
![Cerrar Caja](screenshots/14-cerrar-caja.png)

### 📄 Detalle de Caja / Register Detail
![Detalle Caja](screenshots/15-detalle-caja.png)

---

## 🛠️ Stack Tecnológico / Tech Stack

| Capa / Layer | Tecnología / Technology | Versión / Version |
|---|---|---|
| **Backend** | Python + Flask | 3.10+ / 3.1 |
| **ORM** | SQLAlchemy | 2.0 |
| **Auth** | Flask-JWT-Extended | 4.7 |
| **Frontend** | React + Vite | 19 / 5.4 |
| **Estado / State** | Redux Toolkit | 2.8 |
| **UI Components** | Ant Design | 5.x |
| **Charts** | Chart.js + react-chartjs-2 | 4.5 |
| **HTTP Client** | Axios | 1.x |
| **DB Desarrollo / Dev DB** | SQLite | — |
| **DB Producción / Prod DB** | PostgreSQL | — |
| **Imágenes / Images** | Cloudinary | 1.44 |
| **Deploy** | Render | — |

---

## 🚀 Instalación Local / Local Setup

### Prerrequisitos / Prerequisites
- Python 3.10+
- Node.js 18+
- Git

---

### Backend

```bash
# 1. Clonar el repositorio / Clone the repository
git clone https://github.com/dmbruno/Ananda.git
cd Ananda

# 2. Crear y activar entorno virtual / Create and activate virtual environment
cd backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

# 3. Instalar dependencias / Install dependencies
pip install -r requirements.txt

# 4. Configurar variables de entorno / Set environment variables
# Copiar el archivo de ejemplo y completar los valores
# Copy the example file and fill in the values
cp .env.example .env
# Editar .env con tus valores / Edit .env with your values
```

**Variables de entorno requeridas / Required environment variables (`.env`):**

```env
DATABASE_URL=sqlite:///./instance/ananda.db   # SQLite para dev / for dev
SECRET_KEY=tu_clave_secreta_aqui
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
TZ=America/Argentina/Buenos_Aires
```

```bash
# 5. Inicializar la base de datos / Initialize the database
flask db init     # (si usas migraciones / if using migrations)
# o simplemente ejecutar la app para que SQLAlchemy cree las tablas
# or just run the app so SQLAlchemy creates the tables

# 6. Ejecutar el servidor / Run the server
python app.py
# El backend estará disponible en / Backend available at: http://localhost:5001
```

---

### Frontend

```bash
# Desde la raíz del proyecto / From project root
cd frontend

# 1. Instalar dependencias / Install dependencies
npm install

# 2. Configurar variable de entorno / Set environment variable
echo "VITE_API_URL=http://localhost:5001" > .env

# 3. Ejecutar en modo desarrollo / Run in development mode
npm run dev
# La app estará disponible en / App available at: http://localhost:5173

# Para construir para producción / To build for production
npm run build
```

---

## 🗄️ Base de Datos / Database

El proyecto usa **SQLite** para desarrollo y **PostgreSQL** para producción.

Para usar PostgreSQL localmente, cambiar `DATABASE_URL` en `.env`:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/ananda
```

El esquema SQL está disponible en:
- `schema.sql` — SQLite
- `schema_postgres.sql` — PostgreSQL

---

## ☁️ Deploy en Render / Render Deployment

El proyecto está configurado para deploy en [Render](https://render.com):

1. Crear un **Web Service** para el backend con:
   - Build command: `pip install -r requirements.txt`
   - Start command: `python app.py`
   - Variables de entorno: configurar `DATABASE_URL` con la URL de PostgreSQL de Render

2. Crear un **Static Site** para el frontend con:
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
   - Variable: `VITE_API_URL=https://tu-backend.onrender.com`

---

## 📁 Estructura del Proyecto / Project Structure

```
Ananda/
├── backend/
│   ├── models/          # Modelos SQLAlchemy / SQLAlchemy models
│   ├── routes/          # Endpoints de la API / API endpoints (Flask blueprints)
│   ├── services/        # Lógica de negocio / Business logic
│   ├── utils/           # Utilidades / Utilities
│   ├── database/        # Configuración y seeds / Config and seeds
│   ├── app.py           # Punto de entrada / Entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/         # Llamadas a la API / API calls (Axios)
│   │   ├── components/  # Componentes reutilizables / Reusable components
│   │   ├── pages/       # Páginas / Pages (React Router)
│   │   ├── store/       # Redux Toolkit slices
│   │   └── hooks/       # Custom hooks
│   ├── package.json
│   └── vite.config.js
├── screenshots/         # Capturas de pantalla / Screenshots
├── schema.sql
├── schema_postgres.sql
└── README.md
```

---

## 🔐 Autenticación / Authentication

El sistema usa **JWT (JSON Web Tokens)** para la autenticación. Los tokens se almacenan en localStorage y se incluyen automáticamente en cada request via Axios interceptors.

The system uses **JWT (JSON Web Tokens)** for authentication. Tokens are stored in localStorage and automatically included in every request via Axios interceptors.

---

## 📬 Contacto / Contact

<div align="center">

**Diego Bruno**

[![GitHub](https://img.shields.io/badge/GitHub-dmbruno-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dmbruno)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Diego_Bruno-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/dmbruno)

</div>

---

<div align="center">

*Desarrollado con ❤️ para el comercio minorista argentino*

*Built with ❤️ for Argentine retail commerce*

</div>
