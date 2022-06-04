import { BASE_URL, NETWORK_ERROR } from '../../../constants/Constants'
import { useQuery } from 'react-query'

export default function useFetchTopSellers() {
  return useQuery(['topSellers'], () => fetchTopSellers())
}

const fetchTopSellers = async () => {
  try {
    const res = await fetch(`${BASE_URL}users/topSellers`, {
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
