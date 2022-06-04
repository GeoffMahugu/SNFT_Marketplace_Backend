import { BASE_URL, NETWORK_ERROR } from '../../../constants/Constants'
import { useQuery } from 'react-query'
import { errorToaster } from '../../components/Toasts'

export default function useFetchLikedNfts() {
  return useQuery(['likedNfts'], () => fetchLikedNfts())
}

const fetchLikedNfts = async () => {
  try {
    const res = await fetch(`${BASE_URL}liked-nft/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
    if (res.status === 200) {
      const data = await res.json()

      return data
    } else {
      console.log('Error')
    }
  } catch (err) {
    return NETWORK_ERROR
  }
}
