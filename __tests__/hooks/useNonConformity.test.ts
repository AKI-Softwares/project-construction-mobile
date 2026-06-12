import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNonConformity } from '../../src/hooks/useNonConformity';
import { nonConformitiesService } from '../../src/services/non-conformities.service';

jest.mock('../../src/services/non-conformities.service');
const mockedSvc = nonConformitiesService as jest.Mocked<typeof nonConformitiesService>;

const mockNC = { id: 1, description: 'Risco', photos: [] };

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe('useNonConformity', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createMutation chama service.create com visitItemId e description', async () => {
    mockedSvc.create.mockResolvedValueOnce(mockNC);
    const { result } = renderHook(() => useNonConformity(1), { wrapper: makeWrapper() });
    await act(async () => {
      result.current.createMutation.mutate({ visitItemId: 10, description: 'Risco' });
    });
    await waitFor(() => expect(result.current.createMutation.isSuccess).toBe(true));
    expect(mockedSvc.create).toHaveBeenCalledWith(10, 'Risco');
  });

  it('createMutation expõe isError em falha', async () => {
    mockedSvc.create.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useNonConformity(1), { wrapper: makeWrapper() });
    await act(async () => {
      result.current.createMutation.mutate({ visitItemId: 10, description: 'x' });
    });
    await waitFor(() => expect(result.current.createMutation.isError).toBe(true));
  });

  it('patchMutation chama service.patch com id e description', async () => {
    mockedSvc.patch.mockResolvedValueOnce({ ...mockNC, description: 'Nova' });
    const { result } = renderHook(() => useNonConformity(1), { wrapper: makeWrapper() });
    await act(async () => {
      result.current.patchMutation.mutate({ id: 1, description: 'Nova' });
    });
    await waitFor(() => expect(result.current.patchMutation.isSuccess).toBe(true));
    expect(mockedSvc.patch).toHaveBeenCalledWith(1, 'Nova');
  });
});
