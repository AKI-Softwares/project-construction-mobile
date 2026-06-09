import MockAdapter from 'axios-mock-adapter';
import { api } from '../../src/services/api';
import { photosService } from '../../src/services/photos.service';
import type { Photo } from '../../src/types/visit.types';

const mock = new MockAdapter(api);

const mockPhoto: Photo = { id: 1, url: 'https://cdn.example.com/photo.jpg' };
const localPhoto = { uri: 'file:///tmp/photo.jpg', fileName: 'photo.jpg', mimeType: 'image/jpeg' };

describe('photosService', () => {
  afterEach(() => mock.reset());

  describe('add', () => {
    it('faz upload e retorna Photo', async () => {
      mock.onPost('/non-conformities/1/photos').reply(201, mockPhoto);
      const result = await photosService.add(1, localPhoto);
      expect(result).toEqual(mockPhoto);
    });

    it('envia multipart/form-data', async () => {
      mock.onPost('/non-conformities/1/photos').reply(201, mockPhoto);
      await photosService.add(1, localPhoto);
      expect(mock.history.post[0].headers?.['Content-Type']).toMatch(/multipart\/form-data/);
    });

    it('rejeita em erro de rede', async () => {
      mock.onPost('/non-conformities/1/photos').networkError();
      await expect(photosService.add(1, localPhoto)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('deleta foto sem retorno', async () => {
      mock.onDelete('/photos/1').reply(204);
      await expect(photosService.remove(1)).resolves.toBeUndefined();
    });

    it('rejeita em 404', async () => {
      mock.onDelete('/photos/99').reply(404);
      await expect(photosService.remove(99)).rejects.toThrow();
    });
  });
});
