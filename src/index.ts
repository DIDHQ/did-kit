import { CoinType, guessCoinType, normalizeAddress } from './address'
import { DidSystem, guessDidSystem, normalizeDid } from './did/index'
import { getDidsOfAddress } from './resolve'
import { getManagerAddress, getRelatedAddresses } from './reverse-resolve'
import { getDidCreatedAt } from './timestamp'
import { verifyMessage } from './verify-message/index'

export {
  // address
  CoinType,
  guessCoinType,
  normalizeAddress,

  // did
  DidSystem,
  guessDidSystem,
  normalizeDid,

  // timestamp
  getDidCreatedAt,

  // resolve
  getDidsOfAddress,

  // reverse resolve
  getManagerAddress,
  getRelatedAddresses,

  // verify message
  verifyMessage,
}
