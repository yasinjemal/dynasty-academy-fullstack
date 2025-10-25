/**
 * Instructor Verification Dashboard
 *
 * Multi-stage verification interface for instructor onboarding
 */

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  Shield,
  Award,
  Users,
  FileText,
  Star,
  TrendingUp,
} from "lucide-react";

type VerificationStage =
  | "identity"
  | "expertise"
  | "content"
  | "community"
  | "trust";
type VerificationStatus = "pending" | "in_progress" | "verified" | "rejected";

interface VerificationBadge {
  stage: VerificationStage;
  status: VerificationStatus;
  score: number;
  evidence: any[];
  verifiedAt?: Date;
}

const stageInfo: Record<
  VerificationStage,
  { icon: any; title: string; description: string }
> = {
  identity: {
    icon: Shield,
    title: "Identity Verification",
    description: "Verify email, phone, and social profiles",
  },
  expertise: {
    icon: Award,
    title: "Expertise Proof",
    description: "Credentials, portfolio, and knowledge assessment",
  },
  content: {
    icon: FileText,
    title: "Content Quality",
    description: "Submit sample lesson for AI analysis",
  },
  community: {
    icon: Users,
    title: "Community Validation",
    description: "Peer endorsements and social proof",
  },
  trust: {
    icon: Star,
    title: "Trust Score",
    description: "Ongoing performance monitoring",
  },
};

export default function InstructorVerificationPage() {
  const [verification, setVerification] = useState<any>(null);
  const [currentStage, setCurrentStage] =
    useState<VerificationStage>("identity");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock verification data
    setVerification({
      userId: "current-user",
      overallStatus: "in_progress",
      completionPercentage: 40,
      badges: [
        { stage: "identity", status: "verified", score: 75, evidence: [] },
        { stage: "expertise", status: "in_progress", score: 40, evidence: [] },
        { stage: "content", status: "pending", score: 0, evidence: [] },
        { stage: "community", status: "pending", score: 0, evidence: [] },
        { stage: "trust", status: "pending", score: 0, evidence: [] },
      ],
      credibilityScore: 450,
      canPublishCourses: false,
      canReceivePayments: false,
      recommendations: [
        "Complete expertise verification by uploading credentials",
        "Submit a sample lesson for content review",
      ],
    });
    setLoading(false);
  }, []);

  if (loading || !verification) {
    return <div>Loading...</div>;
  }

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Instructor Verification
        </h1>
        <p className="text-muted-foreground">
          Complete all stages to unlock course publishing and payments
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Verification Progress
          </CardTitle>
          <CardDescription>
            {verification.completionPercentage}% complete
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={verification.completionPercentage} className="h-3" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="text-sm text-muted-foreground">
                Credibility Score
              </div>
              <div className="text-3xl font-bold">
                {verification.credibilityScore}/1000
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="text-sm text-muted-foreground">
                Stages Complete
              </div>
              <div className="text-3xl font-bold">
                {
                  verification.badges.filter(
                    (b: any) => b.status === "verified"
                  ).length
                }
                /5
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge
                className={`mt-1 ${getStatusColor(verification.overallStatus)}`}
              >
                {verification.overallStatus.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {verification.badges.map((badge: VerificationBadge) => {
          const info = stageInfo[badge.stage];
          const Icon = info.icon;

          return (
            <Card
              key={badge.stage}
              className={`cursor-pointer transition-all ${
                currentStage === badge.stage
                  ? "ring-2 ring-purple-600"
                  : "hover:shadow-lg"
              }`}
              onClick={() => setCurrentStage(badge.stage)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-base">{info.title}</CardTitle>
                  </div>
                  {getStatusIcon(badge.status)}
                </div>
                <CardDescription>{info.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-bold">{badge.score}/100</span>
                  </div>
                  <Progress value={badge.score} className="h-2" />

                  {badge.verifiedAt && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                      ✓ Verified{" "}
                      {new Date(badge.verifiedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Stage Details */}
      <Card>
        <CardHeader>
          <CardTitle>{stageInfo[currentStage].title} - Details</CardTitle>
          <CardDescription>
            Complete the requirements below to verify this stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStage === "identity" && (
            <div className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <Input type="email" placeholder="your@email.com" />
                <Button className="mt-2" size="sm">
                  Send Verification
                </Button>
              </div>
              <div>
                <Label>LinkedIn Profile (Optional)</Label>
                <Input
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <Label>GitHub Profile (Optional)</Label>
                <Input type="url" placeholder="https://github.com/username" />
              </div>
            </div>
          )}

          {currentStage === "expertise" && (
            <div className="space-y-4">
              <div>
                <Label>Credentials</Label>
                <Input type="file" />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload degrees, certificates, or licenses
                </p>
              </div>
              <div>
                <Label>Portfolio URL</Label>
                <Input type="url" placeholder="https://yourportfolio.com" />
              </div>
              <Button>Take Knowledge Assessment</Button>
            </div>
          )}

          {currentStage === "content" && (
            <div className="space-y-4">
              <div>
                <Label>Sample Lesson Topic</Label>
                <Input placeholder="e.g., Introduction to React Hooks" />
              </div>
              <div>
                <Label>Lesson Content</Label>
                <textarea
                  className="w-full min-h-[200px] p-3 border rounded-md"
                  placeholder="Paste your sample lesson content here..."
                />
              </div>
              <div>
                <Label>Sample Video (Optional)</Label>
                <Input type="url" placeholder="YouTube or Vimeo URL" />
              </div>
              <Button>Submit for Review</Button>
            </div>
          )}

          {currentStage === "community" && (
            <div className="space-y-4">
              <div>
                <Label>Request Peer Endorsements</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Invite colleagues to endorse your expertise
                </p>
                <Input type="email" placeholder="colleague@email.com" />
                <Button className="mt-2" size="sm">
                  Send Invitation
                </Button>
              </div>
              <div>
                <Label>External Reviews</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Link to reviews on other platforms (Udemy, Coursera, etc.)
                </p>
                <Input type="url" placeholder="https://..." />
              </div>
            </div>
          )}

          {currentStage === "trust" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Trust score is calculated automatically based on your ongoing
                performance:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Course completion rates</li>
                <li>• Student satisfaction ratings</li>
                <li>• Response time to student questions</li>
                <li>• Content quality and accuracy</li>
                <li>• Policy compliance</li>
              </ul>
              <Button variant="outline">View Trust Score Details</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {verification.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {verification.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
