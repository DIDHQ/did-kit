import { Address, verifyMessage } from "viem";

export async function verifyEvmMessage(
  address: string,
  message: string,
  signature: `0x${string}`
) {
  return verifyMessage({ address: address as Address, message, signature });
}
