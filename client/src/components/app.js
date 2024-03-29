import React, { useEffect } from 'react';
import { Router, Location, Redirect } from '@reach/router'
import ScrollToTopBtn from './menu/ScrollToTop'
import Header from './menu/header'
import Home from './pages/home'
import HomeGrey from './pages/homeGrey'
import Home1 from './pages/home1'
import Home1grey from './pages/home1Grey'
import Home2 from './pages/home2'
import Home2grey from './pages/home2Grey'
import Home3 from './pages/home3'
import Home4 from './pages/home4'
import Home5 from './pages/home5'
import Explore from './pages/explore'
import Aws from './pages/aws';
import Exploregrey from './pages/exploreGrey'
import Explore2 from './pages/explore2'
import Explore2grey from './pages/explore2Grey'
import ExploreOpensea from './pages/Opensea/explore'
// import Rangking from './pages/rangking';
import RankingRedux from './pages/RankingRedux'
import RankingReduxgrey from './pages/RankingReduxGrey'
import Auction from './pages/Auction'
import Auctiongrey from './pages/AuctionGrey'
import Helpcenter from './pages/helpcenter'
import Helpcentergrey from './pages/helpcenterGrey'
import Colection from './pages/colection'
import Colectiongrey from './pages/colectionGrey'
// import ItemDetail from './pages/ItemDetail';
import ItemDetailRedux from './pages/ItemDetailRedux'
import ItemDetailReduxgrey from './pages/ItemDetailReduxGrey'
import Author from './pages/Author'
import AuthorGrey from './pages/AuthorGrey'
import AuthorOpensea from './pages/Opensea/author'
import Wallet from './pages/wallet'
import WalletGrey from './pages/walletGrey'
import Login from './pages/login'
import Logingrey from './pages/loginGrey'
import LoginTwo from './pages/loginTwo'
import LoginTwogrey from './pages/loginTwoGrey'
import Register from './pages/register'
import Registergrey from './pages/registerGrey'
import Price from './pages/price'
import Works from './pages/works'
import News from './pages/news'
import NewsSingle from './pages/newsSingle'
import Create from './pages/create'
import Creategrey from './pages/createGrey'
import Create2 from './pages/create2'
import Create3 from './pages/create3'
import Createoption from './pages/createOptions'
import Activity from './pages/activity'
import Activitygrey from './pages/activityGrey'
import Contact from './pages/contact'
import Contactgrey from './pages/contactGrey'
import ElegantIcons from './pages/elegantIcons'
import EtlineIcons from './pages/etlineIcons'
import FontAwesomeIcons from './pages/fontAwesomeIcons'
import Accordion from './pages/accordion'
import Alerts from './pages/alerts'
import Progressbar from './pages/progressbar'
import Tabs from './pages/tabs'
import Minter from './pages/Minter'
import Mintergrey from './pages/MinterGrey'
import { ToastContainer } from 'react-toastify'

import { createGlobalStyle } from 'styled-components'

import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import Profile from './pages/Profile'
import 'react-toastify/dist/ReactToastify.css'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import SIngleAuthor from './pages/SIngleAuthor'

const queryClient = new QueryClient()

const GlobalStyles = createGlobalStyle`
  :root {
    scroll-behavior: unset;
  }
`

export const ScrollTop = ({ children, location }) => {
  React.useEffect(() => window.scrollTo(0, 0), [location])
  return children
}

const PosedRouter = ({ children }) => (
  <Location>
    {({ location }) => (
      <div id='routerhang'>
        <div key={location.key}>
          <Router location={location}>{children}</Router>
        </div>
      </div>
    )}
  </Location>
)

const App = () => {
  useEffect(() => {
    const isWalletConnectUser = localStorage.getItem('@walletconnect');
    console.log(isWalletConnectUser);
    if (isWalletConnectUser === null || !isWalletConnectUser) {
      localStorage.setItem('@walletconnect', 'metamask');
    }
  }, [])
  return (
    <div className='wraper'>
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        <GlobalStyles />
        <Header />

        <PosedRouter>
          <ScrollTop path='/'>
            <Home4 exact path='/'>
              <Redirect to='/home' />
            </Home4>
            <Profile path='/profile' />
            {/* <HomeGrey path="/homeGrey" /> */}
            {/* <Home1 path="/home1" /> */}
            {/* <Home1grey path="/home1Grey" /> */}
            {/* <Home2 path="/home2" /> */}
            {/* <Home2grey path="/home2Grey" /> */}
            {/* <Home3 path="/home3" /> */}
            {/* <Home4 path="/home4" /> */}
            {/* <Home5 path="/home5" /> */}
            <Explore path='/explore' />
            <Aws path='/aws' />

            {/* <Exploregrey path="/exploreGrey" /> */}
            {/* <Explore2 path="/explore2" /> */}
            {/* <Explore2grey path="/explore2Grey" /> */}
            {/* <ExploreOpensea path="/exploreOpensea" /> */}
            {/* <RankingRedux path="/rangking" /> */}
            {/* <RankingReduxgrey path="/rangkingGrey" /> */}
            {/* <Auction path="/Auction" /> */}
            {/* <Auctiongrey path="/AuctionGrey" /> */}
            <Helpcenter path='/helpcenter' />
            {/* <Helpcentergrey path="/helpcenterGrey" /> */}
            <Colection path='/colection/:collectionId' />
            {/* <Colectiongrey path="/colectionGrey/:collectionId" /> */}
            <ItemDetailRedux path='/ItemDetail/:nftId' />
            {/* <ItemDetailReduxgrey path="/ItemDetailGrey/:nftId" /> */}
            <Author path='/Author' />
            <SIngleAuthor path='/Author/:authorId' />

            {/* <AuthorGrey path="/AuthorGrey/:authorId" /> */}
            {/* <AuthorOpensea path="/AuthorOpensea" /> */}
            <Wallet path='/wallet' />
            {/* <WalletGrey path="/walletGrey" /> */}
            <Login path='/login' />

            {/* <Logingrey path="/loginGrey" /> */}
            {/* <LoginTwo path="/loginTwo" /> */}
            {/* <LoginTwogrey path="/loginTwoGrey" /> */}
            <Register path='/register' />
            {/* <Registergrey path="/registerGrey" /> */}
            {/* <Price path="/price" /> */}
            {/* <Works path="/works" /> */}
            {/* <News path="/news" /> */}
            {/* <NewsSingle path="/news/:postId" /> */}
            {/* <Create path='/create' /> */}
            {/* <Creategrey path="/createGrey" /> */}
            <Create2 path='/create2' />
            <Create3 path='/create3' />
            <Createoption path='/createOptions' />
            {/* <Activity path="/activity" /> */}
            {/* <Activitygrey path="/activityGrey" /> */}
            {/* <Contact path="/contact" /> */}
            {/* <Contactgrey path="/contactGrey" />  */}
            {/* <ElegantIcons path="/elegantIcons" /> */}
            {/* <EtlineIcons path="/etlineIcons" /> */}
            {/* <FontAwesomeIcons path="/fontAwesomeIcons" /> */}
            {/* <Accordion path="/accordion" /> */}
            {/* <Alerts path="/alerts" /> */}
            {/* <Progressbar path="/progressbar" /> */}
            {/* <Tabs path="/tabs" /> */}
            {/* <Minter path="/mint" /> */}
            {/* <Mintergrey path="/minter" /> */}
          </ScrollTop>
        </PosedRouter>
        <ScrollToTopBtn />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </div>
  );}
export default App
