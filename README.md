# Image Resizer Frontend

This is the React-based frontend for the Image Resizer application. It provides a dashboard to upload images, configure resize/convert options, and download or copy processed images.

## Tech Stack

- React
- React Router
- Axios (for API calls)
- Custom CSS (no heavy UI framework)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

Run the command from the `frontend` directory.

### 2. Environment variables

Copy `.env.example` to `.env` and adjust the values as needed:

```bash
cp .env.example .env
```

Common variables:

- `VITE_API_BASE_URL` – Base URL of the backend API (e.g. `http://localhost:5000/api`).

### 3. Run the dev server

```bash
npm run dev
```

By default this starts Vite on a local port (often `5173`). Open the printed URL in your browser.

### 4. Build for production

```bash
npm run build
```

The optimized production build will be emitted into the `dist` folder.

You can preview the production build with:

```bash
npm run preview
```

## Features

- Authentication (login / signup)
- Protected dashboard route
- Image upload with multi-file support
- Resize/crop and quality options
- Format conversion (JPG, PNG, WebP, etc.)
- Base64 conversion tools
- Light / dark theme toggle

## Project Structure (frontend)

- `src/main.jsx` – App entry point
- `src/App.jsx` – Routing and layout (header, theme toggle)
- `src/pages/` – Route pages (Home, Login, Signup, Dashboard, About)
- `src/components/` – Reusable UI components (uploader, resize options, previews, etc.)
- `src/context/` – Context providers, such as auth
- `src/api/` – Axios instance / API helper
- `src/index.css` – Global styles and theme tokens

## Troubleshooting

- **Blank page / network errors** – Check that the backend is running and `VITE_API_BASE_URL` points to the correct URL.
- **CORS errors** – Ensure the backend is configured to allow the frontend origin.
- **Auth redirects** – If you are redirected away from the dashboard, your auth token may be missing or expired; log in again.
