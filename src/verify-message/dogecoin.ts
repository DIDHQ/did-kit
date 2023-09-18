import { Hex } from "viem";
import { verify } from "bitcoinjs-message";

export async function verifyDogecoinMessage(
  address: string,
  message: string,
  signature: Hex
) {
  return verify(message, address, signature, "\x19Dogecoin Signed Message:\n");
}
