# Ananda — Frontend (React + Vite + Redux Toolkit)

Este README explica cómo trabajar con la parte frontend del proyecto Ananda: configuración, arranque en desarrollo, build para producción, estructura de carpetas, convenciones, y buenas prácticas.

---

## Descripción

Interfaz web construida con React + Vite que consume la API del backend (Flask). Usa Redux Toolkit para el estado global, Chart.js para gráficas, react-toastify para notificaciones y componentes modales y utilidades propias para confirmaciones.

Stack principal
- React (functional components + hooks)
- Vite (dev server + build)
- Redux Toolkit (slices, asyncThunks)
- react-router-dom
- chart.js + react-chartjs-2
- react-toastify

---

## Requisitos

- Node.js v16+ (preferible 18+)
- npm o yarn
- Backend corriendo (para desarrollo) en `http://localhost:5001` (por defecto)

---

## Primeros pasos (setup)

1. Instalar dependencias:

```bash
cd frontend
npm install
```

2. Variables de entorno

Crea un archivo `.env.local` en `frontend/` si necesitás ajustar la URL del backend u otras variables. Ejemplo mínimo:

```
VITE_API_BASE_URL=http://localhost:5001/api
VITE_FRONTEND_PORT=5173
```

Vite expone variables de entorno que empiecen con `VITE_`.

3. Iniciar en modo desarrollo

```bash
npm run dev
```

El dev server suele abrir en `http://localhost:5173`. Si necesitas usar el puerto 5174 (se usa en algunas páginas), puedes exportar `VITE_FRONTEND_PORT` o pasar `--port` a Vite.

4. Build para producción

```bash
npm run build
# previsualizar el build localmente
npm run preview
```

---

## Scripts disponibles

- `npm run dev` – Inicia Vite en modo desarrollo.
- `npm run build` – Genera la versión optimizada para producción en `dist/`.
- `npm run preview` – Sirve el `dist/` localmente para probar la build.
- `npm run lint` – (si está configurado) Ejecuta linters.

Si tu `package.json` no incluye alguno de estos, agrégalos según tus necesidades.

---

## Configuración de la API

Para mantener la app desacoplada, todas las llamadas al backend deben usar la variable `VITE_API_BASE_URL`. Revisa `src/api` donde se centralizan los endpoints y usa `import.meta.env.VITE_API_BASE_URL`.

Ejemplo:
```js
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
```

---

## Estructura del proyecto

```
frontend/
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx            # punto de entrada
   ├─ App.jsx
   ├─ api/                # llamadas al backend centralizadas
   ├─ assets/             # imágenes, iconos, etc.
   ├─ components/         # componentes reutilizables
   ├─ pages/              # vistas / rutas completas
   ├─ store/              # store redux + slices
   ├─ styles/             # css global y variables
   ├─ hooks/              # custom hooks
   └─ utils/              # helpers (notify, confirm, formatters)
```

Convenciones principales
- Los componentes pequeños y reutilizables van en `src/components`.
- Las páginas por ruta en `src/pages`.
- Cada slice de Redux en `src/store` debe tener su propio archivo con thunks y selectores.
- Archivos CSS por componente en la misma carpeta (o usar CSS Modules si se decide luego).

---

## Estado global (Redux Toolkit)

- Usamos slices por entidad (ventas, productos, clientes, caja, usuarios, etc.).
- Después de cualquier mutación (create/update/delete) el flujo recomienda refrescar las entidades relacionadas (dispatch de fetch thunks) para mantener la UI coherente.

Buena práctica: los thunks que mutan el backend deben devolver el resultado y lanzar notificaciones (`notify.success` / `notify.error`) según corresponda.

---

## Componentes y UX utilities importantes

- `src/utils/notify.js` — wrapper alrededor de `react-toastify` para toasts consistentes (success/error/info).
- `src/utils/confirm/*` — provider/modal para confirmaciones promise-based que reemplaza `window.confirm`.
- Modales reutilizables en `src/components/Modals`.
- `src/components/Grafico*` — varios componentes de gráficos usando Chart.js; revisá la configuración de plugins (shadow, tooltips) antes de cambiar.

---

## Estilos

- Existen estilos globales en `src/index.css` / `src/styles`.
- Preferencia por clases utilitarias y reglas scoped por componente.
- Si añadís nuevas variables de color o tipografías, agrégalas a `src/styles/global.css`.

---

## Testing y calidad

- No hay suite de tests incluida por defecto. Recomiendo agregar `jest` o `vitest` + `@testing-library/react` para pruebas unitarias de componentes críticos.
- Añadí `eslint` y `prettier` para mantener consistencia si el equipo lo requiere.

---

## Deploy (recomendado)

- El build de Vite (`npm run build`) genera una carpeta `dist/` estática. Render u otros servicios (Netlify, Vercel) pueden servir ese contenido con la URL del backend apuntada con `VITE_API_BASE_URL` en las variables de entorno del servicio.

- Si usás Render (backend en otro servicio), configurar en el servicio frontend la variable `VITE_API_BASE_URL` con la URL pública del backend.

---

## Debugging rápido

- Si la app no recibe datos: comprobar `VITE_API_BASE_URL`, CORS en backend (puerto 5001 por defecto) y abrir DevTools → Network.
- Errores de CORS: verificar que backend permite el origen del frontend (5173/5174).
- Problemas con rutas: revisar `react-router` y que `<BrowserRouter>` esté configurado correctamente.

---

## Extensiones y utilidades recomendadas (VSCode)

- ESLint
- Prettier
- Simple React Snippets
- GitLens

---

## Cómo contribuir

- Crea una rama con nombre claro: `feature/<descripcion>` o `fix/<descripcion>`.
- Haz PR hacia `main` con descripción del cambio.
- Mantén commits pequeños y con mensaje claro.

---

## Contacto

Si necesitás ayuda con el frontend o con la integración backend/frontend, abrí una issue o escribime directamente.


