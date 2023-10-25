import { createPublicClient, http, labelhash, namehash, parseAbi } from 'viem'
import { mainnet as ethereum } from 'viem/chains'
import { normalize } from 'viem/ens'
import { compact, uniq } from 'remeda'
import { normalizeAddress } from './address'
import { guessCoinType } from './coin-type'

export enum DidSystem {
  BIT = 'BIT',
  ENS = 'ENS',
  LENS = 'LENS',
}

const ethereumClient = createPublicClient({
  chain: ethereum,
  transport: http('https://rpc.ankr.com/eth'),
  batch: { multicall: true },
})

const ensNameWrapper = normalizeAddress(
  '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401',
)

function formatDid(did: string) {
  return did.indexOf('.') === did.lastIndexOf('.')
    ? did
    : did.replace(/\.bit$/, '')
}

export function guessDidSystem(didOrAddress: string): DidSystem | null {
  if (didOrAddress.endsWith('.eth')) {
    return DidSystem.ENS
  }
  if (didOrAddress.endsWith('.lens')) {
    return DidSystem.LENS
  }
  if (
    didOrAddress.endsWith('.bit') ||
    /^[^\s\.]+\.[^\s\.]+$/.test(didOrAddress)
  ) {
    return DidSystem.BIT
  }
  return null
}

const abi = parseAbi([
  'function owner(bytes32 node) public view returns (address)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
])

async function getEnsManager(did: string): Promise<string | null> {
  try {
    const node = namehash(normalize(did))
    const address = await ethereumClient.readContract({
      abi,
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
      functionName: 'owner',
      args: [node],
    })
    return normalizeAddress(address)
  } catch (err) {
    console.error('getEnsManager', did, err)
    return null
  }
}

async function getEnsOwner(did: string): Promise<string | null> {
  try {
    const tokenId = labelhash(normalize(did.replace(/\.eth$/, '')))
    const address = await ethereumClient.readContract({
      abi,
      address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    })
    return normalizeAddress(address)
  } catch (err) {
    console.error('getEnsOwner', did, err)
    return null
  }
}

async function getEnsAddress(did: string): Promise<string | null> {
  try {
    const address = await ethereumClient.getEnsAddress({ name: normalize(did) })
    return address ? normalizeAddress(address) : null
  } catch (err) {
    console.error('getEnsAddress', did, err)
    return null
  }
}

/**
 * @see https://thegraph.com/hosted-service/subgraph/ensdomains/ens
 */
async function getEnsCreatedAt(did: string): Promise<Date | null> {
  const tokenId = labelhash(normalize(did.replace(/\.eth$/, '')))
  try {
    const response = await fetch(
      'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operationName: 'getRegistrationDate',
          query:
            'query getRegistrationDate($id: ID!) { registration(id: $id) { registrationDate } }',
          variables: { id: tokenId },
        }),
      },
    )
    const json = (await response.json()) as {
      data: { registration?: { registrationDate: string } }
    }
    return json.data.registration
      ? new Date(parseInt(`${json.data.registration.registrationDate}000`))
      : null
  } catch (err) {
    console.error('getEnsCreatedAt', did, err)
    return null
  }
}

async function getBitAccountInfo(did: string): Promise<{
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

async function getBitAccountReverseAddresses(did: string): Promise<string[]> {
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

async function listBitAccounts(address: string): Promise<string[]> {
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

/**
 * @see https://thegraph.com/hosted-service/subgraph/ensdomains/ens
 */
async function listEnsAccounts(address: string): Promise<string[]> {
  try {
    const response = await fetch(
      'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operationName: 'getNames',
          query:
            'query getNames($id: ID!) { account(id: $id) { domains(first: 1000) { name } }}',
          variables: { id: address.toLowerCase() },
        }),
      },
    )
    const json = (await response.json()) as {
      data: { account?: { domains: [{ name: string }] } }
    }
    return json.data.account?.domains.map(({ name }) => name) || []
  } catch (err) {
    console.error('listEnsAccounts', address, err)
    return []
  }
}

export async function getDidsOfAddress(address: string): Promise<string[]> {
  return (
    await Promise.all([listBitAccounts(address), listEnsAccounts(address)])
  )
    .flat()
    .sort()
}

export async function getDidCreatedAt(did: string): Promise<Date | null> {
  const didSystem = guessDidSystem(did)
  if (didSystem === DidSystem.ENS) {
    return getEnsCreatedAt(did)
  }
  if (didSystem === DidSystem.LENS) {
    return getEnsCreatedAt(`${did}.xyz`)
  }
  if (didSystem === DidSystem.BIT) {
    const info = await getBitAccountInfo(did)
    return info.createdAt
  }
  return null
}

export function normalizeDid(did: string): string {
  if (guessDidSystem(did) === DidSystem.BIT) {
    return did.toLowerCase()
  }
  if (
    guessDidSystem(did) === DidSystem.ENS ||
    guessDidSystem(did) === DidSystem.LENS
  ) {
    return normalize(did)
  }
  return did
}

export async function getManagerAddress(did: string): Promise<string | null> {
  const didSystem = guessDidSystem(did)
  if (didSystem === DidSystem.ENS) {
    const manager = await getEnsManager(did)
    return manager === ensNameWrapper ? getEnsAddress(did) : manager
  }
  if (didSystem === DidSystem.LENS) {
    const address = await getEnsAddress(`${did}.xyz`)
    return address
  }
  if (didSystem === DidSystem.BIT) {
    const { manager } = await getBitAccountInfo(did)
    return manager
  }
  return normalizeAddress(did)
}

export async function getRelatedAddresses(did: string): Promise<string[]> {
  const didSystem = guessDidSystem(did)
  if (didSystem === DidSystem.ENS) {
    const [manager, owner, address] = await Promise.all([
      getEnsManager(did),
      getEnsOwner(did),
      getEnsAddress(did),
    ])
    return uniq(compact([manager, owner, address])).filter(
      (address) => address !== ensNameWrapper,
    )
  }
  if (didSystem === DidSystem.LENS) {
    const address = await getEnsAddress(`${did}.xyz`)
    return compact([address])
  }
  if (didSystem === DidSystem.BIT) {
    const { manager, owner } = await getBitAccountInfo(did)
    const reverses = await getBitAccountReverseAddresses(did)
    return uniq(compact([manager, owner, ...reverses]))
  }
  return [normalizeAddress(did)]
}
