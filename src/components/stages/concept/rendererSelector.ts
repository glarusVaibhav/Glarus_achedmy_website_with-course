import { UIStrategy } from './conceptAnalyzer';

export type RendererKey = 'standard' | 'code' | 'comparison' | 'spatial' | 'seven-point';

export function selectRenderer(strategy: UIStrategy): RendererKey {
  switch (strategy) {
    case 'code-split':
      return 'code';
    case 'comparison-split':
      return 'comparison';
    case 'spatial':
      return 'spatial';
    case 'seven-point-variations':
      return 'seven-point';
    case 'standard':
    default:
      return 'standard';
  }
}
