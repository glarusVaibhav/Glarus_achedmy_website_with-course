import { useEffect, useState, useRef } from 'react';
import { useAudioStore } from '@/lib/store/audioStore';

export interface SubtitlePosition {
  subtitleIndex: number;
  startTime: number;
  endTime: number;
  nodes: { node: Text; startOffset: number; endOffset: number }[];
}

export function useAudioHighlighter(
  containerRef: React.RefObject<HTMLElement | null>,
  onSeek?: (time: number) => void
) {
  const subtitleData = useAudioStore((s) => s.subtitleData);
  const currentTime = useAudioStore((s) => s.currentTime);
  const isAudioMode = useAudioStore((s) => s.isAudioMode);
  const lastActiveIdxRef = useRef<number | null>(null);
  
  const cacheRef = useRef<SubtitlePosition[]>([]);
  const isCacheDirty = useRef<boolean>(true);

  // Rebuild cache when DOM mutates
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new MutationObserver((mutations) => {
      // Ignore mutations caused by our own highlights (e.g. spans being added/removed)
      const hasContentMutation = mutations.some(m => {
        if (m.type === 'childList') {
          return Array.from(m.addedNodes).some(n => (n as HTMLElement).className !== 'audio-highlight') ||
                 Array.from(m.removedNodes).some(n => (n as HTMLElement).className !== 'audio-highlight');
        }
        return m.type === 'characterData';
      });

      if (hasContentMutation) {
        isCacheDirty.current = true;
      }
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [containerRef]);

  // Also dirty cache when subtitleData changes
  useEffect(() => {
    isCacheDirty.current = true;
    clearHighlights();
    lastActiveIdxRef.current = null;
  }, [subtitleData]);

  const buildCache = () => {
    if (!containerRef.current || !subtitleData || subtitleData.length === 0) return;
    
    // Clear existing cache
    cacheRef.current = [];
    isCacheDirty.current = false;

    const root = containerRef.current;
    const normalize = (str: string) => str.replace(/[^a-zA-Z]/g, '').toLowerCase();

    // Fast path: clean any existing old highlights before walking
    // This shouldn't be strictly necessary if MutationObserver avoids them, but safe to do.
    
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        // Skip text inside our own highlight fallback spans to avoid duplicate mapping if we rebuild while highlighted
        if (node.parentElement?.classList.contains('audio-highlight')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    
    const textNodes: Text[] = [];
    let currentNode: Node | null;
    
    while ((currentNode = walker.nextNode())) {
      if (currentNode.parentElement?.tagName !== 'SCRIPT' && currentNode.parentElement?.tagName !== 'STYLE') {
        textNodes.push(currentNode as Text);
      }
    }

    let globalNormalizedText = "";
    const nodeMap: { node: Text; startPos: number; endPos: number; originalText: string }[] = [];
    
    for (const node of textNodes) {
      const originalText = node.nodeValue || "";
      const startPos = globalNormalizedText.length;
      globalNormalizedText += normalize(originalText);
      nodeMap.push({
        node,
        startPos,
        endPos: globalNormalizedText.length,
        originalText
      });
    }

    let currentOffset = 0;

    for (let i = 0; i < subtitleData.length; i++) {
      const sub = subtitleData[i];
      const normSub = normalize(sub.text);
      if (!normSub) continue;

      let idx = globalNormalizedText.indexOf(normSub, currentOffset);
      
      if (idx !== -1) {
        const jump = idx - currentOffset;
        let isValidJump = true;
        
        if (jump > 60) {
          isValidJump = false;
          let lookaheadText = "";
          for (let j = i + 1; j < subtitleData.length; j++) {
            lookaheadText += normalize(subtitleData[j].text);
            if (lookaheadText.length >= 6) break;
          }

          if (lookaheadText.length > 0) {
            const nextIdx = globalNormalizedText.indexOf(lookaheadText, idx + normSub.length);
            const gap = nextIdx - (idx + normSub.length);
            if (nextIdx !== -1 && gap >= 0 && gap < 40) {
              isValidJump = true;
            }
          } else if (normSub.length >= 5) {
            isValidJump = true;
          }
        }

        if (isValidJump) {
          const matchStart = idx;
          const matchEnd = idx + normSub.length;
          
          const nodesToHighlight: { node: Text, startOffset: number, endOffset: number }[] = [];

          for (const mapped of nodeMap) {
            if (mapped.endPos <= matchStart || mapped.startPos >= matchEnd) continue;

            let nodeMatchStartNorm = Math.max(0, matchStart - mapped.startPos);
            let nodeMatchEndNorm = Math.min(mapped.endPos - mapped.startPos, matchEnd - mapped.startPos);

            let originalStart = 0;
            let normCount = 0;
            while (normCount < nodeMatchStartNorm && originalStart < mapped.originalText.length) {
              if (/[a-zA-Z]/.test(mapped.originalText[originalStart])) normCount++;
              originalStart++;
            }

            let originalEnd = originalStart;
            normCount = 0;
            while (normCount < (nodeMatchEndNorm - nodeMatchStartNorm) && originalEnd < mapped.originalText.length) {
              if (/[a-zA-Z]/.test(mapped.originalText[originalEnd])) normCount++;
              originalEnd++;
            }

            nodesToHighlight.push({
              node: mapped.node,
              startOffset: originalStart,
              endOffset: originalEnd
            });
          }

          if (nodesToHighlight.length > 0) {
            cacheRef.current.push({
              subtitleIndex: i,
              startTime: sub.start,
              endTime: sub.end,
              nodes: nodesToHighlight
            });
          }

          currentOffset = idx + normSub.length;
        }
      }
    }
  };

  // Click to seek handler
  useEffect(() => {
    if (!containerRef.current || !onSeek) return;

    const handleClick = (e: MouseEvent) => {
      // Ensure we have a cache to search through
      if (isCacheDirty.current) {
        buildCache();
      }

      // Find the clicked text node
      let clickedNode: Node | null = null;
      let clickedOffset = 0;

      // Use standard modern API if available
      if (document.caretPositionFromPoint) {
        const range = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (range) {
          clickedNode = range.offsetNode;
          clickedOffset = range.offset;
        }
      } else if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (range) {
          clickedNode = range.startContainer;
          clickedOffset = range.startOffset;
        }
      } else {
        // Fallback: check if the event target itself is a text node wrapper (like our fallback spans)
        const target = e.target as HTMLElement;
        if (target.classList.contains('audio-highlight') && target.firstChild) {
            clickedNode = target.firstChild;
            clickedOffset = 0; // rough approximation
        }
      }

      if (clickedNode && clickedNode.nodeType === Node.TEXT_NODE) {
        // Search cache for the subtitle containing this exact node and offset
        for (const pos of cacheRef.current) {
          for (const n of pos.nodes) {
            // Because fallback spans might replace nodes, we have to match the original node
            // But if fallback span was used, the node might have been split.
            // If the node exactly matches (which it will with CSS Highlight API)
            if (n.node === clickedNode || n.node.textContent === clickedNode.textContent) {
               // We found a match. If we're strictly checking offset:
               // if (clickedOffset >= n.startOffset && clickedOffset <= n.endOffset) { ... }
               // But it's safer to just jump to the subtitle if the node matches
               onSeek(pos.startTime);
               return;
            }
          }
        }
      } else {
        // If they clicked on an element containing text (e.g., a p tag), try to map it by finding if any cache node is inside it
        const target = e.target as HTMLElement;
        for (const pos of cacheRef.current) {
           for (const n of pos.nodes) {
              if (target.contains(n.node)) {
                 onSeek(pos.startTime);
                 return;
              }
           }
        }
      }
    };

    const root = containerRef.current;
    root.addEventListener('click', handleClick);
    return () => root.removeEventListener('click', handleClick);
  }, [containerRef, onSeek, subtitleData]);


  // Highlight sync
  useEffect(() => {
    if (!isAudioMode || !containerRef.current || !subtitleData || subtitleData.length === 0) {
      clearHighlights();
      lastActiveIdxRef.current = null;
      return;
    }

    if (isCacheDirty.current) {
      buildCache();
    }

    let activeIdx = subtitleData.findIndex(s => currentTime >= s.start && currentTime <= s.end);
    if (activeIdx === -1) {
      const nextIdx = subtitleData.findIndex(s => s.start > currentTime);
      activeIdx = nextIdx !== -1 ? nextIdx - 1 : subtitleData.length - 1;
    }
    
    if (activeIdx < 0) {
      clearHighlights();
      lastActiveIdxRef.current = null;
      return;
    }

    if (activeIdx === lastActiveIdxRef.current) {
      return;
    }

    lastActiveIdxRef.current = activeIdx;
    clearHighlights();
    
    const pos = cacheRef.current.find(p => p.subtitleIndex === activeIdx);
    if (pos) {
      highlightTextInDOM(pos);
    }

    return () => {}
  }, [currentTime, subtitleData, isAudioMode, containerRef]);

  const clearHighlights = () => {
    if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
      (CSS as any).highlights.delete('audio-highlight');
    }

    if (!containerRef.current) return;
    const highlights = containerRef.current.querySelectorAll('.audio-highlight');
    highlights.forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
        parent.normalize(); 
      }
    });
  };

  const highlightTextInDOM = (pos: SubtitlePosition) => {
    const nodesToHighlight = pos.nodes;

    if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
      const ranges = nodesToHighlight.map(({ node, startOffset, endOffset }) => {
        const range = document.createRange();
        // Catch DOM exceptions in case the node was removed or changed without our observer catching it yet
        try {
          range.setStart(node, startOffset);
          range.setEnd(node, endOffset);
        } catch(e) {
           return null;
        }
        return range;
      }).filter(r => r !== null) as Range[];
      
      if (ranges.length > 0) {
        const highlight = new (window as any).Highlight(...ranges);
        (CSS as any).highlights.set('audio-highlight', highlight);
        
        const firstNode = ranges[0].startContainer;
        const el = firstNode.parentElement;
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
      return;
    }

    // Fallback for older browsers
    nodesToHighlight.slice().reverse().forEach(({ node, startOffset, endOffset }) => {
      if (endOffset <= startOffset) return;
      try {
        const range = document.createRange();
        range.setStart(node, startOffset);
        range.setEnd(node, endOffset);
        
        const span = document.createElement('span');
        span.className = 'audio-highlight bg-blue-600/50 text-white rounded-sm px-[2px] transition-colors duration-300 shadow-[0_0_8px_rgba(37,99,235,0.5)]';
        
        range.surroundContents(span);
        
        span.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      } catch (e) {
        console.warn("Could not highlight text node", e);
      }
    });
  };
}
