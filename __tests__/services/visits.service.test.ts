import MockAdapter from 'axios-mock-adapter';
import { api } from '../../src/services/api';
import { visitsService } from '../../src/services/visits.service';
import type { VisitDetail } from '../../src/types/visit.types';

const mock = new MockAdapter(api);

const mockVisit = {
  id: 1,
  status: 'NOT_STARTED' as const,
  createdAt: '2026-06-04T10:00:00Z',
  apartment: {
    identifier: '101',
    floor: 1,
    block: 'A',
    building: { name: 'Residencial Aurora' },
  },
};

const mockVisitDetail: VisitDetail = {
  ...mockVisit,
  checklistId: 3,
  observations: null,
  finalizedAt: null,
  inspector: { id: 2, name: 'João' },
  rooms: [
    {
      id: 5,
      name: 'Sala',
      isComplete: false,
      items: [
        { id: 10, serviceId: 3, serviceName: 'Pintura', status: 'NOK', nonConformity: { id: 1, description: 'Risco na parede' } },
        { id: 11, serviceId: 4, serviceName: 'Rejunte', status: null, nonConformity: null },
      ],
    },
  ],
};

describe('visitsService', () => {
  afterEach(() => mock.reset());

  describe('getMyVisits', () => {
    it('retorna array de visitas', async () => {
      mock.onGet('/visits/mine').reply(200, [mockVisit]);
      const result = await visitsService.getMyVisits('NOT_STARTED,ONGOING');
      expect(result).toEqual([mockVisit]);
    });

    it('retorna array vazio quando não há visitas', async () => {
      mock.onGet('/visits/mine').reply(200, []);
      const result = await visitsService.getMyVisits('NOT_STARTED,ONGOING');
      expect(result).toEqual([]);
    });

    it('rejeita promise em erro de rede', async () => {
      mock.onGet('/visits/mine').networkError();
      await expect(visitsService.getMyVisits('NOT_STARTED,ONGOING')).rejects.toThrow();
    });
  });

  describe('getVisitById', () => {
    it('retorna VisitDetail por id', async () => {
      mock.onGet('/visits/1').reply(200, mockVisitDetail);
      const result = await visitsService.getVisitById(1);
      expect(result).toEqual(mockVisitDetail);
    });

    it('rejeita em 404', async () => {
      mock.onGet('/visits/99').reply(404);
      await expect(visitsService.getVisitById(99)).rejects.toThrow();
    });

    it('rejeita em erro de rede', async () => {
      mock.onGet('/visits/1').networkError();
      await expect(visitsService.getVisitById(1)).rejects.toThrow();
    });
  });

  describe('startVisit', () => {
    it('retorna visit com status ONGOING', async () => {
      const started = { ...mockVisit, status: 'ONGOING' as const };
      mock.onPatch('/visits/1/start').reply(200, started);
      const result = await visitsService.startVisit(1);
      expect(result.status).toBe('ONGOING');
    });

    it('rejeita em 409 (visita já iniciada)', async () => {
      mock.onPatch('/visits/1/start').reply(409);
      await expect(visitsService.startVisit(1)).rejects.toThrow();
    });
  });

  describe('evaluateItem', () => {
    it('retorna VisitItem com status atualizado', async () => {
      const updated = {
        id: 10,
        serviceId: 3,
        serviceName: 'Pintura',
        status: 'OK' as const,
        nonConformity: null,
      };
      mock.onPatch('/visits/1/items/10').reply(200, updated);
      const result = await visitsService.evaluateItem(1, 10, 'OK');
      expect(result.status).toBe('OK');
    });

    it('rejeita em 409 (guard de cômodo)', async () => {
      mock.onPatch('/visits/1/items/10').reply(409);
      await expect(visitsService.evaluateItem(1, 10, 'NOK')).rejects.toThrow();
    });

    it('rejeita em erro de rede', async () => {
      mock.onPatch('/visits/1/items/10').networkError();
      await expect(visitsService.evaluateItem(1, 10, 'OK')).rejects.toThrow();
    });

    it('envia status null para reverter item', async () => {
      const reverted = {
        id: 10,
        serviceId: 3,
        serviceName: 'Pintura',
        status: null,
        nonConformity: null,
      };
      mock.onPatch('/visits/1/items/10').reply(200, reverted);
      const result = await visitsService.evaluateItem(1, 10, null);
      expect(result.status).toBeNull();
    });
  });

  describe('finalizeVisit', () => {
    it('retorna visit com status FINALIZED', async () => {
      const finalized = { ...mockVisit, status: 'FINALIZED' as const };
      mock.onPatch('/visits/1').reply(200, finalized);
      const result = await visitsService.finalizeVisit(1);
      expect(result.status).toBe('FINALIZED');
    });

    it('rejeita em 409 (itens pendentes)', async () => {
      mock.onPatch('/visits/1').reply(409);
      await expect(visitsService.finalizeVisit(1)).rejects.toThrow();
    });
  });
});
