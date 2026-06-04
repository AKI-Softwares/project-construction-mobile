import MockAdapter from 'axios-mock-adapter';
import { api } from '../../src/services/api';
import { visitsService } from '../../src/services/visits.service';

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
});
