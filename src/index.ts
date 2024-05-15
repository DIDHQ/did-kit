import { CoinType, guessCoinType, normalizeAddress } from './address.js'
import { DidSystem, guessDidSystem, normalizeDid } from './did/index.js'
import {
  listManagedDids,
  getManagerAddress,
  listRelatedAddresses,
} from './resolve.js'
import { getDidCreatedAt } from './timestamp.js'
import { verifyMessage } from './verify-message/index.js'

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
