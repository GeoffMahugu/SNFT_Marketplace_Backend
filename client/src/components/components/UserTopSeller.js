import React, { memo } from 'react'
import api from '../../core/api'
import UserPlaceholder from '../../assets/User-Placeholder.jpeg'
import MiddleEllipsis from 'react-middle-ellipsis'
import { navigate } from '@reach/router'
import {unit} from '../../config'

//react functional component
const UserTopSeller = ({ user }) => {
  const navigateTo = (link) => {
    navigate(link)
  }
  return (
    <>
      <div className='author_list_pp'>
        <span onClick={() => navigateTo(`Author/${user.walletAddress}`)}>
          <img
            className='lazy'
            src={user?.profileImage ? user?.profileImage : UserPlaceholder}
            alt=''
            style={{ width: 50, height: 50 }}
          />
          <i className='fa fa-check'></i>
        </span>
      </div>
      <div className='author_list_info'>
        <MiddleEllipsis>
          <span onClick={() => navigateTo(`Author/${user.walletAddress}`)}>
            {user?.userName ? user.userName : user.walletAddress}
          </span>
        </MiddleEllipsis>
        <span className='bot'>
          {user?.amount} {unit}
        </span>
      </div>
    </>
  );
}

export default memo(UserTopSeller)
