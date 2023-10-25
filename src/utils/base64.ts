export function isBase64(value: string) {
  return /^[a-zA-Z0-9+/]+={0,3}$/.test(value)
}
