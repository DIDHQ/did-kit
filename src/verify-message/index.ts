import { isHex } from 'viem'
import { guessCoinType, CoinType } from '../address'
import { isBase64 } from '../utils/base64'
import { verifyDogecoinMessage } from './dogecoin'
import { verifyEvmMessage } from './evm'
import { verifyNervosMessage } from './nervos'
import { verifyTronMessage } from './tron'

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
