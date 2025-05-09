'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const TextExtractor = forwardRef(({ text, onTextSelection }, ref) => {
  const textAreaRef = useRef(null);
  
  const handleTextSelection = () => {
    if (typeof window === 'undefined') return;
    
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      onTextSelection(selection.toString());
    }
  };

  const highlightText = (searchText) => {
    if (!textAreaRef.current || !searchText) return;
    
    const textArea = textAreaRef.current;
    const textContent = textArea.value;
    
    const startPos = textContent.indexOf(searchText);
    if (startPos !== -1) {
      // Set selection in the textarea
      textArea.focus();
      textArea.setSelectionRange(startPos, startPos + searchText.length);
      
      // Scroll to the position
      const lineHeight = parseInt(getComputedStyle(textArea).lineHeight);
      const textBeforeMatch = textContent.substring(0, startPos);
      const linesBeforeMatch = textBeforeMatch.split('\n').length - 1;
      
      // Approximate scroll position
      textArea.scrollTop = linesBeforeMatch * lineHeight;
    }
  };

  useImperativeHandle(ref, () => ({
    highlightText
  }));

  return (
    <div className="text-extractor">
      <textarea
        ref={textAreaRef}
        value={text}
        onChange={() => {}} // Read-only
        onMouseUp={handleTextSelection}
        className="extracted-text"
        placeholder="Extracted text will appear here"
        readOnly
      />
    </div>
  );
});

TextExtractor.displayName = 'TextExtractor';
export default TextExtractor;