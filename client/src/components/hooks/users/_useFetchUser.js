import { useQuery } from 'react-query'

import { fetchUser } from '../../../services/Services'

export default function useFetchUser(walletAddress) {
  return useQuery(['user', walletAddress], () => fetchUser(walletAddress), {
    enabled: walletAddress !== null && walletAddress !== undefined
  })
}
