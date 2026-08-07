"use client";

import { useState, useCallback, useEffect } from 'react';
import type { StageComponentProps, DragDropStageData } from '@/types/engine';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, GripVertical, CheckCircle, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

// Extend the type to handle the JSON structure we discovered
interface Bucket {
  name: string;
  accepts: string[];
}
interface BucketDragDropData extends DragDropStageData {
  content?: {
    question: string;
    buckets: Bucket[];
  };
}

export function DragDropStage({ data, onComplete }: StageComponentProps<BucketDragDropData>) {
  // Check if it's the Bucket format or the old Ordering format
  const isBucketFormat = !!data.content?.buckets;

  // --- BUCKET FORMAT STATE ---
  const [unassignedItems, setUnassignedItems] = useState<string[]>([]);
  const [bucketState, setBucketState] = useState<Record<string, string[]>>({});
  
  // --- ORDERING FORMAT STATE ---
  const correctOrder = data.correctOrder ?? data.items ?? [];
  const initialItems = data.items ?? [...correctOrder].sort(() => Math.random() - 0.5);
  const [items, setItems] = useState<string[]>([]);

  // --- SHARED STATE ---
  const [dragItem, setDragItem] = useState<{ id: string, source: 'unassigned' | string | number } | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (isBucketFormat && data.content) {
      // Gather all accepts into one randomized pool
      const allItems = data.content.buckets.flatMap(b => b.accepts).sort(() => Math.random() - 0.5);
      setUnassignedItems(allItems);
      
      const initialBuckets: Record<string, string[]> = {};
      data.content.buckets.forEach(b => initialBuckets[b.name] = []);
      setBucketState(initialBuckets);
    } else {
      setItems([...initialItems].sort(() => Math.random() - 0.5));
    }
  }, [data]);

  // --- HANDLERS ---
  const handleDragStart = (item: string, source: 'unassigned' | string | number) => {
    if (checked) return;
    setDragItem({ id: item, source });
  };

  const handleDropToBucket = (bucketName: string) => {
    if (!dragItem || dragItem.source === bucketName || checked) return;
    
    // Remove from source
    if (dragItem.source === 'unassigned') {
      setUnassignedItems(prev => prev.filter(i => i !== dragItem.id));
    } else if (typeof dragItem.source === 'string') {
      setBucketState(prev => ({
        ...prev,
        [dragItem.source]: prev[dragItem.source].filter(i => i !== dragItem.id)
      }));
    }

    // Add to destination
    setBucketState(prev => ({
      ...prev,
      [bucketName]: [...prev[bucketName], dragItem.id]
    }));
    
    setDragItem(null);
  };

  const handleDropToUnassigned = () => {
    if (!dragItem || dragItem.source === 'unassigned' || checked) return;
    
    if (typeof dragItem.source === 'string') {
      setBucketState(prev => ({
        ...prev,
        [dragItem.source]: prev[dragItem.source].filter(i => i !== dragItem.id)
      }));
    }
    
    setUnassignedItems(prev => [...prev, dragItem.id]);
    setDragItem(null);
  };

  const handleCheckBucket = () => {
    if (!data.content) return;
    let correct = true;
    
    // Check if unassigned is empty
    if (unassignedItems.length > 0) correct = false;
    
    // Check if every bucket has exact matching items
    data.content.buckets.forEach(b => {
      const currentInBucket = bucketState[b.name] || [];
      const hasAll = b.accepts.every(a => currentInBucket.includes(a));
      const hasNoExtras = currentInBucket.every(c => b.accepts.includes(c));
      if (!hasAll || !hasNoExtras) correct = false;
    });

    setIsCorrect(correct);
    setChecked(true);
    if (correct) confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
  };

  const handleResetBucket = () => {
    if (!data.content) return;
    const allItems = data.content.buckets.flatMap(b => b.accepts).sort(() => Math.random() - 0.5);
    setUnassignedItems(allItems);
    
    const initialBuckets: Record<string, string[]> = {};
    data.content.buckets.forEach(b => initialBuckets[b.name] = []);
    setBucketState(initialBuckets);
    
    setChecked(false);
    setIsCorrect(false);
  };

  if (!isBucketFormat && items.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Configuration Error</h2>
        <p className="text-white/60">This stage is missing data.items or data.content.buckets in the JSON.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 md:p-6 lg:p-8 rounded-2xl border-white/10 w-full max-w-4xl relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-40 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3 mb-4 lg:mb-6 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              <GripVertical className="w-7 h-7 text-orange-300" />
            </div>
            <div>
              <span className="text-orange-400 font-bold uppercase tracking-widest text-xs block">Drag & Drop</span>
              <h2 className="text-lg md:text-xl font-extrabold text-white">
                {isBucketFormat ? data.content?.question : 'Order the Items'}
              </h2>
            </div>
          </div>

          {/* BUCKET FORMAT UI */}
          {isBucketFormat && (
            <div className="flex flex-col gap-8 w-full">
              
              {/* Item Pool */}
              <div 
                className="w-full min-h-[60px] bg-white/5 border-2 border-dashed border-white/20 rounded-xl p-3 md:p-4 flex flex-wrap gap-2 items-center justify-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropToUnassigned}
              >
                {unassignedItems.length === 0 && !checked && (
                  <span className="text-white/30 text-sm font-medium">All items assigned</span>
                )}
                <AnimatePresence>
                  {unassignedItems.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      key={item}
                      draggable={!checked}
                      onDragStart={() => handleDragStart(item, 'unassigned')}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg cursor-grab active:cursor-grabbing text-white text-sm font-medium hover:bg-white/20 transition-colors shadow-md"
                    >
                      {item}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Buckets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {data.content?.buckets.map((bucket) => {
                  const bItems = bucketState[bucket.name] || [];
                  const isBucketCorrect = checked && bItems.every(i => bucket.accepts.includes(i)) && bucket.accepts.every(a => bItems.includes(a));
                  const isBucketWrong = checked && !isBucketCorrect;

                  return (
                    <div 
                      key={bucket.name}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDropToBucket(bucket.name)}
                      className={`min-h-[120px] lg:min-h-[160px] rounded-xl border-2 transition-all p-4 flex flex-col gap-2 ${
                        isBucketCorrect ? 'border-emerald-500/50 bg-emerald-500/10' :
                        isBucketWrong ? 'border-red-500/50 bg-red-500/10' :
                        'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <h3 className="text-base font-bold text-white/90 text-center mb-2">{bucket.name}</h3>
                      <div className="flex flex-col gap-3 flex-1">
                        <AnimatePresence>
                          {bItems.map(item => {
                            const isItemWrong = checked && !bucket.accepts.includes(item);
                            return (
                              <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0, x: isItemWrong ? [-5, 5, -5, 5, 0] : 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={item}
                                draggable={!checked}
                                onDragStart={() => handleDragStart(item, bucket.name)}
                                className={`px-3 py-2 rounded-lg border flex items-center justify-between text-sm font-medium cursor-grab active:cursor-grabbing shadow-md ${
                                  isItemWrong ? 'bg-red-500/20 border-red-500/40 text-white' : 'bg-white/10 border-white/20 text-white'
                                }`}
                              >
                                <span>{item}</span>
                                {checked && isItemWrong && <XCircle className="w-5 h-5 text-red-400" />}
                                {checked && !isItemWrong && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                        {bItems.length === 0 && !checked && (
                          <div className="flex-1 flex items-center justify-center opacity-30 text-sm font-medium">
                            Drop items here
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-3 md:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] z-50 flex items-center justify-end gap-3">
        {checked && !isCorrect && (
          <button onClick={handleResetBucket} className="px-4 py-2 bg-white/5 text-white/60 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
        )}
        {!checked ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCheckBucket}
            disabled={unassignedItems.length > 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 text-white font-bold text-base rounded-xl shadow-[0_0_15px_var(--color-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Answers
          </motion.button>
        ) : isCorrect ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onComplete({ correct: true, score: 100 })}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 text-white font-bold text-base rounded-xl shadow-[0_0_15px_var(--color-primary)] transition-all"
          >
            Complete <ArrowRight className="w-5 h-5" />
          </motion.button>
        ) : null}
      </div>
    </div>
  );
}
