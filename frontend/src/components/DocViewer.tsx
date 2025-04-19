import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress, Button, IconButton } from '@mui/material';
import { FiDownload, FiFileText, FiAlertCircle, FiMaximize, FiMinimize } from 'react-icons/fi';
import mammoth from 'mammoth';
import axios from 'axios';

interface DocViewerProps {
  documentUrl: string;
  highlightedTerms?: string[];
}

const DocViewer: React.FC<DocViewerProps> = ({ documentUrl, highlightedTerms = [] }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching Word document from URL:', documentUrl);
        
        // Fetch the document as an array buffer
        const response = await axios.get(documentUrl, {
          responseType: 'arraybuffer',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword'
          }
        });
        
        console.log('Document fetched successfully, converting to HTML...');
        
        // Convert the Word document to HTML
        const result = await mammoth.convertToHtml({ 
          arrayBuffer: response.data
        });
        
        let html = result.value;
        console.log('Conversion successful, processing content...');
        
        // Highlight terms if provided
        if (highlightedTerms.length > 0) {
          console.log('Highlighting terms:', highlightedTerms);
          highlightedTerms.forEach(term => {
            if (term && term.trim() !== '') {
              const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
              html = html.replace(regex, '<mark>$1</mark>');
            }
          });
        }
        
        // Add wrapper for styling
        html = `<div class="doc-content">${html}</div>`;
        
        setContent(html);
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading document:', error);
        setError(`Failed to load document: ${error.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    if (documentUrl) {
      fetchDocument();
    }
  }, [documentUrl, highlightedTerms]);

  const [fullscreen, setFullscreen] = useState(false);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 0, 
        mt: 2, 
        height: fullscreen ? '100vh' : 'auto',
        position: fullscreen ? 'fixed' : 'relative',
        top: fullscreen ? 0 : 'auto',
        left: fullscreen ? 0 : 'auto',
        right: fullscreen ? 0 : 'auto',
        bottom: fullscreen ? 0 : 'auto',
        zIndex: fullscreen ? 1300 : 1,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2,
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        backgroundColor: '#f8fafc'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FiFileText size={20} style={{ marginRight: '8px', color: '#4f46e5' }} />
          <Typography variant="h6" sx={{ fontWeight: 500, color: '#1e293b' }}>
            Document Viewer
          </Typography>
        </Box>
        <Box>
          <IconButton 
            onClick={() => setFullscreen(!fullscreen)}
            sx={{ color: '#4f46e5', mr: 1 }}
          >
            {fullscreen ? <FiMinimize /> : <FiMaximize />}
          </IconButton>
          <Button 
            variant="outlined" 
            startIcon={<FiDownload />}
            href={documentUrl}
            target="_blank"
            download
            sx={{ 
              borderColor: '#4f46e5', 
              color: '#4f46e5',
              '&:hover': {
                borderColor: '#4338ca',
                backgroundColor: 'rgba(79, 70, 229, 0.04)'
              } 
            }}
          >
            Download
          </Button>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', my: 8, flex: 1 }}>
          <CircularProgress sx={{ color: '#4f46e5', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Loading document...
          </Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ 
          p: 4, 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1
        }}>
          <FiAlertCircle size={40} style={{ color: '#ef4444', marginBottom: '16px' }} />
          <Typography variant="h6" sx={{ color: '#ef4444', mb: 1 }}>
            Error Loading Document
          </Typography>
          <Typography color="textSecondary" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<FiDownload />}
            href={documentUrl}
            target="_blank"
            sx={{ 
              backgroundColor: '#4f46e5', 
              '&:hover': { backgroundColor: '#4338ca' } 
            }}
          >
            Download Original
          </Button>
        </Box>
      )}

      {!loading && !error && (
        <Box 
          sx={{ 
            p: 3, 
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#ffffff'
          }}
        >
          <div 
            className="doc-content" 
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        </Box>
      )}
    </Paper>
  );
};

export default DocViewer;
