'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Eye } from 'lucide-react';

interface Reader {
  userId: string;
  userName: string;
  userAvatar?: string;
}

interface LivePresenceIndicatorProps {
  readers: Reader[];
  count: number;
  isConnected: boolean;
}

export default function LivePresenceIndicator({ readers, count, isConnected }: LivePresenceIndicatorProps) {
  if (!isConnected) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 right-4 z-50"
    >
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg px-4 py-2 flex items-center gap-2 text-white">
        {/* Pulse animation */}
        <div className="relative">
          <Eye className="w-5 h-5" />
          <motion.div
            className="absolute inset-0 bg-white rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </div>

        <span className="font-bold text-sm">
          {count} {count === 1 ? 'reader' : 'readers'} here
        </span>

        {/* Avatar stack */}
        {readers.length > 0 && (
          <div className="flex -space-x-2">
            <AnimatePresence>
              {readers.slice(0, 3).map((reader, index) => (
                <motion.div
                  key={reader.userId}
                  initial={{ scale: 0, x: -10 }}
                  animate={{ scale: 1, x: 0 }}
                  exit={{ scale: 0, x: 10 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                  title={reader.userName}
                >
                  {reader.userAvatar ? (
                    <img
                      src={reader.userAvatar}
                      alt={reader.userName}
                      className="w-6 h-6 rounded-full border-2 border-white"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold">
                      {reader.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {count > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-purple-800 flex items-center justify-center text-xs font-bold">
                +{count - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hover tooltip with reader names */}
      {readers.length > 0 && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 min-w-[200px] opacity-0 hover:opacity-100 transition-opacity pointer-events-none hover:pointer-events-auto">
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Reading Now:
          </div>
          <div className="space-y-1">
            {readers.map((reader) => (
              <div key={reader.userId} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                {reader.userAvatar ? (
                  <img
                    src={reader.userAvatar}
                    alt={reader.userName}
                    className="w-4 h-4 rounded-full"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white">
                    {reader.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{reader.userName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
