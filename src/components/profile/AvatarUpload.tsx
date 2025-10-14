"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Check, Loader2, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onSuccess: (avatarUrl: string) => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function AvatarUpload({
  currentAvatar,
  onSuccess,
}: AvatarUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  );
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<"select" | "crop">("select");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please select an image under 2MB",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please select an image file",
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setStep("crop");
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: CropArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const getCroppedImage = async (): Promise<Blob> => {
    if (!preview || !croppedAreaPixels) {
      throw new Error("No image to crop");
    }

    const image = new Image();
    image.src = preview;
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    // Set canvas size to the cropped area
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        },
        "image/jpeg",
        0.95
      );
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !croppedAreaPixels) return;

    setUploading(true);

    try {
      // Get cropped image
      const croppedBlob = await getCroppedImage();

      // Create FormData
      const formData = new FormData();
      formData.append("avatar", croppedBlob, selectedFile.name);

      // Upload to API
      const response = await fetch("/api/users/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success("Avatar updated!", {
        description: "Your profile picture has been updated successfully",
      });

      onSuccess(data.avatarUrl);
      handleClose();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Upload failed", {
        description: error.message || "Failed to upload avatar",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setPreview(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setStep("select");
  };

  return (
    <>
      {/* Avatar Display with Edit Button */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-10 h-10 text-purple-400" />
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
          >
            {currentAvatar ? "Change" : "Upload"} Avatar
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            JPG, PNG or WEBP. Max 2MB.
          </p>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Upload Avatar</h2>
                      <p className="text-purple-100 text-sm">
                        {step === "select"
                          ? "Select an image to upload"
                          : "Crop your image"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                    disabled={uploading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {step === "select" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                        isDragActive
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10"
                          : "border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {isDragActive
                              ? "Drop your image here"
                              : "Drag & drop your image here"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            or click to browse files
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>
                            Max file size: 2MB • Supported: JPG, PNG, WEBP
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === "crop" && preview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="space-y-4">
                      {/* Cropper */}
                      <div className="relative h-96 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden">
                        <Cropper
                          image={preview}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          cropShape="round"
                          showGrid={false}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={onCropComplete}
                        />
                      </div>

                      {/* Zoom Control */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Zoom
                        </label>
                        <input
                          type="range"
                          min={1}
                          max={3}
                          step={0.1}
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                      </div>

                      {/* Tips */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          💡 <strong>Tip:</strong> Drag to reposition, use the
                          slider to zoom in/out
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
                {step === "crop" && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setStep("select");
                      setPreview(null);
                      setSelectedFile(null);
                    }}
                    disabled={uploading}
                  >
                    ← Back
                  </Button>
                )}
                <div className={step === "select" ? "w-full" : "ml-auto"}>
                  {step === "crop" && (
                    <Button
                      onClick={handleUpload}
                      disabled={uploading || !croppedAreaPixels}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Upload Avatar
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
