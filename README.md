# Portafolio de Alexander Urbaneja

Portafolio personal con forma de escritorio: cada proyecto es una carpeta, un archivo o una app que se abre en su propia ventana. Incluye los sitios web en producción que construí, minijuegos táctiles jugables, mi reel, el CV en español e inglés y un mensajero de contacto.

**Product Engineer · Full Stack** · [LinkedIn](https://www.linkedin.com/in/alexanderojas) · [Behance](https://www.behance.net/alestudiocreative)

## Qué hay adentro

- **Gestor de ventanas propio:** abrir, mover, minimizar, maximizar y cerrar ventanas, con atajos de teclado, dock con zoom y enlaces profundos (`?abrir=`).
- **Fondo técnico interactivo:** plano animado con mira de CAD, foco y paralaje que siguen al mouse. Respeta "reducir movimiento" y pantallas táctiles.
- **Navegador embebido** para mostrar los sitios en producción, con alternativa para los que no permiten mostrarse dentro de otra página.
- **Minijuegos en HTML** servidos de forma aislada, con su propia política de seguridad.
- **Mensajero de contacto** con validación, límite de envíos, huella de IP con sal, token de tiempo mínimo anti-bots, guardado en PostgreSQL y aviso por correo.
- **Versión simple** (`/simple`) para lectores de pantalla y conexiones lentas.
- **SEO:** metadatos, imagen para redes generada en el servidor, `robots.txt` y `sitemap.xml`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Drizzle ORM · PostgreSQL (Neon) · Nodemailer · Vitest · ESLint

## Calidad

- 260+ pruebas unitarias con Vitest y pruebas de integración contra una base de datos real.
- TypeScript estricto y ESLint.
- Encabezados de seguridad (`frame-ancestors`, `X-Frame-Options`, `nosniff`, `Referrer-Policy`) configurados en `next.config.ts`.
- `pnpm check:comentarios` mantiene el código sin comentarios: los nombres y las pruebas documentan el comportamiento.

## Cómo correrlo

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

```bash
pnpm test
pnpm typecheck
pnpm lint
```

Las variables de entorno están descritas en `.env.example`. El mensajero de contacto necesita `DATABASE_URL` y los datos SMTP.

## Licencia

El código es de consulta. Los logos, imágenes, videos y minijuegos pertenecen a sus marcas y no se pueden reutilizar.
