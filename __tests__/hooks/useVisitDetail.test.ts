import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVisitDetail } from '../../src/hooks/useVisitDetail';
import { visitsService } from '../../src/services/visits.service';
import type { VisitDetail } from '../../src/types/visit.types';

jest.mock('../../src/services/visits.service');
const mockedService = visitsService as jest.Mocked<typeof visitsService>;

const mockVisitDetail: VisitDetail = {
  id: 7,
  checklistId: 3,
  status: 'ONGOING',
  observations: null,
  finalizedAt: null,
  createdAt: '2026-06-01T10:00:00Z',
  inspector: { id: 2, name: 'João' },
  apartment: { identifier: '101', floor: 1, block: 'A', building: { name: 'Residencial Aurora' } },
  rooms: [
    { id: 5, name: 'Sala', isComplete: false, items: [] },
    { id: 6, name: 'Quarto 1', isComplete: true, items: [] },
  ],
};

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe('useVisitDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('estado loading inicial', () => {
    mockedService.getVisitById.mockResolvedValueOnce(mockVisitDetail);
    const { result } = renderHook(() => useVisitDetail(7), { wrapper: makeWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('retorna VisitDetail com sucesso', async () => {
    mockedService.getVisitById.mockResolvedValueOnce(mockVisitDetail);
    const { result } = renderHook(() => useVisitDetail(7), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockVisitDetail);
    expect(mockedService.getVisitById).toHaveBeenCalledWith(7);
  });

  it('estado de erro em falha', async () => {
    mockedService.getVisitById.mockRejectedValueOnce(new Error('Network Error'));
    const { result } = renderHook(() => useVisitDetail(7), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
