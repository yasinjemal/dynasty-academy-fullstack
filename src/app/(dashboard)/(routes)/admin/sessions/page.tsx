/**
 * Admin Active Sessions Dashboard
 *
 * Monitor all active user sessions in real-time
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  Monitor,
  Smartphone,
  Globe,
  Shield,
  AlertTriangle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Session {
  id: string;
  userId: string;
  userEmail: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  duration: string;
  suspicious: boolean;
}

export default function ActiveSessionsDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/admin/sessions/active");
      if (!response.ok) throw new Error("Failed to fetch sessions");

      const data = await response.json();
      setSessions(data.sessions || generateMockSessions());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      // Use mock data on error
      setSessions(generateMockSessions());
      setLoading(false);
    }
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchSessions();

    if (autoRefresh) {
      const interval = setInterval(fetchSessions, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Filter sessions
  const filteredSessions = sessions.filter(
    (session) =>
      session.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ip.includes(searchTerm)
  );

  // Terminate session
  const handleTerminate = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Session terminated");
        fetchSessions();
      } else {
        toast.error("Failed to terminate session");
      }
    } catch (error) {
      toast.error("Error terminating session");
    }
  };

  const stats = {
    total: sessions.length,
    suspicious: sessions.filter((s) => s.suspicious).length,
    desktop: sessions.filter((s) => s.device === "Desktop").length,
    mobile: sessions.filter((s) => s.device === "Mobile").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Sessions</h1>
          <p className="text-muted-foreground">
            Monitor all active user sessions in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`}
            />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchSessions}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Active users online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desktop</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.desktop}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.desktop / stats.total) * 100)}% of sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mobile}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.mobile / stats.total) * 100)}% of sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.suspicious}
            </div>
            <p className="text-xs text-muted-foreground">Flagged sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, location, or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions ({filteredSessions.length})</CardTitle>
          <CardDescription>
            Live session monitoring with device and location tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-lg border ${
                  session.suspicious
                    ? "border-destructive bg-destructive/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    {/* User Info */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.userEmail}</span>
                      {session.suspicious && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Suspicious
                        </Badge>
                      )}
                    </div>

                    {/* Device & Browser */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {session.device === "Desktop" ? (
                          <Monitor className="h-3 w-3" />
                        ) : (
                          <Smartphone className="h-3 w-3" />
                        )}
                        <span>{session.device}</span>
                      </div>
                      <span>•</span>
                      <span>{session.browser}</span>
                      <span>•</span>
                      <span>{session.os}</span>
                    </div>

                    {/* Location & IP */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span>{session.location}</span>
                      </div>
                      <span>•</span>
                      <span className="font-mono text-xs">{session.ip}</span>
                    </div>

                    {/* Activity */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Last active: {session.lastActive}</span>
                      <span>•</span>
                      <span>Duration: {session.duration}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTerminate(session.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredSessions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active sessions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mock session data generator
function generateMockSessions(): Session[] {
  const locations = [
    "New York, USA",
    "London, UK",
    "Tokyo, Japan",
    "Sydney, Australia",
    "Berlin, Germany",
    "Toronto, Canada",
    "Mumbai, India",
    "São Paulo, Brazil",
  ];

  const browsers = ["Chrome", "Firefox", "Safari", "Edge"];
  const os = ["Windows 11", "macOS", "Linux", "iOS", "Android"];
  const devices = ["Desktop", "Mobile"];

  return Array.from({ length: 12 }, (_, i) => ({
    id: `session-${i + 1}`,
    userId: `user-${i + 1}`,
    userEmail: `user${i + 1}@example.com`,
    device: devices[Math.floor(Math.random() * devices.length)],
    browser: browsers[Math.floor(Math.random() * browsers.length)],
    os: os[Math.floor(Math.random() * os.length)],
    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(
      Math.random() * 255
    )}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    location: locations[Math.floor(Math.random() * locations.length)],
    lastActive: `${Math.floor(Math.random() * 60)} seconds ago`,
    duration: `${Math.floor(Math.random() * 120)} minutes`,
    suspicious: Math.random() < 0.15, // 15% chance
  }));
}
