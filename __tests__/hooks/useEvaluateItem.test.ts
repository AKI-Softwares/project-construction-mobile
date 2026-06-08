import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEvaluateItem } from '../../src/hooks/useEvaluateItem';
import { visitsService } from '../../src/services/visits.service';

jest.mock('../../src/services/visits.service');
const mockedService = visitsService as jest.Mocked<typeof visitsService>;

const mockItem = {
  id: 10,
  serviceId: 3,
  serviceName: 'Pintura',
  status: 'OK' as const,
  nonConformity: null,
};

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe('useEvaluateItem', () => {
  beforeEach(() => jest.clearAllMocks());

  it('chama evaluateItem com itemId e status corretos', async () => {
    mockedService.evaluateItem.mockResolvedValueOnce(mockItem);
    const { result } = renderHook(() => useEvaluateItem(1), { wrapper: makeWrapper() });
    result.current.mutate({ itemId: 10, status: 'OK' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedService.evaluateItem).toHaveBeenCalledWith(10, 'OK');
  });

  it('expõe isError em falha da mutation', async () => {
    mockedService.evaluateItem.mockRejectedValueOnce(new Error('Conflict'));
    const { result } = renderHook(() => useEvaluateItem(1), { wrapper: makeWrapper() });
    result.current.mutate({ itemId: 10, status: 'NOK' });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
