import { isHex } from 'viem'
import { guessCoinType, CoinType } from '../address.js'
import { isBase64 } from '../utils/base64.js'
import { verifyDogecoinMessage } from './dogecoin.js'
import { verifyEvmMessage } from './evm.js'
import { verifyNervosMessage } from './nervos.js'
import { verifyTronMessage } from './tron.js'

export async function verifyMessage(
  address: string,
  message: string,
  signature: string,
): Promise<boolean> {
  const coinType = guessCoinType(address)
  switch (coinType) {
    case CoinType.Dogecoin: {
      return isBase64(signature)
        ? verifyDogecoinMessage(address, message, signature)
        : false
    }
    case CoinType.Ethereum: {
      return isHex(signature)
        ? verifyEvmMessage(address, message, signature)
        : false
    }
    case CoinType.Nervos: {
      return isHex(signature)
        ? verifyNervosMessage(address, message, signature)
        : false
    }
    case CoinType.Tron: {
      return isHex(signature)
        ? verifyTronMessage(address, message, signature)
        : false
    }
    default: {
      throw new Error('unknown address')
    }
  }
}
