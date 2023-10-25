import { listBitAccounts } from './did/bit'
import { listEnsAccounts } from './did/ens'

export async function getDidsOfAddress(address: string): Promise<string[]> {
  return (
    await Promise.all([listBitAccounts(address), listEnsAccounts(address)])
  )
    .flat()
    .sort()
}
