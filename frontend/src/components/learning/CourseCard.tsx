/**
 * Course Card Component
 *
 * Displays course information with thumbnail, progress, and action button
 */

import React from 'react';
import { motion } from 'framer-motion';

// Types
export interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  progress?: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  status: 'in-progress' | 'locked' | 'not-started';
  onClick?: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  thumbnail: _thumbnail,
  progress = 0,
  totalLessons,
  completedLessons,
  duration,
  status,
  onClick,
}) => {
  const handleClick = () => {
    onClick?.(id);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'in-progress':
        return (
          <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-green-500/20">
            In Progress
          </span>
        );
      case 'locked':
        return (
          <span className="bg-slate-500/10 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-slate-500/20">
            Locked
          </span>
        );
      case 'not-started':
        return (
          <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-blue-500/20">
            New
          </span>
        );
    }
  };

  return (
    <motion.div
      className={`min-w-0 rounded-xl p-6 border-l-4 cursor-pointer transition-all hover:bg-white/5 ${
        status === 'in-progress'
          ? 'bg-white/5 backdrop-blur-sm border-l-primary'
          : 'bg-white/5 backdrop-blur-sm border-l-slate-700 opacity-70'
      }`}
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-2 rounded-lg ${
            status === 'in-progress' ? 'bg-primary/10 text-primary' : 'bg-white/5 text-slate-400'
          }`}
        >
          <span className="material-symbols-outlined">
            {status === 'locked' ? 'lock' : 'school'}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      <h4 className="text-white font-bold mb-2">{title}</h4>
      <p className="text-slate-500 text-sm mb-6 line-clamp-2">{description}</p>

      {status === 'in-progress' && progress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium">Progress</span>
            <span className="text-primary font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(129,61,225,0.6)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">schedule</span>
          {duration}
        </div>
        <span>
          {completedLessons}/{totalLessons} Lessons
        </span>
      </div>
    </motion.div>
  );
};

export default CourseCard;
