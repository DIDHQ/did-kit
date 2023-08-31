export enum CoinType {
  Ethereum = 60,
  Tron = 195,
  Nervos = 309,
}

export function guessCoinType(address: string): CoinType | null {
  if (/^0x[a-zA-Z0-9]{40}$/.test(address)) {
    return CoinType.Ethereum;
  }
  if (
    /^T[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{33}$/.test(
      address
    )
  ) {
    return CoinType.Tron;
  }
  if (/^ck[bt]1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42,}$/i.test(address)) {
    return CoinType.Nervos;
  }
  return null;
}
