import MastraAIService from './mastraAI';
import DocumentService, { Document } from './documentService';
import ChecklistService, { ChecklistItem } from './checklistService';

// KYC Agent Service
class KYCAgentService {
  private mastraAI: MastraAIService;
  private documentService: DocumentService;
  private checklistService: ChecklistService;

  constructor() {
    this.mastraAI = new MastraAIService();
    this.documentService = new DocumentService();
    this.checklistService = new ChecklistService();
  }

  // Process a new document
  async processDocument(document: Document): Promise<{
    checklist: ChecklistItem[];
    pendingItems: string[];
  }> {
    try {
      // Step 1: Extract text from the document
      if (!document.extractedText) {
        // Use the appropriate extraction method based on file type
        document.extractedText = await this.documentService.extractTextFromDocument(document.path);
      }

      // Step 2: Recognize entities in the text
      const entities = await this.mastraAI.recognizeEntities(
        document.extractedText,
        document.id
      );

      // Step 3: Map entities to checklist items
      const updatedChecklist = await this.mastraAI.mapToChecklist(
        entities,
        this.checklistService.getChecklist()
      );

      // Step 4: Update the checklist
      this.checklistService.updateChecklist(updatedChecklist);

      // Step 5: Verify the information
      const verification = await this.mastraAI.verifyInformation(updatedChecklist);
      
      // Log verification results
      console.log('Verification results:', verification);

      // Return the updated checklist and pending items
      return {
        checklist: this.checklistService.getChecklist(),
        pendingItems: this.checklistService.getPendingItems()
      };
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }

  // Get the current checklist
  getChecklist(): {
    checklist: ChecklistItem[];
    pendingItems: string[];
  } {
    return {
      checklist: this.checklistService.getChecklist(),
      pendingItems: this.checklistService.getPendingItems()
    };
  }

  // Get all documents
  getDocuments(): Document[] {
    return this.documentService.getDocuments();
  }

  // Get document by ID
  getDocumentById(id: string): Document | undefined {
    return this.documentService.getDocumentById(id);
  }

  // Add a new document
  addDocument(document: Document): Document {
    return this.documentService.addDocument(document);
  }

  // Perform web search for verification
  async performWebSearch(entityType: string, value: string): Promise<any> {
    return this.mastraAI.searchWeb(entityType, value);
  }

  // Reset the checklist
  resetChecklist(): void {
    this.checklistService.resetChecklist();
  }

  // Get upload directory
  getUploadDir(): string {
    return this.documentService.getUploadDir();
  }
}

export default KYCAgentService;
