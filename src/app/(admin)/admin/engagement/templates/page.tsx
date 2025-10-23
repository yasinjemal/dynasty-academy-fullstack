"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Mail,
  Bell,
  MessageSquare,
  Save,
  X,
} from "lucide-react";

interface InterventionTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  cta: string;
  ctaUrl: string;
  channel: "EMAIL" | "PUSH" | "IN_APP";
  isActive: boolean;
  createdAt: string;
}

export default function InterventionTemplatesPage() {
  const [templates, setTemplates] = useState<InterventionTemplate[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "gentle_reminder",
    subject: "",
    body: "",
    cta: "",
    ctaUrl: "/dashboard",
    channel: "EMAIL" as "EMAIL" | "PUSH" | "IN_APP",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/engagement/templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      // Fallback to mock data on error
      setTemplates([
        {
          id: "1",
          name: "Gentle Reminder",
          type: "gentle_reminder",
          subject: "We miss you! 🎓",
          body: "It's been a while since your last visit. Your progress is waiting!",
          cta: "Continue Learning",
          ctaUrl: "/dashboard",
          channel: "EMAIL",
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Streak Warning",
          type: "streak_warning",
          subject: "⚠️ Your streak is at risk!",
          body: "Don't break your amazing streak! Just 5 minutes today will keep it alive.",
          cta: "Save My Streak",
          ctaUrl: "/dashboard",
          channel: "PUSH",
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleCreate = () => {
    setCreating(true);
    setFormData({
      name: "",
      type: "gentle_reminder",
      subject: "",
      body: "",
      cta: "",
      ctaUrl: "/dashboard",
      channel: "EMAIL",
    });
  };

  const handleSave = async () => {
    try {
      if (editing) {
        // Update existing template
        await fetch("/api/engagement/templates", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing, ...formData }),
        });
      } else {
        // Create new template
        await fetch("/api/engagement/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      fetchTemplates();
      setCreating(false);
      setEditing(null);
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this template?")) {
      try {
        await fetch(`/api/engagement/templates?id=${id}`, {
          method: "DELETE",
        });
        fetchTemplates();
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  const handleDuplicate = async (template: InterventionTemplate) => {
    try {
      await fetch("/api/engagement/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...template,
          name: `${template.name} (Copy)`,
        }),
      });
      fetchTemplates();
    } catch (error) {
      console.error("Error duplicating template:", error);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "EMAIL":
        return <Mail className="w-4 h-4" />;
      case "PUSH":
        return <Bell className="w-4 h-4" />;
      case "IN_APP":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-950 dark:via-purple-950 dark:to-blue-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ✍️ Intervention Templates
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Create and manage custom intervention messages
            </p>
          </div>

          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Create/Edit Form */}
        {(creating || editing) && (
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle>
                {creating ? "Create New Template" : "Edit Template"}
              </CardTitle>
              <CardDescription>
                Customize your intervention message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Template Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="My Custom Template"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="gentle_reminder">Gentle Reminder</option>
                    <option value="streak_warning">Streak Warning</option>
                    <option value="achievement_unlocked">
                      Achievement Unlocked
                    </option>
                    <option value="milestone_celebration">
                      Milestone Celebration
                    </option>
                    <option value="personalized_content">
                      Personalized Content
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Subject Line</label>
                <Input
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="We miss you! 🎓"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Message Body</label>
                <Textarea
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  placeholder="It's been a while since your last visit..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Call to Action</label>
                  <Input
                    value={formData.cta}
                    onChange={(e) =>
                      setFormData({ ...formData, cta: e.target.value })
                    }
                    placeholder="Continue Learning"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">CTA URL</label>
                  <Input
                    value={formData.ctaUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, ctaUrl: e.target.value })
                    }
                    placeholder="/dashboard"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Channel</label>
                <div className="flex gap-2 mt-2">
                  {(["EMAIL", "PUSH", "IN_APP"] as const).map((channel) => (
                    <Button
                      key={channel}
                      variant={
                        formData.channel === channel ? "default" : "outline"
                      }
                      onClick={() => setFormData({ ...formData, channel })}
                      className="flex-1"
                    >
                      {getChannelIcon(channel)}
                      <span className="ml-2">{channel}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreating(false);
                    setEditing(null);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Templates List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>
                      {template.type.replace(/_/g, " ")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={template.isActive ? "default" : "outline"}
                      className="flex items-center gap-1"
                    >
                      {getChannelIcon(template.channel)}
                      {template.channel}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Subject:
                    </p>
                    <p className="text-sm">{template.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Message:
                    </p>
                    <p className="text-sm line-clamp-2">{template.body}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      CTA:
                    </p>
                    <p className="text-sm text-purple-600">{template.cta}</p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(template.id)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                      className="flex-1"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates.length === 0 && !creating && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No templates yet. Create your first one!
              </p>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
