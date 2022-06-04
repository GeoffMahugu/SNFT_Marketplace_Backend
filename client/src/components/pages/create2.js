import React, { useState, useEffect } from 'react'
import Clock from '../components/Clock'
import Footer from '../components/footer'
import { createGlobalStyle } from 'styled-components'

import dayjs from 'dayjs'
import { Formik } from 'formik'
import * as yup from 'yup'
import {
  nftaddress,
  nftmarketaddress,
  unit,
  walletConnectProvider
} from '../../config'

import NFT from '../../contracts/NFT.json'
import Market from '../../contracts/NFTMarket.json'

import Web3Modal from 'web3modal'
import { ethers, providers } from 'ethers'

import { create as ipfsHttpClient } from 'ipfs-http-client'
import CreateCollectionModal from '../components/CreateCollectionModal'
import { useFetchCollectionsByOwner } from '../hooks/collections'
import {
  useFetchSigner,
  useFetchUser,
  useIsWalletConnectUser
} from '../hooks/users'

import VideoPlayer from '../components/VideoPlayer'
import AddNftsExtraListItem from '../components/AddNftsExtraListItem'
import AddNftsPropertiesModal from '../components/AddNftPropertiesModal'

import WalletConnect from '@walletconnect/client'
import QRCodeModal from '@walletconnect/qrcode-modal'
import { createNftService } from '../../services/Services'
import Loader from '../components/Loader'
import { categories } from '../../utils'
import UserPlaceholder from '../../assets/User-Placeholder.jpeg'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const connector = new WalletConnect({
  bridge: 'https://bridge.walletconnect.org', // Required
  qrcodeModal: QRCodeModal
})

const createNftSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  price: yup
    .number('Price should be a number')
    .required('Price is required')
    .positive('Price should be positive')
})

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.sticky.white {
    background: #403f83;
    border-bottom: solid 1px #403f83;
  }
  header#myHeader.navbar .search #quick_search{
    color: #fff;
    background: rgba(255, 255, 255, .1);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #fff;
  }
  header#myHeader .dropdown-toggle::after{
    color: rgba(255, 255, 255, .5);
  }
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
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
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`
// const categories = ['All', 'Featured', 'Art', 'Sport']
// const collections = ['Col1', 'Col2', 'Col3', 'Col3']

export default function Createpage() {
  const { data: signerAddress } = useFetchSigner()
  const { data: isWalletConnectUser } = useIsWalletConnectUser()
  const { data: user } = useFetchUser(signerAddress)

  const { data: collections, status: colStatus } =
    useFetchCollectionsByOwner(signerAddress)
  console.log(collections)
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [isVideo, setIsVideo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isAuctionSale, setIsAuctionSale] = useState(false)
  const [auctionEndDate, setAuctionEndDate] = useState(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  )
  const [addCollection, setAddCollection] = useState(false)
  const [showPropertiesModal, setShowPropertiesModal] = useState(false)
  const [nftProperties, setNftProperties] = useState([])

  console.log({ isWalletConnectUser })

  useEffect(() => {
    if (collections?.length > 0) {
      setSelectedCollection(collections?.[0].collectionAddress)
    }
  }, [collections])
  const onChange = async (e) => {
    var file = e.target.files[0]
    const fileType = file['type']
    if (fileType.includes('video')) {
      setIsVideo(true)
    } else {
      setIsVideo(false)
    }
    setFile(file)
    try {
      setLoading(true)
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`)
      })
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      console.log('objectUrl', url)
      setFileUrl(url)
      setLoading(false)
    } catch (error) {
      console.log('Error uploading file: ', error)
      setLoading(false)
    }
  }

  const handleShow = () => {
    setIsAuctionSale(false)
    document.getElementById('btn1').classList.add('active')
    document.getElementById('btn2').classList.remove('active')
  }
  const handleShow1 = () => {
    setIsAuctionSale(true)
    document.getElementById('btn1').classList.remove('active')
    document.getElementById('btn2').classList.add('active')
  }

  async function createMarket(values, actions) {
    console.log('formadata', values)

    const { title, description, price } = values
    if (!title || !fileUrl) return
    /* first, upload to IPFS */
    setLoading(true)
    const data = JSON.stringify({
      title,
      description,
      isVideo,
      image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      if (isWalletConnectUser === 'metamask') {
        createSale(url, price, values)
      } else {
        createWalletConnectSale(url, price, values)
      }
    } catch (error) {
      console.log('Error uploading file: ', error)
      setLoading(false)
    }
  }

  async function createWalletConnectSale(url, nftPrice, values) {
    try {
      //  Enable session (triggers QR Code modal)
      await walletConnectProvider.enable('walletconnect')
      const c = walletConnectProvider.accounts

      const web3Provider = new providers.Web3Provider(walletConnectProvider)
      const signer = web3Provider.getSigner()

      console.log(web3Provider, signer, c)
      let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
      let transaction = await contract.createToken(url)
      let tx = await transaction.wait()
      console.log('tx', tx)
      let event = tx.events[0]
      let value = event.args[2]
      let tokenId = value.toNumber()

      const price = ethers.utils.parseUnits(nftPrice.toString(), 'ether')

      /* then list the item for sale on the marketplace */
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
      // let listingPrice = await contract.getListingPrice();
      let listingPrice = await contract.getListingPriceByItemPrice(price)

      listingPrice = listingPrice.toString()

      const today = dayjs()
      const endDate = dayjs(auctionEndDate)
      const seconds = endDate.diff(today, 'seconds')

      if (isAuctionSale) {
        transaction = await contract.createMarketItem(
          nftaddress,
          tokenId,
          price,
          true,
          seconds,
          // 200,
          auctionEndDate,
          selectedCategory,
          selectedCollection || signerAddress,
          {
            value: listingPrice
          }
        )
      } else {
        transaction = await contract.createMarketItem(
          nftaddress,
          tokenId,
          price,
          false,
          0,
          '',
          selectedCategory,
          selectedCollection || signerAddress,
          {
            value: listingPrice
          }
        )
      }

      await transaction.wait()
      const nftServerSchema = {
        artist: signerAddress,
        auction: null,
        auctionInfo: null,
        category: selectedCategory,
        collectionAddress: selectedCollection || signerAddress,
        description: values.description,
        image: fileUrl,
        isVideo: isVideo,
        itemId: tokenId,
        owner: signerAddress,
        price: price,
        seller: signerAddress,
        title: values.title,
        properties: nftProperties,
        auctionEndDate: auctionEndDate
      }
      const createNft = await createNftService(nftServerSchema)
      console.log('create123', createNft)
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }

  async function createSale(url, nftPrice, values) {
    try {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()

      /* next, create the item */
      let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
      let transaction = await contract.createToken(url)
      let tx = await transaction.wait()
      console.log('tx', tx)
      let event = tx.events[0]
      let value = event.args[2]
      let tokenId = value.toNumber()

      const price = ethers.utils.parseUnits(nftPrice.toString(), 'ether')

      /* then list the item for sale on the marketplace */
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
      // let listingPrice = await contract.getListingPrice();
      let listingPrice = await contract.getListingPriceByItemPrice(price)

      listingPrice = listingPrice.toString()

      const today = dayjs()
      const endDate = dayjs(auctionEndDate)
      const seconds = endDate.diff(today, 'seconds')

      if (isAuctionSale) {
        transaction = await contract.createMarketItem(
          nftaddress,
          tokenId,
          price,
          true,
          seconds,
          // 200,
          auctionEndDate,
          selectedCategory,
          selectedCollection || signerAddress,
          {
            value: listingPrice
          }
        )
      } else {
        transaction = await contract.createMarketItem(
          nftaddress,
          tokenId,
          price,
          false,
          0,
          '',
          selectedCategory,
          selectedCollection || signerAddress,
          {
            value: listingPrice
          }
        )
      }

      await transaction.wait()
      const nftServerSchema = {
        artist: signerAddress,
        auction: null,
        auctionInfo: null,
        category: selectedCategory,
        collectionAddress: selectedCollection || signerAddress,
        description: values.description,
        image: fileUrl,
        isVideo: isVideo,
        itemId: tokenId,
        owner: signerAddress,
        price: price,
        seller: signerAddress,
        title: values.title,
        properties: nftProperties,
        auctionEndDate: auctionEndDate
      }
      const createNft = await createNftService(nftServerSchema)
      console.log('create123', createNft)

      setLoading(false)
      // window.open("/", "_self");
    } catch (error) {
      console.log(error)
      console.log(error?.data?.message)
      alert(error?.data?.message)
      setLoading(false)
    }
  }

  const initialValues = {
    title: '',
    description: '',
    price: 0
  }

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={createNftSchema}
        onSubmit={(values, actions) => {
          console.log('alues', values)
          createMarket(values, actions)
        }}
      >
        {({
          values,
          touched,
          errors,
          isValid,
          handleChange,
          handleBlur,
          handleSubmit
        }) => (
          <>
            <GlobalStyles />

            <section
              className='jumbotron breadcumb no-bg'
              style={{
                backgroundImage: `url(${'./img/background/subheader.jpg'})`
              }}
            >
              <div className='mainbreadcumb'>
                <div className='container'>
                  <div className='row m-10-hor'>
                    <div className='col-12'>
                      <h1 className='text-center'>Create NFT</h1>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className='container'>
              <div className='row'>
                <div className='col-lg-7 offset-lg-1 mb-5'>
                  {loading && <div>Loading ...</div>}
                  <form
                    id='form-create-item'
                    className='form-border'
                    action='#'
                  >
                    <div className='field-set'>
                      <h5>Upload file</h5>
                      <div className='d-create-file'>
                        <p id='file_name'>
                          PNG, JPG, GIF, WEBP, VIDEO Max 20mb.
                        </p>

                        {file && <p>{file.name}</p>}

                        <div className='browse'>
                          <input
                            type='button'
                            id='get_file'
                            className='btn-main'
                            value='Browse'
                          />
                          <input
                            id='upload_file'
                            type='file'
                            accept='image/png, image/gif, image/jpeg, video/mp4,video/x-m4v,video/*'
                            multiple
                            onChange={onChange}
                          />
                        </div>
                      </div>
                      <div className='spacer-single'></div>
                      <h5>Select method</h5>
                      <div className='de_tab tab_methods'>
                        <ul className='de_nav'>
                          <li id='btn1' className='active' onClick={handleShow}>
                            <span>
                              <i className='fa fa-tag'></i>Fixed price
                            </span>
                          </li>
                          <li id='btn2' onClick={handleShow1}>
                            <span>
                              <i className='fa fa-hourglass-1'></i>Timed auction
                            </span>
                          </li>
                        </ul>

                        <div className='de_tab_content pt-3'>
                          {!isAuctionSale && (
                            <div id='tab_opt_1'>
                              <h5>Price</h5>
                              <input
                                type='text'
                                name='price'
                                id='item_price'
                                className='form-control'
                                placeholder='enter price for one item (ETH)'
                                value={values.price}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              <p>{touched.price && errors.price}</p>
                            </div>
                          )}

                          <div id='tab_opt_2'>
                            {isAuctionSale && (
                              <>
                                <h5>Minimum bid</h5>
                                <input
                                  type='text'
                                  name='price'
                                  id='item_price_bid'
                                  className='form-control'
                                  placeholder='enter minimum bid'
                                  value={values.price}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                                <p>{touched.price && errors.price}</p>
                                <div className='row'>
                                  <div className='col-md-6'>
                                    <h5>Expiration date</h5>
                                    <input
                                      type='date'
                                      name='bid_expiration_date'
                                      id='bid_expiration_date'
                                      className='form-control'
                                      min={dayjs()
                                        .add(1, 'day')
                                        .format('YYYY-MM-DD')}
                                      value={auctionEndDate}
                                      onChange={(e) =>
                                        setAuctionEndDate(e.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          <div id='tab_opt_3'></div>
                        </div>
                      </div>
                      <h5>Title</h5>
                      <input
                        type='text'
                        name='title'
                        id='item_title'
                        className='form-control'
                        placeholder="e.g. 'Crypto Funk"
                        value={values.title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <p>{touched.title && errors.title}</p>
                      <div className='spacer-10'></div>
                      <h5>Description</h5>
                      <textarea
                        data-autoresize
                        name='description'
                        id='item_desc'
                        className='form-control'
                        placeholder="e.g. 'This is very limited item'"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      ></textarea>
                      <p>{touched.description && errors.description}</p>
                      <div className='spacer-10'></div>
                      <div className='d-flex '>
                        <h5 className=''>Collection</h5>

                        <div
                          className='add_collection_btn'
                          onClick={() => setAddCollection(true)}
                        >
                          <i className='fa fa-plus text-white '></i>
                        </div>
                      </div>
                      <select
                        className='form-control1'
                        value={selectedCollection}
                        onChange={(e) => setSelectedCollection(e.target.value)}
                      >
                        {colStatus === 'success' &&
                          collections?.map((col) => (
                            <option value={col?.collectionAddress}>
                              {col?.name}
                            </option>
                          ))}
                      </select>

                      {addCollection && (
                        <CreateCollectionModal
                          displayModal={(val) => setAddCollection(val)}
                        />
                      )}
                      <div className='spacer-10'></div>
                      <h5>Category</h5>
                      <select
                        className='form-control1'
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        {categories.map((cat) => (
                          <option value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className='spacer-10'></div>
                      {showPropertiesModal && (
                        <AddNftsPropertiesModal
                          displayModal={(val) => setShowPropertiesModal(val)}
                          setNftProperties={setNftProperties}
                          nftProperties={nftProperties}
                        />
                      )}
                      <AddNftsExtraListItem
                        heading={'Properties'}
                        subHeading='Textual Traits that shows up as rectangles'
                        headingIconName={'fa fa-list'}
                        onAddPress={() => setShowPropertiesModal(true)}
                      />
                      <div className='spacer-10'></div>
                      {!loading ? (
                        <input
                          type='button'
                          id='submit'
                          className='btn-main'
                          value='Create Item'
                          onClick={handleSubmit}
                        />
                      ) : (
                        <Loader width={40} height={40} />
                      )}
                    </div>
                  </form>
                </div>

                <div className='col-lg-3 col-sm-6 col-xs-12'>
                  <h5>Preview item</h5>
                  <div className='nft__item m-0'>
                    {isAuctionSale && (
                      <div className='de_countdown'>
                        <Clock
                          deadline={
                            dayjs(auctionEndDate)?.format('MMMM, DD, YYYY') ||
                            'December, 30, 2021'
                          }
                        />
                      </div>
                    )}
                    <div className='author_list_pp'>
                      <span>
                        <img
                          className='lazy'
                          style={{ width: 50, height: 50 }}
                          src={
                            user?.user?.profileImage
                              ? user?.user?.profileImage
                              : UserPlaceholder
                          }
                          alt=''
                          loading='lazy'
                        />
                        <i className='fa fa-check'></i>
                      </span>
                    </div>
                    <div className='nft__item_wrap'>
                      <span>
                        {!isVideo ? (
                          <img
                            src={fileUrl || './img/collections/coll-item-3.jpg'}
                            id='get_file_2'
                            className='lazy nft__item_preview'
                            alt=''
                            loading='lazy'
                          />
                        ) : (
                          fileUrl && <VideoPlayer videoURL={fileUrl} />
                        )}
                      </span>
                    </div>
                    <div className='nft__item_info'>
                      <span>
                        <h4>{values?.title || 'Your title here'}</h4>
                      </span>
                      <div className='nft__item_price'>
                        {values?.price || 'Your price here'} {unit}
                      </div>
                      <div className='nft__item_action'>
                        <span>Place a bid</span>
                      </div>
                      <div className='nft__item_like'>
                        <i className='fa fa-heart'></i>
                        <span>50</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <Footer />
          </>
        )}
      </Formik>
    </div>
  )
}
