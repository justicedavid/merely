import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function addAccountCreate(token) {
  const access = await fetchWithTimeout(`/admin/accounts?token=${encodeURIComponent(token)}`, { method: 'POST' })
  checkResponse(access);
  return await access.json()
}

