import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, Eye, Edit3, Check, Clock, AlertCircle, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'draft' | 'in-review' | 'signed';
  uploadDate: string;
  lastModified: string;
  url?: string;
}

interface Signature {
  id: string;
  documentId: string;
  signerName: string;
  signerEmail: string;
  signedAt: string;
  signatureData: string;
}

export const DocumentChamberPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Investment Agreement.pdf',
      type: 'pdf',
      size: 1024000,
      status: 'draft',
      uploadDate: '2024-08-25',
      lastModified: '2024-08-25'
    },
    {
      id: '2',
      name: 'NDA Template.pdf',
      type: 'pdf',
      size: 512000,
      status: 'in-review',
      uploadDate: '2024-08-20',
      lastModified: '2024-08-23'
    },
    {
      id: '3',
      name: 'Term Sheet Final.pdf',
      type: 'pdf',
      size: 768000,
      status: 'signed',
      uploadDate: '2024-08-15',
      lastModified: '2024-08-18'
    }
  ]);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signature, setSignature] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in-review': return 'bg-yellow-100 text-yellow-800';
      case 'signed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit3 size={14} />;
      case 'in-review': return <Clock size={14} />;
      case 'signed': return <Check size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newDocument: Document = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.includes('pdf') ? 'pdf' : 'document',
          size: file.size,
          status: 'draft',
          uploadDate: new Date().toISOString().split('T')[0],
          lastModified: new Date().toISOString().split('T')[0],
          url: URL.createObjectURL(file)
        };
        setDocuments(prev => [...prev, newDocument]);
      });
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveSignature = () => {
    if (selectedDocument && signerName && signerEmail) {
      const canvas = canvasRef.current;
      if (canvas) {
        const signatureData = canvas.toDataURL();
        
        // Update document status to signed
        setDocuments(prev => prev.map(doc => 
          doc.id === selectedDocument.id 
            ? { ...doc, status: 'signed' as const, lastModified: new Date().toISOString().split('T')[0] }
            : doc
        ));
        
        setIsSignatureModalOpen(false);
        setSelectedDocument(null);
        setSignerName('');
        setSignerEmail('');
        clearSignature();
      }
    }
  };

  const updateDocumentStatus = (documentId: string, newStatus: 'draft' | 'in-review' | 'signed') => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, status: newStatus, lastModified: new Date().toISOString().split('T')[0] }
        : doc
    ));
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Chamber</h1>
        <p className="text-gray-600">Manage your deals, contracts, and legal documents with e-signature capabilities.</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upload Documents</h2>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload size={18} />}
          >
            Upload Files
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
          <p className="text-sm text-gray-500">Supported formats: PDF, DOC, DOCX</p>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-500">Uploaded {doc.uploadDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                      <span className="mr-1">{getStatusIcon(doc.status)}</span>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatFileSize(doc.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doc.lastModified}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye size={16} />}
                      onClick={() => setSelectedDocument(doc)}
                    >
                      Preview
                    </Button>
                    
                    {doc.status !== 'signed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Edit3 size={16} />}
                        onClick={() => {
                          setSelectedDocument(doc);
                          setIsSignatureModalOpen(true);
                        }}
                      >
                        Sign
                      </Button>
                    )}
                    
                    <select
                      value={doc.status}
                      onChange={(e) => updateDocumentStatus(doc.id, e.target.value as any)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="draft">Draft</option>
                      <option value="in-review">In Review</option>
                      <option value="signed">Signed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && !isSignatureModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{selectedDocument.name}</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <FileText className="mx-auto h-24 w-24 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Document Preview</p>
                <p className="text-sm text-gray-500 mb-6">
                  {selectedDocument.name} • {formatFileSize(selectedDocument.size)}
                </p>
                
                <div className="space-y-4">
                  <Button
                    leftIcon={<Download size={18} />}
                    onClick={() => {
                      if (selectedDocument.url) {
                        const a = document.createElement('a');
                        a.href = selectedDocument.url;
                        a.download = selectedDocument.name;
                        a.click();
                      }
                    }}
                  >
                    Download
                  </Button>
                  
                  {selectedDocument.status !== 'signed' && (
                    <Button
                      variant="outline"
                      leftIcon={<Edit3 size={18} />}
                      onClick={() => setIsSignatureModalOpen(true)}
                    >
                      Add Signature
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* E-Signature Modal */}
      {isSignatureModalOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Electronic Signature</h3>
              <button
                onClick={() => {
                  setIsSignatureModalOpen(false);
                  setSignerName('');
                  setSignerEmail('');
                  clearSignature();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Document: {selectedDocument.name}</h4>
                <p className="text-sm text-gray-600">Please provide your signature and details below.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digital Signature *
                </label>
                <div className="border border-gray-300 rounded-md p-4">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={200}
                    className="border border-gray-200 rounded cursor-crosshair w-full"
                    style={{ touchAction: 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">Draw your signature above</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSignature}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Legal Notice</p>
                    <p className="mt-1">
                      By signing this document electronically, you agree that your electronic signature 
                      has the same legal effect as a handwritten signature.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSignatureModalOpen(false);
                    setSignerName('');
                    setSignerEmail('');
                    clearSignature();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveSignature}
                  disabled={!signerName || !signerEmail}
                  leftIcon={<Check size={18} />}
                >
                  Sign Document
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-semibold text-gray-900">{documents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-md">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-semibold text-gray-900">
                {documents.filter(d => d.status === 'in-review').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Signed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {documents.filter(d => d.status === 'signed').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};