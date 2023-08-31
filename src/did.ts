export enum DidSystem {
  BIT = "BIT",
  ENS = "ENS",
  LENS = "LENS",
}

export function guessDidSystem(did: string): DidSystem | null {
  if (did.endsWith(".eth")) {
    return DidSystem.ENS;
  }
  if (did.endsWith(".lens")) {
    return DidSystem.LENS;
  }
  if (did.endsWith(".bit") || /^[^\s\.]+\.[^\s\.]+$/.test(did)) {
    return DidSystem.BIT;
  }
  return null;
}
