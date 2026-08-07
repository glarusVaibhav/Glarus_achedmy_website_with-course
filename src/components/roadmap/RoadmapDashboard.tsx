"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Code,
  Terminal,
  Video,
  HelpCircle,
  Settings,
  CheckCircle2,
  Circle,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Play,
  Trophy,
  Flame,
  Star,
  Sparkles,
  Hourglass,
  Award,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// --- Type Definitions ---
export type SubtopicStatus = 'Completed' | 'In Progress' | 'Locked';
export type SubtopicType = 'code' | 'concept' | 'video' | 'quiz' | 'setup';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Subtopic {
  id: string;
  name: string;
  difficulty: DifficultyLevel;
  type: SubtopicType;
  status: SubtopicStatus;
}

export interface Module {
  id: string;
  title: string;
  duration: string;
  subtopics: Subtopic[];
}

// --- Initial Data ---
const INITIAL_MODULES: Module[] = [
  {
    id: 'mod-1',
    title: 'Foundations & Ecosystem',
    duration: '1.5 hrs',
    subtopics: [
      { id: 'sub-1-1', name: 'Introduction to Programming', difficulty: 'Beginner', type: 'concept', status: 'Completed' },
      { id: 'sub-1-2', name: 'How Software Works', difficulty: 'Beginner', type: 'concept', status: 'Completed' },
      { id: 'sub-1-3', name: 'IDE Setup', difficulty: 'Beginner', type: 'setup', status: 'Completed' },
      { id: 'sub-1-4', name: 'Git & GitHub Basics', difficulty: 'Beginner', type: 'code', status: 'In Progress' },
      { id: 'sub-1-5', name: 'Developer Roadmap', difficulty: 'Beginner', type: 'video', status: 'Locked' }
    ]
  },
  {
    id: 'mod-2',
    title: 'Variables & Types',
    duration: '2.0 hrs',
    subtopics: [
      { id: 'sub-2-1', name: 'Variables', difficulty: 'Beginner', type: 'concept', status: 'Locked' },
      { id: 'sub-2-2', name: 'Data Types', difficulty: 'Beginner', type: 'concept', status: 'Locked' },
      { id: 'sub-2-3', name: 'Constants', difficulty: 'Beginner', type: 'concept', status: 'Locked' },
      { id: 'sub-2-4', name: 'Type Conversion', difficulty: 'Intermediate', type: 'code', status: 'Locked' },
      { id: 'sub-2-5', name: 'User Input', difficulty: 'Intermediate', type: 'code', status: 'Locked' }
    ]
  },
  {
    id: 'mod-3',
    title: 'Operations & Logic Flow',
    duration: '2.5 hrs',
    subtopics: [
      { id: 'sub-3-1', name: 'Arithmetic Operators', difficulty: 'Beginner', type: 'code', status: 'Locked' },
      { id: 'sub-3-2', name: 'Comparison Operators', difficulty: 'Beginner', type: 'code', status: 'Locked' },
      { id: 'sub-3-3', name: 'Logical Operators', difficulty: 'Intermediate', type: 'code', status: 'Locked' },
      { id: 'sub-3-4', name: 'Expressions', difficulty: 'Intermediate', type: 'concept', status: 'Locked' },
      { id: 'sub-3-5', name: 'Operator Precedence', difficulty: 'Advanced', type: 'quiz', status: 'Locked' }
    ]
  },
  {
    id: 'mod-4',
    title: 'Control Flow',
    duration: '3.0 hrs',
    subtopics: [
      { id: 'sub-4-1', name: 'If Else', difficulty: 'Beginner', type: 'code', status: 'Locked' },
      { id: 'sub-4-2', name: 'Nested Conditions', difficulty: 'Intermediate', type: 'code', status: 'Locked' },
      { id: 'sub-4-3', name: 'Switch Case', difficulty: 'Intermediate', type: 'code', status: 'Locked' },
      { id: 'sub-4-4', name: 'Loops', difficulty: 'Intermediate', type: 'code', status: 'Locked' },
      { id: 'sub-4-5', name: 'Break & Continue', difficulty: 'Advanced', type: 'code', status: 'Locked' }
    ]
  },
  {
    id: 'mod-5',
    title: 'Data Structures',
    duration: '4.0 hrs',
    subtopics: [
      { id: 'sub-5-1', name: 'Arrays', difficulty: 'Beginner', type: 'code', status: 'Locked' },
      { id: 'sub-5-2', name: 'Lists', difficulty: 'Intermediate', type: 'code', status: 'Locked' },
      { id: 'sub-5-3', name: 'Stacks', difficulty: 'Advanced', type: 'concept', status: 'Locked' },
      { id: 'sub-5-4', name: 'Queues', difficulty: 'Advanced', type: 'concept', status: 'Locked' },
      { id: 'sub-5-5', name: 'Dictionaries', difficulty: 'Advanced', type: 'code', status: 'Locked' }
    ]
  }
];

// Helper to return Lucide icon for topic type
const getTopicIcon = (type: SubtopicType) => {
  switch (type) {
    case 'code':
      return <Code className="w-4 h-4" />;
    case 'concept':
      return <BookOpen className="w-4 h-4" />;
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'quiz':
      return <HelpCircle className="w-4 h-4" />;
    case 'setup':
      return <Settings className="w-4 h-4" />;
  }
};

// Helper for difficulty colors
const getDifficultyStyles = (level: DifficultyLevel) => {
  switch (level) {
    case 'Beginner':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Intermediate':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Advanced':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  }
};

export default function RoadmapDashboard() {
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-1': true, // Expanded by default
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeMenuSubtopicId, setActiveMenuSubtopicId] = useState<string | null>(null);
  
  // Simulated overall profile metrics
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(150);
  const [streak, setStreak] = useState(3);
  const [hoursStudied, setHoursStudied] = useState(1.8);

  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Recalculate module progress
  const getModuleProgress = (module: Module) => {
    const total = module.subtopics.length;
    if (total === 0) return 0;
    const completed = module.subtopics.filter(s => s.status === 'Completed').length;
    return Math.round((completed / total) * 100);
  };

  // Get total progress of the entire course
  const getTotalProgress = () => {
    let totalSubtopics = 0;
    let completedSubtopics = 0;
    modules.forEach(m => {
      totalSubtopics += m.subtopics.length;
      completedSubtopics += m.subtopics.filter(s => s.status === 'Completed').length;
    });
    return totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;
  };

  // Automatically update modules locking status based on progression
  // Rule: Module 1 is always unlocked.
  // Module N unlocks (its first topic becomes In Progress/unlocked) only when Module N-1 is 100% completed.
  useEffect(() => {
    setModules(prevModules => {
      let changed = false;
      const updatedModules = prevModules.map((mod, idx) => {
        // Module 1 is always unlocked
        if (idx === 0) return mod;

        const prevMod = prevModules[idx - 1];
        const isPrevModComplete = getModuleProgress(prevMod) === 100;

        // If previous module is complete, this module should unlock
        // If it was locked, unlock its first subtopic and set module subtopics to un-locked
        const isCurrentlyLocked = mod.subtopics.every(s => s.status === 'Locked');
        
        if (isPrevModComplete && isCurrentlyLocked) {
          changed = true;
          // Clone and unlock the first subtopic
          const newSubtopics = mod.subtopics.map((sub, sIdx) => {
            if (sIdx === 0) {
              return { ...sub, status: 'In Progress' as SubtopicStatus };
            }
            // Keep the rest locked until first is in progress/completed
            return { ...sub, status: 'Locked' as SubtopicStatus };
          });

          // Auto-expand newly unlocked module
          setExpandedModules(prev => ({ ...prev, [mod.id]: true }));

          // Fire notification confetti
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#a855f7', '#3b82f6', '#10b981']
          });

          return { ...mod, subtopics: newSubtopics };
        }

        // Conversely, if previous module becomes incomplete (user downgraded it), lock this module
        if (!isPrevModComplete && !isCurrentlyLocked) {
          changed = true;
          const newSubtopics = mod.subtopics.map(sub => ({
            ...sub,
            status: 'Locked' as SubtopicStatus
          }));
          return { ...mod, subtopics: newSubtopics };
        }

        return mod;
      });

      return changed ? updatedModules : prevModules;
    });
  }, [modules]);

  // Recalculate level based on XP
  useEffect(() => {
    // 500 XP per level
    const newLevel = Math.floor(xp / 500) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      // level up effect
      confetti({
        particleCount: 150,
        spread: 80,
        colors: ['#a855f7', '#f43f5e', '#fbbf24']
      });
    }
  }, [xp, level]);

  // Handle manual subtopic status change
  const handleStatusChange = (subtopicId: string, newStatus: SubtopicStatus) => {
    let xpAward = 0;
    
    setModules(prevModules => {
      return prevModules.map(mod => {
        const hasSubtopic = mod.subtopics.some(s => s.id === subtopicId);
        if (!hasSubtopic) return mod;

        // Check if module is currently locked
        // (A module is locked if it's not the first one and the previous one isn't 100% completed)
        const modIdx = prevModules.findIndex(m => m.id === mod.id);
        if (modIdx > 0) {
          const prevMod = prevModules[modIdx - 1];
          if (getModuleProgress(prevMod) < 100) {
            // Cannot modify locked module
            return mod;
          }
        }

        const updatedSubtopics = mod.subtopics.map(sub => {
          if (sub.id === subtopicId) {
            const oldStatus = sub.status;
            if (oldStatus === newStatus) return sub;

            // XP calculations
            if (newStatus === 'Completed' && oldStatus !== 'Completed') {
              xpAward += 100;
            } else if (oldStatus === 'Completed' && newStatus !== 'Completed') {
              xpAward -= 100;
            }

            return { ...sub, status: newStatus };
          }
          return sub;
        });

        // Auto unlock next subtopics in the same module
        // E.g., if subtopic i is marked Completed, subtopic i+1 becomes In Progress if it was Locked
        for (let i = 0; i < updatedSubtopics.length - 1; i++) {
          if (updatedSubtopics[i].status === 'Completed' && updatedSubtopics[i + 1].status === 'Locked') {
            updatedSubtopics[i + 1].status = 'In Progress';
          }
        }

        return { ...mod, subtopics: updatedSubtopics };
      });
    });

    if (xpAward !== 0) {
      setXp(prev => Math.max(0, prev + xpAward));
      if (xpAward > 0) {
        setHoursStudied(prev => parseFloat((prev + 0.3).toFixed(1)));
      }
    }
    setActiveMenuSubtopicId(null);
  };

  // Toggle module expansion
  const toggleExpand = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Expand / collapse all modules
  const toggleAllModules = () => {
    const anyCollapsed = modules.some(m => !expandedModules[m.id]);
    const newState: Record<string, boolean> = {};
    modules.forEach(m => {
      newState[m.id] = anyCollapsed;
    });
    setExpandedModules(newState);
  };

  // Reset all progress
  const resetProgress = () => {
    stopSimulation();
    setModules(INITIAL_MODULES);
    setExpandedModules({ 'mod-1': true });
    setXp(150);
    setLevel(1);
    setHoursStudied(1.8);
    setStreak(3);
    confetti({
      particleCount: 50,
      spread: 40,
      colors: ['#6b7280']
    });
  };

  // Auto-Simulation Engine
  const startSimulation = () => {
    if (isSimulating) {
      stopSimulation();
      return;
    }

    setIsSimulating(true);
    
    simulationIntervalRef.current = setInterval(() => {
      setModules(prevModules => {
        // Find the first subtopic that is NOT completed and NOT locked (so it is either 'In Progress' or the next unlocked one)
        let targetSub: Subtopic | null = null;
        let targetModIdx = -1;
        let targetSubIdx = -1;

        for (let mIdx = 0; mIdx < prevModules.length; mIdx++) {
          const mod = prevModules[mIdx];
          for (let sIdx = 0; sIdx < mod.subtopics.length; sIdx++) {
            const sub = mod.subtopics[sIdx];
            if (sub.status === 'In Progress' || (sub.status === 'Locked' && mIdx === 0 && sIdx === 0)) {
              targetSub = sub;
              targetModIdx = mIdx;
              targetSubIdx = sIdx;
              break;
            }
          }
          if (targetSub) break;
        }

        // If no "In Progress" subtopic, find the first "Locked" subtopic that has a completed predecessor
        if (!targetSub) {
          for (let mIdx = 0; mIdx < prevModules.length; mIdx++) {
            const mod = prevModules[mIdx];
            
            // Check if this module is unlocked (either first or previous is completed)
            const isUnlocked = mIdx === 0 || getModuleProgress(prevModules[mIdx - 1]) === 100;
            if (!isUnlocked) continue;

            for (let sIdx = 0; sIdx < mod.subtopics.length; sIdx++) {
              const sub = mod.subtopics[sIdx];
              if (sub.status === 'Locked') {
                targetSub = sub;
                targetModIdx = mIdx;
                targetSubIdx = sIdx;
                break;
              }
            }
            if (targetSub) break;
          }
        }

        // If everything is completed, stop simulation
        if (!targetSub) {
          setIsSimulating(false);
          if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
          
          // Complete celebration!
          confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 },
            colors: ['#a855f7', '#fbbf24', '#f43f5e', '#3b82f6', '#10b981']
          });
          return prevModules;
        }

        // Open/expand the module during simulation
        const targetMod = prevModules[targetModIdx];
        setExpandedModules(prev => ({ ...prev, [targetMod.id]: true }));

        // Upgrade its status: if In Progress -> Completed. If Locked -> In Progress.
        const nextStatus: SubtopicStatus = targetSub.status === 'In Progress' ? 'Completed' : 'In Progress';
        
        // Execute state update
        const updatedModules = prevModules.map((m, mIdx) => {
          if (mIdx !== targetModIdx) return m;

          const updatedSubtopics = m.subtopics.map((s, sIdx) => {
            if (sIdx === targetSubIdx) {
              return { ...s, status: nextStatus };
            }
            // Auto-unlock next sibling if current is complete
            if (sIdx === targetSubIdx + 1 && nextStatus === 'Completed' && s.status === 'Locked') {
              return { ...s, status: 'In Progress' as SubtopicStatus };
            }
            return s;
          });

          return { ...m, subtopics: updatedSubtopics };
        });

        // Award XP if completed
        if (nextStatus === 'Completed') {
          setXp(prev => prev + 100);
          setHoursStudied(prev => parseFloat((prev + 0.3).toFixed(1)));
          
          // Check if this completes the module
          const completedCount = updatedModules[targetModIdx].subtopics.filter(s => s.status === 'Completed').length;
          const totalCount = updatedModules[targetModIdx].subtopics.length;
          if (completedCount === totalCount) {
            // Module completed celebration!
            setTimeout(() => {
              confetti({
                particleCount: 100,
                spread: 70,
                colors: ['#a855f7', '#3b82f6']
              });
            }, 100);
          }
        }

        return updatedModules;
      });
    }, 1200);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 relative">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* --- Header / Dashboard Stats --- */}
      <div className="glass-panel bg-black/40 border border-white/10 rounded-3xl p-6 md:p-8 mb-10 relative overflow-hidden">
        {/* Subtle grid lines background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Learning OS v3.0
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">INTERACTIVE PATHWAY</h2>
            <p className="text-white/60 text-sm mt-1">Simulate and visualize your learning progression through the syllabus.</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={startSimulation}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 border ${
                isSimulating
                  ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:bg-red-500/20'
                  : 'bg-purple-600 text-white border-purple-500 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:scale-105'
              }`}
            >
              {isSimulating ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping shrink-0" />
                  Stop Simulation
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Auto-Simulate Study
                </>
              )}
            </button>

            <button
              onClick={toggleAllModules}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
            >
              {modules.some(m => !expandedModules[m.id]) ? 'Expand All' : 'Collapse All'}
            </button>

            <button
              onClick={resetProgress}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 text-white/50 hover:text-red-400 transition-all text-xs font-bold uppercase tracking-wider"
              title="Reset Roadmap Progress"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Profile statistics cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Level */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Level</div>
              <div className="text-xl font-bold text-white">{level}</div>
            </div>
          </div>

          {/* XP */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">XP Points</div>
              <div className="text-xl font-bold text-white">{xp} <span className="text-xs text-white/40 font-normal">/ {level * 500}</span></div>
              <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="bg-amber-400 h-full transition-all duration-500" 
                  style={{ width: `${((xp % 500) / 500) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 animate-pulse">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Active Streak</div>
              <div className="text-xl font-bold text-white">{streak} Days</div>
            </div>
          </div>

          {/* Hours Studied */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Hourglass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Study Time</div>
              <div className="text-xl font-bold text-white">{hoursStudied} hrs</div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:p-5 relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white/60">Overall Course Completion</span>
            <span className="text-sm font-black text-purple-400 font-mono">{getTotalProgress()}%</span>
          </div>
          <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden p-[2px] border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getTotalProgress()}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.7)]"
            />
          </div>
          
          {/* Quick status list */}
          <div className="flex items-center gap-6 mt-3.5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span>{modules.reduce((acc, m) => acc + m.subtopics.filter(s => s.status === 'Completed').length, 0)} Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-ping" />
              <span>{modules.reduce((acc, m) => acc + m.subtopics.filter(s => s.status === 'In Progress').length, 0)} In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <span>{modules.reduce((acc, m) => acc + m.subtopics.filter(s => s.status === 'Locked').length, 0)} Locked</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Roadmap Roadmap Timeline --- */}
      <div className="relative pl-8 md:pl-16">
        
        {/* Timeline main vertical progress line */}
        <div className="absolute left-[19px] md:left-[35px] top-4 bottom-4 w-[3px] bg-white/5 -z-10 rounded-full overflow-hidden">
          {/* Active progress highlighter */}
          <div 
            className="w-full bg-gradient-to-b from-emerald-400 via-purple-500 to-transparent transition-all duration-700" 
            style={{
              height: `${(() => {
                // Find percentage height along the line
                const completedMods = modules.filter(m => getModuleProgress(m) === 100).length;
                if (completedMods === 0) {
                  // If mod 1 is partially complete
                  const p1 = getModuleProgress(modules[0]);
                  return `${(p1 / 100) * 15}%`;
                }
                if (completedMods === modules.length) return '100%';
                
                // Base completed modules height + fractional next module height
                const basePercent = (completedMods / modules.length) * 100;
                const nextModProgress = getModuleProgress(modules[completedMods]);
                const extraPercent = (nextModProgress / 100) * (100 / modules.length);
                return `${basePercent + extraPercent}%`;
              })()}`
            }}
          />
        </div>

        {/* List of Modules */}
        <div className="space-y-8">
          {modules.map((mod, index) => {
            const progress = getModuleProgress(mod);
            const isCompleted = progress === 100;
            
            // A module is active if it's not completed, but it is unlocked
            // Unlocked condition: index === 0 OR previous module is completed (100% progress)
            const isUnlocked = index === 0 || getModuleProgress(modules[index - 1]) === 100;
            const isActive = isUnlocked && !isCompleted;
            const isLocked = !isUnlocked;
            
            const isExpanded = expandedModules[mod.id] || false;

            return (
              <div key={mod.id} className="relative">
                {/* --- Timeline Node Dot --- */}
                <div className="absolute -left-[27px] md:-left-[43px] top-6 z-10">
                  <div className={`w-[18px] h-[18px] md:w-[22px] md:h-[22px] rounded-full border-4 bg-[#05050a] flex items-center justify-center transition-all duration-500 ${
                    isCompleted 
                      ? 'border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]' 
                      : isActive 
                        ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-pulse'
                        : 'border-white/10'
                  }`}>
                    {isCompleted ? (
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400" />
                    ) : isActive ? (
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-purple-400" />
                    ) : null}
                  </div>
                </div>

                {/* --- Module Card --- */}
                <div className={`transition-all duration-300 ${
                  isLocked ? 'opacity-40 grayscale-[30%]' : 'opacity-100'
                }`}>
                  <div
                    onClick={() => !isLocked && toggleExpand(mod.id)}
                    className={`glass-panel bg-black/40 rounded-2xl p-5 border cursor-pointer select-none transition-all duration-300 relative group ${
                      isActive 
                        ? 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:border-purple-500/80 bg-purple-950/[0.03]' 
                        : isCompleted
                          ? 'border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-950/[0.01]'
                          : 'border-white/10 hover:border-white/20 hover:bg-white/[0.01]'
                    }`}
                  >
                    
                    {/* Glowing active card indicator */}
                    {isActive && (
                      <div className="absolute top-0 right-0 w-32 h-[1px] bg-gradient-to-l from-purple-500 to-transparent" />
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Left: Module basic info */}
                      <div className="flex items-center gap-4">
                        {/* Number Badge */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border transition-all ${
                          isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : isActive
                              ? 'bg-purple-500/20 border-purple-500/30 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                              : 'bg-white/5 border-white/10 text-white/50'
                        }`}>
                          {index + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Module {index + 1}</span>
                            {isCompleted && (
                              <span className="text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Completed</span>
                            )}
                            {isActive && (
                              <span className="text-[9px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Active Pathway</span>
                            )}
                            {isLocked && (
                              <span className="text-[9px] font-extrabold bg-white/5 text-white/30 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> Locked
                              </span>
                            )}
                          </div>
                          <h3 className={`text-lg font-black mt-0.5 transition-colors ${
                            isActive ? 'text-purple-300 group-hover:text-purple-200' : 'text-white'
                          }`}>{mod.title}</h3>
                        </div>
                      </div>

                      {/* Middle/Right: Progress & controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto">
                        <div className="flex items-center gap-6">
                          {/* Info counters */}
                          <div className="text-right hidden md:block">
                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Syllabus</div>
                            <div className="text-xs text-white/70 font-semibold mt-0.5">{mod.subtopics.length} Subtopics ({mod.duration})</div>
                          </div>

                          {/* Module completion circle */}
                          <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                              {/* SVG Circle Progress */}
                              <svg className="w-full h-full -rotate-90">
                                <circle 
                                  cx="18" 
                                  cy="18" 
                                  r="14" 
                                  className="stroke-white/5 fill-transparent" 
                                  strokeWidth="3.5" 
                                />
                                <motion.circle 
                                  cx="18" 
                                  cy="18" 
                                  r="14" 
                                  className={`fill-transparent transition-all duration-500 ${
                                    isCompleted ? 'stroke-emerald-400' : 'stroke-purple-500'
                                  }`} 
                                  strokeWidth="3.5" 
                                  strokeDasharray={2 * Math.PI * 14}
                                  strokeDashoffset={2 * Math.PI * 14 * (1 - progress / 100)}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className={`absolute text-[9px] font-bold font-mono ${
                                isCompleted ? 'text-emerald-400' : 'text-purple-400'
                              }`}>{progress}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Chevron Trigger */}
                        <div className={`p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all ${
                          isExpanded ? 'text-white' : 'text-white/40'
                        }`}>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* --- Subtopic Expansion Section --- */}
                  <AnimatePresence initial={false}>
                    {isExpanded && !isLocked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 md:pl-8 pr-1 pt-3 pb-2 mt-1 space-y-2 relative">
                          {/* Inner timeline line linking subtopics */}
                          <div className="absolute left-[3px] md:left-[11px] top-0 bottom-4 w-[2px] bg-white/5" />

                          {mod.subtopics.map((sub, sIdx) => {
                            const isSubCompleted = sub.status === 'Completed';
                            const isSubActive = sub.status === 'In Progress';
                            const isSubLocked = sub.status === 'Locked';

                            return (
                              <div
                                key={sub.id}
                                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all group/sub ${
                                  isSubCompleted
                                    ? 'bg-emerald-950/[0.01] border-emerald-500/10 hover:border-emerald-500/30'
                                    : isSubActive
                                      ? 'bg-purple-950/[0.02] border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.05)] hover:border-purple-500/40'
                                      : 'bg-transparent border-transparent opacity-60'
                                }`}
                              >
                                <div className="flex items-center gap-3.5 relative">
                                  {/* Subtopic small line dot */}
                                  <div className="absolute -left-[17px] md:-left-[25px] top-1/2 -translate-y-1/2 z-10">
                                    <div className={`w-[8px] h-[8px] rounded-full transition-all duration-300 ${
                                      isSubCompleted 
                                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' 
                                        : isSubActive 
                                          ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse'
                                          : 'bg-white/10'
                                    }`} />
                                  </div>

                                  {/* Type Icon */}
                                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                                    isSubCompleted
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                      : isSubActive
                                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                        : 'bg-white/5 border-white/10 text-white/40'
                                  }`}>
                                    {getTopicIcon(sub.type)}
                                  </div>

                                  <div>
                                    <h4 className={`text-sm font-bold transition-colors ${
                                      isSubCompleted ? 'text-white/80 line-through' : isSubActive ? 'text-purple-300' : 'text-white/60'
                                    }`}>{sub.name}</h4>
                                    
                                    {/* Subtitle / category */}
                                    <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                                      <span>{sub.type}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Difficulty & Interactive Status Menu */}
                                <div className="flex items-center gap-3">
                                  
                                  {/* Difficulty Badge */}
                                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border tracking-wide hidden sm:inline ${getDifficultyStyles(sub.difficulty)}`}>
                                    {sub.difficulty}
                                  </span>

                                  {/* Status Selector Button */}
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Toggle status selection popup
                                        setActiveMenuSubtopicId(activeMenuSubtopicId === sub.id ? null : sub.id);
                                      }}
                                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all select-none hover:scale-102 ${
                                        isSubCompleted
                                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                          : isSubActive
                                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.1)]'
                                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60'
                                      }`}
                                    >
                                      {isSubCompleted && <CheckCircle className="w-3.5 h-3.5" />}
                                      {isSubActive && <Sparkles className="w-3.5 h-3.5 animate-spin" />}
                                      {isSubLocked && <Lock className="w-3.5 h-3.5" />}
                                      <span>{sub.status}</span>
                                      <ChevronDown className="w-3 h-3" />
                                    </button>

                                    {/* Action Dropdown Menu */}
                                    <AnimatePresence>
                                      {activeMenuSubtopicId === sub.id && (
                                        <>
                                          {/* Backdrop to close menu */}
                                          <div 
                                            className="fixed inset-0 z-40" 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveMenuSubtopicId(null);
                                            }}
                                          />
                                          
                                          <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-1 w-36 rounded-xl border border-white/15 bg-[#0b0b14] p-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                                          >
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleStatusChange(sub.id, 'Completed'); }}
                                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-2"
                                            >
                                              <CheckCircle2 className="w-3.5 h-3.5" />
                                              Complete
                                            </button>
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleStatusChange(sub.id, 'In Progress'); }}
                                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-purple-400 hover:bg-purple-500/10 transition-colors flex items-center gap-2"
                                            >
                                              <Circle className="w-3.5 h-3.5" />
                                              In Progress
                                            </button>
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleStatusChange(sub.id, 'Locked'); }}
                                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-white/40 hover:bg-white/5 transition-colors flex items-center gap-2"
                                            >
                                              <Lock className="w-3.5 h-3.5" />
                                              Lock
                                            </button>
                                          </motion.div>
                                        </>
                                      )}
                                    </AnimatePresence>
                                  </div>

                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* --- Footer Tips --- */}
      <div className="mt-12 flex justify-center">
        <div className="flex items-start gap-2.5 max-w-lg bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-xs text-white/40 font-medium">
          <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-white/60">Unlock Mechanism:</strong> Marking all subtopics inside a module as <span className="text-emerald-400">Completed</span> (100% progress) will automatically unlock the next module down the roadmap hierarchy.
          </p>
        </div>
      </div>
    </div>
  );
}
