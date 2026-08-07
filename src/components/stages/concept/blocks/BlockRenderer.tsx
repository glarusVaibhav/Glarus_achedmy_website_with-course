import React, { useState } from 'react';
import { Block } from '../conceptAnalyzer';
import { Lightbulb, AlertTriangle, Layers, Info, Code, X, ZoomIn } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { TemperatureGame } from './TemperatureGame';

const ZoomableImage = ({ src, alt, className, ...props }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const cleanSrc = src ? encodeURI(decodeURI(src)) : src;

  // If the image is meant to be full width, we limit it to a medium size and center it.
  const newClass = "rounded-xl shadow-lg border border-white/10 w-full max-w-md my-6 cursor-pointer hover:opacity-80 transition-all hover:scale-[1.02] mx-auto block " + (className || "");

  return (
    <>
      <span 
        className="relative group cursor-pointer w-full max-w-md mx-auto block my-6"
        onClick={(e) => { e.preventDefault(); setIsOpen(true); }}
      >
        <img 
          src={cleanSrc} 
          alt={alt} 
          className={newClass} 
          {...props} 
        />
        <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
          <ZoomIn className="w-8 h-8 text-white" />
        </span>
      </span>

      {isOpen && (
        <span 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 sm:p-8 backdrop-blur-sm"
          onClick={(e) => { e.preventDefault(); setIsOpen(false); }}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); }}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={cleanSrc} 
            alt={alt} 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]" 
            onClick={(e) => e.stopPropagation()}
          />
        </span>
      )}
    </>
  );
};

interface BlockRendererProps {
  block: Block;
}

function normalizeExplanationContent(content: string) {
  let normalizedContent = content.replace(/•/g, '-');
  
  // Remove any content explicitly marked to be hidden from the UI.
  // Support a few common marker syntaxes authors might use when generating content:
  // 1. HTML comments: <!--HIDE-->...<!--/HIDE-->
  // 2. Bracket markers: [HIDDEN]...[/HIDDEN]
  // 3. Custom tag: <hidden>...</hidden>
  normalizedContent = normalizedContent
    .replace(/<!--\s*HIDE\s*-->[\s\S]*?<!--\s*\/HIDE\s*-->/gi, '')
    .replace(/\[HIDDEN\][\s\S]*?\[\/HIDDEN\]/gi, '')
    .replace(/<hidden\b[^>]*>[\s\S]*?<\/hidden>/gi, '');
  // Match [IMAGE:...] including paths with spaces
  normalizedContent = normalizedContent.replace(/\[IMAGE:([^\]]+)\]/gi, (_, src: string) => {
    const cleanSrc = encodeURI(src.trim());
    return `![image](${cleanSrc})`;
  });

  // Also match standard markdown ![alt](src) with spaces
  normalizedContent = normalizedContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/gi, (_, alt: string, src: string) => {
    const cleanSrc = encodeURI(src.trim());
    return `![${alt}](${cleanSrc})`;
  });

  // Normalize line breaks BUT preserve markdown table structure.
  // Tables require single newlines between rows — double newlines break them.
  const lines = normalizedContent.split('\n');
  const result: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableLine = line.trimStart().startsWith('|');
    const nextLine = lines[i + 1];
    const nextIsTableLine = nextLine !== undefined && nextLine.trimStart().startsWith('|');
    
    result.push(line);
    
    // If this line AND next line are both table rows, keep single newline
    // Otherwise, add a blank line for paragraph spacing
    if (isTableLine && nextIsTableLine) {
      // Single newline — don't add extra blank line
    } else if (line.trim() === '') {
      // Already a blank line, skip adding another
    } else {
      result.push(''); // Add blank line for paragraph break
    }
  }
  
  return result.join('\n');
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case 'explanation': {
      const normalizedContent = normalizeExplanationContent(block.content);
      // Normalize content so ReactMarkdown parses it correctly:
      // 1. Replace bullet characters with markdown list hyphens
      // let normalizedContent = block.content.replace(/•/g, '-');

      // 2. Normalize all line breaks to double line breaks. 
      // This forces single line breaks (which Markdown usually ignores) to become actual paragraphs or loose list items.
      // normalizedContent = normalizedContent.replace(/\n+/g, '\n\n');

      return (
        <section>
          <div className="text-white/85 text-[16px] md:text-[17px] lg:text-[18px] leading-[1.85] font-normal prose prose-invert max-w-none prose-p:my-4 [&>p:first-child]:!mt-0 prose-ul:list-disc prose-ul:ml-6 prose-ul:my-4 prose-li:my-2 prose-li:text-white/75 prose-li:leading-[1.8] prose-strong:text-primary prose-strong:font-semibold prose-headings:text-primary prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-hr:my-6 prose-hr:border-white/10 prose-code:text-emerald-400 prose-code:bg-emerald-400/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                img: ZoomableImage,
                table: ({ node, children, ...props }) => (
                  <div className="my-6 overflow-x-auto rounded-xl border border-white/10 shadow-lg">
                    <table className="w-full text-sm border-collapse" {...props}>
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ node, children, ...props }) => (
                  <thead className="bg-primary/15 border-b border-primary/20" {...props}>
                    {children}
                  </thead>
                ),
                th: ({ node, children, ...props }) => (
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary whitespace-nowrap" {...props}>
                    {children}
                  </th>
                ),
                td: ({ node, children, ...props }) => (
                  <td className="px-4 py-3 text-white/75 border-t border-white/5 text-sm" {...props}>
                    {children}
                  </td>
                ),
                tr: ({ node, children, ...props }) => (
                  <tr className="hover:bg-white/[0.03] transition-colors even:bg-white/[0.02]" {...props}>
                    {children}
                  </tr>
                ),
                pre: ({ node, children, ...props }) => (
                  <div className="bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden my-6 shadow-2xl">
                    <div className="bg-[#2d2d2d] px-4 py-3 flex items-center gap-2 border-b border-[#1e1e1e]">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                      <span className="ml-2 text-[#858585] text-xs font-mono font-medium tracking-wider uppercase">Snippet</span>
                    </div>
                    <pre className="p-4 overflow-x-auto bg-transparent m-0" {...props}>
                      <div className="!bg-transparent !p-0 leading-relaxed font-mono text-[0.9em]">
                        {children}
                      </div>
                    </pre>
                  </div>
                ),
                // img: ({ node, ...props }) => (
                //   <div className="flex justify-center my-4">
                //     <img {...props} className="rounded-xl border border-white/10 max-w-[420px] md:max-w-[520px] h-auto shadow-xl object-contain" />
                //   </div>
                // ),
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isBlock = String(children).includes('\n');
                  if (!match && !isBlock && inline !== false) {
                    return <code className={className} {...props}>{children}</code>;
                  }
                  return (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match ? match[1] : 'text'}
                      PreTag="div"
                      CodeTag="div"
                      customStyle={{ background: 'transparent', padding: 0, margin: 0, fontSize: 'inherit' }}
                      codeTagProps={{ style: { fontFamily: 'inherit' } }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                }
              }}
            >
              {normalizedContent}
            </ReactMarkdown>
          </div>
        </section>
      );
    }

    case 'example':
      return (
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 md:p-6 shadow-inner relative mt-6">
          <span className="absolute -top-3 left-8 px-4 py-1 bg-blue-600 text-white text-xs font-bold uppercase rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]">
            Example
          </span>
          <p className="mt-2 text-blue-100 text-base md:text-lg italic font-mono leading-relaxed whitespace-pre-wrap">
            {block.content}
          </p>
        </section>
      );

    case 'code': {
      const codeContent = block.content.trim();
      // Ensure it's wrapped in markdown backticks if it isn't already
      const markdownCode = codeContent.startsWith('```') ? codeContent : `\`\`\`python\n${codeContent}\n\`\`\``;

      return (
        <section className="mt-8 mb-4">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre: ({ node, children, ...props }) => (
                  <div className="bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                    <div className="bg-[#2d2d2d] px-4 py-3 flex items-center gap-2 border-b border-[#1e1e1e]">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                      <span className="ml-2 text-[#858585] text-xs font-mono font-medium tracking-wider uppercase">Snippet</span>
                    </div>
                    <pre className="p-4 md:p-6 overflow-x-auto bg-transparent m-0" {...props}>
                      <div className="!bg-transparent !p-0 leading-relaxed font-mono text-[0.9em]">
                        {children}
                      </div>
                    </pre>
                  </div>
                ),
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isBlock = String(children).includes('\n');
                  if (!match && !isBlock && inline !== false) {
                    return <code className={className} {...props}>{children}</code>;
                  }
                  return (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match ? match[1] : 'text'}
                      PreTag="div"
                      CodeTag="div"
                      customStyle={{ background: 'transparent', padding: 0, margin: 0, fontSize: 'inherit' }}
                      codeTagProps={{ style: { fontFamily: 'inherit' } }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                }
              }}
            >
              {markdownCode}
            </ReactMarkdown>
          </div>
        </section>
      );
    }

    case 'comparison':
      return (
        <section className="mt-6">
          <h3 className="text-white/60 uppercase tracking-widest text-xs font-bold mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-white/40" /> Evolution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-950/30 border border-red-500/20 p-4 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              <div className="flex items-center gap-2 text-red-400 font-black text-sm uppercase mb-3 tracking-widest">
                Before
              </div>
              <p className="text-base font-mono text-red-200/80 leading-relaxed whitespace-pre-wrap">{block.content.before}</p>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-500/20 p-4 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase mb-3 tracking-widest">
                After
              </div>
              <p className="text-base font-mono text-emerald-200/80 leading-relaxed whitespace-pre-wrap">{block.content.after}</p>
            </div>
          </div>
        </section>
      );

    case 'vsComparison':
      return (
        <section className="mt-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center">
            <div className="w-14 h-14 bg-black border-4 border-slate-900 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-purple-500 font-black italic text-lg tracking-widest">VS</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left Side */}
            <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900/40 border border-cyan-500/20 p-4 md:p-6 rounded-2xl relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <h4 className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 tracking-tight">
                {block.content.left.title}
              </h4>
              <ul className="space-y-2 lg:space-y-3">
                {block.content.left.points.map((point: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-cyan-50/80 leading-relaxed font-medium">
                    <span className="text-cyan-500 mt-1 shrink-0">✦</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Side */}
            <div className="bg-gradient-to-bl from-purple-950/40 to-slate-900/40 border border-purple-500/20 p-4 md:p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/40 transition-colors">
              <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mt-16" />
              <h4 className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4 tracking-tight text-right md:text-left">
                {block.content.right.title}
              </h4>
              <ul className="space-y-2 lg:space-y-3">
                {block.content.right.points.map((point: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-purple-50/80 leading-relaxed font-medium justify-end md:justify-start">
                    <span className="text-purple-500 mt-1 shrink-0 md:order-first order-last hidden md:block">✦</span>
                    <span className="text-right md:text-left">{point}</span>
                    <span className="text-purple-500 mt-1 shrink-0 md:hidden block">✦</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      );

    case 'tip':
      return (
        <section className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start mt-6">
          <div className="p-2 bg-amber-500/20 rounded-xl shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-2">Pro Tip</h4>
            <p className="text-amber-200/80 text-base leading-relaxed">{block.content}</p>
          </div>
        </section>
      );

    case 'warning':
      return (
        <section className="bg-[#2a1717] border border-red-900/50 rounded-xl p-4 flex gap-3 items-start mt-6">
          <div className="p-2 bg-red-500/20 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h4 className="text-red-500 font-bold uppercase tracking-widest text-xs mb-2">Common Trap</h4>
            <p className="text-red-200/80 text-base leading-relaxed">{block.content}</p>
          </div>
        </section>
      );

    case 'htmlCode':
      return (
        <section className="mt-0 relative w-full overflow-hidden">
          <div dangerouslySetInnerHTML={{ __html: block.content }} className="w-full" />
        </section>
      );

    case 'interactiveTemperature':
      return <TemperatureGame />;

    default:
      return null;
  }
}
