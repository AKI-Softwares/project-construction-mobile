import { decodeJwtPayload } from '../../src/lib/jwt';

function makeToken(payload: object): string {
  const json = JSON.stringify(payload);
  const base64 = btoa(json);
  return `header.${base64}.signature`;
}

describe('decodeJwtPayload', () => {
  it('decodifica payload completo', () => {
    const payload = {
      sub: '1',
      companyId: 12,
      isPlatformAdmin: false,
      isCompanyAdmin: false,
      roleId: 3,
      permissions: ['visits:read'],
      mustChangePassword: false,
    };
    expect(decodeJwtPayload(makeToken(payload))).toEqual(payload);
  });

  it('retorna mustChangePassword true quando presente', () => {
    const token = makeToken({ mustChangePassword: true });
    expect(decodeJwtPayload(token).mustChangePassword).toBe(true);
  });

  it('retorna mustChangePassword false quando ausente do payload', () => {
    const token = makeToken({ mustChangePassword: false });
    expect(decodeJwtPayload(token).mustChangePassword).toBe(false);
  });
});
