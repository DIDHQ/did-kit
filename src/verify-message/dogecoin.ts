import bs58check from 'bs58check'
import RIPEMD160 from '@rvagg/ripemd160'
import { recover } from 'tiny-secp256k1'

export async function verifyDogecoinMessage(
  address: string,
  message: string,
  signature: string,
) {
  return verify(message, address, signature, '\x19Dogecoin Signed Message:\n')
}

async function sha256(b: ArrayBuffer) {
  return crypto.subtle.digest('SHA-256', b)
}

async function hash256(buffer: ArrayBuffer) {
  return sha256(await sha256(buffer))
}

async function hash160(buffer: ArrayBuffer) {
  return new RIPEMD160().update(new Uint8Array(await sha256(buffer))).digest()
}

function decodeSignature(buffer: Buffer) {
  if (buffer.length !== 65) throw new Error('Invalid signature length')

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

async function magicHash(
  message: string | Buffer,
  messagePrefix: string | Buffer,
) {
  messagePrefix = messagePrefix
  if (!Buffer.isBuffer(messagePrefix)) {
    messagePrefix = Buffer.from(messagePrefix, 'utf8')
  }
  if (!Buffer.isBuffer(message)) {
    message = Buffer.from(message, 'utf8')
  }
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
  message: string,
  address: string,
  signature: string | Buffer,
  messagePrefix: string,
) {
  if (!Buffer.isBuffer(signature)) signature = Buffer.from(signature, 'base64')

  const parsed = decodeSignature(signature)

  const hash = await magicHash(message, messagePrefix)
  const publicKey = recover(
    Buffer.from(hash),
    parsed.signature,
    parsed.recovery as 0 | 1 | 2 | 3,
    parsed.compressed,
  )
  const publicKeyHash = await hash160(publicKey)

  const actual = publicKeyHash
  const expected = bs58check.decode(address).slice(1)

  console.log(actual, expected, address)
  return Buffer.from(actual).equals(expected)
}

function checkUInt53(n: number) {
  if (n < 0 || n > Number.MAX_SAFE_INTEGER || n % 1 !== 0)
    throw new RangeError('value out of range')
}

function varUintEncode(number: number, buffer: Buffer, offset: number) {
  checkUInt53(number)

  if (!buffer) buffer = Buffer.allocUnsafe(varUintEncodingLength(number))
  if (!Buffer.isBuffer(buffer))
    throw new TypeError('buffer must be a Buffer instance')
  if (!offset) offset = 0

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
