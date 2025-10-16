"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Calendar,
  User,
  BookOpen,
  Download,
  Share2,
  Shield,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface CertificateData {
  id: string;
  verificationCode: string;
  issuedAt: string;
  userName: string;
  courseTitle: string;
  instructorName: string;
  valid: boolean;
}

export default function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params
  useEffect(() => {
    params.then((p) => setCode(p.code));
  }, [params]);

  useEffect(() => {
    if (!code) return;

    async function verifyCertificate() {
      try {
        const response = await fetch(`/api/certificates/${code}/verify`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setCertificate(data.certificate);
        } else {
          setError(data.error || "Certificate not found");
        }
      } catch (err) {
        setError("Failed to verify certificate");
      } finally {
        setLoading(false);
      }
    }

    verifyCertificate();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Certificate Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            {error || "This verification code is invalid or has expired."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Homepage
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Verified Certificate
          </h1>
          <p className="text-slate-600">
            This certificate has been verified as authentic
          </p>
        </motion.div>

        {/* Certificate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200"
        >
          {/* Certificate Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white text-center">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">
              Certificate of Completion
            </h2>
            <p className="text-purple-100">Dynasty Academy</p>
          </div>

          {/* Certificate Details */}
          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Student Name */}
              <div className="bg-slate-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Student Name
                  </span>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {certificate.userName}
                </p>
              </div>

              {/* Issue Date */}
              <div className="bg-slate-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Issue Date
                  </span>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Course Title */}
              <div className="bg-slate-50 rounded-xl p-6 md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Course Completed
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {certificate.courseTitle}
                </p>
              </div>

              {/* Instructor */}
              <div className="bg-slate-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Instructor
                  </span>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {certificate.instructorName}
                </p>
              </div>

              {/* Verification Code */}
              <div className="bg-slate-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Verification Code
                  </span>
                </div>
                <p className="text-lg font-mono font-bold text-slate-900">
                  {certificate.verificationCode}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`/api/certificates/${certificate.verificationCode}/download`}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
              >
                <Download className="w-5 h-5" />
                Download Certificate
              </a>
              <button
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  alert("Link copied to clipboard!");
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                <Share2 className="w-5 h-5" />
                Share Certificate
              </button>
            </div>

            {/* LinkedIn Share */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 mb-3 font-medium">
                🎓 Share your achievement on LinkedIn
              </p>
              <a
                href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
                  certificate.courseTitle
                )}&organizationName=${encodeURIComponent(
                  "Dynasty Academy"
                )}&issueYear=${new Date(
                  certificate.issuedAt
                ).getFullYear()}&issueMonth=${
                  new Date(certificate.issuedAt).getMonth() + 1
                }&certUrl=${encodeURIComponent(
                  window.location.href
                )}&certId=${encodeURIComponent(certificate.verificationCode)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                Add to LinkedIn
              </a>
            </div>
          </div>
        </motion.div>

        {/* Authenticity Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">
              This certificate is authentic and verified
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
