"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Download,
  Share2,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface CertificateCardProps {
  courseId: string;
  courseTitle: string;
  courseCompleted: boolean;
  progress: number;
}

export function CertificateCard({
  courseId,
  courseTitle,
  courseCompleted,
  progress,
}: CertificateCardProps) {
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCertificate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}/certificate`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        if (data.alreadyIssued) {
          setCertificate(data.certificate);
        } else {
          setCertificate(data.certificate);
        }
      } else {
        setError(data.error || "Failed to generate certificate");
      }
    } catch (err) {
      setError("Failed to generate certificate");
    } finally {
      setLoading(false);
    }
  };

  if (!courseCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Earn Your Certificate
            </h3>
            <p className="text-slate-600 mb-4">
              Complete all lessons to earn your certificate of completion
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Progress</span>
                <span className="font-medium text-slate-900">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (certificate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              🎉 Certificate Issued!
            </h3>
            <p className="text-slate-600 text-sm">
              Congratulations on completing {courseTitle}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="text-sm text-slate-600 mb-1">Verification Code</div>
          <div className="font-mono font-bold text-slate-900">
            {certificate.verificationCode}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={certificate.downloadUrl || certificate.pdfUrl}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
          <a
            href={`/certificates/${certificate.verificationCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            View Certificate
          </a>
        </div>

        <div className="mt-4 pt-4 border-t border-green-200">
          <a
            href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
              courseTitle
            )}&organizationId=Dynasty Academy&issueYear=${new Date().getFullYear()}&issueMonth=${
              new Date().getMonth() + 1
            }&certUrl=${encodeURIComponent(
              `${window.location.origin}/certificates/${certificate.verificationCode}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            Share on LinkedIn
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-amber-100 rounded-lg">
          <Award className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            🎓 You've Completed the Course!
          </h3>
          <p className="text-slate-600">
            Get your official certificate of completion
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleGenerateCertificate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Certificate...
          </>
        ) : (
          <>
            <Award className="w-5 h-5" />
            Generate Certificate
          </>
        )}
      </button>

      <p className="mt-4 text-xs text-center text-slate-500">
        Your certificate will be available for download and sharing
      </p>
    </motion.div>
  );
}
