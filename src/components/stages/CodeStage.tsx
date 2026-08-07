"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import type { StageComponentProps, CodeStageData } from '@/types/engine';
import { useLearningStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, CheckCircle, XCircle, ArrowRight, Lightbulb, Code, 
  Terminal, Trash2, Loader2, RefreshCw, Sparkles, Brain, 
  Award, Trophy, Timer, AlertOctagon, Heart, ChevronRight, Wand2, 
  Maximize, Settings, GripVertical, ChevronDown, ChevronUp,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { executePythonCode, parseErrors, validateChallenge, initPyodide, mergeStarterAndSolution } from '@/lib/execution/pyodideRunner';
import clsx from 'clsx';

interface ConsoleLog {
  type: 'input' | 'output' | 'error' | 'system' | 'tutor';
  text: string;
}

export function CodeStage({ data, onComplete }: StageComponentProps<CodeStageData>) {
  const rawChallenge = (data as any)?.challenge || (data as any)?.content?.challenge || data || {};

  const challenge = {
    title: rawChallenge.title || (data as any)?.title || (data as any)?.content?.title || "Coding Challenge",
    question: rawChallenge.question || rawChallenge.description || (data as any)?.question || (data as any)?.content?.explanation || (data as any)?.explanation || "Complete the coding challenge below.",
    description: rawChallenge.description || rawChallenge.question || (data as any)?.explanation || "",
    starterCode: rawChallenge.starterCode || (data as any)?.starterCode || (data as any)?.content?.starterCode || "# Write your Python code here\n",
    solution: rawChallenge.solution || (data as any)?.solution || (data as any)?.content?.solution || "",
    explanation: rawChallenge.explanation || (data as any)?.explanation || (data as any)?.content?.explanation || "Write your code and click Run to test your solution.",
    language: rawChallenge.language || (data as any)?.language || "python",
    hints: rawChallenge.hints || (data as any)?.hints || [rawChallenge.hint || (data as any)?.hint || "Review your variable logic and syntax."],
    hint: rawChallenge.hint || (data as any)?.hint || "Review your variable logic and syntax.",
    concepts: rawChallenge.concepts || (data as any)?.concepts || ["Syntax", "Logic"]
  };

  const { currentUserInput, setCurrentUserInput, addXp } = useLearningStore();
  
  // Base states
  const [code, setCode] = useState(currentUserInput || challenge.starterCode);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Game states
  const [attemptCount, setAttemptCount] = useState(0);
  const [avatarState, setAvatarState] = useState<'idle' | 'thinking' | 'correct' | 'incorrect' | 'typing'>('idle');
  const [tutorSpeech, setTutorSpeech] = useState<string>(
    challenge.explanation || "Hey there! Ready to write some code? I'm here to guide you step-by-step. Go ahead, type your code and run it!"
  );
  const [isMentorOpen, setIsMentorOpen] = useState(true);
  const [hasNewMentorMessage, setHasNewMentorMessage] = useState(false);
  
  // Terminal logs state
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([
    { type: 'system', text: `Console sandbox initialized. Language: ${challenge.language || 'python'}` }
  ]);

  // Gamification overlay
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Layout States
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [leftWidth, setLeftWidth] = useState(32); // percentage
  const [editorHeight, setEditorHeight] = useState(70); // percentage
  const [isDraggingH, setIsDraggingH] = useState(false);
  const [isDraggingV, setIsDraggingV] = useState(false);
  
  const startTime = useRef(Date.now());
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const hasRevealedRef = useRef(false);
  
  // Monaco editor refs
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // Sync input
  useEffect(() => {
    setCurrentUserInput(code);
  }, [code, setCurrentUserInput]);

  // Terminal scroll
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  // Preload Pyodide
  useEffect(() => {
    initPyodide();
  }, []);

  // Set new mentor message glow
  useEffect(() => {
    if (!isMentorOpen && tutorSpeech !== challenge.explanation) {
      setHasNewMentorMessage(true);
    }
  }, [tutorSpeech, isMentorOpen, challenge.explanation]);

  // Resizing Logic
  const handleHorizontalDrag = useCallback((e: MouseEvent) => {
    if (!outerContainerRef.current) return;
    const rect = outerContainerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newWidth = (offsetX / rect.width) * 100;
    if (newWidth >= 15 && newWidth <= 75) {
      setLeftWidth(newWidth);
    }
  }, []);

  const handleVerticalDrag = useCallback((e: MouseEvent) => {
    if (!rightPanelRef.current) return;
    const rect = rightPanelRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const newHeight = (offsetY / rect.height) * 100;
    if (newHeight >= 20 && newHeight <= 85) {
      setEditorHeight(newHeight);
    }
  }, []);

  useEffect(() => {
    if (isDraggingH) {
      const onMove = (e: MouseEvent) => handleHorizontalDrag(e);
      const onUp = () => setIsDraggingH(false);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      }
    }
  }, [isDraggingH, handleHorizontalDrag]);

  useEffect(() => {
    if (isDraggingV) {
      const onMove = (e: MouseEvent) => handleVerticalDrag(e);
      const onUp = () => setIsDraggingV(false);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      }
    }
  }, [isDraggingV, handleVerticalDrag]);


  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const clearMonacoMarkers = () => {
    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      monacoRef.current.editor.setModelMarkers(model, "owner", []);
    }
  };

  const setMonacoErrorMarker = (lineNum: number, message: string) => {
    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      monacoRef.current.editor.setModelMarkers(model, "owner", [
        {
          startLineNumber: lineNum,
          startColumn: 1,
          endLineNumber: lineNum,
          endColumn: 100,
          message: message,
          severity: monacoRef.current.MarkerSeverity.Error,
        }
      ]);
    }
  };

  const startSolutionReveal = async () => {
    if (isTyping) return;
    setIsTyping(true);
    hasRevealedRef.current = true;
    setAvatarState('typing');
    setTutorSpeech("Watch closely! I am typing out the correct solution code and explaining it line-by-line.");
    setIsMentorOpen(true);
    
    setConsoleLogs([
      { type: 'system', text: "🤖 AI tutor is typing the correct solution..." }
    ]);
    clearMonacoMarkers();

    const solutionCode = mergeStarterAndSolution(challenge.starterCode || "", challenge.solution || "");
    let currentTyped = "";
    const chars = solutionCode.split("");

    for (let i = 0; i < chars.length; i++) {
      currentTyped += chars[i];
      setCode(currentTyped);
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    setIsTyping(false);
    setTutorSpeech("Done! Here is the completed solution. Go ahead and click the 'Run Code' button to verify it!");
  };

  const handleRun = async (overrideCode?: string) => {
    const codeToRun = overrideCode || code;
    
    setIsRunning(true);
    setAvatarState('thinking');
    clearMonacoMarkers();

    const currentAttempt = attemptCount + 1;
    setAttemptCount(currentAttempt);

    const logs: ConsoleLog[] = [
      ...consoleLogs,
      { type: 'input', text: `python main.py` }
    ];
    setConsoleLogs(logs);

    let executionOutput = "";
    let rawError: string | null = null;

    try {
      const result = await executePythonCode(codeToRun, challenge.language, challenge.solution);
      if (result.error) {
        rawError = result.error;
      } else {
        executionOutput = result.output || "";
      }
    } catch (err: any) {
      rawError = err.message;
    }

    if (rawError) {
      setAvatarState('incorrect');
      const friendlyError = parseErrors(rawError);
      
      const execMatches = Array.from(rawError.matchAll(/File "<(?:exec|string)>", line (\d+)/g));
      let errorLine = 1;
      if (execMatches.length > 0) {
        errorLine = parseInt(execMatches[execMatches.length - 1][1]);
        setMonacoErrorMarker(errorLine, friendlyError);
      } else {
        const lineMatches = Array.from(rawError.matchAll(/line (\d+)/gi));
        if (lineMatches.length > 0) {
          const userLineMatch = lineMatches.find(m => m[1] !== '573');
          errorLine = userLineMatch ? parseInt(userLineMatch[1]) : parseInt(lineMatches[lineMatches.length - 1][1]);
          setMonacoErrorMarker(errorLine, friendlyError);
        }
      }

      logs.push({ type: 'error', text: `Traceback (most recent call last):\n  line ${errorLine} in main.py\nRuntimeError: ${rawError}` });
      logs.push({ type: 'tutor', text: `🤖 Tutor advice: ${friendlyError}` });

      setConsoleLogs([...logs]);
      setIsCorrect(false);
      setIsRunning(false);

      if (overrideCode) {
        setTutorSpeech(`I typed the solution, but there was an unexpected execution error on line ${errorLine}.\n\n🛠️ Please check the traceback logs in the console.`);
        return;
      }

      if (currentAttempt === 1) {
        const firstHint = challenge.hints?.[0] || challenge.hint || "Check your variable assignments and syntax.";
        setTutorSpeech(`Oops! It looks like there's an error on line ${errorLine}.\n\n💡 Hint: ${firstHint}`);
      } else if (currentAttempt === 2) {
        const secondHint = challenge.hints?.[1] || "Ensure you are matching the expected logic variables.";
        setTutorSpeech(`Ah, almost there, but still hitting a snag on line ${errorLine}.\n\n🛠️ Logic check: ${secondHint}`);
      } else {
        if (!hasRevealedRef.current) {
          await startSolutionReveal();
        } else {
          setTutorSpeech(`It seems the code is still throwing an error on line ${errorLine} after the reveal.\n\n🛠️ Please check the traceback logs in the console or reset the code.`);
        }
      }
      setIsMentorOpen(true);
      return;
    }

    logs.push({ type: 'output', text: executionOutput || "(Execution finished successfully with no console outputs)" });

    let validationResult = validateChallenge(
      window.pyodide, 
      codeToRun, 
      challenge, 
      executionOutput
    );

    if (!validationResult.success && hasRevealedRef.current) {
      const cleanRun = codeToRun.replace(/\s+/g, '');
      const cleanSol = (challenge.solution || '').replace(/\s+/g, '');
      const cleanMerged = mergeStarterAndSolution(challenge.starterCode || "", challenge.solution || "").replace(/\s+/g, '');
      if (cleanRun === cleanSol || cleanRun.includes(cleanSol) || cleanRun === cleanMerged || cleanRun.includes(cleanMerged)) {
        validationResult = { success: true, message: "System solution verified!" };
      }
    }

    if (validationResult.success) {
      setAvatarState('correct');
      setIsCorrect(true);
      logs.push({ type: 'system', text: `✅ Tests passed! ${validationResult.message}` });
      setTutorSpeech("Brilliant! You solved it correctly. Your logic is clean and exact. Keep it up!");
      setIsMentorOpen(true);
      
      setTimeout(() => {
        addXp(50);
        setShowCelebration(true);
      }, 1000);
    } else {
      setAvatarState('incorrect');
      setIsCorrect(false);
      logs.push({ type: 'error', text: `❌ Validation Failed: ${validationResult.message}` });
      
      if (validationResult.expected) {
        logs.push({ type: 'system', text: `💡 Expected:\n${validationResult.expected}\n\n💡 Received:\n${validationResult.received || 'None'}` });
      }

      if (overrideCode) {
        setTutorSpeech(`I typed the solution, but it failed verification: ${validationResult.message}.\n\n🛠️ Please check the logs in the console.`);
        setConsoleLogs([...logs]);
        setIsRunning(false);
        return;
      }

      if (currentAttempt === 1) {
        const firstHint = challenge.hints?.[0] || challenge.hint || "Review your arrays and values.";
        setTutorSpeech(`Not quite right! Your values or logic are off.\n\n💡 Concept Hint: ${firstHint}`);
      } else if (currentAttempt === 2) {
        const secondHint = challenge.hints?.[1] || "Check your variable declarations and indices.";
        setTutorSpeech(`We have a logic mismatch here.\n\n🎯 Expected values: ${challenge.hints?.[1] || 'Double-check coordinate dimensions.'}`);
      } else {
        if (!hasRevealedRef.current) {
          await startSolutionReveal();
        } else {
          setTutorSpeech(`The code still failed verification after the reveal. Try pressing Reset to reload the clean template.`);
        }
      }
      setIsMentorOpen(true);
    }

    setConsoleLogs([...logs]);
    setIsRunning(false);
  };

  const handleClearConsole = () => setConsoleLogs([{ type: 'system', text: 'Console cleared.' }]);

  const handleResetCode = () => {
    if (window.confirm("Are you sure you want to reset your code to the starter template?")) {
      setCode(challenge.starterCode);
      setIsCorrect(null);
      clearMonacoMarkers();
      setAttemptCount(0);
      hasRevealedRef.current = false;
      setAvatarState('idle');
      setTutorSpeech(challenge.explanation || "Starter template reloaded. Ready to write code!");
    }
  };

  const handleSubmit = () => {
    onComplete({
      correct: isCorrect ?? false,
      score: isCorrect ? 100 : 20,
      timeTaken: Date.now() - startTime.current,
    });
  };

  return (
    <div 
      ref={outerContainerRef}
      className="w-full h-full flex overflow-hidden bg-[#02040A] text-zinc-100 font-sans select-none relative"
      style={{ cursor: isDraggingH ? 'col-resize' : isDraggingV ? 'row-resize' : 'default' }}
    >
      {/* Global Drag Overlay (Prevents Monaco Editor from capturing mouse events during drag) */}
      {(isDraggingH || isDraggingV) && (
        <div 
          className="fixed inset-0 z-[99999] select-none"
          style={{ cursor: isDraggingH ? 'col-resize' : 'row-resize' }}
        />
      )}
      
      {/* ----------------------------- */}
      {/* LEFT PANEL (Learning Context) */}
      {/* ----------------------------- */}
      <div 
        className={clsx(
          "flex flex-col h-full bg-[#05070D] border-r border-white/5 relative z-10 transition-all duration-200",
          isSidebarMinimized && "hidden"
        )}
        style={{ width: `${leftWidth}%`, minWidth: '250px' }}
      >
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-6 flex flex-col gap-8 pb-32">
          
          {/* 1. Challenge Card */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-3xl font-black tracking-tight text-white leading-tight">
                {challenge.title || "Interactive Practice"}
              </h1>
              <button
                onClick={() => setIsSidebarMinimized(true)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 mt-1"
                title="Minimize Sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>
            <div className="text-[14px] text-zinc-400 leading-relaxed font-medium">
              {(challenge.question || challenge.description || "").split('\n').map((para: string, i: number) => (
                <p key={i} className="mb-3">{para}</p>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
               {(challenge.concepts && challenge.concepts.length > 0 ? challenge.concepts : ["Syntax", "Logic"]).map((concept: string, i: number) => (
                 <span key={i} className="text-[11px] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-zinc-300 font-bold shadow-sm">
                   {concept}
                 </span>
               ))}
            </div>
          </div>
        </div>

        {/* AI Mentor - Collapsible bottom card */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#05070D] via-[#05070D] to-transparent z-20 pointer-events-none">
          <motion.div 
            className="bg-[#0A0E1A] border border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto relative ring-1 ring-white/5"
            animate={{ height: isMentorOpen ? 'auto' : '64px' }}
            initial={false}
          >
            {/* Glow if new message */}
            {hasNewMentorMessage && !isMentorOpen && (
              <div className="absolute top-0 inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
            )}
            
            {/* Header (Clickable) */}
            <div 
              className="h-16 px-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => {
                setIsMentorOpen(!isMentorOpen);
                setHasNewMentorMessage(false);
              }}
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-8 h-8 rounded-xl flex items-center justify-center border",
                  avatarState === 'correct' ? "bg-emerald-500/20 border-emerald-500/40" :
                  avatarState === 'incorrect' ? "bg-red-500/20 border-red-500/40" :
                  avatarState === 'thinking' ? "bg-indigo-500/20 border-indigo-500/40 animate-pulse" :
                  "bg-white/5 border-white/10"
                )}>
                  {avatarState === 'correct' ? <Sparkles className="w-4 h-4 text-emerald-400" /> :
                   avatarState === 'incorrect' ? <AlertOctagon className="w-4 h-4 text-red-400" /> :
                   <Brain className="w-4 h-4 text-indigo-400" />}
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                    AI Mentor 
                    {hasNewMentorMessage && !isMentorOpen && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                  </h4>
                </div>
              </div>
              <div className="text-zinc-500">
                {isMentorOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>

            {/* Content Body */}
            <AnimatePresence>
              {isMentorOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 pb-4 border-t border-white/5 pt-3"
                >
                  <div className="text-[13px] text-zinc-300 leading-relaxed font-medium select-text whitespace-pre-wrap">
                    {tutorSpeech}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

      </div>

      {/* ----------------------------- */}
      {/* DRAG HANDLE (Horizontal)      */}
      {/* ----------------------------- */}
      {!isSidebarMinimized && (
        <div 
          className={clsx(
            "w-3 -mx-1.5 h-full cursor-col-resize z-50 transition-colors flex justify-center items-center group relative select-none shrink-0",
            isDraggingH ? "bg-indigo-500/30" : "hover:bg-indigo-500/20"
          )}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDraggingH(true);
          }}
          title="Drag to resize sidebar"
        >
          <div className={clsx(
            "w-1 h-12 rounded-full transition-colors",
            isDraggingH ? "bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "bg-white/10 group-hover:bg-indigo-400/80"
          )} />
        </div>
      )}

      {/* ----------------------------- */}
      {/* RIGHT PANEL (Code Workspace)  */}
      {/* ----------------------------- */}
      <div 
        className="flex flex-col h-full bg-[#02040A] relative z-0 flex-1"
        style={{ width: isSidebarMinimized ? '100%' : `calc(${100 - leftWidth}% - 6px)` }}
        ref={rightPanelRef}
      >
        {/* Toolbar */}
        <div className="h-14 border-b border-white/10 bg-[#060810] px-4 flex items-center justify-between shrink-0 shadow-sm relative z-20">
          <div className="flex items-center gap-3">
             {isSidebarMinimized && (
               <button
                 onClick={() => setIsSidebarMinimized(false)}
                 className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition-colors text-[12px] font-bold flex items-center gap-2 cursor-pointer"
                 title="Expand Sidebar"
               >
                 <PanelLeftOpen className="w-4 h-4 text-indigo-400" /> Show Task & Instructions
               </button>
             )}
             <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[12px] font-mono text-zinc-200 shadow-inner flex items-center gap-2">
               <span className="text-indigo-400 font-black">{}</span> main.py
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button
              onClick={handleResetCode}
              disabled={isTyping}
              className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-[12px] font-bold flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={() => handleRun()}
              disabled={isRunning || isTyping}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white text-[12px] font-black uppercase tracking-wider rounded-lg border border-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all cursor-pointer"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              Run Code
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <div 
          className="relative bg-[#02040A] w-full"
          style={{ height: `${editorHeight}%` }}
        >
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={(v) => !isTyping && setCode(v ?? '')}
            theme="vs-dark"
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              fontFamily: "var(--font-mono), 'Fira Code', 'JetBrains Mono', Menlo, monospace",
              minimap: { enabled: false },
              padding: { top: 24, bottom: 24 },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              roundedSelection: true,
              automaticLayout: true,
              readOnly: isTyping || isRunning,
              tabSize: 4,
              scrollbar: { vertical: 'visible', horizontal: 'visible' },
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth'
            }}
          />
        </div>

        {/* DRAG HANDLE (Vertical) */}
        <div 
          className={clsx(
            "h-3 -my-1.5 w-full cursor-row-resize z-50 transition-colors flex justify-center items-center group select-none shrink-0",
            isDraggingV ? "bg-indigo-500/30" : "hover:bg-indigo-500/20"
          )}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDraggingV(true);
          }}
          title="Drag to resize terminal height"
        >
          <div className={clsx(
            "h-1 w-12 rounded-full transition-colors",
            isDraggingV ? "bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "bg-white/10 group-hover:bg-indigo-400/80"
          )} />
        </div>

        {/* Output Panel (Logs) */}
        <div 
          className="flex-1 bg-[#05070D] flex flex-col overflow-hidden shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)] border-t border-white/5 relative"
        >
          <div className="h-9 px-4 border-b border-white/5 bg-[#020308] flex items-center justify-between shrink-0">
            <span className="text-[10px] font-mono tracking-[0.15em] font-extrabold text-zinc-500 uppercase flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Output Console
            </span>
            <button
              onClick={handleClearConsole}
              className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto font-mono text-[12px] leading-relaxed space-y-2 select-text scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {consoleLogs.map((log, idx) => (
              <div 
                key={idx} 
                className={clsx(
                  "whitespace-pre-wrap break-all px-3 py-2 rounded-lg border-l-2 shadow-sm",
                  log.type === 'input' ? "text-indigo-300 border-indigo-500 bg-indigo-500/[0.04]" :
                  log.type === 'error' ? "text-red-300 border-red-500 bg-red-500/[0.04]" :
                  log.type === 'system' ? "text-cyan-300 border-cyan-500 bg-cyan-500/[0.04]" :
                  log.type === 'tutor' ? "text-amber-300 border-amber-500 bg-amber-500/[0.04]" :
                  "text-zinc-400 border-zinc-700 bg-zinc-800/[0.15]"
                )}
              >
                {log.type === 'input' && <span className="text-indigo-500/50 mr-2 font-black">❯</span>}
                {log.text}
              </div>
            ))}
            {isRunning && (
              <div className="text-indigo-400/80 animate-pulse flex items-center gap-2 px-3 py-2 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sandbox executing...
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>

      </div>

      {/* Global Control bar - Success State */}
      {isCorrect === true && (
        <div className="shrink-0 bg-[#0A0D16]/95 backdrop-blur-2xl border-t border-white/10 p-5 flex items-center justify-end gap-5 select-none z-50 absolute bottom-0 left-0 right-0 shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            className="flex items-center gap-3 px-10 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black text-[13px] font-black uppercase tracking-wider rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
          >
            Advance to Next Module <ArrowRight className="w-4.5 h-4.5 stroke-[3]" />
          </motion.button>
        </div>
      )}

      {/* Gamified XP Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#02040A]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="max-w-md w-full bg-[#0A0D15] border border-white/10 p-10 rounded-[2rem] relative shadow-[0_30px_80px_rgba(0,0,0,0.8)] flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500" />
              <div className="absolute top-0 p-48 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />

              <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-[inset_0_0_20px_rgba(16,185,129,0.1),_0_0_40px_rgba(16,185,129,0.15)] relative">
                <div className="absolute inset-0 rounded-3xl bg-emerald-500/10 animate-ping opacity-20" />
                <Trophy className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
              </div>

              <span className="text-[10px] px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold uppercase tracking-[0.25em] mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                Challenge Mastered
              </span>

              <h2 className="text-3xl font-black text-white leading-tight tracking-tighter mb-2">
                Outstanding Work!
              </h2>
              
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 my-6 flex items-center gap-2 drop-shadow-sm">
                <Sparkles className="w-8 h-8 text-emerald-400" />
                +50 XP
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                className="w-full mt-6 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black text-[14px] uppercase tracking-wider rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                Continue Learning <ChevronRight className="w-5 h-5 stroke-[3]" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
