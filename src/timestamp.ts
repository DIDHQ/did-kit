import { getBitAccountInfo } from './did/bit.js'
import { getEnsCreatedAt } from './did/ens.js'
import { DidSystem, guessDidSystem } from './did/index.js'

export async function getDidCreatedAt(did: string): Promise<Date | undefined> {
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
}
