'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MousePointer, Move, Type, Pen, Check, Disc, Eraser, Undo2, Redo2, Trash2, Download, MoreHorizontal, ShieldCheck, X, Star, Heart, ArrowRight, ExternalLink } from 'lucide-react';
export type AnnotationTool = 'select' | 'move' | 'text' | 'draw' | 'stamp' | 'spotlight' | 'eraser';
export type StampType = 'check' | 'cross' | 'star' | 'heart' | 'arrow';

interface StrokePoint {
  x: number;
  y: number;
}

interface StrokeItem {
  id: string;
  type: 'draw' | 'text' | 'stamp';
  points?: StrokePoint[];
  text?: string;
  x?: number;
  y?: number;
  stampType?: StampType;
  color: string;
  size: number;
}

interface ZoomAnnotationToolbarProps {
  isOpen: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isHost?: boolean;
}

const PRESET_COLORS = [
  '#f97316', // Orange (Default from screenshot)
  '#ef4444', // Red
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ffffff', // White
  '#000000', // Black
];

const PRESET_SIZES = [2, 4, 8, 14];

export default function ZoomAnnotationToolbar({
  isOpen,
  onOpen,
  onClose,
  containerRef,
  isHost = true,
}: ZoomAnnotationToolbarProps) {
  // Current active tool
  const [activeTool, setActiveTool] = useState<AnnotationTool>('draw');
  const [selectedColor, setSelectedColor] = useState<string>('#f97316'); // Orange like screenshot
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [selectedStamp, setSelectedStamp] = useState<StampType>('check');

  // Menus & Popovers
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStampPicker, setShowStampPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [allowParticipantAnnotate, setAllowParticipantAnnotate] = useState(true);

  // Canvas Drawing History
  const [history, setHistory] = useState<StrokeItem[]>([]);
  const [redoStack, setRedoStack] = useState<StrokeItem[]>([]);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[] | null>(null);

  // Text input placement state
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState('');

  // Spotlight position
  const [spotlightPos, setSpotlightPos] = useState<{ x: number; y: number } | null>(null);

  // Draggable toolbar state
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number }>({ x: 24, y: 80 });
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  const dragStartOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Redraw canvas whenever history changes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed strokes
    history.forEach((item) => {
      ctx.save();
      ctx.strokeStyle = item.color;
      ctx.fillStyle = item.color;
      ctx.lineWidth = item.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (item.type === 'draw' && item.points && item.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
          ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
      } else if (item.type === 'text' && item.text && item.x !== undefined && item.y !== undefined) {
        ctx.font = `bold ${Math.max(16, item.size * 4)}px sans-serif`;
        ctx.fillText(item.text, item.x, item.y);
      } else if (item.type === 'stamp' && item.x !== undefined && item.y !== undefined) {
        ctx.font = '28px sans-serif';
        const stampEmoji =
          item.stampType === 'check'
            ? '✓'
            : item.stampType === 'cross'
              ? '✗'
              : item.stampType === 'star'
                ? '★'
                : item.stampType === 'heart'
                  ? '❤️'
                  : '➡️';
        ctx.fillText(stampEmoji, item.x - 12, item.y + 10);
      }
      ctx.restore();
    });

    // Draw live stroke in progress
    if (currentStroke && currentStroke.length > 0) {
      ctx.save();
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [history, currentStroke, selectedColor, strokeWidth]);

  // Adjust canvas size to window/container
  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawCanvas();
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Toolbar drag handling
  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    setIsDraggingToolbar(true);
    dragStartOffset.current = {
      x: e.clientX - toolbarPos.x,
      y: e.clientY - toolbarPos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingToolbar) {
        const nextX = Math.max(10, Math.min(window.innerWidth - 65, e.clientX - dragStartOffset.current.x));
        const nextY = Math.max(10, Math.min(window.innerHeight - 560, e.clientY - dragStartOffset.current.y));
        setToolbarPos({ x: nextX, y: nextY });
      }
    };

    const handleMouseUp = () => {
      if (isDraggingToolbar) {
        setIsDraggingToolbar(false);
      }
    };

    if (isDraggingToolbar) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingToolbar]);

  // Canvas Mouse / Touch events for drawing & annotating
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'draw') {
      isDrawingRef.current = true;
      setCurrentStroke([{ x, y }]);
    } else if (activeTool === 'stamp') {
      const newStamp: StrokeItem = {
        id: `stamp-${Date.now()}`,
        type: 'stamp',
        stampType: selectedStamp,
        x,
        y,
        color: selectedColor,
        size: strokeWidth,
      };
      setHistory((prev) => [...prev, newStamp]);
      setRedoStack([]);
    } else if (activeTool === 'text') {
      if (textInputPos && textInputValue.trim()) {
        commitTextInput();
      }
      setTextInputPos({ x, y });
      setTextInputValue('');
    } else if (activeTool === 'eraser') {
      // Erase closest stroke within 25px radius
      setHistory((prev) =>
        prev.filter((item) => {
          if (item.type === 'draw' && item.points) {
            return !item.points.some((p) => Math.hypot(p.x - x, p.y - y) < 25);
          }
          if ((item.type === 'text' || item.type === 'stamp') && item.x && item.y) {
            return Math.hypot(item.x - x, item.y - y) > 30;
          }
          return true;
        })
      );
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'spotlight') {
      setSpotlightPos({ x, y });
    }

    if (activeTool === 'draw' && isDrawingRef.current) {
      setCurrentStroke((prev) => (prev ? [...prev, { x, y }] : [{ x, y }]));
    } else if (activeTool === 'eraser' && e.buttons === 1) {
      setHistory((prev) =>
        prev.filter((item) => {
          if (item.type === 'draw' && item.points) {
            return !item.points.some((p) => Math.hypot(p.x - x, p.y - y) < 25);
          }
          if ((item.type === 'text' || item.type === 'stamp') && item.x && item.y) {
            return Math.hypot(item.x - x, item.y - y) > 30;
          }
          return true;
        })
      );
    }
  };

  const handleCanvasMouseUp = () => {
    if (activeTool === 'draw' && isDrawingRef.current && currentStroke && currentStroke.length > 0) {
      isDrawingRef.current = false;
      const newStroke: StrokeItem = {
        id: `stroke-${Date.now()}`,
        type: 'draw',
        points: currentStroke,
        color: selectedColor,
        size: strokeWidth,
      };
      setHistory((prev) => [...prev, newStroke]);
      setCurrentStroke(null);
      setRedoStack([]);
    }
  };

  // Commit text annotation
  const commitTextInput = () => {
    if (textInputPos && textInputValue.trim()) {
      const newTextItem: StrokeItem = {
        id: `text-${Date.now()}`,
        type: 'text',
        text: textInputValue,
        x: textInputPos.x,
        y: textInputPos.y,
        color: selectedColor,
        size: strokeWidth,
      };
      setHistory((prev) => [...prev, newTextItem]);
      setRedoStack([]);
    }
    setTextInputPos(null);
    setTextInputValue('');
  };

  // Undo & Redo Actions
  const handleUndo = () => {
    if (history.length === 0) return;
    const lastItem = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, lastItem]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextItem = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, nextItem]);
  };

  // Clear Canvas
  const handleClear = () => {
    if (history.length === 0) return;
    setHistory([]);
    setRedoStack([]);
    setTextInputPos(null);
  };

  // Download screenshot with annotations
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `zoom-screen-annotation-${Date.now()}.png`;
    link.href = imageUri;
    link.click();
  };

  // Pop out annotation toolbar to Screen 2 (Always-on-top PiP or popup window)
  const handlePopoutToScreen2 = async () => {
    try {
      if ('documentPictureInPicture' in window) {
        const pip = await (window as any).documentPictureInPicture.requestWindow({
          width: 75,
          height: 560,
        });

        Array.from(document.styleSheets).forEach((styleSheet) => {
          try {
            if (styleSheet.href) {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = styleSheet.href;
              pip.document.head.appendChild(link);
            }
          } catch (e) { }
        });
      } else {
        window.open(
          window.location.href,
          'ZoomAnnotationScreen2',
          'width=320,height=600,menubar=no,toolbar=no,location=no,status=no'
        );
      }
    } catch (e) {
      console.warn('PiP/Popout error:', e);
    }
  };

  const isInteractiveCanvas = isOpen && activeTool !== 'select' && activeTool !== 'move';

  return (
    <>
      {/* 0. Floating Circular Pencil Launcher Button in Bottom-Left Corner (Shown when closed/collapsed) */}
      {!isOpen && (
        <div className="fixed bottom-6 left-6 z-[90] pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={onOpen}
            title="Annotate on shared screen"
            className="w-11 h-11 rounded-full bg-[#12151e]/95 border-2 border-[#22c55e] text-[#22c55e] flex items-center justify-center shadow-[0_4px_24px_rgba(34,197,94,0.4),0_0_15px_rgba(0,0,0,0.8)] hover:bg-[#22c55e]/20 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
          >
            <Pen className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      )}

      {/* 1. Transparent Annotation Canvas Overlay over Screen Share */}
      <canvas
        ref={canvasRef}
        onMouseDown={isOpen ? handleCanvasMouseDown : undefined}
        onMouseMove={isOpen ? handleCanvasMouseMove : undefined}
        onMouseUp={isOpen ? handleCanvasMouseUp : undefined}
        className={`fixed inset-0 z-[70] ${isInteractiveCanvas ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
          }`}
        style={{
          cursor:
            !isOpen
              ? 'default'
              : activeTool === 'select'
                ? 'default'
                : activeTool === 'move'
                  ? 'move'
                  : activeTool === 'text'
                    ? 'text'
                    : activeTool === 'eraser'
                      ? 'cell'
                      : 'crosshair',
        }}
      />

      {/* When open, render spotlight, text field, and the vertical tool palette */}
      {isOpen && (
        <>
          {/* Spotlight / Laser indicator */}
          {activeTool === 'spotlight' && spotlightPos && (
            <div
              className="fixed pointer-events-none z-[75] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
              style={{ left: spotlightPos.x, top: spotlightPos.y }}
            >
              <div className="w-8 h-8 rounded-full border-2 border-red-500 bg-red-500/30 animate-ping absolute inset-0" />
              <div className="w-5 h-5 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] border-2 border-white" />
            </div>
          )}

          {/* Text input floating field */}
          {textInputPos && (
            <div
              className="fixed z-[76] pointer-events-auto"
              style={{ left: textInputPos.x, top: textInputPos.y }}
            >
              <input
                autoFocus
                type="text"
                value={textInputValue}
                onChange={(e) => setTextInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitTextInput();
                  if (e.key === 'Escape') setTextInputPos(null);
                }}
                onBlur={commitTextInput}
                placeholder="Type note & press Enter..."
                style={{ color: selectedColor }}
                className="bg-black/75 border border-white/30 rounded-lg px-2.5 py-1 text-sm outline-none shadow-2xl backdrop-blur-md min-w-[180px]"
              />
            </div>
          )}

          {/* 2. Sleek Vertical Zoom Annotation Toolbar matching the exact screenshot */}
          <div
            style={{ left: toolbarPos.x, top: toolbarPos.y }}
            className="fixed z-[95] pointer-events-auto select-none transition-shadow"
          >
            <div
              className="w-12 bg-[#20222b]/95 border border-[#3b3f4f] rounded-2xl py-2 px-1 flex flex-col items-center space-y-1 shadow-[0_12px_36px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Top Drag Handle */}
              <div
                onMouseDown={handleToolbarMouseDown}
                title="Drag to reposition toolbar"
                className="w-full py-1 cursor-grab active:cursor-grabbing flex justify-center group"
              >
                <div className="w-5 h-1 bg-white/30 group-hover:bg-white/60 rounded-full transition-colors" />
              </div>

              {/* 1. Mouse / Pointer Tool */}
              <button
                onClick={() => setActiveTool('select')}
                title="Mouse Pointer (Pass clicks through)"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTool === 'select'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                <MousePointer className="w-4 h-4 -rotate-45" />
              </button>

              {/* 2. Move / Pan Tool */}
              <button
                onClick={() => setActiveTool('move')}
                title="Move / Pan"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTool === 'move'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Move className="w-4 h-4" />
              </button>

              {/* 3. Text Tool (T) */}
              <button
                onClick={() => setActiveTool('text')}
                title="Text Tool (Click screen to add text)"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer font-serif ${activeTool === 'text'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Type className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* 4. Draw / Pen Tool (Highlighted Blue Squircle in Screenshot) */}
              <button
                onClick={() => setActiveTool('draw')}
                title="Draw / Pen Tool"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTool === 'draw'
                    ? 'bg-[#1b73e8] text-white shadow-md shadow-blue-600/40 ring-1 ring-blue-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Pen className="w-4 h-4" />
              </button>

              {/* 5. Stamp Tool */}
              <div className="relative">
                <button
                  onClick={() => {
                    setActiveTool('stamp');
                    setShowStampPicker((prev) => !prev);
                  }}
                  title="Stamp Tool (Click to select stamp)"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTool === 'stamp'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {selectedStamp === 'check' ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : selectedStamp === 'star' ? (
                    <Star className="w-4 h-4" />
                  ) : selectedStamp === 'heart' ? (
                    <Heart className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>

                {/* Stamp Popover Selector */}
                {showStampPicker && (
                  <div className="absolute left-full ml-2 top-0 bg-[#1e212b] border border-white/15 rounded-xl p-1.5 flex gap-1 shadow-2xl z-50 animate-in fade-in slide-in-from-left-2">
                    {[
                      { id: 'check', icon: <Check className="w-3.5 h-3.5" /> },
                      { id: 'star', icon: <Star className="w-3.5 h-3.5" /> },
                      { id: 'heart', icon: <Heart className="w-3.5 h-3.5" /> },
                      { id: 'arrow', icon: <ArrowRight className="w-3.5 h-3.5" /> },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedStamp(s.id as StampType);
                          setActiveTool('stamp');
                          setShowStampPicker(false);
                        }}
                        className={`p-2 rounded-lg hover:bg-white/15 text-slate-200 cursor-pointer ${selectedStamp === s.id ? 'bg-blue-600 text-white' : ''
                          }`}
                      >
                        {s.icon}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Spotlight / Laser Pointer */}
              <button
                onClick={() => setActiveTool('spotlight')}
                title="Spotlight / Laser Pointer"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTool === 'spotlight'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Disc className="w-4 h-4" />
              </button>

              {/* 7. Eraser Tool */}
              <button
                onClick={() => setActiveTool('eraser')}
                title="Eraser (Erase drawing annotations)"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTool === 'eraser'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Eraser className="w-4 h-4" />
              </button>

              {/* 8. Color Picker & Line Width Dot (Orange Dot in Screenshot) */}
              <div className="relative py-0.5">
                <button
                  onClick={() => setShowColorPicker((prev) => !prev)}
                  title="Color & Format"
                  className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
                >
                  <span
                    className="w-4 h-4 rounded-full shadow-md border border-black/50"
                    style={{ backgroundColor: selectedColor }}
                  />
                </button>

                {/* Color Palette Popover */}
                {showColorPicker && (
                  <div className="absolute left-full ml-2 top-0 bg-[#1a1d26] border border-white/15 rounded-2xl p-3 shadow-2xl z-50 w-44 space-y-2.5 animate-in fade-in slide-in-from-left-2">
                    <div className="text-[11px] font-semibold text-slate-300">Colors</div>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setSelectedColor(c);
                            setShowColorPicker(false);
                          }}
                          style={{ backgroundColor: c }}
                          className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer ${selectedColor === c ? 'border-white scale-110 shadow-lg' : 'border-black/30'
                            }`}
                        />
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <div className="text-[11px] font-semibold text-slate-300 mb-1.5">Line Thickness</div>
                      <div className="flex items-center justify-between gap-1">
                        {PRESET_SIZES.map((sz) => (
                          <button
                            key={sz}
                            onClick={() => {
                              setStrokeWidth(sz);
                              setShowColorPicker(false);
                            }}
                            className={`p-2 rounded-lg hover:bg-white/15 flex items-center justify-center cursor-pointer ${strokeWidth === sz ? 'bg-blue-600/40 text-blue-400' : 'text-slate-300'
                              }`}
                          >
                            <span
                              className="rounded-full bg-current"
                              style={{ width: sz * 1.5, height: sz * 1.5 }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 9. Undo */}
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                title="Undo"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <Undo2 className="w-4 h-4" />
              </button>

              {/* 10. Redo */}
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                title="Redo"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <Redo2 className="w-4 h-4" />
              </button>

              {/* 11. Trash / Clear All */}
              <button
                onClick={handleClear}
                disabled={history.length === 0}
                title="Clear all drawings"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* 12. Save / Download */}
              <button
                onClick={handleDownload}
                title="Save Annotation Screenshot"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* 13. Divider */}
              <div className="w-6 h-[1px] bg-white/15 my-1" />

              {/* 14. More Options */}
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu((prev) => !prev)}
                  title="More Annotation Options"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showMoreMenu && (
                  <div className="absolute left-full ml-2 bottom-0 bg-[#1a1d26] border border-white/15 rounded-2xl p-2 shadow-2xl z-50 w-48 text-xs text-slate-300 space-y-1 animate-in fade-in slide-in-from-left-2">
                    <button
                      onClick={() => {
                        handlePopoutToScreen2();
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 cursor-pointer flex items-center justify-between"
                    >
                      <span>Pop Out to Screen 2</span>
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    <button
                      onClick={() => {
                        handleClear();
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 cursor-pointer"
                    >
                      Clear My Drawings
                    </button>
                    <button
                      onClick={() => {
                        handleDownload();
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-200 cursor-pointer"
                    >
                      Save as PNG
                    </button>
                  </div>
                )}
              </div>

              {/* 15. Security / Collaboration Permissions */}
              <button
                onClick={() => setAllowParticipantAnnotate((prev) => !prev)}
                title={
                  allowParticipantAnnotate
                    ? 'Collaboration: Participants can annotate'
                    : 'Collaboration: Annotation locked to host only'
                }
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${allowParticipantAnnotate ? 'text-sky-400 hover:bg-sky-500/10' : 'text-slate-500 hover:bg-white/10'
                  }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </button>

              {/* 16. Red Close Button [X] at Bottom */}
              <button
                onClick={onClose}
                title="Close Annotation Toolbar"
                className="w-8 h-8 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95 mt-1"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
