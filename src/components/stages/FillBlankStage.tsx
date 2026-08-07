"use client";

import { useState } from 'react';
import type { StageComponentProps, FillBlankStageData } from '@/types/engine';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, PenLine, Code2 } from 'lucide-react';

export function FillBlankStage({ data, onComplete }: StageComponentProps<FillBlankStageData>) {
  const challenge = data.challenge || ((data as any).content && (data as any).content.challenge);

  if (challenge) {
    // Ensure the child component can find it at data.challenge
    const updatedData = { ...data, challenge };
    return <CodeFillBlankChallenge data={updatedData} onComplete={onComplete} />;
  }
  
  return <StandardFillBlank data={data} onComplete={onComplete} />;
}

// --- Standard Sentences ---
function StandardFillBlank({ data, onComplete }: StageComponentProps<FillBlankStageData>) {
  const rawSentences = data.sentences || ((data as any).content && (data as any).content.sentences);
  const sentences = Array.isArray(rawSentences) && rawSentences.length > 0
    ? rawSentences
    : [
        {
          beforeBlank: (data as any).beforeBlank || (data as any).content?.beforeBlank || "Fill in the blank: ",
          afterBlank: (data as any).afterBlank || (data as any).content?.afterBlank || ".",
          answer: (data as any).answer || (data as any).content?.answer || "code",
          hint: (data as any).hint || (data as any).content?.hint || "Think about syntax"
        }
      ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);

  const safeIdx = Math.min(currentIdx, sentences.length - 1);
  const item = sentences[safeIdx] || { beforeBlank: "", afterBlank: "", answer: "", hint: "" };

  const handleCheck = () => {
    const correct = userInput.trim().toLowerCase() === item.answer.trim().toLowerCase();
    setIsCorrect(correct);
    setRevealed(true);
    if (correct) setTotalCorrect((c) => c + 1);
  };

  const handleNext = () => {
    if (currentIdx < sentences.length - 1) {
      setCurrentIdx((i) => i + 1);
      setUserInput('');
      setRevealed(false);
      setIsCorrect(false);
    } else {
      const finalCorrect = totalCorrect + (isCorrect ? 1 : 0);
      onComplete({
        correct: finalCorrect >= Math.ceil(sentences.length * 0.6),
        score: Math.round((finalCorrect / sentences.length) * 100),
      });
    }
  };

  if (!item) return null;

  const parts = item.text.split('___');

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="glass-panel p-4 md:p-6 lg:p-8 rounded-2xl border-white/10 w-full max-w-2xl relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div className="flex items-center gap-3">
                <PenLine className="w-5 h-5 text-indigo-400" />
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                  Fill {currentIdx + 1} of {sentences.length}
                </span>
              </div>
            </div>

            <div className="text-lg md:text-xl font-bold text-white mb-4 lg:mb-6 leading-relaxed flex flex-wrap items-center gap-2">
              {parts.map((part: string, i: number) => (
                <span key={i} className="flex items-center gap-2">
                  {part}
                  {i < parts.length - 1 && (
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !revealed && handleCheck()}
                      disabled={revealed}
                      placeholder="..."
                      className={`inline-block w-40 px-4 py-2 rounded-xl text-lg font-mono text-center transition-all outline-none border-2 ${
                        revealed
                          ? isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                            : 'bg-red-500/10 border-red-500/50 text-red-300'
                          : 'bg-white/5 border-white/20 text-white focus:border-primary/50'
                      }`}
                    />
                  )}
                </span>
              ))}
            </div>

            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                {isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                <span className={`font-medium text-sm ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                  {isCorrect ? 'Correct!' : `The answer was: ${item.answer}`}
                </span>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-3 md:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] z-50 flex items-center justify-end gap-3">
        {!revealed ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCheck}
            disabled={!userInput.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-40 text-white font-bold text-base rounded-xl shadow-[0_0_15px_var(--color-primary)] transition-all"
          >
            Check Answer
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 text-white font-bold text-base rounded-xl shadow-[0_0_15px_var(--color-primary)] transition-all"
          >
            {currentIdx < sentences.length - 1 ? 'Next' : 'Complete'}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}

// --- Code Fill Blank Challenge ---
function CodeFillBlankChallenge({ data, onComplete }: StageComponentProps<FillBlankStageData>) {
  const challenge = data.challenge!;
  
  // Extract answers into an array to map to the blanks
  const answerKeys = Object.keys(challenge.answers);
  const correctAnswers = answerKeys.map(k => challenge.answers[k]);
  
  // Keep track of user inputs per blank
  const [inputs, setInputs] = useState<string[]>(Array(correctAnswers.length).fill(''));
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleInputChange = (idx: number, val: string) => {
    const newInputs = [...inputs];
    newInputs[idx] = val;
    setInputs(newInputs);
  };

  const handleCheck = () => {
    const res = inputs.map((val, idx) => val.trim() === correctAnswers[idx].trim());
    setResults(res);
    setRevealed(true);
  };

  const handleNext = () => {
    const isAllCorrect = results.every(Boolean);
    onComplete({
      correct: isAllCorrect,
      score: isAllCorrect ? 100 : 0,
      feedback: isAllCorrect ? "Perfect code!" : "Some blanks were incorrect.",
    });
  };

  let blankCounter = 0;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 md:p-6 lg:p-8 rounded-2xl border-white/10 w-full max-w-4xl relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-4 mb-4 lg:mb-6 border-b border-white/10 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
              <Code2 className="w-7 h-7 text-blue-300" />
            </div>
            <div>
              <span className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-1 block">Code Fill-in-the-Blank</span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {challenge.title}
              </h2>
            </div>
          </div>
          
          <p className="text-white/80 text-lg mb-8 leading-relaxed font-medium">
            {challenge.question}
          </p>

          {/* Code Editor Mock */}
          <div className="bg-[#0f111a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mb-8 font-mono text-base">
            <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex items-center gap-2">
               <div className="flex gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-red-500/80" />
                 <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                 <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
               </div>
               <span className="ml-4 text-white/40 text-xs font-bold uppercase tracking-widest">script.py</span>
            </div>
            <div className="p-6 text-blue-200/90 leading-loose">
              {challenge.template.map((line, lIdx) => {
                const parts = line.split('____');
                if (parts.length === 1) {
                  return <div key={lIdx} className="min-h-[1.5rem]">{line}</div>;
                }
                
                return (
                  <div key={lIdx} className="min-h-[1.5rem] flex flex-wrap items-center">
                    {parts.map((part, pIdx) => {
                      const isLast = pIdx === parts.length - 1;
                      if (isLast) return <span key={pIdx}>{part}</span>;
                      
                      const currentBlankIdx = blankCounter++;
                      return (
                        <span key={pIdx} className="flex items-center">
                          {part}
                          <input
                            type="text"
                            value={inputs[currentBlankIdx]}
                            onChange={(e) => handleInputChange(currentBlankIdx, e.target.value)}
                            disabled={revealed}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'copy';
                              setDragOverIdx(currentBlankIdx);
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              setDragOverIdx(null);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragOverIdx(null);
                              const val = e.dataTransfer.getData("text/plain");
                              if (val) handleInputChange(currentBlankIdx, val);
                            }}
                            className={`mx-2 inline-block px-3 py-1 bg-white/10 border-b-2 outline-none text-white transition-all text-center placeholder:text-white/20 min-w-[120px] ${
                              revealed 
                                ? results[currentBlankIdx]
                                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                                  : 'border-red-500 text-red-400 bg-red-500/10'
                                : dragOverIdx === currentBlankIdx
                                  ? 'border-fuchsia-500 bg-fuchsia-500/20'
                                  : 'border-blue-500/50 focus:border-blue-400 focus:bg-white/20'
                            }`}
                            placeholder="____"
                          />
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Options Bag */}
          {challenge.options && !revealed && (
            <div className="mb-8">
              <h4 className="text-white/40 uppercase tracking-widest text-xs font-bold mb-4">Available Snippets</h4>
              <div className="flex flex-wrap gap-3">
                {challenge.options.map((opt, i) => (
                  <div 
                    key={i} 
                    draggable={!revealed}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", opt);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-blue-200 cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-white/20 transition-all select-none shadow-sm hover:shadow-md"
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border ${
                results.every(Boolean) ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <h3 className={`font-bold text-lg mb-2 flex items-center gap-2 ${results.every(Boolean) ? 'text-emerald-400' : 'text-red-400'}`}>
                {results.every(Boolean) ? <CheckCircle /> : <XCircle />}
                {results.every(Boolean) ? 'Perfect!' : 'Some blanks are incorrect.'}
              </h3>
              {!results.every(Boolean) && (
                <div className="mt-4 space-y-2">
                  <p className="text-white/70 text-sm">Correct answers:</p>
                  <ul className="list-disc pl-5 text-red-200/80 font-mono text-sm">
                    {correctAnswers.map((ans, i) => (
                      !results[i] && <li key={i}>Blank {i + 1}: {ans}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-3 md:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] z-50 flex items-center justify-end gap-3">
        {!revealed ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCheck}
            disabled={inputs.some(v => !v.trim())}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-40 text-white font-bold text-base rounded-xl shadow-[0_0_15px_var(--color-primary)] transition-all"
          >
            Check Code
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 text-white font-bold text-base rounded-xl shadow-[0_0_15px_var(--color-primary)] transition-all"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
