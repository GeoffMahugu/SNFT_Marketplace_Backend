import React, { memo, useEffect, useState } from 'react'
import styled from 'styled-components'
import Clock from './Clock'
import { navigate } from '@reach/router'
import api from '../../core/api'
import { unit } from '../../config'
import UserPlaceHolder from '../../assets/User-Placeholder.jpeg'
import { countNftLikes } from '../../utils/nfts'
import { useFetchLikedNfts } from '../hooks/nfts'
import VideoPlayer from './VideoPlayer'

import useFetchNftOwner from '../hooks/nfts/_useFetchNftOwner'

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`

//react functional component
const NftCard = ({
  nft,
  className = 'd-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4',
  clockTop = true,
  height,
  onImgLoad,
  userImg,
  onLike,
  liked,
  isVideo,
  myNft,
  onResale
}) => {
  const navigateTo = (link) => {
    navigate(link)
  }
  const { data: likedNfts } = useFetchLikedNfts()

  const likes = countNftLikes(nft.itemId, likedNfts)

  const { data: nftOwner } = useFetchNftOwner(nft.seller)

  return (
    <div className={className}>
      <div className='nft__item m-0'>
        <div className='author_list_pp'>
          <span onClick={() => navigateTo(`/Author/${nft.seller}`)}>
            <img
              style={{ width: 50, height: 50 }}
              className='lazy'
              src={
                nftOwner?.user?.profileImage
                  ? nftOwner?.user?.profileImage
                  : UserPlaceHolder
              }
              alt=''
              loading='lazy'
            />
            <i className='fa fa-check'></i>
          </span>
        </div>
        <div
          className='nft__item_wrap'
          style={{ height: isVideo ? 'auto' : `${height}px` }}
        >
          <Outer>
            {!isVideo ? (
              <span>
                <img
                  onLoad={onImgLoad}
                  src={nft?.image}
                  className='lazy nft__item_preview'
                  alt=''
                  loading='lazy'
                />
              </span>
            ) : (
              <VideoPlayer videoURL={nft?.image} />
            )}
          </Outer>
        </div>
        {nft?.auctionInfo && (
          <div className='de_countdown'>
            <Clock deadline={nft?.auctionInfo.endDate} />
          </div>
        )}
        <div className='nft__item_info'>
          <span onClick={() => navigateTo(`/ItemDetail/${nft.itemId}`)}>
            <h4>{nft.title}</h4>
          </span>
          <div className='nft__item_price'>
            {nft?.price} {unit}
          </div>
          <div className='nft__item_action'>
            {!myNft ? (
              <span onClick={() => navigateTo(`/ItemDetail/${nft.itemId}`)}>
                {nft?.auctionInfo ? 'Place a bid' : 'Buy Now'}
              </span>
            ) : (
              <button className='btn-main' onClick={onResale}>
                Resell
              </button>
            )}
          </div>
          <div
            onClick={() => onLike(nft)}
            className={liked ? 'nft__item_dis_like' : 'nft__item_like'}
          >
            <i className='fa fa-heart'></i>
            {likes > 0 && <span>{likes}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(NftCard)
