import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStartVisit } from '../../src/hooks/useStartVisit';
import { visitsService } from '../../src/services/visits.service';

jest.mock('../../src/services/visits.service');
const mockedService = visitsService as jest.Mocked<typeof visitsService>;

const mockVisit = {
  id: 1,
  status: 'ONGOING' as const,
  createdAt: '2026-06-04T10:00:00Z',
  apartment: { identifier: '101', floor: 1, block: 'A', building: { name: 'Residencial Aurora' } },
};

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe('useStartVisit', () => {
  beforeEach(() => jest.clearAllMocks());

  it('chama startVisit com id correto', async () => {
    mockedService.startVisit.mockResolvedValueOnce(mockVisit);
    const { result } = renderHook(() => useStartVisit(1), { wrapper: makeWrapper() });
    await act(async () => { result.current.mutate(); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedService.startVisit).toHaveBeenCalledWith(1);
  });

  it('expõe isError em falha da mutation', async () => {
    mockedService.startVisit.mockRejectedValueOnce(new Error('Conflict'));
    const { result } = renderHook(() => useStartVisit(1), { wrapper: makeWrapper() });
    await act(async () => { result.current.mutate(); });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
