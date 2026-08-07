"use client";

import { useState, useEffect } from 'react';
import type { StageComponentProps, InteractiveSimulationStageData } from '@/types/engine';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, CheckCircle, Cpu, ChevronRight, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CommandSimulation } from './simulation/CommandSimulation';

// ============================================================
// Mode Router — Delegates to the correct sub-simulation
// ============================================================

export function InteractiveSimulationStage({ data, onComplete }: StageComponentProps<InteractiveSimulationStageData>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mode: string = (data as any).mode ?? 'pipeline';

  // --- Mode: Command (grid navigation) ---
  if (mode === 'command') {
    return <CommandSimulation data={data as never} onComplete={onComplete} />;
  }

  // --- Mode: Pipeline (existing) + Scenario (decision-based, same UI) ---
  return <PipelineSimulation data={data} onComplete={onComplete} />;
}

// ============================================================
// Pipeline / Scenario Simulation (existing logic, preserved)
// ============================================================

function PipelineSimulation({ data, onComplete }: StageComponentProps<InteractiveSimulationStageData>) {
  const steps = data.steps ?? [
    { label: 'Initialize', action: 'start', description: 'Begin the process' },
    { label: 'Process', action: 'run', description: 'Execute the main logic' },
    { label: 'Validate', action: 'check', description: 'Verify the results' },
    { label: 'Deploy', action: 'deploy', description: 'Ship to production' },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  
  // New System Engine State
  const [systemState, setSystemState] = useState({ stability: 100, errors: 0, efficiency: 80 });
  const [feedbackMessage, setFeedbackMessage] = useState<{ id: number, text: string, type: 'good' | 'warning' | 'bad' } | null>(null);
  
  // Optional Timer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [timeLeft, setTimeLeft] = useState<number | null>((data as any).timeLimit ?? null);
  const [shake, setShake] = useState(false);

  const isComplete = completedSteps.length === steps.length;
  const isFailed = systemState.stability <= 0 || (timeLeft !== null && timeLeft <= 0);
  const progress = (completedSteps.length / steps.length) * 100;

  useEffect(() => {
    if (timeLeft === null || isFailed || isComplete || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFailed, isComplete]);

  const handleAction = (choice?: { label: string, impact: number, feedback: string }) => {
    if (isAnimating || completedSteps.includes(currentStep) || isFailed) return;
    setIsAnimating(true);

    if (choice) {
      const { impact, feedback } = choice;
      let type: 'good' | 'warning' | 'bad' = 'good';
      
      setSystemState(prev => {
        let newStability = prev.stability;
        let newErrors = prev.errors;
        
        if (impact > 0) {
          newStability = Math.min(100, prev.stability + impact);
          type = 'good';
        } else if (impact < 0) {
          newStability = prev.stability + impact;
          newErrors = prev.errors + 1;
          type = 'bad';
          setShake(true);
          setTimeout(() => setShake(false), 500);
        } else {
          type = 'warning';
        }
        return { ...prev, stability: newStability, errors: newErrors };
      });

      setFeedbackMessage({ id: Date.now(), text: feedback, type });
      setTimeout(() => setFeedbackMessage(null), 3000);
    }

    setTimeout(() => {
      if (systemState.stability + (choice?.impact || 0) <= 0) {
        setIsAnimating(false);
        return;
      }

      const newCompleted = [...completedSteps, currentStep];
      setCompletedSteps(newCompleted);
      setIsAnimating(false);

      if (newCompleted.length === steps.length) {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      } else {
        setCurrentStep(currentStep + 1);
        setSliderValue(((currentStep + 1) / (steps.length - 1)) * 100);
      }
    }, 800);
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderValue(val);
    const stepIdx = Math.round((val / 100) * (steps.length - 1));
    if (!isAnimating && !isFailed) setCurrentStep(stepIdx);
  };

  const handleRetry = () => {
    setSystemState({ stability: 100, errors: 0, efficiency: 80 });
    setCurrentStep(0);
    setCompletedSteps([]);
    setSliderValue(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setTimeLeft((data as any).timeLimit ?? null);
    setFeedbackMessage(null);
    setShake(false);
  };

  const handleComplete = () => {
    const score = Math.max(0, (completedSteps.length / steps.length) * 100 - (systemState.errors * 10) + (systemState.stability * 0.2));
    onComplete({ correct: true, score });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stepChoices = (steps[currentStep] as any)?.choices as { label: string, impact: number, feedback: string }[] | undefined;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, x: shake ? [-10, 10, -10, 10, 0] : 0 }}
          transition={{ x: { duration: 0.4 } }}
          className="glass-panel p-8 md:p-12 rounded-3xl border-white/10 w-full max-w-4xl relative overflow-hidden shadow-2xl bg-black/40 backdrop-blur-3xl"
        >
          {/* Animated Background Blobs */}
          <motion.div 
            animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
            className="absolute top-0 left-0 p-40 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" 
          />
          <motion.div 
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
            className="absolute bottom-0 right-0 p-40 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" 
          />

          {/* System Status Panel */}
          <div className="absolute top-6 right-6 hidden md:block z-30">
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] w-48">
              <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <Cpu className="w-3 h-3" /> System Status
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-white/70">Stability</span>
                    <span className={systemState.stability > 50 ? 'text-emerald-400' : 'text-red-400'}>{systemState.stability}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      className={`h-full ${systemState.stability > 50 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      animate={{ width: `${Math.max(0, systemState.stability)}%` }}
                      transition={{ type: "spring", bounce: 0 }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white/70">Errors</span>
                  <motion.span 
                    key={systemState.errors}
                    initial={{ scale: 1.5, color: '#ef4444' }}
                    animate={{ scale: 1, color: systemState.errors > 0 ? '#f87171' : '#ffffff' }}
                  >
                    {systemState.errors}
                  </motion.span>
                </div>
                {timeLeft !== null && (
                   <div className="flex justify-between text-xs font-bold pt-2 border-t border-white/10">
                     <span className="text-white/70">Time Remaining</span>
                     <span className={timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}>
                       0:{timeLeft.toString().padStart(2, '0')}
                     </span>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6 pr-48 md:pr-0">
            <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              <Cpu className="w-7 h-7 text-cyan-300" />
            </div>
            <div>
              <span className="text-cyan-400 font-bold uppercase tracking-widest text-xs block">Interactive Simulation</span>
              <h2 className="text-2xl font-extrabold text-white">{data.title ?? 'System Pipeline'}</h2>
            </div>
          </div>

          {data.description && (
            <p className="text-white/60 text-sm mb-8 pr-48 md:pr-0">{data.description}</p>
          )}

          {/* Visual Pipeline Track */}
          <div className="relative mb-12 mt-4">
            {/* Track Line */}
            <div className="absolute top-6 left-6 right-6 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full relative shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <motion.div 
               className="absolute top-[26px] -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.9)] z-10"
               animate={{ left: `calc(${progress}% + 12px)` }}
               transition={{ duration: 0.5 }}
            />

            {/* Step Nodes */}
            <div className="relative flex justify-between z-20">
              {steps.map((step, idx) => {
                const isDone = completedSteps.includes(idx);
                const isCurrent = idx === currentStep;
                return (
                  <motion.div
                    key={idx}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      animate={
                        isCurrent && !isDone && !isAnimating ? {
                          scale: [1, 1.05, 1],
                          boxShadow: ['0 0 10px rgba(6,182,212,0.2)', '0 0 20px rgba(6,182,212,0.6)', '0 0 10px rgba(6,182,212,0.2)']
                        } : isCurrent && isAnimating ? { scale: [1, 1.2, 1] } : {}
                      }
                      transition={isCurrent && !isDone && !isAnimating ? { repeat: Infinity, duration: 2 } : { duration: 0.4 }}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all cursor-pointer bg-black/60 backdrop-blur-sm ${
                        isDone
                          ? 'border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                          : isCurrent
                          ? 'border-cyan-400 text-cyan-300'
                          : 'border-white/20 text-white/30 hover:border-white/40'
                      }`}
                      onClick={() => !isAnimating && !isFailed && setCurrentStep(idx)}
                    >
                      {isDone ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-bold">{idx + 1}</span>}
                    </motion.div>
                    <span className={`mt-3 text-xs font-bold text-center max-w-[80px] ${
                      isDone ? 'text-emerald-400' : isCurrent ? 'text-cyan-300 drop-shadow-md' : 'text-white/30'
                    }`}>
                      {step.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Timeline Slider */}
          <div className="mb-10 px-2">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={handleSlider}
              disabled={isFailed}
              className="w-full h-2 appearance-none bg-white/5 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(6,182,212,0.6)] [&::-webkit-slider-thumb]:cursor-grab hover:[&::-webkit-slider-thumb]:scale-110 disabled:opacity-50"
            />
          </div>

          {/* Current Step Detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 relative shadow-inner"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-xl">{steps[currentStep]?.label}</h3>
                {completedSteps.includes(currentStep) && (
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </span>
                )}
              </div>
              <p className="text-white/70 text-sm mb-6">{steps[currentStep]?.description ?? 'Execute this step to progress.'}</p>
              
              {!completedSteps.includes(currentStep) && !isFailed && (
                <div className="flex flex-col gap-3 relative mt-6 border-t border-white/10 pt-6">
                  
                  <AnimatePresence>
                    {feedbackMessage && (
                      <motion.div
                        key={feedbackMessage.id}
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: -20, scale: 1 }}
                        exit={{ opacity: 0, y: -40, scale: 0.9 }}
                        className={`absolute left-1/2 bottom-full mb-2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm shadow-2xl z-30 flex items-center gap-2 backdrop-blur-md ${
                          feedbackMessage.type === 'good' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50' :
                          feedbackMessage.type === 'bad' ? 'bg-red-950/80 text-red-300 border border-red-500/50' :
                          'bg-yellow-950/80 text-yellow-300 border border-yellow-500/50'
                        }`}
                      >
                        {feedbackMessage.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {stepChoices && stepChoices.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {stepChoices.map((choice, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(6,182,212,0.2)" }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleAction(choice)}
                          disabled={isAnimating}
                          className="flex items-center justify-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 text-white font-medium rounded-xl transition-all text-sm group"
                        >
                          <span className="group-hover:text-cyan-300 transition-colors">{choice.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(6,182,212,0.4)" }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleAction()}
                      disabled={isAnimating}
                      className="w-full sm:w-auto self-start flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    >
                      {isAnimating ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" /> Execute Action
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Failure Overlay */}
          <AnimatePresence>
            {isFailed && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center border border-red-500/50 rounded-3xl"
              >
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(239,68,68,0.3)] border border-red-500/30">
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-3 tracking-wide shadow-red-500/50 drop-shadow-lg">SYSTEM FAILURE</h2>
                <p className="text-red-200/80 mb-8 max-w-md text-center text-sm">
                  {timeLeft !== null && timeLeft <= 0 
                    ? "Time limit exceeded. The simulation window has closed." 
                    : "Critical instability detected. The simulation has been terminated to prevent catastrophic failure."}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(239,68,68,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRetry}
                  className="px-8 py-4 bg-red-600/90 hover:bg-red-500 border border-red-400/50 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                >
                  Retry Simulation
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Goal */}
          {data.goalDescription && (
            <div className="mt-6 text-white/40 text-xs flex items-center gap-2 px-2">
              <ChevronRight className="w-3 h-3 text-cyan-500" />
              Objective: {data.goalDescription}
            </div>
          )}
        </motion.div>
      </div>

      {/* Completion Bar */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-emerald-950/90 backdrop-blur-2xl border-t border-emerald-500/30 p-6 shadow-[0_-20px_50px_rgba(16,185,129,0.2)] z-50 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-emerald-400 font-bold text-lg">Simulation Successful</div>
                <div className="text-emerald-200/60 text-sm">All {steps.length} steps completed with {systemState.stability}% stability.</div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(16,185,129,0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleComplete}
              className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
            >
              Finish Stage <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
