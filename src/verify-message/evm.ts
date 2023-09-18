import { Address, Hex, verifyMessage } from "viem";

export async function verifyEvmMessage(
  address: string,
  message: string,
  signature: Hex
): Promise<boolean> {
  return verifyMessage({ address: address as Address, message, signature });
}
