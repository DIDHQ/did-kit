import { guessDidSystem, DidSystem } from './did/index'
import {
  listBitAccounts,
  getBitAccountInfo,
  getBitAccountReverseAddresses,
} from './did/bit'
import {
  listEnsAccounts,
  getEnsAddress,
  getEnsManager,
  getEnsOwner,
} from './did/ens'
import { normalizeAddress } from './address'

export async function listManagedDids(address: string): Promise<string[]> {
  return (
    await Promise.all([listBitAccounts(address), listEnsAccounts(address)])
  )
    .flat()
    .sort()
}

export async function getManagerAddress(
  did: string,
): Promise<string | undefined> {
  const didSystem = guessDidSystem(did)
  if (didSystem === DidSystem.ENS) {
    const manager = await getEnsManager(did)
    return manager
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
    return [...new Set([manager, owner, address])].filter(Boolean)
  }
  if (didSystem === DidSystem.LENS) {
    const address = await getEnsAddress(`${did}.xyz`)
    return [address].filter(Boolean)
  }
  if (didSystem === DidSystem.BIT) {
    const { manager, owner } = await getBitAccountInfo(did)
    const reverses = await getBitAccountReverseAddresses(did)
    return [...new Set([manager, owner, ...reverses])].filter(Boolean)
  }
  return [normalizeAddress(did)]
}
