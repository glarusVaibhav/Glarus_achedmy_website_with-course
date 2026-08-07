import { ConceptStageData } from '@/types/engine';

export type ConceptType = 'standard' | 'code' | 'architecture' | 'comparison' | 'math' | 'seven-point';
export type UIStrategy = 'standard' | 'code-split' | 'comparison-split' | 'spatial' | 'seven-point-variations';

export interface Block {
  id: string;
  type: 'explanation' | 'example' | 'beforeAfter' | 'tip' | 'warning' | 'code' | 'comparison' | 'sevenPoint' | 'vsComparison' | 'htmlCode' | 'interactiveTemperature';
  content: any;
  metadata?: any;
}

export interface AnalysisResult {
  conceptType: ConceptType;
  uiStrategy: UIStrategy;
  blocks: Block[];
  complexity: 'low' | 'medium' | 'high';
  title?: string;
}

export function analyzeConcept(content: ConceptStageData['content']): AnalysisResult {
  // If the backend already provided blocks, just use them!
  if (content.blocks && Array.isArray(content.blocks)) {
     let conceptType: ConceptType = 'standard';
     let uiStrategy: UIStrategy = 'standard';
     
     if (content.blocks.some(b => b.type === 'sevenPoint')) {
         conceptType = 'seven-point';
         uiStrategy = 'seven-point-variations';
     } else if (content.blocks.some(b => b.type === 'vsComparison')) {
         conceptType = 'comparison';
         uiStrategy = 'comparison-split';
     } else if (content.blocks.some(b => b.type === 'code')) {
         conceptType = 'code';
         uiStrategy = 'code-split';
     }
     
     const finalBlocks = [...content.blocks];
     if (content.explanation && !finalBlocks.some(b => b.type === 'explanation' && b.id === 'explanation-top')) {
         finalBlocks.unshift({
             id: 'explanation-top',
             type: 'explanation',
             content: content.explanation
         });
     }
     
     return {
        conceptType,
        uiStrategy,
        blocks: finalBlocks,
        complexity: finalBlocks.length > 3 ? 'medium' : 'low',
        title: content.title
     };
  }

  const blocks: Block[] = [];
  let conceptType: ConceptType = 'standard';
  let uiStrategy: UIStrategy = 'standard';
  
  // 1. Analyze Content to determine ConceptType
  // Heuristics:
  const isSevenPoint = /\*\*1\. Beginner-friendly explanation:\*\*/i.test(content.explanation || '');
  // - Code: looks for code blocks or common JS/TS keywords.
  // - Architecture: looks for system design keywords.
  const hasCodeKeywords = 
    /(const|let|var|function|class|import|export|=>|\{\}|```)/i.test(content.explanation || '') || 
    (content.example && /(```|function|import|const|let|=>)/i.test(content.example)) ||
    (content.beforeAfter && /(```|function|import)/i.test(content.beforeAfter.before));

  const hasArchitectureKeywords = /(architecture|system|api|database|client|server|network)/i.test(content.explanation || '');
  const hasBeforeAfter = !!content.beforeAfter;
  
function parseSevenPoints(text: string) {
  const points = [];
  const regex = /\*\*([1-7])\.\s(.*?):\*\*\n([\s\S]*?)(?=\n\*\*[1-7]\.|$)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    points.push({
      number: parseInt(match[1], 10),
      title: match[2].trim(),
      body: match[3].trim()
    });
  }
  return points;
}

  if (isSevenPoint) {
    conceptType = 'seven-point';
    uiStrategy = 'seven-point-variations';
  } else if (hasCodeKeywords) {
    conceptType = 'code';
    uiStrategy = 'code-split';
  } else if (hasBeforeAfter || content.vs_comparison) {
    conceptType = 'comparison';
    uiStrategy = 'comparison-split';
  } else if (hasArchitectureKeywords) {
    conceptType = 'architecture';
    uiStrategy = 'spatial';
  }

  // 2. Map static fields to dynamic blocks
  if (content.explanation) {
    if (isSevenPoint) {
      blocks.push({ id: 'seven-point', type: 'sevenPoint', content: parseSevenPoints(content.explanation) });
    } else {
      blocks.push({ id: 'explanation', type: 'explanation', content: content.explanation });
    }
  }
  
  if (content.example) {
    // If it's a code concept, treat the example as a code block
    blocks.push({ 
        id: 'example', 
        type: conceptType === 'code' ? 'code' : 'example', 
        content: content.example 
    });
  }
  
  if (content.beforeAfter) {
    blocks.push({ id: 'beforeAfter', type: 'comparison', content: content.beforeAfter });
  }

  if (content.vs_comparison) {
    blocks.push({ id: 'vs_comparison', type: 'vsComparison', content: content.vs_comparison });
  }
  
  if (content.tip) {
    blocks.push({ id: 'tip', type: 'tip', content: content.tip });
  }
  
  if (content.warning) {
    blocks.push({ id: 'warning', type: 'warning', content: content.warning });
  }

  if (content.html_code) {
    blocks.push({ id: 'htmlCode', type: 'htmlCode', content: content.html_code });
  }

  // Calculate complexity (naive approach based on length and blocks)
  let complexity: 'low' | 'medium' | 'high' = 'low';
  if (blocks.length > 3 || (content.explanation && content.explanation.length > 500)) {
    complexity = 'medium';
  }
  if (blocks.length > 4 && (content.explanation && content.explanation.length > 1000)) {
    complexity = 'high';
  }

  return {
    conceptType,
    uiStrategy,
    blocks,
    complexity,
    title: content.title
  };
}
