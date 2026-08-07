"use client";

import React from 'react';
import type { StageComponentProps, VisualStageData } from '@/types/engine';
import { motion } from 'framer-motion';
import { Eye, ArrowRight, Info, ChevronLeft, ArrowDown, Box, Activity, Code, Terminal, Zap, Layers, Network, CheckCircle2, XCircle, Lightbulb, Search, Calculator, Database, Globe, FileText, RefreshCw, MoveRight, ArrowUpRight, Brain, AlertCircle } from 'lucide-react';
import { useProgressStore } from '@/lib/store/progressStore';

export function VisualStage({ data, onComplete }: StageComponentProps<VisualStageData>) {
  const { content } = data;
  const goBack = useProgressStore((s) => s.goBack);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth scrollbar-thin scrollbar-thumb-white/10">
        <div className="max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center justify-start pb-8"
          >
            <div className="glass-panel p-8 md:p-12 rounded-3xl border-white/10 w-full relative overflow-hidden shadow-2xl mb-12">
              <div className="absolute top-0 right-0 p-40 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
  
              {/* Header */}
              <div className="flex items-center gap-5 mb-10 border-b border-white/10 pb-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <Eye className="w-8 h-8 text-blue-300" />
                </div>
                <div>
                  <span className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-1 block">Visualization</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {content.title}
                  </h2>
                </div>
              </div>
  
              <div className="space-y-12">
                {content.image && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full flex justify-center mb-12 relative z-10"
                  >
                    <img 
                      src={encodeURI(decodeURI(content.image.startsWith('/') ? content.image : `/${content.image}`))} 
                      alt={content.title} 
                      className="max-w-full w-auto h-auto max-h-[350px] object-contain rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] bg-[#0a0a0f]"
                    />
                  </motion.div>
                )}
  
                {content.diagram && content.diagram.length > 0 && (
                  <div className="flex flex-col items-center gap-0">
                    {content.diagram.map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center w-full max-w-md">
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.2 }}
                          className="w-full bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl text-center shadow-lg relative overflow-hidden z-10"
                        >
                          <div className="absolute left-0 top-0 h-full w-1 bg-blue-500" />
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {idx + 1}
                            </div>
                            <span className="text-white text-lg font-medium text-left">{step}</span>
                          </div>
                        </motion.div>
                        
                        {idx < (content.diagram?.length ?? 0) - 1 && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 32 }}
                            transition={{ delay: idx * 0.2 + 0.1 }}
                            className="w-1 bg-gradient-to-b from-blue-500 to-blue-500/20 h-8 my-0 -z-0"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Handle flow diagram format (nodes & edges) */}
                {(content.type === 'flow' || content.layout === 'flow' || Boolean(content.nodes && content.nodes.length > 0)) && (
                  <div className="w-full flex flex-col items-center">
                    {content.description && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/80 text-lg mb-10 leading-relaxed max-w-3xl text-center font-medium"
                      >
                        {content.description}
                      </motion.p>
                    )}
                    
                    {content.nodes && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full relative z-10">
                        {content.nodes.map((node: any, idx: number) => (
                          <motion.div 
                            key={node.id} 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl hover:bg-white/10 hover:border-blue-500/30 transition-all group"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                {idx + 1}
                              </div>
                              <h4 className="font-bold text-white text-lg">{node.label}</h4>
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed">{node.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {content.edges && content.edges.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-10 bg-black/30 rounded-2xl p-6 border border-white/5 w-full shadow-inner"
                      >
                        <h4 className="text-xs font-bold text-white/40 mb-4 uppercase tracking-widest flex items-center gap-2">
                          <ArrowRight className="w-4 h-4" /> Data Flow / Connections
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {content.edges.map((e: any, i: number) => {
                            const fromLabel = content.nodes?.find((n: any) => n.id === e.from)?.label || e.from;
                            const toLabel = content.nodes?.find((n: any) => n.id === e.to)?.label || e.to;
                            return (
                              <div key={i} className="text-xs text-white/70 bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 shadow-sm">
                                <span className="font-medium text-blue-300">{fromLabel}</span>
                                <ArrowRight className="w-3 h-3 text-white/30" />
                                {e.label && (
                                  <>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{e.label}</span>
                                    <ArrowRight className="w-3 h-3 text-white/30" />
                                  </>
                                )}
                                <span className="font-medium text-purple-300">{toLabel}</span>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Handle enterprise architecture stack format */}
                {(content.type === 'architecture_stack' || content.layout === 'architecture_stack') && content.layers && (
                  <div className="w-full flex flex-col xl:flex-row gap-8 items-start">
                    {/* Main Stack */}
                    <div className="flex-1 w-full flex flex-col items-center">
                      {content.description && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-white/80 text-lg mb-10 leading-relaxed max-w-3xl text-center font-medium"
                        >
                          {content.description}
                        </motion.p>
                      )}
                      
                      <div className="w-full max-w-4xl flex flex-col items-center gap-2">
                        {content.layers.map((layer: any, idx: number) => {
                          const colors = [
                            'from-blue-600/10 to-indigo-600/10 border-blue-500/30 text-blue-400',
                            'from-purple-600/10 to-pink-600/10 border-purple-500/30 text-purple-400',
                            'from-emerald-600/10 to-teal-600/10 border-emerald-500/30 text-emerald-400',
                            'from-orange-600/10 to-red-600/10 border-orange-500/30 text-orange-400',
                            'from-cyan-600/10 to-blue-600/10 border-cyan-500/30 text-cyan-400'
                          ];
                          const colorClass = colors[idx % colors.length];
                          
                          return (
                            <div key={layer.id} className="w-full flex flex-col items-center">
                              {idx > 0 && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 24 }}
                                  transition={{ delay: idx * 0.15 }}
                                  className="flex flex-col items-center h-8 justify-center"
                                >
                                  <ArrowDown className="w-5 h-5 text-white/30 animate-bounce" />
                                </motion.div>
                              )}
                              
                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.15 + 0.1 }}
                                className={`w-full bg-gradient-to-r ${colorClass.split(' ').slice(0,2).join(' ')} border ${colorClass.split(' ')[2]} p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md group relative overflow-hidden`}
                              >
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
                                  <div className="flex flex-col items-center md:items-start min-w-[220px]">
                                    <div className={`px-4 py-1.5 rounded-full border border-white/10 bg-black/40 text-xs font-black uppercase tracking-widest mb-4 shadow-inner ${colorClass.split(' ')[3]}`}>
                                      {layer.badge}
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">{layer.name}</h3>
                                  </div>
                                  
                                  <div className="flex-1 flex flex-wrap justify-center md:justify-start gap-4 w-full">
                                    {layer.packages.map((pkg: any) => (
                                      <div key={pkg.id} className="flex-1 min-w-[240px] bg-black/50 border border-white/10 rounded-2xl p-5 hover:border-white/30 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                                        <div className="flex items-center gap-3 mb-3">
                                          <div className={`p-2 rounded-lg bg-white/5 ${colorClass.split(' ')[3]}`}>
                                            <Box className="w-4 h-4" />
                                          </div>
                                          <h4 className="font-bold text-white/90 text-sm font-mono tracking-wide">{pkg.label}</h4>
                                        </div>
                                        {pkg.items && pkg.items.length > 0 && (
                                          <div className="flex flex-wrap gap-2 mt-4">
                                            {pkg.items.map((item: string, i: number) => (
                                              <span key={i} className="text-[10px] uppercase tracking-wider font-bold bg-white/5 text-white/70 px-2.5 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 hover:text-white transition-colors cursor-default">
                                                {item}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Right Side Panel */}
                    {content.sidePanel && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="w-full xl:w-[320px] shrink-0 bg-black/40 border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl xl:sticky xl:top-8"
                      >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <h3 className="text-lg font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Activity className="w-5 h-5 text-purple-400" />
                          </div>
                          {content.sidePanel.title}
                        </h3>
                        
                        <div className="flex flex-col gap-0 relative">
                          <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-pink-500/50" />
                          {content.sidePanel.flow.map((step: string, idx: number) => (
                            <div key={idx} className="flex gap-5 relative py-4 group">
                              <div className="w-10 h-10 rounded-full bg-[#0a0a0f] border border-white/20 flex items-center justify-center shrink-0 z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:border-purple-500/50 transition-colors">
                                <div className="w-2.5 h-2.5 rounded-full bg-white/80 group-hover:bg-purple-400 group-hover:shadow-[0_0_12px_rgba(168,85,247,1)] transition-all" />
                              </div>
                              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center group-hover:bg-white/10 transition-colors">
                                <span className="text-sm font-bold text-white/90">{step}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Handle lcel_pipeline format */}
                {(content.type === 'lcel_pipeline' || content.layout === 'lcel_pipeline') && content.steps && (
                  <div className="w-full flex flex-col xl:flex-row gap-8 items-start">
                    {/* Main Pipeline Flow */}
                    <div className="flex-1 w-full flex flex-col items-center relative pb-8">
                      {content.description && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-white/80 text-lg mb-12 leading-relaxed max-w-3xl text-center font-medium"
                        >
                          {content.description}
                        </motion.p>
                      )}
                      
                      <div className="w-full max-w-4xl flex flex-col items-center">
                        {content.steps.map((step: any, idx: number) => {
                          const colors = [
                            'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-400', // User Input
                            'from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-400',     // Prompt
                            'from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-400', // Model
                            'from-orange-500/10 to-red-500/10 border-orange-500/30 text-orange-400',   // Parser
                            'from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400'        // Output
                          ];
                          const colorClass = colors[idx % colors.length];
                          
                          return (
                            <div key={idx} className="w-full flex flex-col items-center relative">
                              {/* Step Card */}
                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                className={`w-full bg-[#0a0a0f] border ${colorClass.split(' ')[2]} p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden group`}
                              >
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorClass.split(' ').slice(0,2).join(' ')} opacity-50`} />
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                <div className="flex flex-col gap-6 relative z-10">
                                  {/* Title and Description */}
                                  <div className="flex flex-col items-start w-full">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 ${colorClass.split(' ')[3]}`}>
                                        <Layers className="w-5 h-5" />
                                      </div>
                                      <h3 className="text-xl font-black text-white tracking-tight">{step.name}</h3>
                                    </div>
                                    <p className="text-sm font-medium text-white/60 leading-relaxed ml-[52px]">{step.description}</p>
                                  </div>
                                  
                                  {/* Data transformations - full width below */}
                                  <div className="w-full flex flex-col gap-4 font-mono text-sm bg-black/40 rounded-2xl p-5 md:p-6 border border-white/5">
                                    {step.input && (
                                      <div>
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Input</span>
                                        <div className="text-blue-300 bg-blue-900/10 p-4 rounded-xl border border-blue-500/20 whitespace-pre-wrap leading-relaxed text-[13px] md:text-sm overflow-x-auto">{step.input}</div>
                                      </div>
                                    )}
                                    {step.example && (
                                      <div>
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Example Data</span>
                                        <div className="text-blue-300 bg-blue-900/10 p-4 rounded-xl border border-blue-500/20 whitespace-pre-wrap leading-relaxed text-[13px] md:text-sm overflow-x-auto">{step.example}</div>
                                      </div>
                                    )}
                                    {step.template && (
                                      <div>
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Template</span>
                                        <div className="text-purple-300 bg-purple-900/10 p-4 rounded-xl border border-purple-500/20 whitespace-pre-wrap leading-relaxed text-[13px] md:text-sm overflow-x-auto">{step.template}</div>
                                      </div>
                                    )}
                                    {step.receives && (
                                      <div>
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Receives</span>
                                        <div className="text-indigo-300 bg-indigo-900/10 p-4 rounded-xl border border-indigo-500/20 whitespace-pre-wrap leading-relaxed text-[13px] md:text-sm overflow-x-auto">{step.receives}</div>
                                      </div>
                                    )}
                                    {step.processing && (
                                      <div>
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Processing</span>
                                        <div className="flex items-start gap-2 text-orange-300 bg-orange-900/10 p-4 rounded-xl border border-orange-500/20 leading-relaxed text-[13px] md:text-sm">
                                          <Zap className="w-4 h-4 mt-0.5 shrink-0" /> <span className="whitespace-pre-wrap">{step.processing}</span>
                                        </div>
                                      </div>
                                    )}
                                    {step.output && (
                                      <div>
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Output</span>
                                        <div className="text-emerald-300 bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/20 whitespace-pre-wrap leading-relaxed text-[13px] md:text-sm overflow-x-auto">{step.output}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                              
                              {/* Arrow and DataType Badge Down to Next Step */}
                               {idx < (content.steps?.length ?? 0) - 1 && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 80 }}
                                  transition={{ delay: idx * 0.2 + 0.1 }}
                                  className="w-full flex flex-col items-center justify-center relative py-2"
                                >
                                  {/* The vertical pipe */}
                                  <div className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-white/20 via-blue-500/50 to-white/20" />
                                  
                                  {/* Animated data packet */}
                                  <motion.div 
                                    animate={{ y: [0, 60] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                    className="absolute top-0 w-1.5 h-6 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                                  />
                                  
                                  {/* Type Badge */}
                                  {step.outputType && (
                                    <div className="z-10 bg-[#0f111a] px-4 py-1.5 rounded-full border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">{step.outputType}</span>
                                    </div>
                                  )}
                                  
                                  <div className="absolute bottom-0 w-3 h-3 border-b-2 border-r-2 border-blue-500/50 transform rotate-45 translate-y-1 bg-transparent" />
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Right Side Panels */}
                    <div className="w-full xl:w-[400px] shrink-0 flex flex-col gap-6 xl:sticky xl:top-8">
                      {/* Code Panel */}
                      {content.codePanel && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                          className="w-full bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl"
                        >
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                          <h3 className="text-sm font-black text-white/80 mb-4 uppercase tracking-widest flex items-center gap-2">
                            <Code className="w-4 h-4 text-indigo-400" />
                            {content.codePanel.title}
                          </h3>
                          <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-sm overflow-x-auto text-blue-200/90 whitespace-pre">
                            {content.codePanel.code}
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Type Flow Panel */}
                      {content.typeFlowPanel && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.0 }}
                          className="w-full bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl"
                        >
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                          <h3 className="text-sm font-black text-white/80 mb-6 uppercase tracking-widest flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-emerald-400" />
                            {content.typeFlowPanel.title}
                          </h3>
                          
                          <div className="flex flex-col gap-0 relative px-2">
                            <div className="absolute left-[22px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-500/20 via-teal-500/20 to-cyan-500/20" />
                            {content.typeFlowPanel.flow.map((type: string, idx: number) => (
                              <div key={idx} className="flex gap-4 relative py-3 group">
                                <div className="w-7 h-7 rounded-full bg-[#0a0a0f] border border-emerald-500/30 flex items-center justify-center shrink-0 z-10 group-hover:border-emerald-400 transition-colors">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 group-hover:shadow-[0_0_10px_rgba(52,211,153,0.8)] transition-all" />
                                </div>
                                <div className="flex-1 bg-emerald-900/10 border border-emerald-500/10 rounded-xl p-2.5 flex items-center group-hover:bg-emerald-900/20 transition-colors">
                                  <span className="text-xs font-mono font-bold text-emerald-400">{type}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Comparison Panel */}
                {content.comparisonPanel && (
                  <div className="w-full mt-16 flex flex-col items-center">
                    <div className="w-full flex items-center justify-center mb-10">
                      <h2 className="text-3xl font-black text-white tracking-tight relative">
                        {content.comparisonPanel.title}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" />
                      </h2>
                    </div>
                    
                    {/* Two Column Layout */}
                    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                      
                      {/* Left Panel - Chain */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#0a0a0f] border border-blue-500/30 rounded-3xl p-8 relative overflow-hidden group shadow-[0_10px_40px_rgba(59,130,246,0.1)]"
                      >
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400" />
                        
                        <div className="flex items-center justify-between mb-6 relative z-10">
                          <h3 className="text-2xl font-black text-white">{content.comparisonPanel.left.title}</h3>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <ArrowRight className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{content.comparisonPanel.left.tag}</span>
                          </div>
                        </div>
                        
                        <p className="text-white/70 font-medium mb-8 leading-relaxed relative z-10">
                          {content.comparisonPanel.left.description}
                        </p>
                        
                        {/* Flow */}
                        <div className="bg-black/50 rounded-2xl p-6 border border-white/5 mb-8 relative z-10 flex flex-col items-center justify-center gap-2">
                          {content.comparisonPanel.left.flow.map((step: string, i: number) => (
                            <div key={i} className="flex flex-col items-center">
                              <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 font-bold text-sm">
                                {step}
                              </div>
                              {i < content.comparisonPanel.left.flow.length - 1 && (
                                <ArrowDown className="w-4 h-4 text-blue-500/50 my-1" />
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                          {/* Advantages */}
                          <div>
                            <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Advantages
                            </h4>
                            <ul className="flex flex-col gap-3">
                              {content.comparisonPanel.left.advantages.map((adv: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-white/80 font-medium">
                                  <span className="text-emerald-400 mt-0.5">✓</span> {adv}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Limitations */}
                          <div>
                            <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-400" /> Limitations
                            </h4>
                            <ul className="flex flex-col gap-3">
                              {content.comparisonPanel.left.limitations.map((lim: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-white/80 font-medium">
                                  <span className="text-red-400 mt-0.5">✗</span> {lim}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {/* Best Use Cases */}
                        <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
                          <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400" /> Best Use Cases
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {content.comparisonPanel.left.useCases.map((uc: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white/70">
                                {uc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* Right Panel - LangGraph */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-[#0a0a0f] border border-emerald-500/30 rounded-3xl p-8 relative overflow-hidden group shadow-[0_10px_40px_rgba(16,185,129,0.1)]"
                      >
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
                        
                        <div className="flex items-center justify-between mb-6 relative z-10">
                          <h3 className="text-2xl font-black text-white">{content.comparisonPanel.right.title}</h3>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <Network className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{content.comparisonPanel.right.tag}</span>
                          </div>
                        </div>
                        
                        <p className="text-white/70 font-medium mb-8 leading-relaxed relative z-10">
                          {content.comparisonPanel.right.description}
                        </p>
                        
                        {/* Flow */}
                        <div className="bg-black/50 rounded-2xl p-6 border border-white/5 mb-8 relative z-10 flex flex-col items-center justify-center gap-2">
                          {content.comparisonPanel.right.flowGraph.map((step: string, i: number) => (
                            <div key={i} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 font-bold text-sm text-center min-w-[200px]">
                              {step}
                            </div>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                          {/* Advantages */}
                          <div>
                            <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Advantages
                            </h4>
                            <ul className="flex flex-col gap-3">
                              {content.comparisonPanel.right.advantages.map((adv: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-white/80 font-medium">
                                  <span className="text-emerald-400 mt-0.5">✓</span> {adv}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Limitations */}
                          <div>
                            <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-400" /> Limitations
                            </h4>
                            <ul className="flex flex-col gap-3">
                              {content.comparisonPanel.right.limitations.map((lim: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-white/80 font-medium">
                                  <span className="text-red-400 mt-0.5">✗</span> {lim}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {/* Best Use Cases */}
                        <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
                          <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400" /> Best Use Cases
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {content.comparisonPanel.right.useCases.map((uc: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white/70">
                                {uc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Summary Table */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden mb-12 shadow-2xl"
                    >
                      <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                              <th className="p-6 text-sm font-black text-white/50 uppercase tracking-widest">Feature</th>
                              <th className="p-6 text-sm font-black text-blue-400 uppercase tracking-widest">LCEL Chain</th>
                              <th className="p-6 text-sm font-black text-emerald-400 uppercase tracking-widest">LangGraph</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {content.comparisonPanel.summaryTable.map((row: any, i: number) => (
                              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-5 text-white/80 font-bold text-sm">{row.feature}</td>
                                <td className="p-5 text-blue-200/80 font-medium text-sm">{row.chain}</td>
                                <td className="p-5 text-emerald-200/80 font-medium text-sm">{row.langGraph}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                    
                    {/* Highlight Box */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="w-full bg-gradient-to-r from-blue-900/20 to-emerald-900/20 border border-white/10 rounded-3xl p-8 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500" />
                      <h3 className="text-2xl font-black text-white text-center mb-8">{content.comparisonPanel.highlightBox.title}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                          <h4 className="text-lg font-bold text-blue-400 mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                              <ArrowRight className="w-4 h-4 text-blue-300" />
                            </div>
                            Use LCEL Chain when:
                          </h4>
                          <ul className="flex flex-col gap-4">
                            {content.comparisonPanel.highlightBox.chain.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-3 text-white/80 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" /> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                              <Network className="w-4 h-4 text-emerald-300" />
                            </div>
                            Use LangGraph when:
                          </h4>
                          <ul className="flex flex-col gap-4">
                            {content.comparisonPanel.highlightBox.langGraph.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-3 text-white/80 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" /> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Tool-Calling Agent Loop */}
                {(content.type === 'tool_agent_loop' || content.layout === 'tool_agent_loop') && content.mainFlow && (
                  <div className="w-full flex flex-col items-center">
                    {/* Two-Column Layout */}
                    <div className="w-full flex flex-col xl:flex-row gap-8 items-start mb-12">
                      
                      {/* Left: Main Workflow Diagram */}
                      <div className="flex-1 w-full bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col items-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <h3 className="text-xl font-black text-white mb-10 tracking-tight flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 text-purple-400" /> Agent Execution Loop
                        </h3>
                        
                                                <div className="relative w-full max-w-2xl flex flex-col items-center">
                          {(() => {
                            const nodes = content.mainFlow.nodes;
                            const getNode = (id: string) => nodes.find((n: any) => n.id === id) || nodes[0];
                            const renderNode = (node: any, options: any) => {
                              let nodeColors = "from-blue-500/10 to-blue-600/5 border-blue-500/30 text-blue-400";
                              let icon = <Box className="w-4 h-4" />;
                              
                              if (node.id === 'user') {
                                nodeColors = "from-emerald-500/10 to-emerald-600/5 border-emerald-500/30 text-emerald-400";
                                icon = <Terminal className="w-4 h-4" />;
                              } else if (node.id.includes('agent')) {
                                nodeColors = "from-purple-500/20 to-purple-600/10 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]";
                                icon = <Brain className="w-4 h-4" />;
                              } else if (node.id === 'router') {
                                nodeColors = "from-orange-500/10 to-orange-600/5 border-orange-500/40 text-orange-400";
                                icon = <AlertCircle className="w-4 h-4" />;
                              } else if (node.id === 'tool' || node.id === 'result') {
                                nodeColors = "from-cyan-500/10 to-cyan-600/5 border-cyan-500/30 text-cyan-400";
                                icon = <Zap className="w-4 h-4" />;
                              } else if (node.id === 'final') {
                                nodeColors = "from-emerald-500/20 to-emerald-600/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
                                icon = <CheckCircle2 className="w-4 h-4" />;
                              }

                              return (
                                <div className="flex flex-col items-center w-full z-10 relative">
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: options.delay || 0 }}
                                    className={`${options.wClass || 'w-full md:w-3/4 lg:w-2/3'} bg-[#0a0a0f] border ${nodeColors.split(' ')[2]} p-4 rounded-xl relative overflow-hidden group`}
                                  >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${nodeColors.split(' ').slice(0,2).join(' ')} opacity-50`} />
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    <div className="flex flex-col items-center text-center relative z-10">
                                      <div className="flex flex-col items-center gap-1.5 mb-2">
                                        <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 ${nodeColors.split(' ')[3]}`}>
                                          {icon}
                                        </div>
                                        <h4 className="text-base font-black text-white tracking-tight leading-tight">{node.title}</h4>
                                        {node.subtitle && <span className={`text-[10px] font-bold uppercase tracking-widest ${nodeColors.split(' ')[3]}`}>{node.subtitle}</span>}
                                      </div>
                                      {node.details && node.details.length > 0 && (
                                        <div className="mt-1 text-xs font-medium text-white/60 flex flex-col gap-0.5 leading-tight">
                                          {node.details.map((d: any, i: number) => <span key={i}>{d}</span>)}
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                  {options.arrow && (
                                    <div className="w-[2px] h-6 bg-white/10 relative my-1">
                                      <ArrowDown className="absolute -bottom-3 -left-[7px] w-4 h-4 text-white/30" />
                                    </div>
                                  )}
                                </div>
                              );
                            };

                            return (
                              <>
                                {renderNode(getNode('user'), { delay: 0.1, arrow: true, wClass: 'w-full max-w-sm' })}
                                
                                <div className="relative w-full flex flex-col items-center">
                                  {/* Dashed Loop Background */}
                                  <div className="absolute left-0 xl:-left-2 top-[50px] bottom-[50px] w-6 xl:w-16 border-l-2 border-t-2 border-b-2 border-purple-500/30 rounded-l-2xl z-0 border-dashed hidden md:block" />
                                  <div className="absolute left-0 xl:-left-2 top-[50px] bottom-[50px] w-6 xl:w-16 border-l-2 border-t-2 border-b-2 border-purple-400/0 rounded-l-2xl z-0 overflow-hidden hidden md:block">
                                    <motion.div 
                                      animate={{ y: [0, 400], opacity: [0, 1, 0] }}
                                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                      className="absolute left-[-1px] w-0.5 h-16 bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                                    />
                                  </div>
                                  
                                  {renderNode(getNode('agent'), { delay: 0.2, arrow: true, wClass: 'w-full max-w-sm' })}
                                  {renderNode(getNode('router'), { delay: 0.3, arrow: false, wClass: 'w-full max-w-sm' })}
                                  
                                  {/* Router Arrow branching */}
                                  <div className="w-full max-w-[500px] flex relative h-10 my-1 z-10">
                                    {/* YES - Elbow to Left Branch */}
                                    <div className="absolute top-0 w-1/4 border-t-2 border-l-2 border-white/10 rounded-tl-xl h-10 left-1/4">
                                      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-[#0a0a0f] px-2 py-0.5 rounded-full border border-emerald-500/30">YES</div>
                                      <ArrowDown className="absolute -bottom-3 -left-[9px] w-4 h-4 text-emerald-500/50" />
                                    </div>
                                    {/* NO - Elbow to Right Branch */}
                                    <div className="absolute top-0 w-1/4 border-t-2 border-r-2 border-white/10 rounded-tr-xl h-10 right-1/4">
                                      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] font-black text-red-400 uppercase tracking-widest bg-[#0a0a0f] px-2 py-0.5 rounded-full border border-red-500/30">NO</div>
                                      <ArrowDown className="absolute -bottom-3 -right-[9px] w-4 h-4 text-red-500/50" />
                                    </div>
                                  </div>

                                  {/* The 2 Columns */}
                                  <div className="w-full flex flex-col md:flex-row relative z-10 gap-6 md:gap-4 mt-2">
                                    {/* Left Column (Tool Execution) */}
                                    <div className="w-full md:w-1/2 flex flex-col items-center">
                                      {renderNode(getNode('tool'), { delay: 0.4, arrow: true, wClass: 'w-full max-w-sm' })}
                                      {renderNode(getNode('result'), { delay: 0.5, arrow: true, wClass: 'w-full max-w-sm' })}
                                      {renderNode(getNode('agent_analyze'), { delay: 0.6, arrow: false, wClass: 'w-full max-w-sm' })}
                                    </div>
                                    
                                    {/* Right Column (Final Answer) */}
                                    <div className="w-full md:w-1/2 flex flex-col items-center">
                                      {renderNode(getNode('final'), { delay: 0.7, arrow: false, wClass: 'w-full max-w-sm' })}
                                    </div>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Right: Sidebar & Examples */}
                      <div className="w-full xl:w-[350px] shrink-0 flex flex-col gap-6">
                        {/* Tools Available */}
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="w-full bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl"
                        >
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                          <h3 className="text-sm font-black text-white/80 mb-5 uppercase tracking-widest flex items-center gap-2">
                            <Layers className="w-4 h-4 text-cyan-400" /> {content.sidebar.title}
                          </h3>
                          <div className="flex flex-col gap-3">
                            {content.sidebar.tools.map((t: any, i: number) => {
                              const iconMap: any = { Search, Calculator, Database, Globe, FileText };
                              const IconObj = iconMap[t.icon] || Zap;
                              return (
                                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
                                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                                    <IconObj className="w-4 h-4 text-cyan-400" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">{t.name}</span>
                                    <span className="text-xs font-medium text-white/50">{t.desc}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>

                        {/* Execution Example */}
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          className="w-full bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl"
                        >
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
                          <h3 className="text-sm font-black text-white/80 mb-5 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-orange-400" /> {content.example.title}
                          </h3>
                          <div className="flex flex-col gap-2 relative">
                            <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-white/10" />
                            {content.example.steps.map((step: any, i: number) => (
                              <div key={i} className="flex gap-4 relative py-2">
                                <div className="w-8 h-8 rounded-full bg-[#0a0a0f] border border-white/20 flex items-center justify-center shrink-0 z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                                  <div className={`w-2 h-2 rounded-full ${step.role === 'User' ? 'bg-emerald-400' : step.role === 'Agent' ? 'bg-purple-400' : step.role === 'Action' ? 'bg-orange-400' : 'bg-cyan-400'}`} />
                                </div>
                                <div className="flex flex-col justify-center">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{step.role}</span>
                                  <span className="text-sm font-medium text-white/80">{step.text}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Bottom Loop Diagrams */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      {/* Thought Loop */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="w-full bg-[#0a0a0f] border border-purple-500/30 rounded-3xl p-8 relative overflow-hidden text-center flex flex-col items-center"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                        <h4 className="text-lg font-black text-white mb-6 tracking-tight">{content.bottomSection.title}</h4>
                        <div className="flex flex-wrap justify-center items-center gap-3">
                          {content.bottomSection.steps.map((step: string, i: number) => (
                            <React.Fragment key={i}>
                              <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 font-bold text-sm">
                                {step}
                              </div>
                              {i < content.bottomSection.steps.length - 1 && (
                                <MoveRight className="w-4 h-4 text-purple-500/50" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </motion.div>

                      {/* Key Insights */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="w-full bg-[#0a0a0f] border border-blue-500/30 rounded-3xl p-8 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                        <div className="flex flex-col gap-5">
                          <div>
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest block mb-2">Traditional Chain</span>
                            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 font-mono text-sm whitespace-pre-wrap inline-block">
                              {content.keyInsights.traditional}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-black text-blue-400 uppercase tracking-widest block mb-2 flex items-center gap-2">
                              <Zap className="w-3 h-3" /> Tool Agent
                            </span>
                            <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 font-mono text-sm font-bold whitespace-pre-wrap">
                              {content.keyInsights.toolAgent}
                            </div>
                          </div>
                          <div className="mt-2 text-sm font-medium text-white/80 whitespace-pre-wrap border-l-2 border-emerald-500 pl-4 py-1">
                            {content.keyInsights.difference}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )}
  
  
                {content.explanation && (
                  <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mt-12">
                    <h3 className="text-white/60 uppercase tracking-widest text-xs font-bold mb-4 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-400" /> Explanation
                    </h3>
                    <p className="text-white/90 text-lg leading-relaxed font-medium whitespace-pre-line">
                      {content.explanation}
                    </p>
                  </section>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="shrink-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 md:p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4 px-1 md:px-4">
          <p className="text-white/40 text-sm font-medium hidden md:block flex-1">Follow the execution flow.</p>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goBack}
              className="flex justify-center items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 font-bold text-base rounded-xl border border-white/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onComplete({ correct: true, score: 100 })}
              className="flex justify-center items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 text-white font-bold text-base rounded-xl shadow-[0_0_15px_var(--color-primary)] transition-all"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
