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
  useFetchLikedNfts
} from '../../components/hooks/nfts'

import { postLikedNft } from '../../services/Services'
import { isNftLikedByUser } from '../../utils/nfts'
import MiddleEllipsis from 'react-middle-ellipsis'
import dayjs from 'dayjs'
import { ethers, providers } from 'ethers'
import {
  feePercent,
  unit,
  nftaddress,
  nftmarketaddress,
  walletConnectProvider
} from '../../config'
import Web3Modal from 'web3modal'
import NFT from '../../contracts/NFT.json'
import Market from '../../contracts/NFTMarket.json'
import { useFetchSigner } from '../../components/hooks/users'
import { navigate } from '@reach/router'
import NftCard from '../components/NftCard'
import { useFetchUser } from '../hooks/users'
import Loader from '../components/Loader'
import UserPlaceholder from '../../assets/User-Placeholder.jpeg'
import { useMutation, useQueryClient } from 'react-query'
import { followSeller } from '../../services/Services'
import useFetchAllUsers from '../hooks/users/_useFetchAllUsers'
import { getFollowers, getFollowingUsers } from '../../utils/users'
import FollowModal from '../components/FollowModal'
import { successToaster } from '../components/Toasts'
import { navigateTo } from '../../utils/navigation'

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

const Colection = (props) => {
  const authorId = props?.authorId
  const [nftForResale, setNftForResale] = useState(null)
  const [openMenu, setOpenMenu] = React.useState(true)
  const [openMenu1, setOpenMenu1] = React.useState(false)
  const [openMenu2, setOpenMenu2] = React.useState(false)
  const [openMenu3, setOpenMenu3] = React.useState(false)
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()
  const { data: likedNfts } = useFetchLikedNfts()

  const userLikedNfts = useFetchUserLikedNfts()
  const { data: signerAddress } = useFetchSigner()

  const { data: nfts, status } = useCreatorNfts()
  const { data: myNfts, status: myNftsStatus } = useMyNfts()
  const { data: user, status: userStatus } = useFetchUser(signerAddress)
  const { data: users } = useFetchAllUsers()
  const [followingUsers, setFollowingUsers] = useState([])
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [followers, setFollowers] = useState([])

  const sold = nfts?.filter((i) => i.sold)

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

  useEffect(() => {
    setFollowers(getFollowers(user?.user?.followers, users?.users))
  }, [user, users])
  useEffect(() => {
    setFollowingUsers(getFollowingUsers(users?.users))
  }, [users])
  useEffect(() => {
    if (!signerAddress) {
      // navigate('/wallet')
    }
  }, [signerAddress])

  const handleBtnClick = () => {
    setOpenMenu(!openMenu)
    setOpenMenu1(false)
    setOpenMenu2(false)
    setOpenMenu3(false)
    document.getElementById('Mainbtn').classList.add('active')
    document.getElementById('Mainbtn1').classList.remove('active')
    document.getElementById('Mainbtn2').classList.remove('active')
    document.getElementById('Mainbtn3').classList.remove('active')
  }
  const handleBtnClick1 = () => {
    setOpenMenu1(!openMenu1)
    setOpenMenu2(false)
    setOpenMenu(false)
    setOpenMenu3(false)
    document.getElementById('Mainbtn1').classList.add('active')
    document.getElementById('Mainbtn').classList.remove('active')
    document.getElementById('Mainbtn2').classList.remove('active')
    document.getElementById('Mainbtn3').classList.remove('active')
  }
  const handleBtnClick2 = () => {
    setOpenMenu2(!openMenu2)
    setOpenMenu(false)
    setOpenMenu1(false)
    setOpenMenu3(false)
    document.getElementById('Mainbtn2').classList.add('active')
    document.getElementById('Mainbtn').classList.remove('active')
    document.getElementById('Mainbtn1').classList.remove('active')
    document.getElementById('Mainbtn3').classList.remove('active')
  }

  const handleBtnClick3 = () => {
    setOpenMenu3(!openMenu3)
    setOpenMenu2(false)
    setOpenMenu(false)
    setOpenMenu1(false)
    document.getElementById('Mainbtn3').classList.add('active')
    document.getElementById('Mainbtn').classList.remove('active')
    document.getElementById('Mainbtn1').classList.remove('active')
    document.getElementById('Mainbtn2').classList.remove('active')
  }
  const handleUnFollow = async (followingAddress) => {
    setLoading(true)
    const res = await followSeller(followingAddress, user?.user?.walletAddress)

    if (res.message === 'User Followed SuccessFully') {
      successToaster('You Now Following Seller')
      setShowFollowingModal(false)
      queryClient.invalidateQueries('users')
    }
    if (res.message === 'User Un Followed SuccessFully') {
      successToaster('Seller Unfollowed')
      setShowFollowingModal(false)
      queryClient.invalidateQueries('users')
    }
    setLoading(false)
  }

  const dispatch = useDispatch()
  const authorsState = useSelector(selectors.authorsState)
  const author = authorsState.data ? authorsState.data[0] : {}

  useEffect(() => {
    dispatch(fetchAuthorList(authorId))
  }, [dispatch, authorId])

  const resaleNft = async (n, newPrice, isAuctionSale, auctionEndDate) => {
    setLoading(true)
    console.log(n, newPrice, isAuctionSale, auctionEndDate)
    const today = dayjs()
    const endDate = dayjs(auctionEndDate)
    const milliseconds = endDate.diff(today)
    const isWalletConnectUser = localStorage.getItem('@walletconnect')
    if (isWalletConnectUser === 'metamask') {
      try {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const price = ethers.utils.parseUnits(`${Number(newPrice)}`, 'ether')

        /* then list the item for sale on the marketplace */
        let contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        // let listingPrice = await contract.getListingPrice();
        let listingPrice = await contract.getListingPriceByItemPrice(price)
        listingPrice = listingPrice.toString()
        let transaction = await contract.resaleBoughtItem(
          nftaddress,
          n.itemId,
          price,
          isAuctionSale,
          milliseconds,
          auctionEndDate,
          {
            value: listingPrice
          }
        )
        await transaction.wait()
        console.log({ transaction })
        setLoading(false)
        window.open('/', '_self')
      } catch (error) {
        console.log(error?.data?.message)
        if (
          error?.data?.message ===
            'VM Exception while processing transaction: revert ERC721: transfer caller is not owner nor approved' ||
          error?.data?.message ===
            'execution reverted: ERC721: transfer caller is not owner nor approved'
        ) {
          const web3Modal = new Web3Modal()
          const connection = await web3Modal.connect()
          const provider = new ethers.providers.Web3Provider(connection)
          const signer = provider.getSigner()

          /* next, create the item */
          let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
          let transaction = await contract.setApprovalAgain()
          resaleNft(n, newPrice, isAuctionSale, auctionEndDate)
        }
        setLoading(false)
      }
    } else {
      try {
        //  Enable session (triggers QR Code modal)
        await walletConnectProvider.enable('walletconnect')

        const web3Provider = new providers.Web3Provider(walletConnectProvider)
        const signer = web3Provider.getSigner()

        const price = ethers.utils.parseUnits(`${Number(newPrice)}`, 'ether')

        /* then list the item for sale on the marketplace */
        let contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        // let listingPrice = await contract.getListingPrice();
        let listingPrice = await contract.getListingPriceByItemPrice(price)
        listingPrice = listingPrice.toString()
        let transaction = await contract.resaleBoughtItem(
          nftaddress,
          n.itemId,
          price,
          isAuctionSale,
          milliseconds,
          auctionEndDate,
          {
            value: listingPrice
          }
        )
        await transaction.wait()
        console.log({ transaction })
        setLoading(false)
        window.open('/', '_self')
      } catch (error) {
        console.log(error?.data?.message)
        if (
          error?.data?.message ===
            'VM Exception while processing transaction: revert ERC721: transfer caller is not owner nor approved' ||
          error?.data?.message ===
            'execution reverted: ERC721: transfer caller is not owner nor approved'
        ) {
          console.log('error')
          // const provider = new WalletConnectProvider({
          //   infuraId: '27e484dcd9e3efcfd25a83a78777cdf1',
          //   rpc: {
          //     56: 'https://bsc-dataseed.binance.org/',
          //     97: 'https://data-seed-prebsc-2-s2.binance.org:8545/',
          //   },
          //   qrcode: true,
          //   qrcodeModalOptions: {
          //     mobileLinks: ['metamask', 'trust'],
          //     desktopLinks: ['encrypted ink'],
          //   },
          // });

          // //  Enable session (triggers QR Code modal)
          // await provider.enable('walletconnect');

          // const web3Provider = new providers.Web3Provider(provider);
          // const signer = web3Provider.getSigner();

          // /* next, create the item */
          // let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
          // let transaction = await contract.setApprovalAgain();
          // resaleNft(n, newPrice, isAuctionSale, auctionEndDate);
        }
        setLoading(false)
      }
    }
  }

  return (
    <div>
      <GlobalStyles />
      {showFollowersModal && (
        <FollowModal
          users={followers}
          loading={loading}
          title={'Followers'}
          displayModal={(val) => setShowFollowersModal(val)}
          onClickRow={(link) => navigateTo(link)}
        />
      )}
      {showFollowingModal && (
        <FollowModal
          users={followingUsers}
          showFollowButton={true}
          loading={loading}
          title={'Following'}
          displayModal={(val) => setShowFollowingModal(val)}
          onClickRow={(link) => navigateTo(link)}
          onClickUnFollow={(address) => handleUnFollow(address)}
        />
      )}

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
                      {user?.user?.userName ? (
                        user?.user?.userName
                      ) : (
                        <div style={{ maxWidth: 200, whiteSpace: 'nowrap' }}>
                          <MiddleEllipsis>
                            <span>{signerAddress} </span>
                          </MiddleEllipsis>
                        </div>
                      )}
                      <span className='profile_username'>
                        {user?.user?.email ? user?.user?.email : '@Unamed'}
                      </span>
                      <span id='wallet' className='profile_wallet'>
                        {signerAddress && signerAddress}
                      </span>
                      <button
                        id='btn_copy'
                        title='Copy Text'
                        onClick={() =>
                          navigator.clipboard.writeText(signerAddress)
                        }
                      >
                        Copy
                      </button>
                    </h4>
                  </div>
                </div>
              </div>
              <div className='profile_follow de-flex'>
                <div className='de-flex-col'>
                  <div
                    className='profile_follower'
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowFollowersModal(true)}
                  >
                    {user?.user?.followers?.length} Followers
                  </div>
                </div>
                <div className='de-flex-col'>
                  <div
                    className='profile_follower'
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowFollowingModal(true)}
                  >
                    {followingUsers?.length} Following
                  </div>
                </div>
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
                <li id='Mainbtn1' className=''>
                  <span onClick={handleBtnClick1}>Created</span>
                </li>
                <li id='Mainbtn2' className=''>
                  <span onClick={handleBtnClick2}>My assets</span>
                </li>
                <li id='Mainbtn3' className=''>
                  <span onClick={handleBtnClick3}>Liked</span>
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
        {openMenu1 && (
          <div id='zero2' className='onStep fadeIn'>
            <div className='row'>
              {status === 'loading' && <div className='col-12'>Loading...</div>}
              {status === 'success' && sold?.length < 1 && (
                <div className='col-12'>No item...</div>
              )}
              {status === 'success' &&
                sold &&
                sold?.map((nft, index) => (
                  <NftCard
                    nft={nft}
                    key={index}
                    onImgLoad={onImgLoad}
                    height={height}
                    onLike={onLikeNft}
                    liked={isNftLikedByUser(nft.itemId, likedNfts)}
                  />
                ))}
            </div>
          </div>
        )}
        {openMenu2 && (
          <div id='zero3' className='onStep fadeIn'>
            <div className='row'>
              {myNftsStatus === 'loading' && (
                <div className='col-12'>Loading...</div>
              )}
              {myNftsStatus === 'success' && myNfts?.length < 1 && (
                <div className='col-12'>No item...</div>
              )}
              {myNftsStatus === 'success' &&
                myNfts &&
                myNfts?.map((nft, index) => (
                  <NftCard
                    nft={nft}
                    key={index}
                    onImgLoad={onImgLoad}
                    height={height}
                    onLike={onLikeNft}
                    liked={isNftLikedByUser(nft.itemId, likedNfts)}
                    myNft={true}
                    onResale={() => setNftForResale(nft)}
                  />
                ))}
            </div>
          </div>
        )}
        {openMenu3 && (
          <div id='zero4' className='onStep fadeIn'>
            <div className='row'>
              {userLikedNfts?.length === 0
                ? 'No Liked Items'
                : likeNftMutation?.isLoading
                ? 'Loading'
                : userLikedNfts?.map((nft, index) => (
                    <NftCard
                      nft={nft.nft}
                      key={index}
                      onImgLoad={onImgLoad}
                      height={height}
                      liked={true}
                      onLike={onLikeNft}
                    />
                  ))}
            </div>
          </div>
        )}
      </section>
      {nftForResale && (
        <ResaleCheckout
          loading={loading}
          nft={nftForResale}
          onCheckout={(nft, newPrice, isAuctionSale, auctionEndDate) =>
            resaleNft(nft, newPrice, isAuctionSale, auctionEndDate)
          }
          onClose={() => setNftForResale(false)}
        />
      )}

      <Footer />
    </div>
  )
}
export default memo(Colection)

const ResaleCheckout = ({ nft, onCheckout, onClose, loading }) => {
  const [newPrice, setNewPrice] = useState(Number(nft?.price) || 0)
  const [isAuctionSale, setIsAuctionSale] = useState(false)
  const [auctionEndDate, setAuctionEndDate] = useState(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  )

  useEffect(() => {
    if (nft) {
      setNewPrice(Number(nft?.price) || 0)
      setIsAuctionSale(false)
      setAuctionEndDate(dayjs().add(1, 'day').format('YYYY-MM-DD'))
    }
  }, [nft])

  return (
    <div className='checkout' style={{ paddingTop: '100px' }}>
      <div className='maincheckout'>
        <button className='btn-close' onClick={() => onClose()}>
          x
        </button>
        <div className='heading'>
          <h3>Resale item </h3>
        </div>
        <p>
          You are about to list <span className='bold'>{nft?.title}</span> for
          selling.
        </p>

        <h5>Select method</h5>
        <div className='de_tab tab_metho'>
          <select
            className='form-control1'
            onChange={(e) => setIsAuctionSale(e.target.value === '2')}
          >
            <option value='1'>Fixed price</option>
            <option value='2'>Timed auction</option>
          </select>

          {isAuctionSale && (
            <div>
              <div className='row'>
                <div className='col-md-12'>
                  <h5>Expiration date</h5>
                  <input
                    type='date'
                    name='bid_expiration_date'
                    id='bid_expiration_date'
                    className='form-control'
                    min={dayjs().add(1, 'day').format('YYYY-MM-DD')}
                    value={auctionEndDate}
                    onChange={(e) => setAuctionEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='detailcheckout'>
          <div className='listcheckout'>
            <h6>New price ({unit})</h6>
            <input
              type='number'
              className='form-control'
              value={newPrice}
              onChange={(e) => setNewPrice(Math.abs(e.target.value))}
            />
            {newPrice <= nft?.price && (
              <div style={{ color: 'red' }}>
                New price should be greater than previous sold price.
              </div>
            )}
          </div>
        </div>
        <div className='spacer-single'></div>

        <div className='heading'>
          <p>Service fee {feePercent}%</p>
          <div className='subtotal'>
            {newPrice * (feePercent / 100)} {unit}
          </div>
        </div>
        {loading ? (
          <Loader width={40} height={40} />
        ) : (
          <button
            className='btn-main lead mb-5'
            disabled={newPrice <= Number(nft?.price)}
            onClick={() =>
              onCheckout(nft, newPrice, isAuctionSale, auctionEndDate)
            }
          >
            Re list
          </button>
        )}
      </div>
    </div>
  )
}
