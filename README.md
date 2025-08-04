
# Firebase64: Image Uploader & Viewer

Firebase64 is a simple web application for uploading, storing, and viewing images using Firebase Firestore. Images are stored as base64-encoded strings, making it easy to retrieve and display them directly in the browser.

## Features

- Upload images and store them securely in Firebase Firestore
- API key authentication for uploads
- View images via unique URLs
- Images are served as raw data for direct browser display
- Built with Next.js, React, and Firebase

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

### Running Locally

```sh
pnpm dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

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
