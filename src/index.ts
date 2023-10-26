import { CoinType, guessCoinType, normalizeAddress } from './address'
import { DidSystem, guessDidSystem, normalizeDid } from './did/index'
import {
  listManagedDids,
  getManagerAddress,
  listRelatedAddresses,
} from './resolve'
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
  listManagedDids,
  getManagerAddress,
  listRelatedAddresses,

  // verify message
  verifyMessage,
}
