import { normalizeAddress } from '../address'
import { guessCoinType } from '../coin-type'

export async function getBitAccountInfo(did: string): Promise<{
  manager: string | null
  owner: string | null
  createdAt: Date | null
}> {
  try {
    const response = await fetch('https://indexer-v1.did.id/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'das_accountInfo',
        params: [{ account: did.endsWith('.bit') ? did : `${did}.bit` }],
      }),
    })
    const json = (await response.json()) as {
      result: {
        data: {
          account_info: {
            manager_key: string
            owner_key: string
            create_at_unix: number
          }
        } | null
      }
    }
    if (!json.result.data) {
      return { manager: null, owner: null, createdAt: null }
    }
    return {
      manager: normalizeAddress(json.result.data.account_info.manager_key),
      owner: normalizeAddress(json.result.data.account_info.owner_key),
      createdAt: new Date(json.result.data.account_info.create_at_unix * 1000),
    }
  } catch (err) {
    console.error('getBitAccountInfo', did, err)
    return { manager: null, owner: null, createdAt: null }
  }
}

export async function getBitAccountReverseAddresses(
  did: string,
): Promise<string[]> {
  try {
    const response = await fetch(
      'https://indexer-v1.did.id/v1/account/reverse/address',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ account: did }),
      },
    )
    const json = (await response.json()) as {
      data: { list: { key_info: { key: string } }[] }
    }
    return json.data.list.map(({ key_info: { key } }) => normalizeAddress(key))
  } catch (err) {
    console.error('getBitAccountReverseAddresses', did, err)
    return []
  }
}

export async function listBitAccounts(address: string): Promise<string[]> {
  try {
    const coinType = guessCoinType(address)
    if (!coinType) {
      return []
    }
    const response = await fetch('https://indexer-v1.did.id/v1/account/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'blockchain',
        key_info: {
          coin_type: coinType.toString(),
          chain_id: '',
          key: address,
        },
        role: 'manager',
      }),
    })
    const json = (await response.json()) as {
      errno: number
      errmsg: string
      data: { account_list: { account: string }[] }
    }
    return json.data.account_list.map(({ account }) => formatDid(account))
  } catch (err) {
    console.error('listBitAccounts', address, err)
    return []
  }
}

function formatDid(did: string) {
  return did.indexOf('.') === did.lastIndexOf('.')
    ? did
    : did.replace(/\.bit$/, '')
}
