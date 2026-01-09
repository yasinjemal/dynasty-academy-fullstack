"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  StickyNote,
  Plus,
  X,
  Edit3,
  Trash2,
  Pin,
  Users,
  MessageSquare,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollaborativeNote {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  userImage?: string;
  pageNumber: number;
  content: string;
  position: { x: number; y: number };
  isPinned: boolean;
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface CollaborativeNotesProps {
  notes: CollaborativeNote[];
  currentUserId: string;
  currentPage: number;
  onCreateNote: (note: Partial<CollaborativeNote>) => void;
  onUpdateNote: (noteId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
  onPinNote: (noteId: string) => void;
  onAddComment: (noteId: string, comment: string) => void;
}

// Note colors based on user
const NOTE_COLORS = [
  { bg: "bg-yellow-200", border: "border-yellow-400", text: "text-yellow-900" },
  { bg: "bg-pink-200", border: "border-pink-400", text: "text-pink-900" },
  { bg: "bg-blue-200", border: "border-blue-400", text: "text-blue-900" },
  { bg: "bg-green-200", border: "border-green-400", text: "text-green-900" },
  { bg: "bg-purple-200", border: "border-purple-400", text: "text-purple-900" },
  { bg: "bg-orange-200", border: "border-orange-400", text: "text-orange-900" },
];

// Single note component
const NoteCard = ({
  note,
  isOwner,
  onUpdate,
  onDelete,
  onPin,
  onAddComment,
  colorIndex,
}: {
  note: CollaborativeNote;
  isOwner: boolean;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onPin: () => void;
  onAddComment: (comment: string) => void;
  colorIndex: number;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const colors = NOTE_COLORS[colorIndex % NOTE_COLORS.length];

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editContent.trim()) {
      onUpdate(editContent);
    }
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{
        scale: 1,
        rotate: isDragging ? 5 : 0,
        boxShadow: isDragging
          ? "0 20px 40px rgba(0,0,0,0.3)"
          : "0 4px 12px rgba(0,0,0,0.15)",
      }}
      exit={{ scale: 0, rotate: 10 }}
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      style={{ x: note.position.x, y: note.position.y }}
      className={`
        absolute w-56 rounded-lg overflow-hidden cursor-move
        ${colors.bg} ${colors.border} border-2
        ${isDragging ? "z-50" : "z-10"}
      `}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 py-2 ${colors.bg} border-b ${colors.border}`}
      >
        <div className="flex items-center gap-2">
          <GripVertical className={`w-4 h-4 ${colors.text} opacity-50`} />
          <div className="flex items-center gap-1">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold"
              style={{ backgroundColor: note.userColor }}
            >
              {note.userName.charAt(0)}
            </div>
            <span className={`text-xs font-medium ${colors.text}`}>
              {note.userName.split(" ")[0]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {note.isPinned && (
            <Pin className={`w-3 h-3 ${colors.text}`} fill="currentColor" />
          )}
          {isOwner && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className={`p-1 rounded hover:bg-black/10 ${colors.text}`}
              >
                <Edit3 className="w-3 h-3" />
              </button>
              <button
                onClick={onPin}
                className={`p-1 rounded hover:bg-black/10 ${colors.text}`}
              >
                <Pin className="w-3 h-3" />
              </button>
              <button
                onClick={onDelete}
                className={`p-1 rounded hover:bg-black/10 ${colors.text}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={`w-full bg-transparent resize-none focus:outline-none ${colors.text} text-sm`}
              rows={4}
              placeholder="Write your note..."
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                className="h-7 text-xs bg-black/20 hover:bg-black/30 text-inherit"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className={`text-sm ${colors.text} whitespace-pre-wrap`}>
            {note.content || "Empty note..."}
          </p>
        )}
      </div>

      {/* Footer - Comments */}
      <div className={`px-3 py-2 border-t ${colors.border}`}>
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1 text-xs ${colors.text} hover:opacity-70`}
        >
          <MessageSquare className="w-3 h-3" />
          {note.comments.length} comments
        </button>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 space-y-2 overflow-hidden"
            >
              {note.comments.map((comment) => (
                <div key={comment.id} className="text-xs">
                  <span className="font-medium">{comment.userName}: </span>
                  <span className={colors.text}>{comment.content}</span>
                </div>
              ))}

              <div className="flex gap-1 mt-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Add comment..."
                  className={`flex-1 text-xs bg-black/10 rounded px-2 py-1 focus:outline-none ${colors.text} placeholder:opacity-50`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tape decoration */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-amber-100/80 rotate-2" />
    </motion.div>
  );
};

// Create note button
const CreateNoteButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="fixed top-24 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
  >
    <Plus className="w-6 h-6 text-white" />
  </motion.button>
);

export default function CollaborativeNotes({
  notes,
  currentUserId,
  currentPage,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onPinNote,
  onAddComment,
}: CollaborativeNotesProps) {
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter notes for current page + pinned notes
  const visibleNotes = notes.filter(
    (note) => note.pageNumber === currentPage || note.isPinned
  );

  // Group notes by user for color assignment
  const userColorMap = new Map<string, number>();
  let colorIndex = 0;
  notes.forEach((note) => {
    if (!userColorMap.has(note.userId)) {
      userColorMap.set(note.userId, colorIndex++);
    }
  });

  const handleCreateNote = () => {
    // Random position in the visible area
    const x = 100 + Math.random() * 200;
    const y = 100 + Math.random() * 200;

    onCreateNote({
      pageNumber: currentPage,
      content: "",
      position: { x, y },
      isPinned: false,
    });
  };

  return (
    <>
      <CreateNoteButton onClick={handleCreateNote} />

      {/* Notes container */}
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-30"
      >
        <AnimatePresence>
          {visibleNotes.map((note) => (
            <div key={note.id} className="pointer-events-auto">
              <NoteCard
                note={note}
                isOwner={note.userId === currentUserId}
                onUpdate={(content) => onUpdateNote(note.id, content)}
                onDelete={() => onDeleteNote(note.id)}
                onPin={() => onPinNote(note.id)}
                onAddComment={(comment) => onAddComment(note.id, comment)}
                colorIndex={userColorMap.get(note.userId) || 0}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Notes count indicator */}
      {visibleNotes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-24 right-20 z-40 flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm rounded-full border border-white/10"
        >
          <StickyNote className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-white">
            {visibleNotes.length} notes
          </span>
          <div className="flex -space-x-2 ml-1">
            {[...new Set(visibleNotes.map((n) => n.userId))]
              .slice(0, 3)
              .map((userId) => {
                const note = visibleNotes.find((n) => n.userId === userId);
                return (
                  <div
                    key={userId}
                    className="w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs text-white"
                    style={{ backgroundColor: note?.userColor }}
                  >
                    {note?.userName.charAt(0)}
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}
    </>
  );
}
