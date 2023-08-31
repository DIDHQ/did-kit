import { hashMessage, recoverAddress } from "viem";
import bs58 from "bs58";

export async function verifyTronMessage(
  address: string,
  message: string,
  signature: `0x${string}`
) {
  const recovered = await recoverAddress({
    hash: hashMessage(message),
    signature,
  });
  return (await getBase58CheckAddress(recovered)) === address;
}

async function getBase58CheckAddress(address: string) {
  const addressBytes = Buffer.from(address.replace(/^0x/, "41"), "hex");
  const hash0 = await crypto.subtle.digest("SHA-256", addressBytes);
  const hash1 = await crypto.subtle.digest("SHA-256", hash0);
  const arrayBuffer = await new Blob([
    addressBytes,
    hash1.slice(0, 4),
  ]).arrayBuffer();
  return `T${bs58.encode(new Uint8Array(arrayBuffer))}`;
}
