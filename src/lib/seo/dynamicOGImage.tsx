/**
 * 🎨 DYNAMIC OG IMAGE GENERATOR
 *
 * CRAZY IDEA: Generate beautiful, unique social cards for EVERY book
 * using Vercel's @vercel/og (runs at the edge, instant generation)
 *
 * When someone shares your book on Twitter/Facebook/LinkedIn:
 * → Beautiful custom image with book cover, title, rating, etc.
 * → NOT a generic placeholder
 * → Gets 3-5x more clicks than text-only
 *
 * This is what billion-dollar companies do!
 */

import { ImageResponse } from "next/og";

interface OGImageData {
  title: string;
  author: string;
  category: string;
  rating?: number;
  coverImage?: string;
  isFree: boolean;
}

export class DynamicOGImageGenerator {
  /**
   * 🚀 Generate stunning OG image for book
   */
  static async generateBookOGImage(data: OGImageData): Promise<ImageResponse> {
    const { title, author, category, rating, coverImage, isFree } = data;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, #0A0E27 0%, #1a1f3a 50%, #0A1628 100%)",
            fontFamily: "Inter, sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Animated background particles */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              background:
                "radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(219, 39, 119, 0.3) 0%, transparent 50%)",
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "90%",
              maxWidth: "1100px",
              padding: "40px",
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Book cover */}
            {coverImage && (
              <div
                style={{
                  display: "flex",
                  marginRight: "40px",
                }}
              >
                <img
                  src={coverImage}
                  alt={title}
                  style={{
                    width: "240px",
                    height: "360px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                  }}
                />
              </div>
            )}

            {/* Book info */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* FREE badge */}
              {isFree && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    borderRadius: "20px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: "16px",
                    width: "fit-content",
                  }}
                >
                  ✨ FREE TO READ
                </div>
              )}

              {/* Title */}
              <h1
                style={{
                  fontSize: "56px",
                  fontWeight: "bold",
                  color: "white",
                  margin: 0,
                  lineHeight: 1.2,
                  marginBottom: "16px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {title.length > 40 ? title.substring(0, 40) + "..." : title}
              </h1>

              {/* Author */}
              <p
                style={{
                  fontSize: "32px",
                  color: "rgba(255, 255, 255, 0.8)",
                  margin: 0,
                  marginBottom: "24px",
                }}
              >
                by {author}
              </p>

              {/* Rating + Category */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                }}
              >
                {rating && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "32px" }}>⭐</span>
                    <span
                      style={{
                        fontSize: "28px",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {rating.toFixed(1)}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    padding: "8px 16px",
                    background: "rgba(124, 58, 237, 0.2)",
                    borderRadius: "12px",
                    fontSize: "24px",
                    color: "#a78bfa",
                    border: "1px solid rgba(124, 58, 237, 0.3)",
                  }}
                >
                  {category}
                </div>
              </div>

              {/* Dynasty Academy branding */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "32px",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background:
                      "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                  }}
                >
                  👑
                </div>
                <span
                  style={{
                    fontSize: "28px",
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: "600",
                  }}
                >
                  Dynasty Academy
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  /**
   * 🎯 Get OG image URL for a book
   */
  static getOGImageURL(bookSlug: string): string {
    return `https://dynasty-academy.com/api/og/book/${bookSlug}`;
  }
}
