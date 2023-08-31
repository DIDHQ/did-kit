export enum CoinType {
  PassKey = -1,
  EVM = 60,
  Tron = 195,
}

export function guessCoinType(address: string): CoinType | null {
  if (/^ck[bt]1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42,}$/i.test(address)) {
    return CoinType.PassKey;
  }
  if (/^0x[a-zA-Z0-9]{40}$/.test(address)) {
    return CoinType.EVM;
  }
  if (
    /^T[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{33}$/.test(
      address
    )
  ) {
    return CoinType.Tron;
  }
  return null;
}
