'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import ThemeSwitcher from '@/components/ThemeSwitcher';

// Dynamically import the PDF viewer component to avoid SSR issues
const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
  ssr: false,
  loading: () => <div className="loading">Loading PDF viewer...</div>,
});
import TextExtractor from '@/components/TextExtractor';

export default function Home() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [selectedTextPdf, setSelectedTextPdf] = useState({ text: '', position: null });
  const [selectedTextExtracted, setSelectedTextExtracted] = useState('');
  const [pageTexts, setPageTexts] = useState([]);
  const [loadingText, setLoadingText] = useState(false);
  
  const pdfViewerRef = useRef(null);
  const textExtractorRef = useRef(null);

  useEffect(() => {
    // Clean up object URL on unmount
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      // Create object URL for the PDF viewer
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      const newFileUrl = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setFileUrl(newFileUrl);
      
      // Reset states
      setExtractedText('');
      setSelectedTextPdf({ text: '', position: null });
      setSelectedTextExtracted('');
      setPageTexts([]);
      
      // Extract text from PDF
      setLoadingText(true);
      try {
        const formData = new FormData();
        formData.append('pdf', selectedFile);
        
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          setExtractedText(data.text);
          setPageTexts(data.pageTexts || []);
        } else {
          console.error('Failed to extract text');
          setExtractedText('Error: Failed to extract text from PDF');
        }
      } catch (error) {
        console.error('Error extracting text:', error);
        setExtractedText('Error: Failed to extract text from PDF');
      } finally {
        setLoadingText(false);
      }
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handlePdfTextSelection = (text, position) => {
    setSelectedTextPdf({ text, position });
    // Find the text in the extracted text and highlight it
    if (textExtractorRef.current && text) {
      textExtractorRef.current.highlightText(text);
    }
  };

  const handleExtractedTextSelection = (text) => {
    setSelectedTextExtracted(text);
    // Find the text in the PDF and highlight it
    if (pdfViewerRef.current && text) {
      pdfViewerRef.current.highlightText(text);
    }
  };

  return (
    <div className="container">
      <main className="main">
        <header className="header">
          <h1 className="title">Extractor</h1>
          <ThemeSwitcher />
        </header>
        
        <div className="upload-section">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="file-input"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="file-label">
            Choose PDF File
          </label>
        </div>

        {fileUrl && (
          <div className="content-container">
            <div className="column">
              <h2>PDF Viewer</h2>
              <PdfViewer 
                fileUrl={fileUrl} 
                onTextSelection={handlePdfTextSelection}
                ref={pdfViewerRef}
                pageTexts={pageTexts} 
              />
            </div>
            <div className="column">
              <h2>Extracted Text</h2>
              {loadingText ? (
                <div className="loading">Extracting text...</div>
              ) : (
                <TextExtractor 
                  text={extractedText} 
                  onTextSelection={handleExtractedTextSelection}
                  ref={textExtractorRef}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
