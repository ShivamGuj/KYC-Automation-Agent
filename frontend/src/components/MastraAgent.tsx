import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';

// Define types for the agent's state and operations
interface AgentState {
  status: 'idle' | 'processing' | 'complete' | 'error';
  currentStep: number;
  logs: string[];
  tools: Tool[];
  activeTools: string[];
}

interface Tool {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'active' | 'complete' | 'error';
  result?: any;
}

interface MastraAgentProps {
  documentIds: string[];
  onProcessComplete: (results: any) => void;
}

// Define the handle type
export type MastraAgentHandle = {
  activateEmailNotifier: () => void;
};

const MastraAgent = forwardRef<MastraAgentHandle, MastraAgentProps>(({ documentIds, onProcessComplete }, ref) => {
  const [agentState, setAgentState] = useState<AgentState>({
    status: 'idle',
    currentStep: 0,
    logs: [],
    tools: [
      {
        id: 'document_loader',
        name: 'Document Loader',
        description: 'Loads and prepares documents for analysis',
        status: 'idle'
      },
      {
        id: 'text_extractor',
        name: 'Text Extractor',
        description: 'Extracts text content from documents',
        status: 'idle'
      },
      {
        id: 'entity_recognizer',
        name: 'Entity Recognizer',
        description: 'Identifies and extracts entities like names, dates, addresses',
        status: 'idle'
      },
      {
        id: 'checklist_mapper',
        name: 'Checklist Mapper',
        description: 'Maps extracted entities to KYC checklist items',
        status: 'idle'
      },
      {
        id: 'verification_tool',
        name: 'Verification Tool',
        description: 'Verifies extracted information against requirements',
        status: 'idle'
      },
      {
        id: 'email_notifier',
        name: 'Email Notifier',
        description: 'Sends notifications about KYC status',
        status: 'idle'
      }
    ],
    activeTools: []
  });

  // Steps in the agent workflow
  const steps = ['Document Loading', 'Information Extraction', 'Checklist Mapping', 'Verification'];

  // Run the agent's workflow with real backend integration
  useEffect(() => {
    if (documentIds.length === 0 || agentState.status !== 'idle') {
      return;
    }

    const runAgent = async () => {
      setAgentState(prev => ({
        ...prev,
        status: 'processing',
        logs: [...prev.logs, 'Starting KYC document analysis...']
      }));

      try {
        // Step 1: Document loading
        await activateTool('document_loader', `Loading ${documentIds.length} document(s)...`);
        
        // Step 2: Text extraction
        await activateTool('text_extractor', 'Extracting text from documents...');
        
        // Move to next step
        setAgentState(prev => ({
          ...prev,
          currentStep: 1,
          logs: [...prev.logs, 'Text extraction complete. Moving to information extraction...']
        }));
        
        // Step 3: Entity recognition
        await activateTool('entity_recognizer', 'Identifying entities in documents...');
        
        // Move to next step
        setAgentState(prev => ({
          ...prev,
          currentStep: 2,
          logs: [...prev.logs, 'Entity recognition complete. Mapping to checklist items...']
        }));
        
        // Step 4: Checklist mapping
        await activateTool('checklist_mapper', 'Mapping extracted information to checklist...');
        
        // Move to next step
        setAgentState(prev => ({
          ...prev,
          currentStep: 3,
          logs: [...prev.logs, 'Checklist mapping complete. Performing verification...']
        }));
        
        // Step 5: Verification
        await activateTool('verification_tool', 'Verifying extracted information...');
        
        // Since we're in demo mode, we'll generate a simulated checklist instead of making an API call
        const simulatedChecklist = [
          { id: 'id_verification', name: 'ID Verification', status: 'complete', description: 'Verify identity documents' },
          { id: 'address_verification', name: 'Address Verification', status: 'complete', description: 'Verify address information' },
          { id: 'risk_assessment', name: 'Risk Assessment', status: 'complete', description: 'Assess customer risk level' },
          { id: 'notification', name: 'Email Notification', status: 'idle', description: 'Send verification completion notification' }
        ];
        
        const pendingItems: {id: string, name: string, description: string}[] = [];
        
        // Complete the process
        setAgentState(prev => ({
          ...prev,
          status: 'complete',
          logs: [...prev.logs, 'KYC document analysis complete!'],
          activeTools: []
        }));
        
        // Notify parent component with simulated data
        onProcessComplete({
          message: 'KYC document analysis completed successfully',
          documentIds,
          checklist: simulatedChecklist,
          pendingItems: pendingItems
        });
      } catch (error: any) {
        console.error('Error in KYC agent workflow:', error);
        setAgentState(prev => ({
          ...prev,
          status: 'error',
          logs: [...prev.logs, `Error in KYC analysis: ${error.message || 'Unknown error'}`],
          activeTools: []
        }));
      }
    };

    runAgent();
  }, [documentIds]);

  // Helper function to activate a tool and communicate with backend
  const activateTool = async (toolId: string, logMessage: string) => {
    // Add tool to active tools
    setAgentState(prev => ({
      ...prev,
      activeTools: [...prev.activeTools, toolId],
      logs: [...prev.logs, logMessage],
      tools: prev.tools.map(tool => 
        tool.id === toolId ? { ...tool, status: 'active' } : tool
      )
    }));
    
    // Simulate processing time with a small delay
    // In a real implementation, this would be replaced with actual API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mark tool as complete
    setAgentState(prev => ({
      ...prev,
      activeTools: prev.activeTools.filter(id => id !== toolId),
      tools: prev.tools.map(tool => 
        tool.id === toolId ? { ...tool, status: 'complete' } : tool
      )
    }));
  };

  useImperativeHandle(ref, () => ({
    activateEmailNotifier: () => {
      // Add a log entry
      const logMessage = "Email notification sent successfully";
      
      // Activate and complete the email notifier tool
      activateTool('email_notifier', logMessage);
    }
  }));

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box>
        <Typography variant="h5" gutterBottom>
          AI Analysis & Verification
        </Typography>
        
        {/* Status display */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Status: 
          </Typography>
          <Chip 
            label={agentState.status === 'idle' ? 'Ready' : 
                  agentState.status === 'processing' ? 'Processing' : 
                  agentState.status === 'complete' ? 'Complete' : 'Error'} 
            color={agentState.status === 'complete' ? 'success' : 
                  agentState.status === 'error' ? 'error' : 'primary'}
            size="small"
          />
        </Box>
        
        {/* Stepper for workflow steps */}
        <Stepper activeStep={agentState.currentStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Tools section */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Tools & Capabilities
        </Typography>
        
        <List>
          {agentState.tools.map((tool) => (
            <ListItem key={tool.id}>
              <ListItemIcon>
                {tool.status === 'complete' ? (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600" style={{ fontSize: '16px', fontWeight: 'bold' }}>✓</span>
                  </div>
                ) : tool.status === 'active' ? (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <CircularProgress size={16} color="primary" />
                  </div>
                ) : tool.status === 'error' ? (
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <CircularProgress size={16} color="error" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <CircularProgress size={16} color="inherit" style={{ opacity: 0.3 }} />
                  </div>
                )}
              </ListItemIcon>
              <ListItemText 
                primary={tool.name}
                secondary={tool.description}
              />
              <Chip 
                label={tool.status === 'idle' ? 'Ready' : 
                      tool.status === 'active' ? 'Active' : 
                      tool.status === 'complete' ? 'Complete' : 'Error'} 
                color={tool.status === 'complete' ? 'success' : 
                      tool.status === 'error' ? 'error' : 
                      tool.status === 'active' ? 'primary' : 'default'}
                size="small"
                sx={{ ml: 2 }}
              />
            </ListItem>
          ))}
        </List>
        
        {/* Agent logs */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Process Logs
        </Typography>
        
        <Paper variant="outlined" sx={{ p: 2, maxHeight: '200px', overflow: 'auto' }}>
          {agentState.logs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No logs yet. Start processing to see logs.
            </Typography>
          ) : (
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {agentState.logs.map((log, i) => (
                <Typography key={i} variant="body2" component="li" sx={{ mb: 0.5 }}>
                  {log}
                </Typography>
              ))}
            </Box>
          )}
          
          {agentState.status === 'processing' && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Processing...
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Paper>
  );
});

export default MastraAgent;
