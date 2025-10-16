"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  Loader2,
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  onProgress?: (currentPage: number, totalPages: number) => void;
  lastPage?: number;
}

/**
 * 📄 DYNASTY PDF VIEWER
 *
 * Professional PDF viewer with:
 * - Page navigation
 * - Zoom controls
 * - Download option
 * - Progress tracking
 * - Responsive design
 * - Fullscreen mode
 */
export function PDFViewer({
  pdfUrl,
  onProgress,
  lastPage = 1,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(lastPage);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error("Error loading PDF:", error);
    setError("Failed to load PDF. Please try again.");
    setIsLoading(false);
  }

  // Track progress when page changes
  useEffect(() => {
    if (numPages > 0 && onProgress) {
      onProgress(pageNumber, numPages);
    }
  }, [pageNumber, numPages, onProgress]);

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(2.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.2));
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "document.pdf";
    link.click();
  };

  const toggleFullscreen = () => {
    const element = document.getElementById("pdf-container");
    if (element) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        element.requestFullscreen();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevPage();
      } else if (e.key === "ArrowRight") {
        goToNextPage();
      } else if (e.key === "+" || e.key === "=") {
        zoomIn();
      } else if (e.key === "-") {
        zoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [numPages]);

  if (error) {
    return (
      <div className="w-full min-h-[600px] bg-white rounded-xl border-2 border-red-200 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load PDF
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="pdf-container"
      className="w-full bg-gray-100 rounded-xl border border-gray-200 overflow-hidden"
    >
      {/* Controls */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
        {/* Left: Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3">
            <input
              type="number"
              min={1}
              max={numPages}
              value={pageNumber}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= numPages) {
                  setPageNumber(page);
                }
              }}
              className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <span className="text-gray-600">/ {numPages || "..."}</span>
          </div>

          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Progress */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
              style={{ width: `${(pageNumber / numPages) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">
            {Math.round((pageNumber / numPages) * 100)}%
          </span>
        </div>

        {/* Right: Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <span className="text-sm text-gray-600 min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="flex justify-center p-6 min-h-[600px] relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}

        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className="shadow-lg"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-xl"
          />
        </Document>
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
              style={{ width: `${(pageNumber / numPages) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {Math.round((pageNumber / numPages) * 100)}%
          </span>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <p className="text-xs text-gray-500 text-center">
          <span className="hidden sm:inline">
            Shortcuts: ← → (navigate) • + - (zoom) •
          </span>
          Page {pageNumber} of {numPages}
        </p>
      </div>
    </div>
  );
}

// Default export for dynamic imports
export default PDFViewer;
