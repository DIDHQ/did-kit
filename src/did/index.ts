import { normalize } from 'viem/ens'
import { compact, uniq } from 'remeda'
import { normalizeAddress } from '../address'
import {
  getBitAccountInfo,
  getBitAccountReverseAddresses,
  listBitAccounts,
} from './bit'
import {
  getEnsAddress,
  getEnsCreatedAt,
  getEnsManager,
  getEnsOwner,
  listEnsAccounts,
} from './ens'

export enum DidSystem {
  BIT = 'BIT',
  ENS = 'ENS',
  LENS = 'LENS',
}

const ensNameWrapper = normalizeAddress(
  '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401',
)

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
