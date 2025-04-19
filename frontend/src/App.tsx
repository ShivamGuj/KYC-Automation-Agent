import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './index.css'; // Using index.css instead of App.css for Tailwind
import MastraAgent from './components/MastraAgent';
import DocumentViewerWrapper from './components/DocumentViewerWrapper';
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiArrowRight, FiClock } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { FiFileText } from 'react-icons/fi';

// Define types
interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: 'pending' | 'complete';
  value?: string;
  sourceDocument?: string;
  sourcePage?: number;
  sourceCoordinates?: { x: number; y: number; width: number; height: number };
}

interface Document {
  id: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  fileType?: string;
}

function App() {
  // State variables
  const [documents, setDocuments] = useState<Document[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [pendingItems, setPendingItems] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [emailMessage, setEmailMessage] = useState<string>('');
  const [showSuccessNotification, setShowSuccessNotification] = useState<boolean>(false);

  // API URL
  const API_URL = 'http://localhost:5000/api';

  // Fetch checklist on component mount
  useEffect(() => {
    fetchChecklist();
  }, []);

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error(err);
    }
  };

  // Fetch checklist
  const fetchChecklist = async () => {
    try {
      const response = await axios.get(`${API_URL}/checklist`);
      setChecklist(response.data.checklist);
      setPendingItems(response.data.pendingItems);
    } catch (err) {
      setError('Failed to fetch checklist');
      console.error(err);
    }
  };

  // File input reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Handle file selection
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    console.log('Selected file:', file.name, 'Type:', file.type);
    
    // Check file extension as a backup for MIME type detection
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    // Allow all file types to be uploaded and analyzed
    // No file type restriction check

    // Set success message based on file extension
    let fileTypeMessage = 'document';
    if (fileExtension) {
      fileTypeMessage = `${fileExtension.toUpperCase()} file`;
    }
    
    setSuccess(`Uploading ${fileTypeMessage}: ${file.name}`);
    await uploadFile(file);
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileSelect(event.target.files);
    // Reset the input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Upload file to server
  const uploadFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    // Determine file type from extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    let fileType = fileExtension || 'unknown';
    
    // Determine file type from MIME type and extension for better handling
    // Common document formats
    if (file.type === 'application/pdf' || fileExtension === 'pdf') {
      fileType = 'pdf';
    } else if (file.type === 'application/msword' || fileExtension === 'doc') {
      fileType = 'doc';
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileExtension === 'docx') {
      fileType = 'docx';
    } else if (file.type === 'text/plain' || fileExtension === 'txt') {
      fileType = 'txt';
    }
    // Image formats
    else if (['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'].includes(file.type) || 
             ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType)) {
      fileType = fileExtension || file.type.split('/')[1] || 'image';
    }
    // Spreadsheet formats
    else if (file.type === 'application/vnd.ms-excel' || fileExtension === 'xls') {
      fileType = 'xls';
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileExtension === 'xlsx') {
      fileType = 'xlsx';
    } else if (file.type === 'application/vnd.oasis.opendocument.spreadsheet' || fileExtension === 'ods') {
      fileType = 'ods';
    }
    // Presentation formats
    else if (file.type === 'application/vnd.ms-powerpoint' || fileExtension === 'ppt') {
      fileType = 'ppt';
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || fileExtension === 'pptx') {
      fileType = 'pptx';
    }
    // Use extension as fallback for any other type
    else if (fileExtension) {
      fileType = fileExtension;
    }
    
    console.log('Uploading file:', file.name, 'Detected type:', fileType);

    const formData = new FormData();
    formData.append('document', file);
    // Also send the detected file type to help the backend
    formData.append('fileType', fileType);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      });

      // Update state with new data
      setChecklist(response.data.checklist);
      setPendingItems(response.data.pendingItems);
      
      // Fetch updated document list
      await fetchDocuments();
      
      // Set the selected document to the newly uploaded one
      setSelectedDocument(response.data.document.id);
      
      setSuccess('Document uploaded and analyzed successfully');
      setLoading(false);
      setUploadProgress(0);
    } catch (err: any) {
      setError(`Failed to upload and analyze document: ${err.message || 'Unknown error'}`);
      console.error(err);
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // View document
  const viewDocument = (documentId: string) => {
    setSelectedDocument(documentId);
  };

  // Send email notification (demo version)
  const sendEmailNotification = () => {
    // Show loading state briefly for better UX
    setLoading(true);
    
    // Simulate a short delay for better user experience
    setTimeout(() => {
      // Close the email dialog
      setEmailDialogOpen(false);
      
      // Show success notification
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
      
      // Show success message
      setSuccess(`Notification sent successfully to ${email || 'recipient'}!`);
      setTimeout(() => setSuccess(null), 5000);
      
      // Add a log entry to the checklist to show the notification was sent
      const updatedChecklist = [...checklist];
      const notificationItem = updatedChecklist.find(item => 
        item.name.toLowerCase().includes('notification') || 
        item.description.toLowerCase().includes('notification')
      );
      
      if (notificationItem) {
        notificationItem.status = 'complete';
        setChecklist(updatedChecklist);
      }
      
      // Reset loading state
      setLoading(false);
    }, 800); // Short delay to simulate processing
  };

  // Handle agent process completion
  const handleProcessComplete = (result: any) => {
    console.log('Process completed:', result);
    setChecklist(result.checklist || checklist);
    setPendingItems(result.pendingItems || pendingItems);
    setSuccess('KYC analysis completed successfully');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">KYC Automation Agent</h1>
            <p className="text-white text-opacity-90 mt-1">Powered by Mastra AI</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
              Supports All Document Types
            </div>
          </div>
        </div>
      </div>

      {/* Error and success alerts */}
      {error && (
        <div className="fixed top-4 inset-x-0 flex justify-center z-50">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-md max-w-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-4 inset-x-0 flex justify-center z-50">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-md max-w-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiCheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setSuccess(null)}
                  className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Flow Container */}
      <div className="process-container">
        {/* Step 1: Upload Documents */}
        <div className={`process-step ${documents.length > 0 ? 'step-complete' : 'step-active'}`}>
          <div className="step-header">
            <div className="step-number">1</div>
            <div className="step-title">
              <h3>Upload KYC Documents</h3>
              <p>Upload documents containing KYC information for analysis</p>
            </div>
            <div className="step-status">
              {documents.length > 0 ? (
                <span className="status-indicator status-complete flex items-center">
                  <FiCheckCircle className="mr-1" /> Complete
                </span>
              ) : (
                <span className="status-indicator status-pending flex items-center">
                  <FiClock className="mr-1" /> Pending
                </span>
              )}
            </div>
          </div>

          <div className="step-content">
            <div className="mb-4">
              <input
                ref={fileInputRef}
                accept="*/*"
                className="hidden"
                id="upload-document"
                type="file"
                onChange={handleFileUpload}
              />

              {/* Drag & Drop Upload Area */}
              <div
                className={`upload-area ${dragActive ? 'active' : ''} ${loading ? 'uploading' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {loading ? (
                  <div className="upload-progress">
                    <div className="progress-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-center">
                      {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing document...'}
                    </p>
                  </div>
                ) : (
                  <div className="upload-content">
                    <div className="upload-icon">
                      <FiUpload size={40} />
                    </div>
                    <h3 className="upload-title">Drag & Drop your KYC document here</h3>
                    <p className="upload-subtitle">or click to browse files</p>
                    <p className="upload-format">All file types supported for analysis</p>
                  </div>
                )}
              </div>
            </div>

            {documents.length > 0 && (
              <div className="mt-6">
                <h4 className="text-base font-medium mb-3">Uploaded Documents</h4>

                <ul className="document-list">
                  {documents.map((doc) => (
                    <li key={doc.id} className={`document-item ${selectedDocument === doc.id ? 'selected' : ''}`}>
                      <div className="document-icon">
                        <FiFile size={24} />
                      </div>
                      <div className="document-info">
                        <p className="document-name">{doc.originalName}</p>
                        <p className="document-date">{new Date(doc.uploadDate).toLocaleString()}</p>
                      </div>
                      <button
                        className="document-view-btn"
                        onClick={() => viewDocument(doc.id)}
                      >
                        {selectedDocument === doc.id ? 'Viewing' : 'View'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {documents.length > 0 && (
          <>
            <div className="flow-indicator"></div>

            {/* Step 2: Document Viewer */}
            <div className={`process-step ${selectedDocument ? 'step-active' : ''}`}>
              <div className="step-header">
                <div className="step-number">2</div>
                <div className="step-title">
                  <h3>Review Document</h3>
                  <p>View and verify document content with extracted information highlighted</p>
                </div>
                <div className="step-status">
                  {selectedDocument ? (
                    <span className="status-indicator status-pending flex items-center">
                      <FiFileText className="mr-1" /> Viewing
                    </span>
                  ) : (
                    <span className="status-indicator status-pending flex items-center">
                      <FiClock className="mr-1" /> Select a document
                    </span>
                  )}
                </div>
              </div>

              <div className="step-content">
                {selectedDocument ? (
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <DocumentViewerWrapper
                      documentUrl={`${API_URL}/documents/${selectedDocument}`}
                      documentType={documents.find(doc => doc.id === selectedDocument)?.fileType || 'unknown'}
                      highlightedAreas={checklist
                        .filter(item => item.sourceDocument === selectedDocument && item.sourceCoordinates)
                        .map(item => ({
                          page: item.sourcePage || 1,
                          ...item.sourceCoordinates!,
                          label: item.name
                        }))
                      }
                      highlightedTerms={checklist
                        .filter(item => item.sourceDocument === selectedDocument && !item.sourceCoordinates)
                        .map(item => item.name)
                      }
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                    <FiFile size={48} className="mb-4 text-gray-400" />
                    <p className="mb-4">Select a document from the list above to view its contents</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flow-indicator"></div>

            {/* Step 3: AI Analysis */}
            <div className="process-step">
              <div className="step-header">
                <div className="step-number">3</div>
                <div className="step-title">
                  <h3>AI Analysis & Verification</h3>
                  <p>Process documents with AI to extract and verify KYC information</p>
                </div>
                <div className="step-status">
                  {checklist.length > 0 ? (
                    <span className="status-indicator status-complete flex items-center">
                      <FiCheckCircle className="mr-1" /> Complete
                    </span>
                  ) : (
                    <span className="status-indicator status-pending flex items-center">
                      <RiRobot2Line className="mr-1" /> AI Processing
                    </span>
                  )}
                </div>
              </div>
              
              <div className="step-content">
                <MastraAgent 
                  documentIds={documents.map(doc => doc.id)}
                  onProcessComplete={handleProcessComplete}
                />
              </div>
            </div>

            <div className="flow-indicator"></div>

            {/* Step 4: KYC Checklist Results */}
            <div className="process-step">
              <div className="step-header">
                <div className="step-number">4</div>
                <div className="step-title">
                  <h3>KYC Checklist</h3>
                  <p>Review extracted information and verification status</p>
                </div>
                <div className="step-status">
                  {pendingItems.length === 0 && checklist.length > 0 ? (
                    <span className="status-indicator status-complete flex items-center">
                      <FiCheckCircle className="mr-1" /> Complete
                    </span>
                  ) : (
                    <span className="status-indicator status-pending flex items-center">
                      <FiClock className="mr-1" /> 
                      {pendingItems.length === 0 
                        ? 'Awaiting data' 
                        : `${pendingItems.length} items pending`}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="step-content">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center">
                      {pendingItems.length === 0 && checklist.length > 0 ? (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <FiCheckCircle className="text-green-500 text-xl" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <FiClock className="text-blue-500 text-xl" />
                        </div>
                      )}
                      <p className="font-medium text-gray-800">
                        {pendingItems.length === 0 && checklist.length > 0 
                          ? 'All required items are complete!' 
                          : `${pendingItems.length} required items pending verification`}
                      </p>
                    </div>
                    <div className="sm:ml-auto">
                      <button 
                        className="btn-primary text-xs flex items-center justify-center py-1 px-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                        onClick={() => setEmailDialogOpen(true)}
                      >
                        <FiArrowRight className="mr-1" /> Send Notification
                      </button>
                    </div>
                  </div>
                </div>

                {/* KYC Checklist */}
                <div className="kyc-checklist mt-10 p-8 bg-white rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">KYC Checklist</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {checklist.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300 col-span-2">
                        <FiFile size={48} className="mb-4 text-gray-400" />
                        <p className="text-gray-500 mb-2">No checklist items available yet</p>
                        <p className="text-sm text-gray-400">Process documents with AI to generate the checklist</p>
                      </div>
                    ) : (
                      checklist.map((item) => (
                        <div key={item.id} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg p-5 flex items-start border border-gray-100">
                          <div className="mr-4 mt-1">
                            {item.status === 'complete' ? (
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <FiCheckCircle className="text-green-500 text-xl" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                <FiClock className="text-yellow-500 text-xl" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-gray-800 mb-1">{item.name}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Email Notification Dialog */}
      {emailDialogOpen && (
        <div className="email-dialog-overlay fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="email-dialog bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all animate-slideIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Send Notification</h3>
              <button 
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setEmailDialogOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="form-group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter recipient email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="form-group">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  id="message"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder={`KYC checklist status: ${pendingItems.length} items pending`}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                ></textarea>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4">
              <button 
                className="btn-secondary text-sm px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                onClick={() => setEmailDialogOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                onClick={sendEmailNotification}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Popup */}
      {showSuccessNotification && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 flex items-center space-x-4 animate-fadeInUp">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <FiCheckCircle className="text-green-500 text-xl" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800">Success!</h4>
              <p className="text-gray-600">Notification sent successfully.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
