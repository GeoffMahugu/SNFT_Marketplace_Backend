import React, { memo, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Clock from '../components/Clock'
import Footer from '../components/footer'
import { createGlobalStyle } from 'styled-components'
import * as selectors from '../../store/selectors'
import { fetchNftDetail } from '../../store/actions/thunks'
/*import Checkout from "../components/Checkout";
import Checkoutbid from "../components/Checkoutbid";*/
import api from '../../core/api'
import moment from 'moment'
import VideoPlayer from '../components/VideoPlayer'

import {
  useFetchSingleNft,
  useBuyNft,
  useWithdrawBid,
  usePlaceBid,
  useEndAuction,
  useFetchAuctionInfo,
  useFetchLikedNfts
} from '../hooks/nfts'
import { useFetchSigner } from '../hooks/users'
import {
  ZERO_ADDRESS,
  RPC_URL,
  unit,
  feePercent,
  POLYGONSCAN_URL,
  nftaddress
} from '../../config'
import UserPlaceholder from '../../assets/User-Placeholder.jpeg'

import { ethers } from 'ethers'
import dayjs from 'dayjs'
import useFetchNftOwner from '../hooks/nfts/_useFetchNftOwner'
import MiddleEllipsis from 'react-middle-ellipsis'
import { countNftLikes } from '../../utils/nfts'
import ConnectoToWallet from '../components/ConnectWalletModal'
import Loader from '../components/Loader'

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #fff;
    border-bottom: solid 1px #dddddd;
  }
  .mr40{
    margin-right: 40px;
  }
  .mr15{
    margin-right: 15px;
  }
  .btn2{
    background: #000000;
    color: #FFFFFF !important;
  }
   .mainside{
   
    .logout{
      display: flex;
      align-items: center;
     
    }
     .create{
        display:none
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

const convertBigNumberToNormal = (num) => {
  return ethers.utils.formatEther(num) // ethers.utils.formatUnits(num.toString(), 'ether');
}

const ItemDetailRedux = (props) => {
  const nftId = props?.nftId
  const [previousHighestBid, setPreviousHighestBid] = useState(0)
  const [previousHighestBidder, setPreviousHighestBidder] =
    useState(ZERO_ADDRESS)
  const [connectoToWallet, setConnectToWallet] = useState(false)

  const [showPlaceBidForm, setShowPlaceBidForm] = useState(false)

  const [auctionEndDate, setAuctionEndDate] = useState(null)
  const [bids, setBids] = useState([])

  const { data: signerAddress } = useFetchSigner()

  const { data: singleNft, status: singleNftStatus } = useFetchSingleNft(nftId)
  console.log(singleNft)
  const { data: auctionInfo } = useFetchAuctionInfo(singleNft?.auction)
  const { mutate: buyNft, status } = useBuyNft()
  const { data: nftOwner, status: ownerStatus } = useFetchNftOwner(
    singleNft?.seller
  )
  const { data: nftArtist, status: artistStatus } = useFetchNftOwner(
    singleNft?.artist
  )

  const { mutate: withdrawBidFunds } = useWithdrawBid()
  const { mutate: placeAuctionBid, status: bidStatus } = usePlaceBid()
  const { mutate: endAuctionHandler } = useEndAuction()

  console.log({ singleNft, auctionInfo, bidStatus, status })

  const [openMenu0, setOpenMenu0] = useState(true)
  const [openMenu, setOpenMenu] = useState(false)
  const [openMenu1, setOpenMenu1] = useState(false)

  const handleBtnClick0 = () => {
    setOpenMenu0(!openMenu0)
    setOpenMenu(false)
    setOpenMenu1(false)
    document.getElementById('Mainbtn0')?.classList?.add('active')
    document.getElementById('Mainbtn')?.classList?.remove('active')
    document.getElementById('Mainbtn1')?.classList.remove('active')
  }
  const handleBtnClick = () => {
    setOpenMenu(!openMenu)
    setOpenMenu1(false)
    setOpenMenu0(false)
    document.getElementById('Mainbtn')?.classList.add('active')
    document.getElementById('Mainbtn1')?.classList.remove('active')
    document.getElementById('Mainbtn0')?.classList.remove('active')
  }
  const handleBtnClick1 = () => {
    setOpenMenu1(!openMenu1)
    setOpenMenu(false)
    setOpenMenu0(false)
    document.getElementById('Mainbtn1')?.classList.add('active')
    document.getElementById('Mainbtn')?.classList.remove('active')
    document.getElementById('Mainbtn0')?.classList.remove('active')
  }

  const dispatch = useDispatch()
  const nftDetailState = useSelector(selectors.nftDetailState)
  const nft = nftDetailState.data ? nftDetailState.data : []
  const { data: likedNfts } = useFetchLikedNfts()

  const likes = countNftLikes(nft.itemId, likedNfts)
  const [openCheckout, setOpenCheckout] = useState(false)
  const [openCheckoutbid, setOpenCheckoutbid] = useState(false)

  useEffect(() => {
    dispatch(fetchNftDetail(nftId))
  }, [dispatch, nftId])

  useEffect(() => {
    if (singleNft?.auctionInfo) {
      const { endDate, allBids, highBid, highBidder } = singleNft?.auctionInfo
      setAuctionEndDate(endDate)
      setPreviousHighestBid(convertBigNumberToNormal(highBid))
      setPreviousHighestBidder(highBidder)
      setBids(allBids)
    }
  }, [singleNft?.auctionInfo])

  const placeBidHandler = (_auctionAddress, newBidAmount) => {
    placeAuctionBid({ _auctionAddress, newBidAmount })
    setShowPlaceBidForm(false)
  }

  console.log({ nftOwner, ownerStatus, nftArtist })

  return (
    <div>
      <GlobalStyles />
      {singleNftStatus === 'loading' && <div>Loading...</div>}
      {singleNftStatus === 'success' && (
        <>
          <section className='container'>
            {showPlaceBidForm && (
              <PlaceBidCheckout
                nft={singleNft}
                highestBid={previousHighestBid}
                onCheckout={(_auctionAddress, bidAmount) =>
                  placeBidHandler(_auctionAddress, bidAmount)
                }
                onClose={() => setShowPlaceBidForm(false)}
              />
            )}
            {connectoToWallet && (
              <ConnectoToWallet
                displayModal={(val) => setConnectToWallet(val)}
              />
            )}
            <div className='row mt-md-5 pt-md-4'>
              <div className='col-md-6 text-center'>
                {!singleNft?.isVideo ? (
                  <img
                    src={singleNft?.image}
                    className='img-fluid img-rounded mb-sm-30'
                    alt=''
                    loading='lazy'
                  />
                ) : (
                  <VideoPlayer videoURL={singleNft?.image} />
                )}
              </div>
              <div className='col-md-6'>
                <div className='item_info'>
                  {singleNft?.auctionInfo && (
                    <>
                      Auctions ends in
                      <div className='de_countdown'>
                        <Clock deadline={singleNft?.auctionInfo?.endDate} />
                      </div>
                    </>
                  )}
                  <h2>{singleNft?.title}</h2>
                  <div className='item_info_counts'>
                    <div className='item_info_type'>
                      <i className='fa fa-image'></i>
                      {singleNft?.category}
                    </div>
                    {/* <div className='item_info_views'>
                      <i className='fa fa-eye'></i>
                      {nft.views}
                    </div> */}
                    <div className='item_info_like'>
                      <i className='fa fa-heart'></i>
                      {likes}
                    </div>
                  </div>
                  <p>
                    {singleNft?.auctionInfo ? 'Minimum price' : 'Price'}:{' '}
                    {singleNft?.price} {unit}
                  </p>
                  <p>{singleNft?.description}</p>

                  <div className=''>
                    <div className='mr40'>
                      <h6>Creator</h6>
                      <div className='item_author'>
                        <div className='author_list_pp'>
                          <span>
                            <img
                              style={{ width: 50, height: 50 }}
                              className='lazy'
                              src={
                                nftArtist?.user?.profileImage
                                  ? nftArtist?.user?.profileImage
                                  : UserPlaceholder
                              }
                              alt=''
                              loading='lazy'
                            />
                            <i className='fa fa-check'></i>
                          </span>
                        </div>
                        <div className='author_list_info'>
                          {nftArtist?.user?.userName
                            ? nftArtist?.user?.userName
                            : '@unamed'}
                          <div style={{ width: 200, whiteSpace: 'nowrap' }}>
                            <MiddleEllipsis>
                              <span>{singleNft?.artist} </span>
                            </MiddleEllipsis>
                          </div>
                        </div>
                      </div>
                    </div>
                    <br />
                    <div className='mr40 mt-2'>
                      <h6>Collection</h6>
                      <div className='item_author'>
                        <div
                          className='author_list_info'
                          style={{ margin: 0, padding: 0 }}
                        >
                          <div style={{ width: 200, whiteSpace: 'nowrap' }}>
                            <MiddleEllipsis>
                              <span>{singleNft?.collectionAddress} </span>
                            </MiddleEllipsis>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* button for checkout */}
                  <div className='d-flex flex-row mt-5'>
                    {signerAddress === singleNft?.seller &&
                    singleNft?.auctionInfo ? (
                      <button
                        className='btn-main btn2 lead mb-5'
                        onClick={() =>
                          endAuctionHandler({
                            _auctionAddress: singleNft?.auction,
                            nftId,
                            previousHighestBidder
                          })
                        }
                      >
                        End auction
                      </button>
                    ) : (
                      <>
                        {!singleNft?.auctionInfo ? (
                          status === 'loading' ? (
                            <div className='  mb-5 mr15'>
                              <Loader width={30} height={30} />
                            </div>
                          ) : (
                            <button
                              className='btn-main lead mb-5 mr15'
                              onClick={() => {
                                if (signerAddress) {
                                  buyNft(singleNft)
                                } else {
                                  setConnectToWallet(true)
                                }
                              }}
                            >
                              Buy Now
                            </button>
                          )
                        ) : bidStatus === 'loading' ? (
                          <div className='  mb-5 mr15'>
                            <Loader width={30} height={30} />
                          </div>
                        ) : (
                          <button
                            className='btn-main lead mb-5'
                            onClick={() => setShowPlaceBidForm(true)}
                          >
                            Place Bid
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <div className='de_tab'>
                    <ul className='de_nav'>
                      <li id='Mainbtn0' className='active'>
                        <span onClick={handleBtnClick0}>Details</span>
                      </li>
                      {singleNft?.auctionInfo && (
                        <li id='Mainbtn'>
                          <span onClick={handleBtnClick}>Bids</span>
                        </li>
                      )}
                      <li id='Mainbtn1' className=''>
                        <span onClick={handleBtnClick1}>Info</span>
                      </li>
                    </ul>

                    <div className='de_tab_content'>
                      {openMenu0 && (
                        <div className='tab-1 onStep fadeIn'>
                          <div className='d-block mb-3'>
                            <div className='mr40'>
                              <h6>Owner</h6>
                              <div className='item_author'>
                                <div className='author_list_pp'>
                                  <span>
                                    <img
                                      style={{ width: 50, height: 50 }}
                                      className='lazy'
                                      src={
                                        nftOwner?.user?.profileImage
                                          ? nftOwner?.user?.profileImage
                                          : UserPlaceholder
                                      }
                                      alt=''
                                      loading='lazy'
                                    />
                                    <i className='fa fa-check'></i>
                                  </span>
                                </div>
                                <div className='author_list_info'>
                                  <span>
                                    {nftOwner?.user?.userName
                                      ? nftOwner?.user?.userName
                                      : '@unamed'}
                                  </span>
                                  <br />
                                  <div
                                    style={{ width: 200, whiteSpace: 'nowrap' }}
                                  >
                                    <MiddleEllipsis>
                                      <span>{singleNft?.seller}</span>
                                    </MiddleEllipsis>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {openMenu && (
                        <div className='tab-1 onStep fadeIn'>
                          {bids?.length < 1 && <p>No bids yet.</p>}
                          {bids &&
                            [...bids].reverse()?.map((b, i) => (
                              <div className='p_list' key={i}>
                                <div className='p_list_pp'>
                                  <span>
                                    <img
                                      className='lazy'
                                      src='./img/author/author-1.jpg'
                                      alt=''
                                      loading='lazy'
                                    />
                                    <i className='fa fa-check'></i>
                                  </span>
                                </div>
                                <div className='p_list_info'>
                                  {b?.[1]}{' '}
                                  <b>
                                    {convertBigNumberToNormal(b?.[2])} {unit}
                                  </b>
                                  {}
                                  {i !== 0 && signerAddress === b?.[1] && (
                                    <>
                                      <WithdrawFunds
                                        bidderAddress={b?.[1]}
                                        bidAmount={b?.[2]}
                                        withDrawn={b?.[3]}
                                        signerAddress={signerAddress}
                                        onClick={() =>
                                          withdrawBidFunds({
                                            _auctionAddress: singleNft?.auction,
                                            bidId: b?.[0]?.toNumber()
                                          })
                                        }
                                      />
                                    </>
                                  )}
                                  <div className='spacer-10'></div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {openMenu1 && (
                        <div className='tab-2 onStep fadeIn'>
                          <div className=''>
                            <h4>Proof of authenticity</h4>
                            <div>
                              <a
                                href={singleNft?.image}
                                target='_blank'
                                rel='noreferrer'
                              >
                                View on IPFS:{' '}
                                <i
                                  className='fa fa-fw'
                                  aria-hidden='true'
                                  title='Copy to use external-link'
                                >
                                  
                                </i>
                              </a>
                            </div>
                            <div>
                              <a
                                href={`${POLYGONSCAN_URL}/address/${nftaddress}`}
                                target='_blank'
                                rel='noreferrer'
                              >
                                View on bscscan:{' '}
                                <i
                                  className='fa fa-fw'
                                  aria-hidden='true'
                                  title='Copy to use external-link'
                                >
                                  
                                </i>
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Footer />
          {openCheckout && (
            <div className='checkout'>
              <div className='maincheckout'>
                <button
                  className='btn-close'
                  onClick={() => setOpenCheckout(false)}
                >
                  x
                </button>
                <div className='heading'>
                  <h3>Checkout</h3>
                </div>
                <p>
                  You are about to purchase a{' '}
                  <span className='bold'>AnimeSailorClub #304</span>
                  <span className='bold'>from Monica Lucas</span>
                </p>
                <div className='detailcheckout mt-4'>
                  <div className='listcheckout'>
                    <h6>
                      Enter quantity.
                      <span className='color'>10 available</span>
                    </h6>
                    <input
                      type='text'
                      name='buy_now_qty'
                      id='buy_now_qty'
                      className='form-control'
                    />
                  </div>
                </div>
                <div className='heading mt-3'>
                  <p>Your balance</p>
                  <div className='subtotal'>10.67856 ETH</div>
                </div>
                <div className='heading'>
                  <p>Service fee 2.5%</p>
                  <div className='subtotal'>0.00325 ETH</div>
                </div>
                <div className='heading'>
                  <p>You will pay</p>
                  <div className='subtotal'>0.013325 ETH</div>
                </div>
                <button className='btn-main lead mb-5'>Checkout</button>
              </div>
            </div>
          )}
          {openCheckoutbid && (
            <div className='checkout'>
              <div className='maincheckout'>
                <button
                  className='btn-close'
                  onClick={() => setOpenCheckoutbid(false)}
                >
                  x
                </button>
                <div className='heading'>
                  <h3>Place a Bid</h3>
                </div>
                <p>
                  You are about to purchase a{' '}
                  <span className='bold'>AnimeSailorClub #304</span>
                  <span className='bold'>from Monica Lucas</span>
                </p>
                <div className='detailcheckout mt-4'>
                  <div className='listcheckout'>
                    <h6>Your bid (ETH)</h6>
                    <input type='text' className='form-control' />
                  </div>
                </div>
                <div className='detailcheckout mt-3'>
                  <div className='listcheckout'>
                    <h6>
                      Enter quantity.
                      <span className='color'>10 available</span>
                    </h6>
                    <input
                      type='text'
                      name='buy_now_qty'
                      id='buy_now_qty'
                      className='form-control'
                    />
                  </div>
                </div>
                <div className='heading mt-3'>
                  <p>Your balance</p>
                  <div className='subtotal'>10.67856 ETH</div>
                </div>
                <div className='heading'>
                  <p>Service fee 2.5%</p>
                  <div className='subtotal'>0.00325 ETH</div>
                </div>
                <div className='heading'>
                  <p>You will pay</p>
                  <div className='subtotal'>0.013325 ETH</div>
                </div>
                <button className='btn-main lead mb-5'>Checkout</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default memo(ItemDetailRedux)

const PlaceBidCheckout = ({ nft, highestBid, onCheckout, onClose }) => {
  const [bidAmount, setBidAmount] = useState(Number(highestBid) || 0)

  useEffect(() => {
    setBidAmount(Number(highestBid) || Number(nft?.price))
  }, [nft.price, highestBid])

  return (
    <div className='checkout'>
      <div className='maincheckout'>
        <button className='btn-close' onClick={() => onClose()}>
          x
        </button>
        <div className='heading'>
          <h3>Place a Bid</h3>
        </div>
        <p>
          You are about to purchase a <span className='bold'>{nft?.title}</span>
        </p>
        <div className='detailcheckout mt-4'>
          <div className='listcheckout'>
            <h6>Your bid ({unit})</h6>
            <input
              type='number'
              className='form-control'
              value={bidAmount}
              onChange={(e) => setBidAmount(Math.abs(e.target.value))}
            />
            {(bidAmount <= Number(highestBid) ||
              bidAmount <= Number(nft?.price)) && (
              <div style={{ color: 'red' }}>
                New bid amount should be greater than previous highest bid and
                initial price
              </div>
            )}
          </div>
        </div>
        <div className='heading mt-3'>
          <p>Previous highest bid</p>
          <div className='subtotal'>
            {highestBid} {unit}
          </div>
        </div>
        <div className='heading'>
          <p>Service fee 2.5%</p>
          <div className='subtotal'>
            {bidAmount * (feePercent / 100)} {unit}
          </div>
        </div>
        <div className='heading'>
          <p>You will pay</p>
          <div className='subtotal'>
            {bidAmount + bidAmount * (feePercent / 100)} {unit}
          </div>
        </div>
        <button
          className='btn-main lead mb-5'
          disabled={
            bidAmount <= Number(highestBid) || bidAmount <= Number(nft?.price)
          }
          onClick={() => onCheckout(nft?.auction, bidAmount)}
        >
          Checkout
        </button>
      </div>
    </div>
  )
}

const WithdrawFunds = ({
  onClick,
  bidderAddress,
  signerAddress,
  withDrawn
}) => {
  if (withDrawn) {
    return <div>Bid withdrawn.</div>
  }
  return !withDrawn && bidderAddress === signerAddress ? (
    <div
      className='nft__item_action'
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <span>Withdraw your funds</span>
    </div>
  ) : (
    <div></div>
  )
}
