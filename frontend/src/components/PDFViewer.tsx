import React, { useState } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';

// Simple PDF viewer using iframe for demo purposes
// This avoids the complex PDF.js worker configuration issues

interface PDFViewerProps {
  documentUrl: string;
  highlightedAreas?: {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }[];
}

const PDFViewer: React.FC<PDFViewerProps> = ({ documentUrl, highlightedAreas = [] }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    console.error('Error loading PDF');
    setError('Failed to load PDF document');
    setLoading(false);
  };

  return (
    <Box sx={{ position: 'relative', height: '500px', width: '100%' }}>
      {loading && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 10
        }}>
          <CircularProgress />
        </Box>
      )}
      
      {error ? (
        <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          <Typography variant="h6">{error}</Typography>
          <Typography variant="body2">Please try again or contact support.</Typography>
        </Paper>
      ) : (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <iframe
            src={documentUrl}
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none' 
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="PDF Document Viewer"
          />
          
          {/* Note: Highlighting is not supported in the simple iframe viewer */}
          {highlightedAreas && highlightedAreas.length > 0 && (
            <Paper sx={{ mt: 2, p: 2, backgroundColor: '#fff9c4' }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Note:</strong> Document highlighting is not available in preview mode.
                {highlightedAreas.length} highlighted areas would be shown in the full version.
              </Typography>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PDFViewer;
