import { CoinType, guessCoinType, normalizeAddress } from './address'
import {
  DidSystem,
  getDidCreatedAt,
  getDidsOfAddress,
  getManagerAddress,
  getRelatedAddresses,
  guessDidSystem,
  normalizeDid,
} from './did/index'
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
  getManagerAddress,
  getRelatedAddresses,
  getDidsOfAddress,
  getDidCreatedAt,

  // verify message
  verifyMessage,
}
