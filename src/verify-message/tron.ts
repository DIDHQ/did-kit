import bs58 from 'bs58'
import { type Hex, concat, keccak256, recoverAddress, toBytes } from 'viem'

/**
 * @see https://github.com/tronprotocol/tronweb/blob/master/src/utils/message.js
 */
export async function verifyTronMessage(
  address: string,
  message: string,
  signature: Hex,
): Promise<boolean> {
  const recovered = await recoverAddress({
    hash: hashMessage(toBytes(message)),
    signature,
  })
  return (await getBase58CheckAddress(recovered)) === address
}

const TRON_MESSAGE_PREFIX = '\x19TRON Signed Message:\n'

function hashMessage(message: Uint8Array) {
  return keccak256(
    concat([
      toBytes(TRON_MESSAGE_PREFIX),
      toBytes(String(message.length)),
      message,
    ]),
  )
}

async function getBase58CheckAddress(address: string) {
  const addressBytes = Buffer.from(address.replace(/^0x/, '41'), 'hex')
  const hash0 = await crypto.subtle.digest('SHA-256', addressBytes)
  const hash1 = await crypto.subtle.digest('SHA-256', hash0)
  const arrayBuffer = await new Blob([
    addressBytes,
    hash1.slice(0, 4),
  ]).arrayBuffer()
  return bs58.encode(new Uint8Array(arrayBuffer))
}
