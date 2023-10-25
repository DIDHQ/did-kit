import { CoinType, guessCoinType, normalizeAddress } from './address'
import {
  DidSystem,
  getDidCreatedAt,
  getDidsOfAddress,
  getManagerAddress,
  getRelatedAddresses,
  guessDidSystem,
  normalizeDid,
} from './did'
import { verifyMessage } from './verify-message'

export {
  // address
  CoinType,
  guessCoinType,
  normalizeAddress,

  // did
  DidSystem,
  guessDidSystem,
  normalizeDid,
  getManagerAddress,
  getRelatedAddresses,
  getDidsOfAddress,
  getDidCreatedAt,

  // verify message
  verifyMessage,
}
