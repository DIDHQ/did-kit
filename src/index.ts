import { CoinType, guessCoinType } from "./coin-type";
import { verifyEvmMessage } from "./verify-message/evm";
import { verifyPasskeyMessage } from "./verify-message/passkey";
import { verifyTronMessage } from "./verify-message/tron";

export async function verifyMessage(
  address: string,
  message: string,
  signature: `0x${string}`
): Promise<boolean> {
  const coinType = guessCoinType(address);
  switch (coinType) {
    case CoinType.PassKey: {
      return verifyPasskeyMessage(address, message, signature);
    }
    case CoinType.EVM: {
      return verifyEvmMessage(address, message, signature);
    }
    case CoinType.Tron: {
      return verifyTronMessage(address, message, signature);
    }
    default: {
      throw new Error("unknown address");
    }
  }
}
