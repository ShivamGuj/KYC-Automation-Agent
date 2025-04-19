# KYC Automation Agent - Frontend

This is the frontend application for the KYC Automation Agent, built with React, TypeScript, and Vite. It provides a modern UI for document upload, analysis, and verification using AI-powered tools.

## Features

- **Document Upload**: Upload KYC documents for analysis
- **Document Viewer**: View uploaded documents with highlighted information
- **AI Analysis**: Process documents with AI to extract and verify KYC information
- **Checklist Management**: Track verification status of KYC requirements
- **Email Notifications**: Send notifications about KYC status

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and optimized builds
- **Material UI** for component library
- **React PDF** for document viewing
- **Axios** for API communication

## Project Structure

```
src/
├── assets/         # Static assets and images
├── components/     # Reusable React components
│   ├── DocumentViewerWrapper.tsx  # Document viewer container
│   ├── MastraAgent.tsx            # AI agent component
│   └── PDFViewer.tsx              # PDF viewing component
├── App.tsx         # Main application component
├── index.css       # Global styles
└── main.tsx        # Application entry point
```

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

```bash
# Install dependencies
npm install
```

### Running the Development Server

```bash
npm run dev
```

This will start the development server at http://localhost:5173

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Demo Mode

The frontend runs in demo mode by default, which means:

1. No actual backend processing is required for basic functionality
2. Email notifications are simulated (no actual emails are sent)
3. Sample documents can be uploaded and processed with simulated AI analysis
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
