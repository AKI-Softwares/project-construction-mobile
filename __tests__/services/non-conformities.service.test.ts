import MockAdapter from 'axios-mock-adapter';
import { api } from '../../src/services/api';
import { nonConformitiesService } from '../../src/services/non-conformities.service';
import type { NonConformity } from '../../src/types/visit.types';

const mock = new MockAdapter(api);

const mockNC: NonConformity = {
  id: 1,
  description: 'Risco na parede',
  photos: [],
};

describe('nonConformitiesService', () => {
  afterEach(() => mock.reset());

  describe('create', () => {
    it('cria NC e retorna objeto', async () => {
      mock.onPost('/non-conformities').reply(201, mockNC);
      const result = await nonConformitiesService.create(10, 'Risco na parede');
      expect(result).toEqual(mockNC);
    });

    it('envia visitItemId e description no body', async () => {
      mock.onPost('/non-conformities').reply(201, mockNC);
      await nonConformitiesService.create(10, 'Risco na parede');
      expect(mock.history.post[0].data).toBe(JSON.stringify({ visitItemId: 10, description: 'Risco na parede' }));
    });

    it('rejeita em erro de rede', async () => {
      mock.onPost('/non-conformities').networkError();
      await expect(nonConformitiesService.create(10, 'desc')).rejects.toThrow();
    });
  });

  describe('patch', () => {
    it('atualiza descrição e retorna NC', async () => {
      const updated = { ...mockNC, description: 'Nova descrição' };
      mock.onPatch('/non-conformities/1').reply(200, updated);
      const result = await nonConformitiesService.patch(1, 'Nova descrição');
      expect(result.description).toBe('Nova descrição');
    });

    it('rejeita em 404', async () => {
      mock.onPatch('/non-conformities/99').reply(404);
      await expect(nonConformitiesService.patch(99, 'desc')).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('deleta NC sem retorno', async () => {
      mock.onDelete('/non-conformities/1').reply(204);
      await expect(nonConformitiesService.remove(1)).resolves.toBeUndefined();
    });

    it('rejeita em 404', async () => {
      mock.onDelete('/non-conformities/99').reply(404);
      await expect(nonConformitiesService.remove(99)).rejects.toThrow();
    });
  });
});
