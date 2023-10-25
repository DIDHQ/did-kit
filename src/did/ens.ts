import { createPublicClient, http, labelhash, namehash, parseAbi } from 'viem'
import { mainnet as ethereum } from 'viem/chains'
import { normalize } from 'viem/ens'
import { normalizeAddress } from '../address'

const client = createPublicClient({
  chain: ethereum,
  transport: http('https://rpc.ankr.com/eth'),
  batch: { multicall: true },
})

const abi = parseAbi([
  'function owner(bytes32 node) public view returns (address)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
])

const ensNameWrapper = normalizeAddress(
  '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401',
)

export async function getEnsManager(did: string): Promise<string | undefined> {
  try {
    const node = namehash(normalize(did))
    const address = await client.readContract({
      abi,
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
      functionName: 'owner',
      args: [node],
    })
    const manager = normalizeAddress(address)
    return manager === ensNameWrapper ? getEnsAddress(did) : manager
  } catch (err) {
    console.error('getEnsManager', did, err)
  }
}

export async function getEnsOwner(did: string): Promise<string | undefined> {
  try {
    const tokenId = labelhash(normalize(did.replace(/\.eth$/, '')))
    const address = await client.readContract({
      abi,
      address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    })
    const owner = normalizeAddress(address)
    return owner === ensNameWrapper ? undefined : owner
  } catch (err) {
    console.error('getEnsOwner', did, err)
  }
}

export async function getEnsAddress(did: string): Promise<string | undefined> {
  try {
    const address = await client.getEnsAddress({ name: normalize(did) })
    return address ? normalizeAddress(address) : undefined
  } catch (err) {
    console.error('getEnsAddress', did, err)
  }
}

/**
 * @see https://thegraph.com/hosted-service/subgraph/ensdomains/ens
 */
export async function getEnsCreatedAt(did: string): Promise<Date | undefined> {
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
      : undefined
  } catch (err) {
    console.error('getEnsCreatedAt', did, err)
  }
}

/**
 * @see https://thegraph.com/hosted-service/subgraph/ensdomains/ens
 */
export async function listEnsAccounts(address: string): Promise<string[]> {
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
