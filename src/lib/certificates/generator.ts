import jsPDF from "jspdf";

interface CertificateData {
  studentName: string;
  courseTitle: string;
  completionDate: Date;
  instructorName: string;
  verificationCode: string;
  courseId: string;
  userId: string;
}

/**
 * 🎓 DYNASTY CERTIFICATE GENERATOR
 *
 * Generates beautiful, professional PDF certificates
 * with verification codes and branding.
 */
export class CertificateGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
  }

  /**
   * Generate a professional certificate PDF
   */
  async generateCertificate(data: CertificateData): Promise<Blob> {
    const {
      studentName,
      courseTitle,
      completionDate,
      instructorName,
      verificationCode,
    } = data;

    // Page dimensions
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const pageHeight = this.doc.internal.pageSize.getHeight();

    // ===== BACKGROUND =====

    // Gradient background (approximated with rectangles)
    this.doc.setFillColor(249, 250, 251); // Light gray
    this.doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Border
    this.doc.setDrawColor(139, 92, 246); // Purple
    this.doc.setLineWidth(2);
    this.doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Inner border
    this.doc.setDrawColor(59, 130, 246); // Blue
    this.doc.setLineWidth(0.5);
    this.doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // ===== HEADER =====

    // Dynasty Logo (text-based)
    this.doc.setFontSize(32);
    this.doc.setTextColor(139, 92, 246); // Purple
    this.doc.setFont("helvetica", "bold");
    this.doc.text("DYNASTY", pageWidth / 2, 35, { align: "center" });

    this.doc.setFontSize(14);
    this.doc.setTextColor(100, 116, 139); // Slate gray
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Academy of Excellence", pageWidth / 2, 43, {
      align: "center",
    });

    // ===== CERTIFICATE TITLE =====

    this.doc.setFontSize(28);
    this.doc.setTextColor(30, 41, 59); // Dark slate
    this.doc.setFont("helvetica", "bold");
    this.doc.text("CERTIFICATE OF COMPLETION", pageWidth / 2, 65, {
      align: "center",
    });

    // Underline
    this.doc.setDrawColor(139, 92, 246);
    this.doc.setLineWidth(1);
    this.doc.line(pageWidth / 2 - 70, 68, pageWidth / 2 + 70, 68);

    // ===== PRESENTATION TEXT =====

    this.doc.setFontSize(14);
    this.doc.setTextColor(71, 85, 105); // Slate
    this.doc.setFont("helvetica", "italic");
    this.doc.text(
      "This certificate is proudly presented to",
      pageWidth / 2,
      85,
      { align: "center" }
    );

    // ===== STUDENT NAME =====

    this.doc.setFontSize(36);
    this.doc.setTextColor(139, 92, 246); // Purple
    this.doc.setFont("times", "bold");
    this.doc.text(studentName, pageWidth / 2, 105, { align: "center" });

    // Name underline
    this.doc.setDrawColor(59, 130, 246);
    this.doc.setLineWidth(0.5);
    const nameWidth = this.doc.getTextWidth(studentName);
    this.doc.line(
      pageWidth / 2 - nameWidth / 2 - 5,
      108,
      pageWidth / 2 + nameWidth / 2 + 5,
      108
    );

    // ===== ACHIEVEMENT TEXT =====

    this.doc.setFontSize(14);
    this.doc.setTextColor(71, 85, 105);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      "for successfully completing the course",
      pageWidth / 2,
      120,
      { align: "center" }
    );

    // ===== COURSE TITLE =====

    this.doc.setFontSize(22);
    this.doc.setTextColor(30, 41, 59);
    this.doc.setFont("helvetica", "bold");

    // Wrap long course titles
    const maxWidth = 200;
    const splitTitle = this.doc.splitTextToSize(courseTitle, maxWidth);
    const titleY = splitTitle.length > 1 ? 132 : 135;
    this.doc.text(splitTitle, pageWidth / 2, titleY, { align: "center" });

    // ===== DATE AND INSTRUCTOR =====

    const bottomY = 165;

    // Date section
    this.doc.setFontSize(11);
    this.doc.setTextColor(100, 116, 139);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Date of Completion", 50, bottomY, { align: "center" });

    this.doc.setFontSize(13);
    this.doc.setTextColor(30, 41, 59);
    this.doc.setFont("helvetica", "bold");
    const formattedDate = completionDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    this.doc.text(formattedDate, 50, bottomY + 7, { align: "center" });

    this.doc.setDrawColor(139, 92, 246);
    this.doc.setLineWidth(0.5);
    this.doc.line(25, bottomY + 10, 75, bottomY + 10);

    // Instructor section
    this.doc.setFontSize(11);
    this.doc.setTextColor(100, 116, 139);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Course Instructor", pageWidth - 50, bottomY, {
      align: "center",
    });

    this.doc.setFontSize(13);
    this.doc.setTextColor(30, 41, 59);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(instructorName, pageWidth - 50, bottomY + 7, {
      align: "center",
    });

    this.doc.setDrawColor(139, 92, 246);
    this.doc.setLineWidth(0.5);
    this.doc.line(pageWidth - 75, bottomY + 10, pageWidth - 25, bottomY + 10);

    // ===== VERIFICATION CODE =====

    this.doc.setFontSize(9);
    this.doc.setTextColor(100, 116, 139);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      `Verification Code: ${verificationCode}`,
      pageWidth / 2,
      pageHeight - 15,
      { align: "center" }
    );

    this.doc.setFontSize(8);
    this.doc.text(
      "Verify this certificate at: dynasty.academy/verify",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    // ===== DECORATIVE ELEMENTS =====

    // Top left corner decoration
    this.doc.setDrawColor(139, 92, 246);
    this.doc.setLineWidth(1);
    this.doc.line(20, 20, 35, 20);
    this.doc.line(20, 20, 20, 35);

    // Top right corner decoration
    this.doc.line(pageWidth - 35, 20, pageWidth - 20, 20);
    this.doc.line(pageWidth - 20, 20, pageWidth - 20, 35);

    // Bottom left corner decoration
    this.doc.line(20, pageHeight - 35, 20, pageHeight - 20);
    this.doc.line(20, pageHeight - 20, 35, pageHeight - 20);

    // Bottom right corner decoration
    this.doc.line(
      pageWidth - 20,
      pageHeight - 35,
      pageWidth - 20,
      pageHeight - 20
    );
    this.doc.line(
      pageWidth - 35,
      pageHeight - 20,
      pageWidth - 20,
      pageHeight - 20
    );

    // Return as Blob
    return this.doc.output("blob");
  }

  /**
   * Generate verification code
   */
  static generateVerificationCode(userId: string, courseId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const userHash = userId.substring(0, 4);
    const courseHash = courseId.substring(0, 4);

    return `${userHash}-${courseHash}-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Download certificate as PDF
   */
  downloadCertificate(filename: string = "certificate.pdf"): void {
    this.doc.save(filename);
  }
}

/**
 * Helper function to generate and download certificate
 */
export async function generateAndDownloadCertificate(
  data: CertificateData
): Promise<void> {
  const generator = new CertificateGenerator();
  await generator.generateCertificate(data);

  const filename = `${data.courseTitle.replace(/\s+/g, "_")}_Certificate.pdf`;
  generator.downloadCertificate(filename);
}
