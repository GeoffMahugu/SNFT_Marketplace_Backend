import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import ColumnNewRedux from '../components/ColumnNewRedux';
import * as selectors from '../../store/selectors';
import { fetchHotCollections } from '../../store/actions/thunks';
import api from '../../core/api';
import { useFetchCollectionNfts } from '../hooks/nfts';
import { useFetchSingleCollection } from '../hooks/collections';
import NftCard from '../components/NftCard';

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #fff;
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
`;

const Colection = function (props) {
  const collectionId = props?.collectionId;
  const [openMenu, setOpenMenu] = useState(true);
  const [openMenu1, setOpenMenu1] = useState(false);
  const [height, setHeight] = useState(0);

  const onImgLoad = ({ target: img }) => {
    let currentHeight = height;
    if (currentHeight < img.offsetHeight) {
      setHeight(img.offsetHeight);
    }
  };

  const { data: singleCol, status: colStatus } = useFetchSingleCollection(collectionId);
  const { data: nfts, status } = useFetchCollectionNfts(
    singleCol?.collectionAddress
  );

  console.log({ nfts, singleCol, collectionId });

  const sold = nfts?.filter((nft) => nft.sold);
  const available = nfts?.filter((nft) => !nft.sold);

  const handleBtnClick = () => {
    setOpenMenu(!openMenu);
    setOpenMenu1(false);
    document.getElementById('Mainbtn').classList.add('active');
    document.getElementById('Mainbtn1').classList.remove('active');
  };
  const handleBtnClick1 = () => {
    setOpenMenu1(!openMenu1);
    setOpenMenu(false);
    document.getElementById('Mainbtn1').classList.add('active');
    document.getElementById('Mainbtn').classList.remove('active');
  };


  return (
    <div>
      <GlobalStyles />
      {console.log({ colStatus })}
      {colStatus === 'loading' && <div>Loading... </div>}
      {colStatus === 'success' && singleCol && (
        <>
          <section
            id='profile_banner'
            className='jumbotron breadcumb no-bg'
            style={{
              backgroundImage: `url(${singleCol?.coverUrl})`,
            }}
          >
            <div className='mainbreadcumb'></div>
          </section>

          <section className='container d_coll no-top no-bottom'>
            <div className='row'>
              <div className='col-md-12'>
                <div className='d_profile'>
                  <div className='profile_avatar'>
                    {
                      <div className='d_profile_img'>
                        <img src={singleCol?.imageUrl} alt='' loading='lazy' />
                        <i className='fa fa-check'></i>
                      </div>
                    }
                    <div className='profile_name'>
                      <h4>
                        {singleCol?.name}
                        <div className='clearfix'></div>
                        {collectionId && (
                          <span id='wallet' className='profile_wallet'>
                            {singleCol?.collectionAddress}
                          </span>
                        )}
                        <button
                          id='btn_copy'
                          title='Copy Text'
                          onClick={() =>
                            navigator.clipboard.writeText(
                              singleCol?.collectionAddress
                            )
                          }
                        >
                          Copy
                        </button>
                      </h4>
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
                  <ul className='de_nav'>
                    <li id='Mainbtn' className='active'>
                      <span onClick={handleBtnClick}>On Sale</span>
                    </li>
                    <li id='Mainbtn1' className=''>
                      <span onClick={handleBtnClick1}>Sold</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {openMenu && (
              <div id='zero1' className='onStep fadeIn'>
                <div className='row'>
                  {status === 'loading' && (
                    <div className='col-12'>Loading...</div>
                  )}
                  {status === 'success' && available?.length < 1 && (
                    <div className='col-12'>No item...</div>
                  )}
                  {status === 'success' &&
                    available &&
                    available?.map((nft, index) => (
                      <NftCard
                        nft={nft}
                        key={index}
                        onImgLoad={onImgLoad}
                        height={height}
                      />
                    ))}
                  {/* {showLoadMore && nfts.length <= 20 && (
          <div className='col-lg-12'>
            <div className='spacer-single'></div>
            <span onClick={loadMore} className='btn-main lead m-auto'>
              Load More
            </span>
          </div>
        )} */}
                </div>
              </div>
            )}
            {openMenu1 && (
              <div id='zero2' className='onStep fadeIn'>
                <div className='row'>
                  {status === 'loading' && (
                    <div className='col-12'>Loading...</div>
                  )}
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
                      />
                    ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
      <Footer />
    </div>
  );
};
export default memo(Colection);
