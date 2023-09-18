import { verify } from 'bitcoinjs-message'

export async function verifyDogecoinMessage(
  address: string,
  message: string,
  signature: string,
) {
  return verify(message, address, signature, '\x19Dogecoin Signed Message:\n')
}
