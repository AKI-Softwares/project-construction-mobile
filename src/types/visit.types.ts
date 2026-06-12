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

export interface Photo {
  id: number;
  url: string;
}

export interface NonConformity {
  id: number;
  description: string;
  photos: Photo[];
}

export interface VisitItem {
  id: number;
  serviceId: number;
  serviceName: string;
  status: 'OK' | 'NOK' | null;
  nonConformity: NonConformity | null;
}

export interface Room {
  id: number;
  name: string;
  isComplete: boolean;
  items: VisitItem[];
}

export interface Inspector {
  id: number;
  name: string;
}

export interface VisitDetail extends Visit {
  checklistId: number;
  observations: string | null;
  finalizedAt: string | null;
  inspector: Inspector;
  rooms: Room[];
}
