import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFinalizeVisit } from '../../src/hooks/useFinalizeVisit';
import { visitsService } from '../../src/services/visits.service';

jest.mock('../../src/services/visits.service');
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: jest.fn() }) }));

const mockedService = visitsService as jest.Mocked<typeof visitsService>;

const mockVisit = {
  id: 1,
  status: 'FINALIZED' as const,
  createdAt: '2026-06-01T10:00:00Z',
  apartment: { identifier: '101', floor: 1, block: 'A', building: { name: 'Aurora' } },
};

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe('useFinalizeVisit', () => {
  beforeEach(() => jest.clearAllMocks());

  it('chama finalizeVisit com visitId correto', async () => {
    mockedService.finalizeVisit.mockResolvedValueOnce(mockVisit);
    const { result } = renderHook(() => useFinalizeVisit(1), { wrapper: makeWrapper() });
    await act(async () => { result.current.mutate(); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedService.finalizeVisit).toHaveBeenCalledWith(1);
  });

  it('expõe isError em falha', async () => {
    mockedService.finalizeVisit.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useFinalizeVisit(1), { wrapper: makeWrapper() });
    await act(async () => { result.current.mutate(); });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
