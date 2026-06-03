export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://project-construction-back.vercel.app';

export const QUERY_KEYS = {
  ME: ['auth', 'me'] as const,
  VISITS_MINE: ['visits', 'mine'] as const,
  VISIT_DETAIL: (id: number) => ['visits', id] as const,
} as const;
