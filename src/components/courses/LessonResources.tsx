"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  File,
  FileArchive,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  downloadCount: number;
  hasDownloaded: boolean;
}

interface LessonResourcesProps {
  lessonId: string;
}

export function LessonResources({ lessonId }: LessonResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/resources`);
        if (response.ok) {
          const data = await response.json();
          setResources(data.resources);
        }
      } catch (error) {
        console.error("Failed to fetch resources:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResources();
  }, [lessonId]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="w-6 h-6" />;
    if (fileType.includes("zip") || fileType.includes("archive"))
      return <FileArchive className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const handleDownload = async (resource: Resource) => {
    try {
      setDownloading(resource.id);

      // Track download
      await fetch(`/api/resources/${resource.id}/download`, {
        method: "POST",
      });

      // Open file in new tab
      window.open(resource.fileUrl, "_blank");

      // Update local state
      setResources(
        resources.map((r) =>
          r.id === resource.id
            ? {
                ...r,
                downloadCount: r.downloadCount + 1,
                hasDownloaded: true,
              }
            : r
        )
      );
    } catch (error) {
      console.error("Failed to download:", error);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    for (const resource of resources) {
      await handleDownload(resource);
      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">No resources available yet</p>
        <p className="text-sm mt-1">
          Check back later for downloadable materials
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            Lesson Resources
          </h2>
          <p className="text-gray-600 mt-1">
            {resources.length} {resources.length === 1 ? "file" : "files"}{" "}
            available
          </p>
        </div>
        {resources.length > 1 && (
          <button
            onClick={handleDownloadAll}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download All
          </button>
        )}
      </div>

      {/* Resources List */}
      <div className="space-y-4">
        {resources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-purple-300 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                {getFileIcon(resource.fileType)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {resource.title}
                </h3>
                {resource.description && (
                  <p className="text-gray-600 mb-3">{resource.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <File className="w-4 h-4" />
                    {resource.fileType.toUpperCase()}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(resource.fileSize)}</span>
                  <span>•</span>
                  <span>{resource.downloadCount} downloads</span>
                  {resource.hasDownloaded && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Downloaded
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={() => handleDownload(resource)}
                disabled={downloading === resource.id}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 font-semibold"
              >
                {downloading === resource.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {resources.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Resources</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {resources.reduce((sum, r) => sum + r.downloadCount, 0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Downloads</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {formatFileSize(
                resources.reduce((sum, r) => sum + r.fileSize, 0)
              )}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Size</p>
          </div>
        </div>
      </div>
    </div>
  );
}
