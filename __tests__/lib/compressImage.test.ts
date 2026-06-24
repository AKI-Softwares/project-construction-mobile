import { compressImage } from '../../src/lib/compressImage';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn(),
}));

const mockManipulate = require('expo-image-manipulator').manipulateAsync as jest.Mock;
const mockGetInfo = require('expo-file-system').getInfoAsync as jest.Mock;

const MB = 1024 * 1024;

describe('compressImage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna uri original se tamanho <= 2MB', async () => {
    mockGetInfo.mockResolvedValue({ size: 1 * MB });
    const result = await compressImage('file:///original.jpg');
    expect(result.uri).toBe('file:///original.jpg');
    expect(mockManipulate).not.toHaveBeenCalled();
  });

  it('tenta quality 0.6 se > 2MB e resultado cabe', async () => {
    mockGetInfo
      .mockResolvedValueOnce({ size: 4 * MB })
      .mockResolvedValueOnce({ size: 1.5 * MB });
    mockManipulate.mockResolvedValue({ uri: 'file:///compressed.jpg', width: 4000, height: 3000 });

    const result = await compressImage('file:///big.jpg');
    expect(mockManipulate).toHaveBeenCalledWith('file:///big.jpg', [], { compress: 0.6, format: 'jpeg' });
    expect(result.uri).toBe('file:///compressed.jpg');
  });

  it('tenta quality 0.4 se quality 0.6 ainda > 2MB', async () => {
    mockGetInfo
      .mockResolvedValueOnce({ size: 4 * MB })
      .mockResolvedValueOnce({ size: 3 * MB })
      .mockResolvedValueOnce({ size: 1.5 * MB });
    mockManipulate.mockResolvedValue({ uri: 'file:///c.jpg', width: 4000, height: 3000 });

    const result = await compressImage('file:///big.jpg');
    expect(mockManipulate).toHaveBeenCalledTimes(2);
    expect(mockManipulate).toHaveBeenLastCalledWith('file:///big.jpg', [], { compress: 0.4, format: 'jpeg' });
    expect(result.uri).toBe('file:///c.jpg');
  });

  it('redimensiona 50% se quality 0.4 ainda > 2MB', async () => {
    mockGetInfo
      .mockResolvedValueOnce({ size: 4 * MB })
      .mockResolvedValueOnce({ size: 3 * MB })
      .mockResolvedValueOnce({ size: 2.5 * MB });
    mockManipulate
      .mockResolvedValueOnce({ uri: 'file:///c1.jpg', width: 4000, height: 3000 })
      .mockResolvedValueOnce({ uri: 'file:///c1.jpg', width: 4000, height: 3000 })
      .mockResolvedValueOnce({ uri: 'file:///small.jpg', width: 2000, height: 1500 });

    const result = await compressImage('file:///big.jpg');
    expect(mockManipulate).toHaveBeenCalledTimes(3);
    expect(mockManipulate).toHaveBeenLastCalledWith(
      'file:///c1.jpg',
      [{ resize: { width: 2000 } }],
      { compress: 0.5, format: 'jpeg' },
    );
    expect(result.uri).toBe('file:///small.jpg');
  });

  it('retorna mimeType image/jpeg e fileName photo.jpg', async () => {
    mockGetInfo.mockResolvedValue({ size: 0.5 * MB });
    const result = await compressImage('file:///photo.jpg');
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.fileName).toBe('photo.jpg');
  });
});
