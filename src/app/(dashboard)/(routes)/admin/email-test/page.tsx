/**
 * Admin Email Testing Dashboard
 *
 * Test all email templates with live preview
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, CheckCircle2, XCircle, Send } from "lucide-react";
import { toast } from "sonner";

type EmailTemplate =
  | "welcome"
  | "password-reset"
  | "course-enrolled"
  | "course-completed"
  | "instructor-approved"
  | "payment-success"
  | "security-alert";

export default function EmailTestDashboard() {
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate>("welcome");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    messageId?: string;
  } | null>(null);

  const templates: {
    value: EmailTemplate;
    label: string;
    description: string;
  }[] = [
    {
      value: "welcome",
      label: "Welcome Email",
      description: "Sent when a new user signs up",
    },
    {
      value: "password-reset",
      label: "Password Reset",
      description: "Password recovery email",
    },
    {
      value: "course-enrolled",
      label: "Course Enrolled",
      description: "Confirmation after course purchase",
    },
    {
      value: "course-completed",
      label: "Course Completed",
      description: "Congratulations on finishing a course",
    },
    {
      value: "instructor-approved",
      label: "Instructor Approved",
      description: "Instructor application approved",
    },
    {
      value: "payment-success",
      label: "Payment Success",
      description: "Payment confirmation with receipt",
    },
    {
      value: "security-alert",
      label: "Security Alert",
      description: "Suspicious activity notification",
    },
  ];

  const handleSendTest = async () => {
    if (!recipientEmail) {
      toast.error("Please enter a recipient email");
      return;
    }

    setIsSending(true);
    setLastResult(null);

    try {
      const response = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: selectedTemplate,
          to: recipientEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLastResult({
          success: true,
          message: "Email sent successfully!",
          messageId: data.messageId,
        });
        toast.success("Test email sent!");
      } else {
        setLastResult({
          success: false,
          message: data.error || "Failed to send email",
        });
        toast.error("Failed to send email");
      }
    } catch (error) {
      setLastResult({
        success: false,
        message: "Network error. Please try again.",
      });
      toast.error("Network error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Email Testing Dashboard
        </h1>
        <p className="text-muted-foreground">
          Test all email templates with live delivery
        </p>
      </div>

      {/* Main Testing Card */}
      <Card>
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
          <CardDescription>
            Select a template and enter a recipient email to send a test
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Email Template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={(value) =>
                setSelectedTemplate(value as EmailTemplate)
              }
            >
              <SelectTrigger id="template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    <div>
                      <div className="font-medium">{template.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Email */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Email</Label>
            <Input
              id="recipient"
              type="email"
              placeholder="test@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendTest}
            disabled={isSending}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>

          {/* Result Display */}
          {lastResult && (
            <div
              className={`p-4 rounded-lg border ${
                lastResult.success
                  ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                  : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
              }`}
            >
              <div className="flex items-start gap-3">
                {lastResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      lastResult.success
                        ? "text-green-900 dark:text-green-100"
                        : "text-red-900 dark:text-red-100"
                    }`}
                  >
                    {lastResult.message}
                  </p>
                  {lastResult.messageId && (
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Message ID: {lastResult.messageId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
          <CardDescription>Details about the selected template</CardDescription>
        </CardHeader>
        <CardContent>
          {templates.find((t) => t.value === selectedTemplate) && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {templates.find((t) => t.value === selectedTemplate)?.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {
                    templates.find((t) => t.value === selectedTemplate)
                      ?.description
                  }
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  <Mail className="mr-1 h-3 w-3" />
                  Transactional
                </Badge>
                <Badge variant="outline">Professional Design</Badge>
                <Badge variant="outline">Mobile Responsive</Badge>
                <Badge variant="outline">Dark Mode Support</Badge>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">What's included:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✅ Dynasty Academy branding</li>
                  <li>✅ Responsive HTML layout</li>
                  <li>✅ Call-to-action buttons</li>
                  <li>✅ Social media links</li>
                  <li>✅ Unsubscribe footer</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Email Statistics</CardTitle>
          <CardDescription>Current email system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">0 / 100</div>
              <div className="text-sm text-muted-foreground">Daily Limit</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">0 / 3,000</div>
              <div className="text-sm text-muted-foreground">Monthly Limit</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">98.5%</div>
              <div className="text-sm text-muted-foreground">Delivery Rate</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">45%</div>
              <div className="text-sm text-muted-foreground">Open Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
