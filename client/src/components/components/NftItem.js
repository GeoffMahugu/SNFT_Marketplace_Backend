import React, { useEffect, useState } from 'react'

import styled from 'styled-components'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import Clock from './Clock'
import { navigate } from '@reach/router'
import UserPlaceholder from '../../assets/User-Placeholder.jpeg'
import useFetchNftOwner from '../hooks/nfts/_useFetchNftOwner'

import VideoPlayer from './VideoPlayer'
import { unit } from '../../config'

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
`

export default function NftItem({
  nft,
  onImgLoad,
  liked,
  likes,
  height,
  onLike,
  isVideo
}) {
  const navigateTo = (link) => {
    navigate(link)
  }

  const { data: nftOwner } = useFetchNftOwner(nft.seller)

  return (
    <div className='itm'>
      <div className='d-item'>
        <div className='nft__item'>
          {nft.auctionInfo && (
            <div className='de_countdown'>
              <Clock deadline={nft?.auctionInfo?.endDate} />
            </div>
          )}
          <div className='author_list_pp'>
            <span onClick={() => navigateTo(`Author/${nft.seller}`)}>
              <img
                style={{ width: 50, height: 50 }}
                className='lazy'
                src={
                  nftOwner?.user?.profileImage
                    ? nftOwner?.user?.profileImage
                    : UserPlaceholder
                }
                alt=''
              />
              <i className='fa fa-check'></i>
            </span>
          </div>
          <div style={{ height: `${height}px` }} className='nft__item_wrap'>
            <Outer>
              <span>
                {!isVideo ? (
                  <img
                    src={nft?.image}
                    className='lazy nft__item_preview'
                    onLoad={onImgLoad}
                    alt=''
                  />
                ) : (
                  <VideoPlayer videoURL={nft?.image} />
                )}
              </span>
            </Outer>
          </div>
          <div className='nft__item_info'>
            <span onClick={() => navigateTo(`/ItemDetail/${nft.itemId}`)}>
              <h4>{nft?.title}</h4>
            </span>
            <div className='nft__item_price'>
              {nft.price} {unit}
              {/* <span>
                {nft?.bid}/{nft.max_bid}
              </span> */}
            </div>
            <div className='nft__item_action'>
              <span onClick={() => navigateTo(`/ItemDetail/${nft.itemId}`)}>
                {nft?.auctionInfo ? 'Place a bid' : 'Buy Now'}
              </span>
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
    </div>
  )
}
