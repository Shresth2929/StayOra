# Frontend (Next.js + TypeScript + Tailwind)

This folder will contain the Next.js frontend application (App Router).

Local setup (recommended):

```bash
cd frontend
# Create the app using Next.js initializer
npx create-next-app@latest . --ts --app

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Start dev server
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to point to the backend (default: http://localhost:8000).
