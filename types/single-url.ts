import type { ComplianceResult } from '@/lib/style-guide/types';

/**
 * Request payload for single URL processing
 */
export interface SingleURLRequest {
  url: string;
}

/**
 * Response from single URL processing
 */
export interface SingleURLResponse {
  success: boolean;
  error?: string;
  result?: {
    url: string;
    title: string;
    description: string;
    titleCharCount: number;
    descriptionCharCount: number;
    compliance: ComplianceResult;
    model: string;
    retryCount: number;
    existingTitle?: string;
    existingDescription?: string;
  };
}

/**
 * UI state for single URL processing
 */
export interface SingleURLState {
  url: string;
  loading: boolean;
  error: string | null;
  result: SingleURLResponse['result'] | null;
}
