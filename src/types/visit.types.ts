// src/types/visit.types.ts
export type VisitStatus = 'NOT_STARTED' | 'ONGOING' | 'FINALIZED';

export interface Building {
  name: string;
}

export interface Apartment {
  identifier: string;
  floor: number;
  block: string;
  building: Building;
}

export interface Visit {
  id: number;
  status: VisitStatus;
  createdAt: string;
  apartment: Apartment;
}
