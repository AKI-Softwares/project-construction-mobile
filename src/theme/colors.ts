export const Colors = {
  // Backgrounds
  bg1: '#0F1520',
  bg2: '#162030',
  bg3: '#1E2C40',
  bg4: '#263348',

  // Accent
  amber: '#E8920C',
  amberL: '#F5A623',
  amberDim: 'rgba(232,146,12,0.12)',

  // Status
  ok: '#22C55E',
  okDim: 'rgba(34,197,94,0.10)',
  nc: '#EF4444',
  ncDim: 'rgba(239,68,68,0.10)',
  prog: '#EAB308',
  progDim: 'rgba(234,179,8,0.10)',
  pend: '#475569',
  pendDim: 'rgba(71,85,105,0.15)',

  // Texto
  t1: '#EDF0F5',
  t2: '#7D8FA3',
  t3: '#344456',

  // Border
  border: '#263348',
  borderM: 'rgba(38,51,72,0.6)',
} as const;

export type ColorKey = keyof typeof Colors;

export const StatusColors = {
  NOT_STARTED: Colors.pend,
  ONGOING: Colors.prog,
  FINALIZED: Colors.ok,
} as const;

export const VisitStatusConfig = {
  NOT_STARTED: { label: 'Pendente',      color: Colors.pend, dim: Colors.pendDim, sym: '○' },
  ONGOING:     { label: 'Em vistoria',   color: Colors.prog, dim: Colors.progDim, sym: '◎' },
  FINALIZED:   { label: 'Finalizado',    color: Colors.ok,   dim: Colors.okDim,   sym: '✓' },
} as const;

export const ItemStatusConfig = {
  OK:  { label: 'Conforme',      color: Colors.ok,   dim: Colors.okDim,   sym: '✓' },
  NOK: { label: 'Não conforme',  color: Colors.nc,   dim: Colors.ncDim,   sym: '✕' },
  NA:  { label: 'N/A',           color: Colors.pend, dim: Colors.pendDim, sym: '—' },
} as const;
