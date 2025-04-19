import React from 'react';
import PDFViewer from './PDFViewer';
import DocViewer from './DocViewer';

interface DocumentViewerWrapperProps {
  documentUrl: string;
  documentType: string;
  highlightedAreas?: {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }[];
  highlightedTerms?: string[];
}

const DocumentViewerWrapper: React.FC<DocumentViewerWrapperProps> = ({ 
  documentUrl, 
  documentType, 
  highlightedAreas = [],
  highlightedTerms = []
}) => {
  // Extract highlighted terms from areas for Word documents
  const terms = highlightedAreas.map(area => area.label);
  
  // Handle different file types
  if (documentType === 'pdf') {
    return <PDFViewer documentUrl={documentUrl} highlightedAreas={highlightedAreas} />;
  } else if (documentType === 'doc' || documentType === 'docx') {
    return <DocViewer documentUrl={documentUrl} highlightedTerms={[...terms, ...highlightedTerms]} />;
  } else {
    // Check if it's an image format
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    if (imageTypes.includes(documentType)) {
      return (
        <div className="image-viewer">
          <img 
            src={documentUrl} 
            alt="Document Image" 
            style={{ maxWidth: '100%', height: 'auto', border: '1px solid #e5e7eb', borderRadius: '4px' }} 
          />
        </div>
      );
    }
    
    // For other file types that cannot be previewed directly
    return (
      <div className="unsupported-document" style={{ padding: '2rem', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>File Type: {documentType.toUpperCase()}</h3>
        <p style={{ marginBottom: '1.5rem' }}>This document type cannot be previewed in the browser. You can download it to view its contents.</p>
        <a 
          href={documentUrl} 
          download
          className="btn-primary" 
          style={{ 
            display: 'inline-block', 
            padding: '0.5rem 1rem', 
            backgroundColor: '#4f46e5', 
            color: 'white', 
            borderRadius: '0.375rem',
            fontWeight: 'medium',
            textDecoration: 'none'
          }}
        >
          Download Document
        </a>
      </div>
    );
  }
};

export default DocumentViewerWrapper;
