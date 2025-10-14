"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  XCircle,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMuteToggle from "./ChatMuteToggle";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  page: number;
  timestamp: number;
  edited?: boolean;
  editedAt?: string | number;
}

interface LiveChatWidgetProps {
  messages: ChatMessage[];
  typingUsers: string[];
  isLoadingMessages?: boolean;
  hasMoreMessages?: boolean;
  currentUserId?: string;
  onSendMessage: (message: string) => void;
  onEditMessage?: (messageId: string, newMessage: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onStartTyping: () => void;
  onLoadMore?: () => void;
}

export default function LiveChatWidget({
  messages,
  typingUsers,
  isLoadingMessages = false,
  hasMoreMessages = false,
  currentUserId,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onStartTyping,
  onLoadMore,
}: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [contextMenuMessageId, setContextMenuMessageId] = useState<
    string | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showReportDialog, setShowReportDialog] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>("spam");
  const [reportDetails, setReportDetails] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    onStartTyping();
  };

  const handleEditStart = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.message);
    setContextMenuMessageId(null);
  };

  const handleEditSave = () => {
    if (editingMessageId && editingText.trim() && onEditMessage) {
      onEditMessage(editingMessageId, editingText);
      setEditingMessageId(null);
      setEditingText("");
    }
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleDeleteClick = (messageId: string) => {
    setShowDeleteConfirm(messageId);
    setContextMenuMessageId(null);
  };

  const handleDeleteConfirm = () => {
    if (showDeleteConfirm && onDeleteMessage) {
      onDeleteMessage(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(null);
  };

  const handleReportClick = (messageId: string) => {
    setShowReportDialog(messageId);
    setContextMenuMessageId(null);
    setReportReason("spam");
    setReportDetails("");
  };

  const handleReportSubmit = async () => {
    if (!showReportDialog) return;

    try {
      const response = await fetch("/api/co-reading/moderation/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: showReportDialog,
          reason: reportReason,
          details: reportDetails || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to report message");
      }

      toast.success("Message reported successfully");
      setShowReportDialog(null);
      setReportDetails("");
    } catch (error: any) {
      toast.error(error.message || "Failed to report message");
    }
  };

  const handleReportCancel = () => {
    setShowReportDialog(null);
    setReportDetails("");
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
          >
            <MessageCircle className="w-6 h-6" />
            {messages.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
              >
                {messages.length > 9 ? "9+" : messages.length}
              </motion.div>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col ${
              isMinimized ? "w-80 h-14" : "w-96 h-[500px]"
            } transition-all duration-300`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Live Chat</span>
                {messages.length > 0 && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {messages.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <div className="mr-1">
                  <ChatMuteToggle />
                </div>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:bg-white/20 p-1 rounded transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-1 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                >
                  {/* Load More Button */}
                  {hasMoreMessages && onLoadMore && (
                    <div className="text-center pb-2">
                      <Button
                        onClick={onLoadMore}
                        disabled={isLoadingMessages}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        {isLoadingMessages
                          ? "Loading..."
                          : "Load Earlier Messages"}
                      </Button>
                    </div>
                  )}

                  {/* Loading Indicator */}
                  {isLoadingMessages && messages.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm">Loading messages...</p>
                    </div>
                  )}

                  {messages.length === 0 && !isLoadingMessages ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No messages yet.</p>
                      <p className="text-xs">Be the first to say something!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwnMessage = msg.userId === currentUserId;
                      const isEditing = editingMessageId === msg.id;

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-2 group relative"
                        >
                          {msg.userAvatar ? (
                            <img
                              src={msg.userAvatar}
                              alt={msg.userName}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              {msg.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {msg.userName}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                {new Date(msg.timestamp).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                              {msg.edited && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 italic flex-shrink-0">
                                  (edited)
                                </span>
                              )}
                            </div>

                            {/* Edit Mode */}
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  value={editingText}
                                  onChange={(e) =>
                                    setEditingText(e.target.value)
                                  }
                                  className="text-sm"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleEditSave();
                                    } else if (e.key === "Escape") {
                                      handleEditCancel();
                                    }
                                  }}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={handleEditSave}
                                    className="h-7 px-2 text-xs"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleEditCancel}
                                    className="h-7 px-2 text-xs"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              /* Normal Message Display */
                              <div className="relative">
                                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 break-words">
                                  {msg.message}
                                </p>

                                {/* Context Menu Button */}
                                {((isOwnMessage &&
                                  onEditMessage &&
                                  onDeleteMessage) ||
                                  !isOwnMessage) && (
                                  <div className="absolute top-1 right-1">
                                    <button
                                      onClick={() =>
                                        setContextMenuMessageId(
                                          contextMenuMessageId === msg.id
                                            ? null
                                            : msg.id
                                        )
                                      }
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all"
                                    >
                                      <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                    </button>

                                    {/* Context Menu */}
                                    {contextMenuMessageId === msg.id && (
                                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[120px]">
                                        {isOwnMessage ? (
                                          <>
                                            <button
                                              onClick={() =>
                                                handleEditStart(msg)
                                              }
                                              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-t-lg"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                              Edit
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleDeleteClick(msg.id)
                                              }
                                              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400 rounded-b-lg"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                              Delete
                                            </button>
                                          </>
                                        ) : (
                                          <button
                                            onClick={() =>
                                              handleReportClick(msg.id)
                                            }
                                            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400 rounded-lg"
                                          >
                                            <Flag className="w-3 h-3" />
                                            Report
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Delete Confirmation Dialog */}
                          {showDeleteConfirm === msg.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                              onClick={handleDeleteCancel}
                            >
                              <div
                                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                                  Delete Message?
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                  This action cannot be undone. The message will
                                  be removed for everyone.
                                </p>
                                <div className="flex gap-3 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDeleteCancel}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteConfirm}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 italic">
                    {typingUsers.slice(0, 3).join(", ")}{" "}
                    {typingUsers.length === 1 ? "is" : "are"} typing...
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  {!currentUserId ? (
                    <div className="text-center py-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Please log in to send messages
                      </p>
                      <a
                        href="/auth/signin"
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm font-medium underline"
                      >
                        Sign in to chat
                      </a>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Dialog */}
      <AnimatePresence>
        {showReportDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
            onClick={handleReportCancel}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Flag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Report Message
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Help us keep the community safe
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    Reason for reporting
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="spam">Spam</option>
                    <option value="harassment">Harassment</option>
                    <option value="inappropriate">Inappropriate Content</option>
                    <option value="hate_speech">Hate Speech</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide any additional context..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReportCancel}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReportSubmit}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Submit Report
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
