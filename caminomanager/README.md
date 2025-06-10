# CaminoManager

Este proyecto fue creado con [Next.js](https://nextjs.org/) y [Supabase](https://supabase.com/).

## Configuración inicial

1. Clona el repositorio y entra a la carpeta del proyecto:
   ```bash
   git clone <repo-url>
   cd caminomanager
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un proyecto en [Supabase](https://app.supabase.com/).
4. Copia las claves públicas y privadas de tu proyecto Supabase.
5. Crea un archivo `.env.local` en la raíz del proyecto y agrega:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```
6. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` — Inicia el servidor de desarrollo
- `npm run build` — Compila la aplicación para producción
- `npm start` — Inicia la aplicación en modo producción

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
