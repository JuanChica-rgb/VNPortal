# VN Portal

Catálogo de juegos con autenticación, favoritos, calificaciones y panel de administración. Interfaz en español e inglés.

## Qué incluye

- Catálogo con búsqueda
- Ficha de cada juego
- Favoritos y ratings por usuario
- Auth (Supabase)
- Panel admin para publicar y editar
- Ajustes de sitio (título, etc.)

## Stack

- React 18, TypeScript, Vite, Tailwind CSS
- Supabase (Auth + Postgres)
- Lucide icons

## Desarrollo

```bash
npm install
cp .env.example .env   # si aún no tienes las claves de Supabase
npm run dev
npm run build
npm run typecheck
```

No subas `.env`. Las claves de Supabase van en variables `VITE_`.

## Licencia

Uso privado del autor. El código está publicado como portafolio.
