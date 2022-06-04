import React, { memo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import UserTopSeller from './UserTopSeller'
import * as selectors from '../../store/selectors'
import { fetchAuthorList } from '../../store/actions/thunks'
import useFetchTopSellers from '../hooks/users/_useFetchTopSellers'

const AuthorList = () => {
  const { data: topSellers, sellersStatus, isLoading } = useFetchTopSellers()

  const dispatch = useDispatch()
  const authorsState = useSelector(selectors.authorsState)
  const authors = authorsState.data ? authorsState.data : []

  useEffect(() => {
    dispatch(fetchAuthorList())
  }, [dispatch])

  return (
    <div>
      <ol className='author_list'>
        {isLoading
          ? 'Loading...'
          : topSellers &&
            topSellers?.topSellers
              ?.sort((a, b) => b?.amount - a?.amount)
              ?.slice(0, 9)
              ?.map((seller, index) => (
                <li key={index}>
                  <UserTopSeller user={seller} />
                </li>
              ))}
      </ol>
    </div>
  );
}
export default memo(AuthorList)
