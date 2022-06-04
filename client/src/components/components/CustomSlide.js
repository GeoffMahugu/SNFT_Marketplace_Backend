import React, { memo } from 'react'
import { navigate } from '@reach/router'

const CustomSlide = ({
  index,
  avatar,
  banner,
  username,
  uniqueId,
  collectionId
}) => {
  return (
    <div className='itm' index={index}>
      <div className='nft_coll'>
        <div className='nft_wrap'>
          <span>
            <img
              src={banner}
              className='lazy img-fluid'
              alt=''
              loading='lazy'
            />
          </span>
        </div>
        <div className='nft_coll_pp'>
          <span onClick={() => navigate('/colection/' + collectionId)}>
            <img
              style={{ width: 50, height: 50 }}
              className='lazy'
              src={avatar}
              alt=''
              loading='lazy'
            />
          </span>
          <i className='fa fa-check'></i>
        </div>
        <div className='nft_coll_info'>
          <span onClick={() => navigate('/colection/' + collectionId)}>
            <h4>{username}</h4>
          </span>
        </div>
      </div>
    </div>
  )
}

export default memo(CustomSlide)
