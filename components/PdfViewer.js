'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
// Next.js needs to be able to reference this in a client component
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

const PdfViewer = forwardRef(({ fileUrl, onTextSelection, pageTexts }, ref) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [highlightedText, setHighlightedText] = useState('');
  const [textPositions, setTextPositions] = useState({});

  useEffect(() => {
    // Reset state when a new file is loaded
    setPageNumber(1);
    setHighlightedText('');
  }, [fileUrl]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleTextSelection = () => {
    if (typeof window === 'undefined') return;
    
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString();
      
      // Get position information (simplified - you'll need more complex logic for precise positioning)
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      const position = {
        page: pageNumber,
        boundingRect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        }
      };
      
      onTextSelection(text, position);
    }
  };

  const highlightText = (text) => {
    if (!text) return;
    
    setHighlightedText(text);
    
    // In a real implementation, you would:
    // 1. Find all occurrences of the text in the current page's content
    // 2. Create highlight annotations at those positions
    // 3. Render these highlights on the PDF
    
    // For demonstration, we'll just find if the text exists on the current page
    if (pageTexts && pageTexts.length >= pageNumber) {
      const currentPageText = pageTexts[pageNumber - 1];
      if (currentPageText && currentPageText.includes(text)) {
        console.log(`Found "${text}" on page ${pageNumber}`);
        // Here you would add actual highlight rendering code
      } else {
        // Search other pages
        const foundOnPage = pageTexts.findIndex(pageText => 
          pageText && pageText.includes(text)
        );
        
        if (foundOnPage !== -1) {
          setPageNumber(foundOnPage + 1);
          console.log(`Found "${text}" on page ${foundOnPage + 1}, navigating there`);
        }
      }
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    highlightText
  }));

  return (
    <div className="pdf-viewer">
      <div className="pdf-controls">
        <button 
          onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
          disabled={pageNumber <= 1}
        >
          Previous
        </button>
        <span>
          Page {pageNumber} of {numPages || '?'}
        </span>
        <button 
          onClick={() => setPageNumber(Math.min(numPages || 1, pageNumber + 1))}
          disabled={pageNumber >= (numPages || 1)}
        >
          Next
        </button>
        <button onClick={() => setScale(scale + 0.2)}>Zoom In</button>
        <button onClick={() => setScale(Math.max(0.6, scale - 0.2))}>Zoom Out</button>
      </div>
      
      <div className="pdf-container" onMouseUp={handleTextSelection}>
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          options={{
            cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
            cMapPacked: true,
          }}
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
});

PdfViewer.displayName = 'PdfViewer';
export default PdfViewer;
