# KYC Automation Agent

A Know Your Customer (KYC) automation agent built with Mastra AI that analyzes KYC documents, extracts relevant information, and maps it to a checklist, ensuring each entry is traceable to its source.

This project demonstrates the orchestration of an intelligent agent using Mastra AI, focusing on workflow design and tool integration for KYC document processing.

## Features

- **Document Upload & Analysis**: Upload PDF documents containing KYC information for automated analysis
- **Information Extraction**: Extract key information from documents using Mastra AI
- **Checklist Mapping**: Automatically map extracted information to KYC checklist items
- **Traceability**: Link each checklist item to its source in the documents
- **PDF Viewer**: View uploaded documents with highlighted information
- **Email Notifications**: Send notifications about KYC status
- **Pending Items Tracking**: Track pending checklist items that need additional documentation

## Tech Stack

### Frontend
- React with TypeScript
- Vite (build tool)
- Material UI (component library)
- React PDF (PDF viewer)
- Axios (HTTP client)

### Backend
- Node.js with Express
- TypeScript
- Multer (file uploads)
- PDF Parse (PDF text extraction)
- Mastra AI integration

## Project Structure

```
kyc-automation-agent/
├── frontend/             # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.tsx       # Main application component
│   │   └── ...
│   └── ...
├── backend/              # Node.js backend application
│   ├── src/
│   │   ├── index.ts      # Main server file
│   │   └── ...
│   └── ...
└── README.md             # Project documentation
```

## Setup and Running Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/kyc-automation-agent.git
   cd kyc-automation-agent
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..

   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

### Running the Application

#### Option 1: Using the start script (Recommended)

The project includes a convenient start script that launches both frontend and backend servers:

```bash
# On Windows
start.bat

# On macOS/Linux
./start.sh
```

This will start:
- Frontend server at http://localhost:5173
- Backend server at http://localhost:5000

#### Option 2: Starting servers manually

If you prefer to start the servers manually:

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. In a separate terminal, start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

### Accessing the Application

Once both servers are running, open your browser and navigate to:

- **Frontend UI**: http://localhost:5173

### Demo Mode

The application runs in demo mode by default, which means:

1. No actual backend processing is required for basic functionality
2. Email notifications are simulated (no actual emails are sent)
3. Sample documents can be uploaded and processed with simulated AI analysis

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the TypeScript code:
   ```
   npm run build
   ```

4. Start the server:
   ```
   npm start
   ```
   
   For development with auto-reload:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

## Usage

1. Start both the backend and frontend servers
2. Open the frontend application in your browser (typically at http://localhost:5173)
3. Upload KYC documents (PDF format) from the `sample input` folder
4. The agent will automatically extract information and map it to the checklist
5. View the checklist status and any pending items
6. Click on document references to view the source document with highlighted information
7. Use the Mastra Agent to run additional analysis on the documents
8. Send notifications about the KYC status if needed

### Sample Documents

The `sample input` folder contains several documents for testing the KYC automation agent:

- **00000000 Template - Engagement - Incorporation Form - PLC.pdf**: Template for company incorporation
- **Director Appointment Truffles AI.docx**: Document for director appointment
- **Director Registry Truffles AI.docx**: Registry of company directors
- **John Doe Full.docx**: Personal information for John Doe
- **John Doe Passport Full.docx**: Passport information for John Doe
- **Proof of Address John Doe (3).docx**: Proof of address document
- **Truffles AI Holdings Company Profile.docx**: Company profile document
- **Truffles AI Shareholder Registry.docx**: Registry of company shareholders

Upload these documents to test the KYC automation workflow.

## Mastra AI Integration

This project integrates with Mastra AI to orchestrate the KYC automation workflow. The agent uses the following tools:

- **Document Loader**: Loads and prepares documents for analysis
- **Text Extractor**: Extracts text content from documents
- **Entity Recognizer**: Identifies and extracts entities like names, dates, addresses
- **Checklist Mapper**: Maps extracted entities to KYC checklist items
- **Verification Tool**: Verifies extracted information against requirements
- **Email Notifier**: Sends notifications about KYC status
- **Web Search**: Searches the web for additional verification information

### Agent Workflow

The KYC automation agent follows this workflow:

1. **Document Upload**: User uploads KYC documents (PDF format)
2. **Document Loading**: The agent loads the documents and prepares them for analysis
3. **Text Extraction**: The agent extracts text content from the documents
4. **Entity Recognition**: The agent identifies and extracts relevant entities (names, dates, addresses, etc.)
5. **Checklist Mapping**: The agent maps the extracted entities to KYC checklist items
6. **Verification**: The agent verifies the extracted information against requirements
7. **Results Display**: The agent displays the results in the UI, with traceability to source documents
8. **Notification**: The agent can send notifications about the KYC status

### Implementation Details

The Mastra AI integration is implemented in the following files:

- `backend/src/services/mastraAI.ts`: Service for interacting with Mastra AI
- `backend/src/services/kycAgentService.ts`: Service for orchestrating the KYC workflow
- `frontend/src/components/MastraAgent.tsx`: React component for displaying the agent's workflow

The agent uses a combination of AI-powered tools to extract and verify information from KYC documents, ensuring accuracy and compliance with regulatory requirements.

## Project Structure

```
kyc-automation-agent/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── MastraAgent.tsx  # Mastra AI agent component
│   │   │   └── PDFViewer.tsx    # PDF viewer component
│   │   ├── App.tsx           # Main application component
│   │   └── index.css         # Styles
│   └── ...
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── services/         # Backend services
│   │   │   ├── mastraAI.ts      # Mastra AI service
│   │   │   ├── checklistService.ts # Checklist management
│   │   │   ├── documentService.ts  # Document management
│   │   │   └── kycAgentService.ts  # KYC agent orchestration
│   │   ├── index.ts          # Main server file
│   │   └── ...
│   └── ...
├── sample input/             # Sample KYC documents for testing
└── README.md                 # Project documentation
```

## Future Enhancements

- **Document Type Classification**: Automatically classify document types (passport, utility bill, etc.)
- **Multi-language Support**: Extract information from documents in multiple languages
- **Risk Assessment**: Implement risk scoring for KYC submissions
- **Blockchain Integration**: Store verification results on a blockchain for immutability
- **Advanced Verification**: Implement more advanced verification techniques (facial recognition, etc.)
- **Dashboard**: Create a dashboard for monitoring KYC submissions and compliance metrics

## License

ISC
