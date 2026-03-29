/**
 * Lesson Card Component
 *
 * Displays individual lesson information with thumbnail, duration, and completion status
 */

import React from 'react';
import { motion } from 'framer-motion';

// Types
export interface LessonCardProps {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
  type: 'video' | 'article';
  completed?: boolean;
  onClick?: (lessonId: string) => void;
  onBookmark?: (lessonId: string) => void;
}

const LessonCard: React.FC<LessonCardProps> = ({
  id,
  title,
  thumbnail,
  duration,
  category,
  type,
  completed = false,
  onClick,
  onBookmark,
}) => {
  const handleClick = () => {
    onClick?.(id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark?.(id);
  };

  return (
    <motion.div
      className="flex gap-4 group cursor-pointer"
      onClick={handleClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ x: 4 }}
    >
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-white text-2xl">play_circle</span>
          </div>
        )}
        {completed && (
          <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
            <span className="material-symbols-outlined text-white text-[12px]">check</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <h5 className="text-sm font-bold text-white line-clamp-2 hover:text-primary transition-colors">
            {title}
          </h5>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
            <span>
              {type === 'video' ? 'Video' : 'Article'} • {duration}
            </span>
            <span className="text-slate-700">•</span>
            <span>{category}</span>
          </div>
        </div>
        <button
          className="text-slate-500 hover:text-primary transition-colors flex justify-start"
          onClick={handleBookmark}
          aria-label="Bookmark lesson"
        >
          <span className="material-symbols-outlined text-sm">bookmark</span>
        </button>
      </div>
    </motion.div>
  );
};

export default LessonCard;
