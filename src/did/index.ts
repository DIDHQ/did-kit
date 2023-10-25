import { normalize } from 'viem/ens'

export enum DidSystem {
  BIT = 'BIT',
  ENS = 'ENS',
  LENS = 'LENS',
}

export function guessDidSystem(did: string): DidSystem | undefined {
  if (did.endsWith('.eth')) {
    return DidSystem.ENS
  }
  if (did.endsWith('.lens')) {
    return DidSystem.LENS
  }
  if (did.endsWith('.bit') || /^[^\s\.]+\.[^\s\.]+$/.test(did)) {
    return DidSystem.BIT
  }
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
