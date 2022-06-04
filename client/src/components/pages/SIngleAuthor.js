import React, { memo, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ColumnNewRedux from '../components/ColumnNewRedux'
import Footer from '../components/footer'
import { createGlobalStyle } from 'styled-components'
import * as selectors from '../../store/selectors'
import { fetchAuthorList } from '../../store/actions/thunks'
import api from '../../core/api'

import {
  useCreatorNfts,
  useMyNfts,
  useFetchUserLikedNfts,
  useFetchLikedNfts,
  useNfts
} from '../../components/hooks/nfts'
import { useFetchSigner } from '../../components/hooks/users'
import { navigate, useParams } from '@reach/router'
import NftCard from '../components/NftCard'
import { useFetchUser } from '../hooks/users'
import Loader from '../components/Loader'
import UserPlaceholder from '../../assets/User-Placeholder.jpeg'
import { useMutation, useQueryClient } from 'react-query'
import { followSeller, postLikedNft } from '../../services/Services'
import { isNftLikedByUser } from '../../utils/nfts'
import useFetchNftOwner from '../hooks/nfts/_useFetchNftOwner'
import MiddleEllipsis from 'react-middle-ellipsis'
import { successToaster } from '../components/Toasts'

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #fff;
  }
  .mainside{
    .connect-wal{
      display: none;
    }
    .logout{
      display: flex;
      align-items: center;
    }
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #111;
    }
    .item-dropdown .dropdown a{
      color: #111 !important;
    }
  }
`

const SingleAuthor = ({ authorId }) => {
  const [openMenu, setOpenMenu] = React.useState(true)

  const queryClient = useQueryClient()
  const { data: likedNfts } = useFetchLikedNfts()
  const { data: signerAddress } = useFetchSigner()
  const [loading, setLoading] = useState(false)

  const { data: allNfts, status } = useNfts()

  const { data: user, status: userStatus } = useFetchNftOwner(authorId)
  const { data: currentUser } = useFetchUser(signerAddress)

  const nfts = allNfts?.filter((nft) => nft.seller === authorId)
  const onSale = nfts?.filter((i) => !i.sold)
  console.log(onSale)

  const [height, setHeight] = useState(0)

  const likeNftMutation = useMutation((nft) => postLikedNft(nft), {
    onSuccess: (data) => {
      queryClient.invalidateQueries('likedNfts')
    }
  })

  const onLikeNft = (nft) => {
    console.log(nft)
    likeNftMutation.mutate(nft)
    console.log(likeNftMutation.status)
  }

  const onImgLoad = ({ target: img }) => {
    let currentHeight = height
    if (currentHeight < img.offsetHeight) {
      setHeight(img.offsetHeight)
    }
  }

  const handleBtnClick = () => {
    setOpenMenu(true)

    document.getElementById('Mainbtn').classList.add('active')
  }

  const isSellerFollowed = () => {
    const isFollowed = user?.user?.followers.filter(
      (fol) => fol === signerAddress
    )
    return isFollowed?.length > 0
  }

  const dispatch = useDispatch()
  const authorsState = useSelector(selectors.authorsState)
  const author = authorsState.data ? authorsState.data[0] : {}

  useEffect(() => {
    dispatch(fetchAuthorList(authorId))
  }, [dispatch, authorId])

  const followOrUnFollow = async () => {
    setLoading(true)
    const res = await followSeller(
      user?.user?.walletAddress,
      currentUser.user.walletAddress
    )

    if (res.message === 'User Followed SuccessFully') {
      successToaster('You Now Following Seller')
      queryClient.invalidateQueries('nft_owner')
    }
    if (res.message === 'User Un Followed SuccessFully') {
      successToaster('Seller Unfollowed')
      queryClient.invalidateQueries('nft_owner')
    }
    setLoading(false)
  }
  return (
    <div>
      <GlobalStyles />

      <section
        id='profile_banner'
        className='jumbotron breadcumb no-bg'
        style={{
          backgroundImage: user?.user?.profileBanner
            ? `url(${user?.user?.profileBanner})`
            : `url(${api?.baseUrl + author?.banner?.url})`
        }}
      >
        <div className='mainbreadcumb'></div>
      </section>

      <section className='container no-bottom'>
        <div className='row'>
          <div className='col-md-12'>
            <div className='d_profile de-flex'>
              <div className='de-flex-col'>
                <div className='profile_avatar'>
                  {userStatus === 'loading' ? (
                    <Loader width={50} height={50} />
                  ) : (
                    <img
                      style={{ width: 150, height: 150 }}
                      src={
                        user?.user?.profileImage
                          ? user?.user?.profileImage
                          : UserPlaceholder
                      }
                      alt=''
                    />
                  )}

                  <i className='fa fa-check'></i>
                  <div className='profile_name'>
                    <h4>
                      {user?.user?.userName ? user?.user?.userName : '@unamed'}
                      <span className='profile_username'>
                        {user?.user?.email ? (
                          user?.user?.email
                        ) : (
                          <div style={{ maxWidth: 200, whiteSpace: 'nowrap' }}>
                            <MiddleEllipsis>
                              <span>{authorId} </span>
                            </MiddleEllipsis>
                          </div>
                        )}
                      </span>
                      <span id='wallet' className='profile_wallet'>
                        {user?.user?.walletAddress}
                      </span>
                      <button id='btn_copy' title='Copy Text'>
                        Copy
                      </button>
                    </h4>
                  </div>
                </div>
              </div>
              <div className='profile_follow de-flex'>
                <div className='de-flex-col'>
                  <div className='profile_follower'>
                    {user?.user?.followers.length > 0 &&
                      user?.user?.followers.length + ' Followers'}
                  </div>
                </div>
                {signerAddress && signerAddress !== authorId && <div className='de-flex-col' onClick={followOrUnFollow}>
                  <span className='btn-main'>
                    {loading ? (
                      <Loader color={'#ffffff'} height={20} width={20} />
                    ) : isSellerFollowed() ? (
                      'Unfollow'
                    ) : (
                      'Follow'
                    )}
                  </span>
                </div>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container no-top'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='items_filter'>
              <ul className='de_nav text-left'>
                <li id='Mainbtn' className='active'>
                  <span onClick={handleBtnClick}>On Sale</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {openMenu && (
          <div id='zero1' className='onStep fadeIn'>
            <div className='row'>
              {status === 'loading' && <div className='col-12'>Loading...</div>}
              {status === 'success' && onSale?.length < 1 && (
                <div className='col-12'>No item...</div>
              )}
              {status === 'success' &&
                onSale &&
                onSale?.map((nft, index) => (
                  <NftCard
                    nft={nft}
                    key={index}
                    onImgLoad={onImgLoad}
                    height={height}
                    userImg={user?.user?.profileImage}
                    onLike={onLikeNft}
                    liked={isNftLikedByUser(nft.itemId, likedNfts)}
                  />
                ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
export default memo(SingleAuthor)
