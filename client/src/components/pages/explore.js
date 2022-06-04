import React, { useState, useEffect } from 'react';
import ColumnNewRedux from '../components/ColumnNewRedux';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import TopFilterBar from '../components/TopFilterBar';
import { useNfts } from '../hooks/nfts';
import { useFetchAwsAssets } from '../hooks/aws';
import { categories } from '../../utils';

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
`

const Explore = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState();
  const { data: nfts, status } = useNfts();
  const { data: awsAssets, status: awsStatus } = useFetchAwsAssets();
  const [addOnce, setAddedOnce] = useState(false);
  const [filteredNfts, setFilteredNfts] = useState(nfts || []);

  console.log({ awsAssets });

  useEffect(() => {
    if (nfts && nfts?.length > 0 && !addOnce) {
      setFilteredNfts(nfts)
      setAddedOnce(true)
    }
  }, [nfts, addOnce])

  const filterNfts = (title, category) => {
    if (!title && !category) {
      setFilteredNfts(nfts)
    } else if (title && !category) {
      setFilteredNfts(
        nfts.filter((nft) =>
          nft.title.toLowerCase().includes(title.toLowerCase())
        )
      )
    } else if (!title && category) {
      if (category === 'Select category') {
        setFilteredNfts(nfts)
      } else {
        setFilteredNfts(nfts.filter((nft) => nft.category === category))
      }
    } else if (title && category) {
      if (category === 'Select category') {
        setFilteredNfts(
          nfts.filter((nft) =>
            nft.title.toLowerCase().includes(title.toLowerCase())
          )
        )
      } else {
        setFilteredNfts(
          nfts.filter(
            (nft) =>
              nft.title.toLowerCase().includes(title.toLowerCase()) &&
              nft.category === category
          )
        )
      }
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
                <h1 className='text-center'>Explore</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className='row'>
          <div className='col-lg-12'>
            <TopFilterBar
              categories={categories}
              onSearch={(text) => {
                setSearchText(text)
                filterNfts(text, selectedCategory)
              }}
              onChangeCategory={(val) => {
                setSelectedCategory(val)
                console.log(nfts, val)
                filterNfts(searchText, val)
              }}
            />
          </div>
        </div>
        {status === 'loading' && <div>Loading...</div>}
        {status === 'success' && filteredNfts?.length < 1 && (
          <div>No items</div>
        )}
        <ColumnNewRedux filteredNfts={filteredNfts} />
      </section>

      <Footer />
    </div>
  )
}
export default Explore
