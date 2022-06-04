import React, { memo, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Slider from 'react-slick'
import styled from 'styled-components'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import Clock from './Clock'
import { carouselNew5 } from './constants'
import * as selectors from '../../store/selectors'
import { fetchNftsBreakdown } from '../../store/actions/thunks'
import api from '../../core/api'
import { navigate } from '@reach/router'
import { useFetchLikedNfts, useNfts } from '../hooks/nfts'
import UserPlaceholder from '../../assets/User-Placeholder.jpeg'
import { useMutation, useQueryClient } from 'react-query'
import { postLikedNft } from '../../services/Services'
import { countNftLikes, isNftLikedByUser } from '../../utils/nfts'
import NftItem from './NftItem'

const CarouselNewRedux = () => {
  const { data: allNfts, status } = useNfts()
  const dispatch = useDispatch()
  const nftsState = useSelector(selectors.nftBreakdownState)
  const nfts = nftsState.data ? nftsState.data : []

  const [height, setHeight] = useState(0)
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

  const onImgLoad = ({ target: img }) => {
    let currentHeight = height
    if (currentHeight < img.offsetHeight) {
      setHeight(img.offsetHeight)
    }
  }
  const navigateTo = (link) => {
    navigate(link)
  }

  useEffect(() => {
    dispatch(fetchNftsBreakdown())
  }, [dispatch])

  return (
    <div className='nft'>
      <Slider {...carouselNew5}>
        {status === 'loading' && <div className='col-12'>Loading...</div>}
        {status === 'success' &&
          allNfts &&
          allNfts.map((nft, index) => (
            <NftItem
              key={index}
              nft={nft}
              liked={isNftLikedByUser(nft.itemId, likedNfts)}
              likes={countNftLikes(nft.itemId, likedNfts)}
              onImgLoad={onImgLoad}
              height={height}
              onLike={onLikeNft}
              isVideo={nft?.isVideo}
            />
          ))}
      </Slider>
    </div>
  )
}

export default memo(CarouselNewRedux)
