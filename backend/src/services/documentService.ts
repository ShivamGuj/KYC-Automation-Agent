import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Document interface
export interface Document {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  uploadDate: Date;
  extractedText?: string;
  fileType?: string; // Allow any file type
}

// Document service
class DocumentService {
  private documents: Document[] = [];
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // Get all documents
  getDocuments(): Document[] {
    return this.documents;
  }

  // Get document by ID
  getDocumentById(id: string): Document | undefined {
    return this.documents.find(doc => doc.id === id);
  }

  // Add a new document
  addDocument(document: Document): Document {
    this.documents.push(document);
    return document;
  }

  // Extract text from PDF
  async extractTextFromPDF(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    try {
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      return '';
    }
  }

  // Extract text from Word document
  async extractTextFromWord(filePath: string): Promise<string> {
    try {
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error('Error parsing Word document:', error);
      return '';
    }
  }

  // Extract text from text file
  async extractTextFromTxt(filePath: string): Promise<string> {
    try {
      const text = fs.readFileSync(filePath, 'utf8');
      return text;
    } catch (error) {
      console.error('Error reading text file:', error);
      return '';
    }
  }

  // Extract text from any supported document
  async extractTextFromDocument(filePath: string): Promise<string> {
    const extension = path.extname(filePath).toLowerCase();
    
    switch (extension) {
      case '.pdf':
        return this.extractTextFromPDF(filePath);
      case '.doc':
      case '.docx':
        return this.extractTextFromWord(filePath);
      case '.txt':
        return this.extractTextFromTxt(filePath);
      default:
        // For unsupported file types, try to read as text
        try {
          console.log(`Attempting to read ${extension} file as text`);
          return this.extractTextFromTxt(filePath);
        } catch (error) {
          console.error(`Unable to extract text from file type: ${extension}`, error);
          return '';
        }
    }
  }

  // Get document path
  getUploadDir(): string {
    return this.uploadDir;
  }

  // Delete a document
  deleteDocument(id: string): boolean {
    const documentIndex = this.documents.findIndex(doc => doc.id === id);
    if (documentIndex === -1) {
      return false;
    }

    const document = this.documents[documentIndex];
    
    // Remove from file system
    try {
      fs.unlinkSync(document.path);
    } catch (error) {
      console.error(`Error deleting file ${document.path}:`, error);
    }
    
    // Remove from documents array
    this.documents.splice(documentIndex, 1);
    return true;
  }
}

export default DocumentService;
