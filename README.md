# Firebase64: Image Uploader & Admin Panel

Firebase64 is a simple web application for uploading, storing, and viewing images using Firebase Firestore. Images are stored as base64-encoded strings, making it easy to retrieve and display them directly in the browser.

## Features

- Upload images and store them securely in Firebase Firestore
- API key authentication for uploads
- View images via unique URLs
- Images are served as raw data for direct browser display
- Built with Next.js, React, and Firebase
- **Admin panel** for managing and moderating images

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (or npm/yarn)
- Firebase project with Firestore enabled

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/firebase64.git
   cd firebase64
   ```
2. Install dependencies:
   ```sh
   pnpm install
   # or
   npm install
   ```
3. Configure Firebase:
   - Copy your Firebase config to `lib/firebase.ts`.
   - Ensure Firestore rules allow appropriate access.

### Required Environment Variables

Create a `.env.local` file in the root directory and add the following variables as needed:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
ADMIN_KEY=your_admin_panel_key
```

> **Note:** The `ADMIN_KEY` is used to access the admin panel. Set this to a secure value and use it to log in at `/admin`.

### Running Locally

```sh
pnpm dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Panel

The admin panel is available at `/admin` and provides the following features:

- Secure login with an admin key (set via the `ADMIN_KEY` environment variable)
- View, search, and paginate all uploaded images
- Preview images and view metadata (filename, size, upload date, API key used, etc.)
- Delete images from Firestore

To access the admin panel, navigate to `/admin` and enter your admin key.

## API

### Upload Image

`POST /api/upload-image`

**Body:**
```json
{
  "imageData": "<base64 string>",
  "fileName": "example.jpg",
  "mimeType": "image/jpeg",
  "apiKey": "<your-api-key>"
}
```

**Response:**
```json
{
  "success": true,
  "imageId": "...",
  "viewUrl": "...",
  "fileSize": 12345,
  "fileSizeMB": "0.01",
  "message": "Image uploaded successfully to Firebase Firestore"
}
```

### View Image

`GET /view/[imageId]`

Displays the raw image in the browser.

## License

MIT
