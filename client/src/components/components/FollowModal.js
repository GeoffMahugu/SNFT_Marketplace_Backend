import React, { useState } from 'react'

import { create as ipfsHttpClient } from 'ipfs-http-client'
import UserPlaceholder from '../../assets/User-Placeholder.jpeg'
import { useCreateCollection } from '../hooks/collections'
import Loader from './Loader'
import MiddleEllipsis from 'react-middle-ellipsis'

export default function FollowModal({
  displayModal,
  title,
  users,
  onClickUnFollow,
  onClickRow,
  loading,
  showFollowButton
}) {
  return (
    <div className='checkout'>
      <div
        className='maincheckout'
        style={{ height: '80%', overflow: 'scroll' }}
      >
        <button className='btn-close' onClick={() => displayModal(false)}>
          x
        </button>
        <div className='heading'>
          <h3>{title}</h3>
        </div>

        <div className='detailcheckout d-flex flex-column mt-4'>
          {users?.length === 0 ? (
            <p>{showFollowButton ? '0 Following' : '0 Followers'}</p>
          ) : (
            users?.map((user) => (
              <div
                key={user?.walletAddress}
                onClick={() => onClickRow(`Author/${user?.walletAddress}`)}
                className='shadow-lg mb-3 bg-white rounded w-100 p-2 d-flex align-items-center justify-content-between '
              >
                <div className='d-flex align-items-center'>
                  <img
                    alt=''
                    className='follow_img'
                    src={
                      user?.profileImage ? user?.profileImage : UserPlaceholder
                    }
                  />
                  <div
                    className=' d-flex   flex-column justify-content-center'
                    style={{ paddingLeft: 10 }}
                  >
                    <h6 className='p-0 m-0'>
                      {user?.userName ? user?.userName : '@unamed'}
                    </h6>
                    <p className='p-0 m-0'>
                      <div style={{ maxWidth: 200, whiteSpace: 'nowrap' }}>
                        <MiddleEllipsis>
                          <span>{user?.walletAddress} </span>
                        </MiddleEllipsis>
                      </div>
                    </p>
                  </div>
                </div>
                {showFollowButton && (
                  <div
                    className=' p-0 m-0'
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onClickUnFollow(user?.walletAddress)
                    }}
                  >
                    <span className='btn-main  p-2 mt-3'>
                      {loading ? (
                        <Loader color={'#ffffff'} height={20} width={20} />
                      ) : (
                        'Unfollow'
                      )}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
