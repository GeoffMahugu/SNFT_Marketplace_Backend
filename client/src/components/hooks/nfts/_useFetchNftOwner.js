import { useQuery } from 'react-query'
import { fetchUser } from '../../../services/Services'

export default function useFetchNftOwner(walletAddress) {
  return useQuery(
    ['nft_owner', walletAddress],
    () => fetchUser(walletAddress),
    {
      enabled: walletAddress !== null && walletAddress !== undefined
    }
  )
}
