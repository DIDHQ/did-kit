import { Address, Hex, verifyMessage } from "viem";

export async function verifyEvmMessage(
  address: string,
  message: string,
  signature: Hex
) {
  return verifyMessage({ address: address as Address, message, signature });
}
