export interface ThemeColors {
  bg: string;
  bgAlt: string;
  surface: string;
  surfacePressed: string;
  teal: string;
  tealDark: string;
  tealDim: string;
  ok: string;
  okDim: string;
  nok: string;
  nokDim: string;
  nc: string;
  ncDim: string;
  waiting: string;
  waitingDim: string;
  progressFill: string;
  progressTrack: string;
  t1: string;
  t2: string;
  t3: string;
  inputBg: string;
  border: string;
  borderOk: string;
  borderNok: string;
}

export const NavColors = {
  navBg:  '#1B2A46',
  tabBg:  '#162030',
  teal:   '#22C4CC',
  tNav:   '#EDF0F5',
} as const;

export const LightColors: ThemeColors = {
  bg:             '#FFFFFF',
  bgAlt:          '#F5F6F8',
  surface:        '#FFFFFF',
  surfacePressed: '#F0F4F8',
  teal:           '#22C4CC',
  tealDark:       '#1BA8B0',
  tealDim:        'rgba(34,196,204,0.12)',
  ok:             '#22C4CC',
  okDim:          'rgba(34,196,204,0.12)',
  nok:            '#F57C00',
  nokDim:         'rgba(245,124,0,0.12)',
  nc:             '#EF4444',
  ncDim:          'rgba(239,68,68,0.10)',
  waiting:        '#8A9BAD',
  waitingDim:     'rgba(138,155,173,0.15)',
  progressFill:   '#F5A623',
  progressTrack:  '#CBD5E0',
  t1:             '#1A2B45',
  t2:             '#6B7F94',
  t3:             '#9AAAB8',
  inputBg:        '#EAECF0',
  border:         '#E2E8F0',
  borderOk:       '#22C4CC',
  borderNok:      '#EF4444',
};

export const DarkColors: ThemeColors = {
  bg:             '#0F1520',
  bgAlt:          '#162030',
  surface:        '#162030',
  surfacePressed: '#1E2C40',
  teal:           '#22C4CC',
  tealDark:       '#1BA8B0',
  tealDim:        'rgba(34,196,204,0.12)',
  ok:             '#22C4CC',
  okDim:          'rgba(34,196,204,0.12)',
  nok:            '#F57C00',
  nokDim:         'rgba(245,124,0,0.12)',
  nc:             '#EF4444',
  ncDim:          'rgba(239,68,68,0.10)',
  waiting:        '#8A9BAD',
  waitingDim:     'rgba(138,155,173,0.15)',
  progressFill:   '#F5A623',
  progressTrack:  '#344456',
  t1:             '#EDF0F5',
  t2:             '#7D8FA3',
  t3:             '#344456',
  inputBg:        '#263348',
  border:         '#263348',
  borderOk:       '#22C4CC',
  borderNok:      '#EF4444',
};

export const VisitStatusConfig = {
  NOT_STARTED: { label: 'Aguardando',   color: '#8A9BAD', dim: 'rgba(138,155,173,0.15)', icon: 'time-outline'           as const },
  ONGOING:     { label: 'Em vistoria',  color: '#22C4CC', dim: 'rgba(34,196,204,0.12)',  icon: 'checkmark-circle-outline' as const },
  FINALIZED:   { label: 'Finalizado',   color: '#22C4CC', dim: 'rgba(34,196,204,0.12)',  icon: 'checkmark-circle'         as const },
} as const;

export const ItemStatusConfig = {
  OK:  { label: 'OK',     color: '#22C4CC', dim: 'rgba(34,196,204,0.12)',  icon: 'checkmark-circle' as const },
  NOK: { label: 'NOK',   color: '#F57C00', dim: 'rgba(245,124,0,0.12)',   icon: 'alert-circle'     as const },
  NA:  { label: 'Avaliar', color: '#8A9BAD', dim: 'rgba(138,155,173,0.15)', icon: 'time-outline'    as const },
} as const;

// Legacy export para compatibilidade com qualquer import restante
export const Colors = DarkColors;
export type ColorKey = keyof ThemeColors;
