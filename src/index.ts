import { isHex } from 'viem'
import { CoinType, guessCoinType } from './coin-type'
import { verifyDogecoinMessage } from './verify-message/dogecoin'
import { verifyEvmMessage } from './verify-message/evm'
import { verifyNervosMessage } from './verify-message/nervos'
import { verifyTronMessage } from './verify-message/tron'

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

function isBase64(value: string) {
  return /^[a-zA-Z0-9+/]={0,3}$/.test(value)
}
