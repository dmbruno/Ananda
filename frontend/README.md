# Frontend Tienda - React + Vite + Redux Toolkit

## Estructura principal

```
/src
  /components      # Componentes reutilizables
  /pages           # Vistas o pantallas completas
  /store           # Redux Toolkit store y slices
  /styles          # Estilos globales (global.css)
  /api             # Funciones para llamadas al backend
```

## Estado global

- Usamos Redux Toolkit con un slice por entidad (usuarios, clientes, productos, categorías, ventas, detalle_ventas).
- Ejemplo de slice: `clientesSlice.js` con reducers y asyncThunk para fetch.

## Estilos

- Variables y clases globales en `/src/styles/global.css`.

## Ejemplo de uso

- Página de clientes en `/src/pages/ClientesPage.jsx` usando el componente `/src/components/ClienteList.jsx`.

## Cómo iniciar

1. Instala dependencias:
   ```sh
   npm install
   ```
2. Inicia el servidor de desarrollo:
   ```sh
   npm run dev
   ```

## Personalización

- Agrega más slices en `/src/store` según crezcas la app.
- Usa `/src/api` para centralizar llamadas al backend.
- Crea más componentes y páginas según tus necesidades.
