import React, { memo, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as selectors from '../../store/selectors'
import * as actions from '../../store/actions/thunks'
import { clearNfts, clearFilter } from '../../store/actions'
import NftCard from './NftCard'
import { shuffleArray } from '../../store/utils'
import { useFetchLikedNfts, useNfts } from '../hooks/nfts'
import { useFetchSigner, useFetchUser } from '../hooks/users'
import { useMutation, useQueryClient } from 'react-query'
import { postLikedNft } from '../../services/Services'
import { isNftLikedByUser } from '../../utils/nfts'

//react functional component
const ColumnNewRedux = ({
  showLoadMore = true,
  shuffle = false,
  authorId = null,
  filteredNfts
}) => {
  const { data: signerAddress } = useFetchSigner()
  const { data: user, userStatus } = useFetchUser(signerAddress)
  const { data: likedNfts } = useFetchLikedNfts()
  const queryClient = useQueryClient()

  const likeNftMutation = useMutation((nft) => postLikedNft(nft), {
    onSuccess: (data) => {
      queryClient.invalidateQueries('likedNfts')
    }
  })

  const onLikeNft = (nft) => {
    likeNftMutation.mutate(nft)
  }

  const dispatch = useDispatch()
  const nftItems = useSelector(selectors.nftItems)
  const nfts = nftItems ? (shuffle ? shuffleArray(nftItems) : nftItems) : []
  const [height, setHeight] = useState(0)

  const onImgLoad = ({ target: img }) => {
    let currentHeight = height
    if (currentHeight < img.offsetHeight) {
      setHeight(img.offsetHeight)
    }
  }

  useEffect(() => {
    dispatch(actions.fetchNftsBreakdown(authorId))
  }, [dispatch, authorId])

  //will run when component unmounted
  useEffect(() => {
    return () => {
      dispatch(clearFilter())
      dispatch(clearNfts())
    }
  }, [dispatch])

  // const loadMore = () => {
  //     dispatch(actions.fetchNftsBreakdown(authorId));
  // }

  return (
    <div className='row'>
      {filteredNfts &&
        filteredNfts?.map((nft, index) => (
          <NftCard
            nft={nft}
            key={index}
            onImgLoad={onImgLoad}
            height={height}
            userImg={user?.user?.profileImage}
            onLike={onLikeNft}
            liked={isNftLikedByUser(nft.itemId, likedNfts)}
            isVideo={nft?.isVideo}
          />
        ))}
      {/* {showLoadMore && nfts.length <= 20 && (
          <div className='col-lg-12'>
            <div className='spacer-single'></div>
            <span onClick={loadMore} className='btn-main lead m-auto'>
              Load More
            </span>
          </div>
        )} */}
    </div>
  )
}

export default memo(ColumnNewRedux)
