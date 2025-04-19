import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';

// Import services
import KYCAgentService from './services/kycAgentService';
import { Document } from './services/documentService';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Initialize KYC agent service
const kycAgent = new KYCAgentService();

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, kycAgent.getUploadDir());
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage
  // Removed file filter to allow all file types
});



// Helper function to determine file type from mimetype and extension
function getFileType(mimetype: string, filename: string): 'pdf' | 'doc' | 'docx' | 'txt' | string {
  // Try to get file extension
  const extension = filename.split('.').pop()?.toLowerCase();
  
  // First check mimetype
  switch (mimetype) {
    case 'application/pdf':
      return 'pdf';
    case 'application/msword':
      return 'doc';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx';
    case 'text/plain':
      return 'txt';
    default:
      // If mimetype doesn't match, try using extension
      if (extension === 'pdf') return 'pdf';
      if (extension === 'doc') return 'doc';
      if (extension === 'docx') return 'docx';
      if (extension === 'txt') return 'txt';
      
      // Return the extension as the file type if it exists
      if (extension) {
        console.log(`Using extension as file type: ${extension}`);
        return extension;
      }
      
      console.log(`Unknown file type: mimetype=${mimetype}, extension=${extension}`);
      return 'unknown';
  }
}

// Routes
app.post('/api/upload', upload.single('document'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Get client-provided file type if available
    const clientFileType = req.body.fileType as string | undefined;
    
    // Determine file type from server-side info
    const serverFileType = getFileType(req.file.mimetype, req.file.originalname);
    
    // Use client file type as a fallback
    const fileType = serverFileType !== 'unknown' ? serverFileType : clientFileType || 'unknown';
    
    console.log(`File upload: ${req.file.originalname}, Server detected: ${serverFileType}, Client detected: ${clientFileType}, Using: ${fileType}`);

    const document: Document = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      uploadDate: new Date(),
      fileType
    };

    // Add document to the list
    kycAgent.addDocument(document);

    // Process document with Mastra AI
    const { checklist, pendingItems } = await kycAgent.processDocument(document);

    res.status(200).json({
      document: {
        id: document.id,
        filename: document.filename,
        originalName: document.originalName
      },
      checklist,
      pendingItems
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

// Get all documents
app.get('/api/documents', (req: Request, res: Response) => {
  const documents = kycAgent.getDocuments();
  const documentList = documents.map(doc => ({
    id: doc.id,
    filename: doc.filename,
    originalName: doc.originalName,
    uploadDate: doc.uploadDate,
    fileType: doc.fileType || 'unknown'
  }));
  
  res.status(200).json(documentList);
});

// Get document by ID
app.get('/api/documents/:id', (req: Request, res: Response) => {
  const document = kycAgent.getDocumentById(req.params.id);
  
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  // Serve the PDF file
  return res.sendFile(document.path);
});

// Get current checklist status
app.get('/api/checklist', (req: Request, res: Response) => {
  const { checklist, pendingItems } = kycAgent.getChecklist();
  
  res.status(200).json({
    checklist,
    pendingItems
  });
});

// Email notification endpoint (simulated)
app.post('/api/notify', (req: Request, res: Response) => {
  const { email, message } = req.body;
  
  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required' });
  }
  
  // In a real implementation, this would send an actual email
  console.log(`Notification sent to ${email}: ${message}`);
  
  res.status(200).json({ success: true, message: 'Notification sent successfully' });
});

// Web search for verification
app.post('/api/verify', async (req: Request, res: Response) => {
  const { entityType, value } = req.body;
  
  if (!entityType || !value) {
    return res.status(400).json({ error: 'Entity type and value are required' });
  }
  
  try {
    const results = await kycAgent.performWebSearch(entityType, value);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error performing verification:', error);
    res.status(500).json({ error: 'Failed to perform verification' });
  }
});

// Reset checklist
app.post('/api/reset', (req: Request, res: Response) => {
  kycAgent.resetChecklist();
  const { checklist, pendingItems } = kycAgent.getChecklist();
  
  res.status(200).json({
    message: 'Checklist reset successfully',
    checklist,
    pendingItems
  });
});

// Start the server
app.listen(port, () => {
  console.log(`KYC Automation Agent backend running on port ${port}`);
});
