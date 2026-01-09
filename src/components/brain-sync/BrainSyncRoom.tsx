"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Users,
  Highlighter,
  MessageCircle,
  Sparkles,
  Settings,
  X,
  Phone,
  PhoneOff,
  Smile,
  Bookmark,
  Share2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrainSyncUser {
  id: string;
  name: string;
  image?: string;
  level: number;
  cursor?: { x: number; y: number };
  currentPage?: number;
  isTyping?: boolean;
  isSpeaking?: boolean;
  color: string;
}

interface BrainSyncMessage {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  timestamp: Date;
  type: "text" | "highlight" | "reaction" | "system";
}

interface SharedHighlight {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  pageNumber: number;
  text: string;
  note?: string;
  reactions: { emoji: string; userId: string }[];
}

interface BrainSyncRoomProps {
  roomId: string;
  contentTitle: string;
  users: BrainSyncUser[];
  messages: BrainSyncMessage[];
  highlights: SharedHighlight[];
  currentUserId: string;
  currentUserColor: string;
  onSendMessage: (content: string) => void;
  onToggleMic: () => void;
  onToggleSpeaker: () => void;
  onLeaveRoom: () => void;
  onHighlightReaction: (highlightId: string, emoji: string) => void;
  isMicOn: boolean;
  isSpeakerOn: boolean;
  isOpen: boolean;
  onClose: () => void;
}

// Emoji reactions
const REACTIONS = ["🔥", "💡", "❤️", "👀", "🤔", "💯"];

// Chat bubble
const ChatBubble = ({
  message,
  isOwn,
  userColor,
}: {
  message: BrainSyncMessage;
  isOwn: boolean;
  userColor: string;
}) => {
  if (message.type === "system") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-2"
      >
        <span className="text-xs text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </motion.div>
    );
  }

  if (message.type === "highlight") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-2 my-2"
      >
        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
          {message.userImage ? (
            <img
              src={message.userImage}
              alt={message.userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-xs"
              style={{ backgroundColor: userColor }}
            >
              {message.userName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <span className="text-xs text-slate-400">{message.userName}</span>
          <div className="flex items-center gap-1 text-yellow-400 text-sm">
            <Highlighter className="w-3 h-3" />
            <span>{message.content}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: isOwn ? 10 : -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      className={`flex items-end gap-2 my-2 ${isOwn ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      {!isOwn && (
        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
          {message.userImage ? (
            <img
              src={message.userImage}
              alt={message.userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-xs"
              style={{ backgroundColor: userColor }}
            >
              {message.userName.charAt(0)}
            </div>
          )}
        </div>
      )}

      {/* Message */}
      <div
        className={`
          max-w-[70%] px-3 py-2 rounded-2xl
          ${
            isOwn
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              : "bg-slate-800 text-white"
          }
        `}
      >
        {!isOwn && (
          <span className="text-xs opacity-70 block mb-0.5">
            {message.userName}
          </span>
        )}
        <p className="text-sm">{message.content}</p>
        <span className="text-xs opacity-50 block text-right mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </motion.div>
  );
};

// Voice call participant
const VoiceParticipant = ({ user }: { user: BrainSyncUser }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="flex flex-col items-center gap-1"
  >
    <motion.div
      animate={
        user.isSpeaking
          ? {
              boxShadow: [
                "0 0 0px rgba(34, 197, 94, 0)",
                "0 0 20px rgba(34, 197, 94, 0.5)",
                "0 0 0px rgba(34, 197, 94, 0)",
              ],
            }
          : {}
      }
      transition={{ duration: 0.5, repeat: user.isSpeaking ? Infinity : 0 }}
      className="relative"
    >
      <div
        className={`
          w-12 h-12 rounded-full overflow-hidden border-2
          ${user.isSpeaking ? "border-green-500" : "border-slate-700"}
        `}
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: user.color }}
          >
            {user.name.charAt(0)}
          </div>
        )}
      </div>

      {user.isSpeaking && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3, repeat: Infinity }}
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
        >
          <Volume2 className="w-2.5 h-2.5 text-white" />
        </motion.div>
      )}
    </motion.div>

    <span className="text-xs text-slate-400 truncate max-w-[60px]">
      {user.name.split(" ")[0]}
    </span>
  </motion.div>
);

export default function BrainSyncRoom({
  roomId,
  contentTitle,
  users,
  messages,
  highlights,
  currentUserId,
  currentUserColor,
  onSendMessage,
  onToggleMic,
  onToggleSpeaker,
  onLeaveRoom,
  onHighlightReaction,
  isMicOn,
  isSpeakerOn,
  isOpen,
  onClose,
}: BrainSyncRoomProps) {
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "highlights" | "voice">(
    "chat"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    onSendMessage(messageInput);
    setMessageInput("");
  };

  const otherUsers = users.filter((u) => u.id !== currentUserId);
  const speakingUsers = users.filter((u) => u.isSpeaking);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed right-0 top-0 bottom-0 w-full sm:w-96 z-50 bg-gradient-to-b from-slate-900 via-purple-950/50 to-slate-900 border-l border-purple-500/20 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-white">Brain Sync</h3>
                  <p className="text-xs text-purple-300 truncate max-w-[180px]">
                    {contentTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-green-500"
                  />
                  <span className="text-xs text-green-400">
                    {users.length} online
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
              {[
                { id: "chat", label: "Chat", icon: MessageCircle },
                { id: "highlights", label: "Highlights", icon: Highlighter },
                { id: "voice", label: "Voice", icon: Phone },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs font-medium transition-all
                    ${
                      activeTab === tab.id
                        ? "bg-purple-500/30 text-purple-300"
                        : "text-slate-400 hover:text-white"
                    }
                  `}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-4xl mb-3"
                      >
                        💬
                      </motion.div>
                      <p className="text-slate-400 text-sm">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <ChatBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.userId === currentUserId}
                        userColor={
                          users.find((u) => u.id === msg.userId)?.color ||
                          currentUserColor
                        }
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-slate-900/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Highlights Tab */}
            {activeTab === "highlights" && (
              <div className="h-full overflow-y-auto p-4 space-y-3">
                {highlights.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-4xl mb-3"
                    >
                      ✨
                    </motion.div>
                    <p className="text-slate-400 text-sm">
                      No shared highlights yet
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Select text while reading to highlight and share
                    </p>
                  </div>
                ) : (
                  highlights.map((highlight) => (
                    <motion.div
                      key={highlight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/50 rounded-xl p-3 border border-white/5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-1 h-full rounded-full"
                          style={{ backgroundColor: highlight.userColor }}
                        />
                        <span className="text-xs text-slate-400">
                          {highlight.userName} • Page {highlight.pageNumber}
                        </span>
                      </div>
                      <p
                        className="text-sm text-white border-l-2 pl-2"
                        style={{ borderColor: highlight.userColor }}
                      >
                        "{highlight.text}"
                      </p>
                      {highlight.note && (
                        <p className="text-xs text-purple-300 mt-2 italic">
                          💭 {highlight.note}
                        </p>
                      )}

                      {/* Reactions */}
                      <div className="flex gap-1 mt-2">
                        {REACTIONS.map((emoji) => {
                          const count = highlight.reactions.filter(
                            (r) => r.emoji === emoji
                          ).length;
                          const hasReacted = highlight.reactions.some(
                            (r) =>
                              r.emoji === emoji && r.userId === currentUserId
                          );

                          return (
                            <button
                              key={emoji}
                              onClick={() =>
                                onHighlightReaction(highlight.id, emoji)
                              }
                              className={`
                                px-2 py-1 rounded-full text-xs transition-all
                                ${
                                  hasReacted
                                    ? "bg-purple-500/30 border border-purple-500/50"
                                    : "bg-slate-700/50 hover:bg-slate-600/50 border border-transparent"
                                }
                              `}
                            >
                              {emoji} {count > 0 && count}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Voice Tab */}
            {activeTab === "voice" && (
              <div className="h-full flex flex-col">
                {/* Voice participants grid */}
                <div className="flex-1 p-4">
                  <div className="grid grid-cols-4 gap-4">
                    {users.map((user) => (
                      <VoiceParticipant key={user.id} user={user} />
                    ))}
                  </div>

                  {speakingUsers.length > 0 && (
                    <div className="mt-6 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                      <p className="text-xs text-green-400 flex items-center gap-2">
                        <Volume2 className="w-3 h-3" />
                        {speakingUsers.map((u) => u.name).join(", ")} speaking
                      </p>
                    </div>
                  )}
                </div>

                {/* Voice controls */}
                <div className="p-4 border-t border-white/10 bg-slate-900/50">
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      onClick={onToggleMic}
                      variant={isMicOn ? "default" : "destructive"}
                      size="lg"
                      className={`rounded-full w-14 h-14 ${
                        isMicOn
                          ? "bg-purple-600 hover:bg-purple-500"
                          : "bg-red-600 hover:bg-red-500"
                      }`}
                    >
                      {isMicOn ? (
                        <Mic className="w-6 h-6" />
                      ) : (
                        <MicOff className="w-6 h-6" />
                      )}
                    </Button>

                    <Button
                      onClick={onToggleSpeaker}
                      variant="ghost"
                      size="lg"
                      className="rounded-full w-14 h-14 bg-slate-800 hover:bg-slate-700"
                    >
                      {isSpeakerOn ? (
                        <Volume2 className="w-6 h-6 text-white" />
                      ) : (
                        <VolumeX className="w-6 h-6 text-red-400" />
                      )}
                    </Button>

                    <Button
                      onClick={onLeaveRoom}
                      variant="destructive"
                      size="lg"
                      className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-500"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </Button>
                  </div>

                  <p className="text-center text-xs text-slate-500 mt-3">
                    {isMicOn ? "Your mic is on" : "Your mic is muted"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
