import React from 'react'
import Reveal from 'react-awesome-reveal'
import { keyframes } from '@emotion/react'
import {navigate} from '@reach/router'

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    -webkit-transform: translateY(40px);
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
`
const inline = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
  .d-inline{
    display: inline-block;
   }
`

const slidermainparticle = () => (
  <div className='container'>
    <div className='row align-items-center'>
      <div className='col-md-6'>
        <div className='spacer-single'></div>
        <h6>
          {' '}
          <span className='text-uppercase color'>Superway Market</span>
        </h6>
        <Reveal
          className='onStep'
          keyframes={fadeInUp}
          delay={300}
          duration={900}
          triggerOnce
        >
          <h1 className='col-white'>
            Discover <span className='color'>rare</span> digital art and collect
            NFTs
          </h1>
        </Reveal>
        <Reveal
          className='onStep'
          keyframes={fadeInUp}
          delay={600}
          duration={900}
          triggerOnce
        >
          <p className='lead col-white'>
            Unit of data stored on a digital ledger, called a blockchain, that
            certifies a digital asset to be unique and therefore not
            interchangeable
          </p>
        </Reveal>
        <div className='spacer-10'></div>
        <Reveal
          className='onStep d-inline'
          keyframes={inline}
          delay={800}
          duration={900}
          triggerOnce
        >
          <span
            onClick={() => navigate('/explore')}
            className='btn-main inline lead'
          >
            Explore
          </span>
          <span
            onClick={() => navigate('/create2')}
            className='btn-main inline white lead'
          >
            Create
          </span>
          <span
            onClick={() => navigate('/aws')}
            className='btn-main inline white lead'
          >
            AWS Marketplace
          </span>
          <div className='mb-sm-30'></div>
        </Reveal>

        {/* <Reveal
          className='onStep d-inline'
          keyframes={inline}
          delay={900}
          duration={1200}
          triggerOnce
        >
          <div className='row'>
            <div className='spacer-single'></div>
            <div className='row'>
              <div className='col-lg-4 col-md-6 col-sm-4 mb30'>
                <div className='de_count text-left'>
                  <h3>
                    <span>94215</span>
                  </h3>
                  <h5 className='id-color'>Collectibles</h5>
                </div>
              </div>

              <div className='col-lg-4 col-md-6 col-sm-4 mb30'>
                <div className='de_count text-left'>
                  <h3>
                    <span>27</span>k
                  </h3>
                  <h5 className='id-color'>Auctions</h5>
                </div>
              </div>

              <div className='col-lg-4 col-md-6 col-sm-4 mb30'>
                <div className='de_count text-left'>
                  <h3>
                    <span>4</span>k
                  </h3>
                  <h5 className='id-color'>NFT Artist</h5>
                </div>
              </div>
            </div>
          </div>
        </Reveal> */}
      </div>
    </div>
  </div>
);

export default slidermainparticle
