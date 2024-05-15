import { Signature } from '@noble/secp256k1'
import RIPEMD160 from '@rvagg/ripemd160'
import bs58check from 'bs58check'

export async function verifyDogecoinMessage(
  address: string,
  message: string,
  signature: string,
) {
  return verify(
    Buffer.from(message, 'utf8'),
    address,
    Buffer.from(signature, 'utf8'),
    Buffer.from('\x19Dogecoin Signed Message:\n', 'utf8'),
  )
}

async function sha256(buffer: ArrayBuffer) {
  return crypto.subtle.digest('SHA-256', buffer)
}

async function hash256(buffer: ArrayBuffer) {
  return sha256(await sha256(buffer))
}

async function hash160(buffer: ArrayBuffer) {
  return new RIPEMD160().update(new Uint8Array(await sha256(buffer))).digest()
}

function decodeSignature(buffer: Buffer) {
  if (buffer.length !== 65) {
    throw new Error('Invalid signature length')
  }

  const flagByte = buffer.readUInt8(0) - 27
  if (flagByte > 15 || flagByte < 0) {
    throw new Error('Invalid signature parameter')
  }

  return {
    compressed: !!(flagByte & 12),
    recovery: flagByte & 3,
    signature: buffer.subarray(1),
  }
}

async function magicHash(message: Buffer, messagePrefix: Buffer) {
  const messageVISize = varUintEncodingLength(message.length)
  const buffer = Buffer.allocUnsafe(
    messagePrefix.length + messageVISize + message.length,
  )
  messagePrefix.copy(buffer, 0)
  varUintEncode(message.length, buffer, messagePrefix.length)
  message.copy(buffer, messagePrefix.length + messageVISize)
  return hash256(buffer)
}

async function verify(
  message: Buffer,
  address: string,
  signature: Buffer,
  messagePrefix: Buffer,
) {
  const parsed = decodeSignature(signature)

  const hash = await magicHash(message, messagePrefix)
  const publicKey = new Signature(
    BigInt(`0x${parsed.signature.subarray(0, 32).toString('hex')}`),
    BigInt(`0x${parsed.signature.subarray(32, 64).toString('hex')}`),
    parsed.recovery,
  )
    .recoverPublicKey(Buffer.from(hash))
    .toRawBytes(parsed.compressed)
  const publicKeyHash = await hash160(publicKey)

  const actual = publicKeyHash
  const expected = bs58check.decode(address).slice(1)

  return Buffer.from(actual).equals(expected)
}

function checkUInt53(n: number) {
  if (n < 0 || n > Number.MAX_SAFE_INTEGER || n % 1 !== 0)
    throw new RangeError('value out of range')
}

function varUintEncode(number: number, buffer: Buffer, offset: number) {
  checkUInt53(number)

  // 8 bit
  if (number < 0xfd) {
    buffer.writeUInt8(number, offset)
    // encode.bytes = 1

    // 16 bit
  } else if (number <= 0xffff) {
    buffer.writeUInt8(0xfd, offset)
    buffer.writeUInt16LE(number, offset + 1)
    // encode.bytes = 3

    // 32 bit
  } else if (number <= 0xffffffff) {
    buffer.writeUInt8(0xfe, offset)
    buffer.writeUInt32LE(number, offset + 1)
    // encode.bytes = 5

    // 64 bit
  } else {
    buffer.writeUInt8(0xff, offset)
    buffer.writeUInt32LE(number >>> 0, offset + 1)
    buffer.writeUInt32LE((number / 0x100000000) | 0, offset + 5)
    // encode.bytes = 9
  }

  return buffer
}

function varUintEncodingLength(number: number) {
  checkUInt53(number)

  return number < 0xfd ? 1 : number <= 0xffff ? 3 : number <= 0xffffffff ? 5 : 9
}
