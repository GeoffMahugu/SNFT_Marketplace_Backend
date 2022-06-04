import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ColumnNewRedux from '../components/ColumnNewRedux';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import TopFilterBar from '../components/TopFilterBar';
import { useNfts } from '../hooks/nfts';
import { useFetchAwsAssets } from '../hooks/aws';
import { categories } from '../../utils';
import UserPlaceHolder from '../../assets/User-Placeholder.jpeg';
import VideoPlayer from '../components/VideoPlayer';
import { navigate } from '@reach/router';
import Loader from '../components/Loader';
import dayjs from 'dayjs';
import {
  nftaddress,
  nftmarketaddress,
  unit,
  walletConnectProvider,
} from '../../config';

import NFT from '../../contracts/NFT.json';
import Market from '../../contracts/NFTMarket.json';

import Web3Modal from 'web3modal';
import { ethers, providers } from 'ethers';

import { useFetchSigner } from '../hooks/users';

import { create as ipfsHttpClient } from 'ipfs-http-client';
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

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
    color: rgba(255, 255, 255, .5);;
  }
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  .mainside{
   
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
`;

const Aws = () => {
  const { data: signerAddress } = useFetchSigner();
  const [searchText, setSearchText] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { data: nfts, status } = useNfts();
  const { data: awsAssets, status: awsStatus } = useFetchAwsAssets();
  const [addOnce, setAddedOnce] = useState(false);
  const [filteredNfts, setFilteredNfts] = useState(nfts || []);
  const [showLazyModal, setShowLazyModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  console.log({ awsAssets });

  useEffect(() => {
    if (nfts && nfts?.length > 0 && !addOnce) {
      setFilteredNfts(nfts);
      setAddedOnce(true);
    }
  }, [nfts, addOnce]);

  const filterNfts = (title, category) => {
    if (!title && !category) {
      setFilteredNfts(nfts);
    } else if (title && !category) {
      setFilteredNfts(
        nfts.filter((nft) =>
          nft.title.toLowerCase().includes(title.toLowerCase())
        )
      );
    } else if (!title && category) {
      if (category === 'Select category') {
        setFilteredNfts(nfts);
      } else {
        setFilteredNfts(nfts.filter((nft) => nft.category === category));
      }
    } else if (title && category) {
      if (category === 'Select category') {
        setFilteredNfts(
          nfts.filter((nft) =>
            nft.title.toLowerCase().includes(title.toLowerCase())
          )
        );
      } else {
        setFilteredNfts(
          nfts.filter(
            (nft) =>
              nft.title.toLowerCase().includes(title.toLowerCase()) &&
              nft.category === category
          )
        );
      }
    }
  };

  const listAssetHandler = async (
    asset,
    price,
    isAuctionSale,
    auctionEndDate
  ) => {
    const uri = await getBlob(
      `https://cloud.inf4mation.com/ipfs/${asset?.ImageCID}`
    );
    createMarket(asset, price, isAuctionSale, auctionEndDate, uri);
  };

  const getBlob = (url) => {
    return fetch(url)
      .then((res) => res.blob())
      .then(blobToFile)
      .then(attemptUpload)
      .catch((err) => console.log(err));
  };

  const blobToFile = (blob, fileName = 'hello') => {
    blob.lastModifiedDate = new Date();
    blob.name = `${fileName}${new Date()}.png`;
    return blob;
  };
  const attemptUpload = async (blobData) => {
    try {
      setLoading(true);
      const added = await client.add(blobData, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      console.log('objectUrl', url);
      setFileUrl(url);
      setLoading(false);
      return url;
    } catch (error) {
      console.log('Error uploading file: ', error);
      setLoading(false);
      return null;
    }
  };

  async function createMarket(
    asset,
    price,
    isAuctionSale,
    auctionEndDate,
    uri
  ) {
    console.log('formadata', asset);

    const { MediaName, description, attributes } = asset;
    if (!MediaName || !uri) {
      alert('Please select a file');
      return;
    }
    /* first, upload to IPFS */
    setLoading(true);
    const data = JSON.stringify({
      title: MediaName,
      description,
      isVideo: asset.MediaType.includes('image') ? false : true,
      image: uri,
      attributes,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      const isWalletConnectUser = localStorage.getItem('@walletconnect');
      if (isWalletConnectUser === 'metamask') {
        createSale(url, price, asset, isAuctionSale, auctionEndDate);
      } else {
        createWalletConnectSale(
          url,
          price,
          asset,
          isAuctionSale,
          auctionEndDate
        );
      }
    } catch (error) {
      console.log('Error uploading file: ', error);
      setLoading(false);
    }
  }

  async function createSale(
    url,
    nftPrice,
    asset,
    isAuctionSale,
    auctionEndDate
  ) {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      /* next, create the item */
      let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      let transaction = await contract.createToken(url);
      let tx = await transaction.wait();
      console.log('tx', tx);
      let event = tx.events[0];
      let value = event.args[2];
      let tokenId = value.toNumber();

      const price = ethers.utils.parseUnits(nftPrice.toString(), 'ether');

      /* then list the item for sale on the marketplace */
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      // let listingPrice = await contract.getListingPrice();
      let listingPrice = await contract.getListingPriceByItemPrice(price);

      listingPrice = listingPrice.toString();

      const today = dayjs();
      const endDate = dayjs(auctionEndDate);
      const seconds = endDate.diff(today, 'seconds');

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
            value: listingPrice,
          }
        );
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
            value: listingPrice,
          }
        );
      }

      const t = await transaction.wait();
      console.log(t);
      // const nftServerSchema = {
      //   artist: signerAddress,
      //   auction: null,
      //   auctionInfo: null,
      //   category: selectedCategory,
      //   collectionAddress: selectedCollection || signerAddress,
      //   description: values.description,
      //   image: fileUrl,
      //   isVideo: isVideo,
      //   itemId: tokenId,
      //   owner: signerAddress,
      //   price: price,
      //   seller: signerAddress,
      //   title: values.title,
      //   properties: nftProperties,
      //   auctionEndDate: auctionEndDate,
      // };
      // const createNft = await createNftService(nftServerSchema);
      // console.log('create123', createNft);

      setLoading(false);
      window.open('/', '_self');
    } catch (error) {
      console.log(error);
      console.log(error?.data?.message);
      alert(error?.data?.message);
      setLoading(false);
    }
  }

  async function createWalletConnectSale(
    url,
    nftPrice,
    asset,
    isAuctionSale,
    auctionEndDate
  ) {
    try {
      //  Enable session (triggers QR Code modal)
      await walletConnectProvider.enable('walletconnect');
      const c = walletConnectProvider.accounts;

      const web3Provider = new providers.Web3Provider(walletConnectProvider);
      const signer = web3Provider.getSigner();

      console.log(web3Provider, signer, c);
      let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      let transaction = await contract.createToken(url);
      let tx = await transaction.wait();
      console.log('tx', tx);
      let event = tx.events[0];
      let value = event.args[2];
      let tokenId = value.toNumber();

      const price = ethers.utils.parseUnits(nftPrice.toString(), 'ether');

      /* then list the item for sale on the marketplace */
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      // let listingPrice = await contract.getListingPrice();
      let listingPrice = await contract.getListingPriceByItemPrice(price);

      listingPrice = listingPrice.toString();

      const today = dayjs();
      const endDate = dayjs(auctionEndDate);
      const seconds = endDate.diff(today, 'seconds');

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
            value: listingPrice,
          }
        );
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
            value: listingPrice,
          }
        );
      }

      await transaction.wait();
      // const nftServerSchema = {
      //   artist: signerAddress,
      //   auction: null,
      //   auctionInfo: null,
      //   category: selectedCategory,
      //   collectionAddress: selectedCollection || signerAddress,
      //   description: values.description,
      //   image: fileUrl,
      //   isVideo: isVideo,
      //   itemId: tokenId,
      //   owner: signerAddress,
      //   price: price,
      //   seller: signerAddress,
      //   title: values.title,
      //   properties: nftProperties,
      //   auctionEndDate: auctionEndDate,
      // };
      // const createNft = await createNftService(nftServerSchema);
      // console.log('create123', createNft);
      setLoading(false);
      window.open('/', '_self');
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div>
      <GlobalStyles />

      <section
        className='jumbotron breadcumb no-bg'
        style={{ backgroundImage: `url(${'./img/background/subheader.jpg'})` }}
      >
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>Aws lazy mint</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        {/* <div className='row'>
          <div className='col-lg-12'>
            <TopFilterBar
              categories={categories}
              onSearch={(text) => {
                setSearchText(text);
                filterNfts(text, selectedCategory);
              }}
              onChangeCategory={(val) => {
                setSelectedCategory(val);
                console.log(nfts, val);
                filterNfts(searchText, val);
              }}
            />
          </div>
        </div> */}
        {status === 'loading' && <div>Loading...</div>}
        {status === 'success' && filteredNfts?.length < 1 && (
          <div>No items</div>
        )}
        {/* <ColumnNewRedux filteredNfts={awsAssets || []} /> */}
        <div className='row'>
          {awsAssets?.map((asset, i) => (
            <NftCard
              key={i}
              nft={asset}
              onMint={(asset) => setSelectedAsset(asset)}
            />
          ))}
        </div>
      </section>
      {selectedAsset && (
        <LazyMintModal
          nft={selectedAsset}
          onListing={listAssetHandler}
          onClose={() => setSelectedAsset(null)}
          loading={loading}
        />
      )}

      <Footer />
    </div>
  );
};
export default Aws;

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

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
  onResale,
  onMint,
}) => {
  const navigateTo = (link) => {
    navigate(link);
  };

  return (
    <div className={className}>
      <div className='nft__item m-0'>
        <div className='author_list_pp'>
          <span onClick={() => navigateTo(`/Author/${nft.seller}`)}>
            <img
              style={{ width: 50, height: 50 }}
              className='lazy'
              src={UserPlaceHolder}
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
                  src={`https://cloud.inf4mation.com/ipfs/${nft?.ImageCID}`}
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
        <div className='nft__item_info'>
          <span
          // onClick={() => navigateTo(`/ItemDetail/${nft?.itemId}`)}
          >
            <h4>{nft?.MediaName}</h4>
          </span>
          <div className='nft__item_action'>
            <span onClick={() => onMint(nft)}>{'Mint'}</span>
          </div>
          <div
            onClick={() => onLike(nft)}
            className={liked ? 'nft__item_dis_like' : 'nft__item_like'}
          >
            <i className='fa fa-heart'></i>
            {/* {likes > 0 && <span>{likes}</span>} */}
          </div>
        </div>
      </div>
    </div>
  );
};

const LazyMintModal = ({ nft, onListing, onClose, loading }) => {
  const [newPrice, setNewPrice] = useState(Number(nft?.price) || 0);
  const [isAuctionSale, setIsAuctionSale] = useState(false);
  const [auctionEndDate, setAuctionEndDate] = useState(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );

  useEffect(() => {
    if (nft) {
      setNewPrice(Number(nft?.price) || 0);
      setIsAuctionSale(false);
    }
  }, [nft]);

  return (
    <div className='checkout' style={{ paddingTop: '100px' }}>
      <div className='maincheckout'>
        <button className='btn-close' onClick={() => onClose()}>
          x
        </button>
        <div className='heading'>
          <h3>Lazy mint item </h3>
        </div>
        <p>
          You are about to mint <span className='bold'>{nft?.MediaName}</span>{' '}
          for selling.
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
            {newPrice <= 0 && (
              <div style={{ color: 'red' }}>
                New price should be a positive number.
              </div>
            )}
          </div>
        </div>
        <div className='spacer-single'></div>

        {loading ? (
          <Loader width={40} height={40} />
        ) : (
          <button
            className='btn-main lead mb-5'
            disabled={newPrice <= 0}
            onClick={() =>
              onListing(nft, newPrice, isAuctionSale, auctionEndDate)
            }
          >
            Checkout
          </button>
        )}
      </div>
    </div>
  );
};
