import { useQuery } from 'react-query'
import { fetchAllUsers } from '../../../services/Services'

export default function useFetchAllUsers() {
  return useQuery(['users'], () => fetchAllUsers())
}
