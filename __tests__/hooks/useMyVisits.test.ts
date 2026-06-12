import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMyVisits } from '../../src/hooks/useMyVisits';
import { visitsService } from '../../src/services/visits.service';

jest.mock('../../src/services/visits.service');
const mockedService = visitsService as jest.Mocked<typeof visitsService>;

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

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe('useMyVisits', () => {
  beforeEach(() => jest.clearAllMocks());

  it('estado loading inicial', () => {
    mockedService.getMyVisits.mockResolvedValueOnce([mockVisit]);
    const { result } = renderHook(() => useMyVisits(), { wrapper: makeWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('retorna visitas com sucesso', async () => {
    mockedService.getMyVisits.mockResolvedValueOnce([mockVisit]);
    const { result } = renderHook(() => useMyVisits(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockVisit]);
    expect(mockedService.getMyVisits).toHaveBeenCalledWith('NOT_STARTED,ONGOING');
  });

  it('retorna array vazio sem visitas', async () => {
    mockedService.getMyVisits.mockResolvedValueOnce([]);
    const { result } = renderHook(() => useMyVisits(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('estado de erro em falha', async () => {
    mockedService.getMyVisits.mockRejectedValueOnce(new Error('Network Error'));
    const { result } = renderHook(() => useMyVisits(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
