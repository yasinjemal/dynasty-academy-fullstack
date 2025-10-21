"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, DollarSign, Star, Zap } from "lucide-react";

interface Voice {
  id: string;
  name: string;
  provider: "elevenlabs" | "openai" | "google";
  gender: "male" | "female" | "neutral";
  accent: string;
  description: string;
  quality: "ultra" | "premium" | "standard";
  costPerChar: number;
  emotionalRange: number; // 0-10
  naturalness: number; // 0-10
  sampleUrl?: string;
  recommended: boolean;
  tags: string[];
}

export default function VoiceSelector() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const res = await fetch("/api/audio/voices");
      if (res.ok) {
        const data = await res.json();
        setVoices(data.voices);
      }
    } catch (error) {
      console.error("Failed to fetch voices:", error);
    } finally {
      setLoading(false);
    }
  };

  const playVoiceSample = (voiceId: string, sampleUrl?: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      // Stop audio playback
      return;
    }

    if (sampleUrl) {
      const audio = new Audio(sampleUrl);
      audio.play();
      setPlayingVoice(voiceId);
      audio.onended = () => setPlayingVoice(null);
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case "elevenlabs":
        return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      case "openai":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "google":
        return "bg-green-500/20 text-green-500 border-green-500/30";
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case "ultra":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "premium":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      case "standard":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
    }
  };

  const filteredVoices = voices.filter((voice) => {
    if (filterProvider !== "all" && voice.provider !== filterProvider)
      return false;
    if (filterGender !== "all" && voice.gender !== filterGender) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          <p className="text-sm text-muted-foreground">Loading voices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cost Comparison */}
      <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">Provider Cost Comparison</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ElevenLabs */}
          <div className="p-4 bg-background rounded-lg border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-purple-500">ElevenLabs</span>
              <span
                className={`px-2 py-1 text-xs rounded ${getQualityBadge(
                  "ultra"
                )}`}
              >
                ULTRA
              </span>
            </div>
            <p className="text-2xl font-bold mb-1">$0.30</p>
            <p className="text-xs text-muted-foreground">per 1M characters</p>
            <p className="text-xs text-muted-foreground mt-2">
              Premium voices, highest quality
            </p>
          </div>

          {/* OpenAI */}
          <div className="p-4 bg-background rounded-lg border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-blue-500">OpenAI</span>
              <span
                className={`px-2 py-1 text-xs rounded ${getQualityBadge(
                  "premium"
                )}`}
              >
                PREMIUM
              </span>
            </div>
            <p className="text-2xl font-bold mb-1">$0.015</p>
            <p className="text-xs text-muted-foreground">per 1M characters</p>
            <div className="mt-2 px-2 py-1 bg-green-500/20 rounded text-xs text-green-500 font-medium">
              20x CHEAPER
            </div>
          </div>

          {/* Google */}
          <div className="p-4 bg-background rounded-lg border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-green-500">Google</span>
              <span
                className={`px-2 py-1 text-xs rounded ${getQualityBadge(
                  "standard"
                )}`}
              >
                STANDARD
              </span>
            </div>
            <p className="text-2xl font-bold mb-1">$0.004</p>
            <p className="text-xs text-muted-foreground">per 1M characters</p>
            <div className="mt-2 px-2 py-1 bg-green-500/20 rounded text-xs text-green-500 font-medium">
              75x CHEAPER
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="text-sm font-medium mb-2 block">Provider</label>
          <select
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
            className="px-3 py-2 bg-background border rounded-lg"
          >
            <option value="all">All Providers</option>
            <option value="elevenlabs">ElevenLabs</option>
            <option value="openai">OpenAI</option>
            <option value="google">Google</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Gender</label>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-3 py-2 bg-background border rounded-lg"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>

        <div className="flex items-end ml-auto">
          <Button variant="outline" onClick={fetchVoices}>
            Refresh Voices
          </Button>
        </div>
      </div>

      {/* Voice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVoices.map((voice) => (
          <Card
            key={voice.id}
            className={`p-4 cursor-pointer transition-all ${
              selectedVoice === voice.id
                ? "ring-2 ring-primary"
                : "hover:ring-1 hover:ring-muted"
            } ${voice.recommended ? "border-yellow-500/50" : ""}`}
            onClick={() => setSelectedVoice(voice.id)}
          >
            {voice.recommended && (
              <div className="flex items-center gap-1 mb-2 text-yellow-500 text-xs font-medium">
                <Star className="h-3 w-3 fill-yellow-500" />
                RECOMMENDED
              </div>
            )}

            {/* Voice Name & Provider */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold">{voice.name}</h4>
                <p className="text-xs text-muted-foreground">{voice.accent}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs border rounded ${getProviderBadge(
                  voice.provider
                )}`}
              >
                {voice.provider.toUpperCase()}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-3">
              {voice.description}
            </p>

            {/* Quality Ratings */}
            <div className="space-y-2 mb-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Naturalness</span>
                  <span className="font-medium">{voice.naturalness}/10</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${voice.naturalness * 10}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Emotional Range</span>
                  <span className="font-medium">{voice.emotionalRange}/10</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${voice.emotionalRange * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {voice.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-muted rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Cost & Play Button */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="text-sm font-semibold">
                  ${voice.costPerChar.toFixed(6)}/char
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  playVoiceSample(voice.id, voice.sampleUrl);
                }}
                disabled={!voice.sampleUrl}
              >
                {playingVoice === voice.id ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Preview
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredVoices.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No voices found matching your filters.</p>
        </Card>
      )}

      {/* Smart Recommendation */}
      {selectedVoice && (
        <Card className="p-4 bg-blue-500/10 border-blue-500/20">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">Smart Recommendation</p>
              <p className="text-sm text-muted-foreground">
                This voice will be used for new audio generation. Existing
                cached audio will continue using their original voices.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
