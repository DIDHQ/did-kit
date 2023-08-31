export enum CoinType {
  Ethereum = 60,
  Tron = 195,
}

export function guessCoinType(address: string): CoinType | null {
  if (/^0x[a-zA-Z0-9]{40}$/.test(address)) {
    return CoinType.Ethereum;
  }
  if (/^T[A-Za-z1-9]{33}$/.test(address)) {
    return CoinType.Tron;
  }
  return null;
}
