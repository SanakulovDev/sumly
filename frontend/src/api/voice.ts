import { api } from './client';
import type { VoiceParseResult } from '../types';

export const voiceApi = {
  // Parses a transcribed sentence into a transaction draft.
  parse: (text: string, lang: string) =>
    api
      .post<{ data: VoiceParseResult }>('/api/voice/parse', { text, lang })
      .then((r) => r.data.data),
};
