import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePhoto } from '../../src/hooks/usePhoto';
import { photosService } from '../../src/services/photos.service';

jest.mock('../../src/services/photos.service');
const mockedSvc = photosService as jest.Mocked<typeof photosService>;

const mockPhoto = { id: 1, url: 'https://cdn.example.com/p.jpg' };
const localPhoto = { uri: 'file:///p.jpg', fileName: 'p.jpg', mimeType: 'image/jpeg' };

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe('usePhoto', () => {
  beforeEach(() => jest.clearAllMocks());

  it('addMutation chama service.add com ncId e photo', async () => {
    mockedSvc.add.mockResolvedValueOnce(mockPhoto);
    const { result } = renderHook(() => usePhoto(1), { wrapper: makeWrapper() });
    await act(async () => {
      result.current.addMutation.mutate({ ncId: 5, photo: localPhoto });
    });
    await waitFor(() => expect(result.current.addMutation.isSuccess).toBe(true));
    expect(mockedSvc.add).toHaveBeenCalledWith(5, localPhoto);
  });

  it('deleteMutation chama service.remove com photoId', async () => {
    mockedSvc.remove.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => usePhoto(1), { wrapper: makeWrapper() });
    await act(async () => {
      result.current.deleteMutation.mutate(3);
    });
    await waitFor(() => expect(result.current.deleteMutation.isSuccess).toBe(true));
    expect(mockedSvc.remove).toHaveBeenCalledWith(3);
  });

  it('addMutation expõe isError em falha', async () => {
    mockedSvc.add.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => usePhoto(1), { wrapper: makeWrapper() });
    await act(async () => {
      result.current.addMutation.mutate({ ncId: 5, photo: localPhoto });
    });
    await waitFor(() => expect(result.current.addMutation.isError).toBe(true));
  });
});
