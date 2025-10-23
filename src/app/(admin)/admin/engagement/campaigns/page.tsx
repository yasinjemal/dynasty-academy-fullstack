"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Campaign {
  id: string;
  name: string;
  description?: string;
  targetAudience: string;
  scheduleType: string;
  scheduledAt?: string;
  recurringPattern?: string;
  recurringTime?: string;
  isDripCampaign: boolean;
  status: string;
  isActive: boolean;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  nextRunAt?: string;
  createdAt: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAudience: "at_risk",
    scheduleType: "one_time",
    scheduledAt: "",
    recurringPattern: "daily",
    recurringDays: [] as number[],
    recurringTime: "09:00",
    isDripCampaign: false,
    dripDays: [] as number[],
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/engagement/campaigns");
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/engagement/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowCreateForm(false);
        setFormData({
          name: "",
          description: "",
          targetAudience: "at_risk",
          scheduleType: "one_time",
          scheduledAt: "",
          recurringPattern: "daily",
          recurringDays: [],
          recurringTime: "09:00",
          isDripCampaign: false,
          dripDays: [],
        });
        fetchCampaigns();
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  const toggleCampaignStatus = async (id: string, isActive: boolean) => {
    try {
      await fetch("/api/engagement/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isActive: !isActive,
          status: !isActive ? "active" : "paused",
        }),
      });
      fetchCampaigns();
    } catch (error) {
      console.error("Error toggling campaign:", error);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      await fetch(`/api/engagement/campaigns?id=${id}`, {
        method: "DELETE",
      });
      fetchCampaigns();
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              📅 Campaign Scheduler
            </h1>
            <p className="text-gray-300">Automate your engagement campaigns</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg"
          >
            {showCreateForm ? "Cancel" : "+ New Campaign"}
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Create New Campaign
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
                  placeholder="Weekly Re-engagement"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Target Audience
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAudience: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                >
                  <option value="all_users">All Users</option>
                  <option value="at_risk">At Risk Users</option>
                  <option value="inactive_7d">Inactive 7 Days</option>
                  <option value="inactive_30d">Inactive 30 Days</option>
                  <option value="custom">Custom Filter</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Schedule Type
                </label>
                <select
                  value={formData.scheduleType}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduleType: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                >
                  <option value="one_time">One Time</option>
                  <option value="recurring">Recurring</option>
                  <option value="drip">Drip Campaign</option>
                </select>
              </div>

              {formData.scheduleType === "one_time" && (
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    Scheduled Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledAt: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>
              )}

              {formData.scheduleType === "recurring" && (
                <>
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      Pattern
                    </label>
                    <select
                      value={formData.recurringPattern}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurringPattern: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.recurringTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurringTime: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-white text-sm font-semibold mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
                  placeholder="Campaign description..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleCreate}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-lg"
              >
                Create Campaign
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Campaigns List */}
        <div className="grid grid-cols-1 gap-6">
          {campaigns.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No campaigns yet
              </h3>
              <p className="text-gray-300 mb-6">
                Create your first automated campaign to get started!
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-lg"
              >
                + Create Campaign
              </Button>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="bg-white/10 backdrop-blur-md border-white/20 p-6 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white">
                        {campaign.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.isActive
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {campaign.isActive ? "Active" : "Paused"}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">
                        {campaign.scheduleType}
                      </span>
                    </div>
                    {campaign.description && (
                      <p className="text-gray-300 mb-4">
                        {campaign.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <div className="text-gray-400 text-sm">Sent</div>
                        <div className="text-white text-xl font-bold">
                          {campaign.totalSent.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Opened</div>
                        <div className="text-green-400 text-xl font-bold">
                          {campaign.totalOpened.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Clicked</div>
                        <div className="text-blue-400 text-xl font-bold">
                          {campaign.totalClicked.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Next Run</div>
                        <div className="text-purple-400 text-sm font-semibold">
                          {campaign.nextRunAt
                            ? new Date(campaign.nextRunAt).toLocaleString()
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() =>
                        toggleCampaignStatus(campaign.id, campaign.isActive)
                      }
                      className={`${
                        campaign.isActive
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-green-500 hover:bg-green-600"
                      } text-white font-semibold px-4 py-2 rounded-lg`}
                    >
                      {campaign.isActive ? "Pause" : "Activate"}
                    </Button>
                    <Button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
