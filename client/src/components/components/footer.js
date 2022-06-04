import React from 'react'
import { Link } from '@reach/router'
import AppLogo from '../../assets/App-logo.png'
import Discord from '../../assets/discord-brands.svg'
import { COMMUNITIES, RESOURCES } from '../../constants/Constants'

const footer = () => (
  <footer className='footer-light'>
    <div className='container'>
      <div className='row'>
        <div className='col-md-4 col-sm-6 col-xs-1'>
          <div className='widget'>
            <h5>Marketplace</h5>
            <ul>
              <li>
                <Link to='/explore'>All NFTs</Link>
              </li>
              <li>
                <Link to='/explore'>Art</Link>
              </li>
              <li>
                <Link to='/explore'>Music</Link>
              </li>
              <li>
                <Link to='/explore'>Domain Names</Link>
              </li>
              <li>
                <Link to='/explore'>Virtual World</Link>
              </li>
              <li>
                <Link to='/explore'>Collectibles</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className='col-md-4 col-sm-6 col-xs-1'>
          <div className='widget'>
            <h5>Resources</h5>
            <ul>
              {RESOURCES.map((resource, i) => (
                <li
                  key={i}
                  className='bottom_link'
                  onClick={() => window.open(resource.link, '_blank')}
                >
                  <span>{resource.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='col-md-4 col-sm-6 col-xs-1'>
          <div className='widget'>
            <h5>Community</h5>
            <ul>
              {COMMUNITIES.map((community, i) => (
                <li
                  key={i}
                  className='bottom_link'
                  onClick={() => window.open(community.link, '_blank')}
                >
                  <span>{community.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* <div className='col-md-3 col-sm-6 col-xs-1'>
          <div className='widget'>
            <h5>Newsletter</h5>
            <p>
              Signup for our newsletter to get the latest news in your inbox.
            </p>
            <form
              action='#'
              className='row form-dark'
              id='form_subscribe'
              method='post'
              name='form_subscribe'
            >
              <div className='col text-center'>
                <input
                  className='form-control'
                  id='txt_subscribe'
                  name='txt_subscribe'
                  placeholder='enter your email'
                  type='text'
                />
                <Link to='' id='btn-subscribe'>
                  <i className='arrow_right bg-color-secondary'></i>
                </Link>
                <div className='clearfix'></div>
              </div>
            </form>
            <div className='spacer-10'></div>
            <small>Your email is safe with us. We don't spam.</small>
          </div>
        </div> */}
      </div>
    </div>
    <div className='subfooter'>
      <div className='container'>
        <div className='row'>
          <div className='col-md-12'>
            <div className='de-flex'>
              <div className='de-flex-col'>
                <span onClick={() => window.open('', '_self')}>
                  <img
                    alt=''
                    style={{ width: 140, height: 100 }}
                    className='f-logo d-1'
                    src={AppLogo}
                  />
                  {/* <img alt="" className="f-logo d-3" src="./img/logo-2-light.png" />
                                        <img alt="" className="f-logo d-4" src="./img/logo-3.png" /> */}
                  <span className='copy'>
                    &copy; Copyright 2021 - snifty.io
                  </span>
                </span>
              </div>
              <div className='de-flex-col'>
                <div className='social-icons'>
                  {/* <span onClick={() => window.open('', '_self')}>
                    <i className='fa fa-facebook fa-lg'></i>
                  </span> */}
                  <span
                    onClick={() =>
                      window.open('https://twitter.com/nf4mation', '_blank')
                    }
                  >
                    <i className='fa fa-twitter fa-lg'></i>
                  </span>
                  <span
                    onClick={() =>
                      window.open('http://t.me/iNf4mation_chat', '_blank')
                    }
                  >
                    <i className='fa fa-telegram fa-lg'></i>
                  </span>
                  <span
                    onClick={() =>
                      window.open(
                        'https://www.instagram.com/iNf4mation.com_official/',
                        '_blank'
                      )
                    }
                  >
                    <i className='fa fa-instagram fa-lg'></i>
                  </span>
                  <span
                    onClick={() =>
                      window.open(
                        'https://web.facebook.com/iNf4mation/?_rdc=1&_rdr',
                        '_blank'
                      )
                    }
                  >
                    <i className='fa fa-facebook fa-lg'></i>
                  </span>
                  <span
                    onClick={() =>
                      window.open(
                        'https://www.linkedin.com/company/iNf4mation',
                        '_blank'
                      )
                    }
                  >
                    <i className='fa fa-linkedin fa-lg'></i>
                  </span>

                  <span
                    onClick={() =>
                      window.open(
                        'https://bitcointalk.org/index.php?topic=5379090.0',
                        '_blank'
                      )
                    }
                  >
                    <i className='fa fa-bitcoin fa-lg'></i>
                  </span>
                  <span
                    onClick={() =>
                      window.open(
                        'https://discord.com/invite/C7sGTaux',
                        '_blank'
                      )
                    }
                  >
                    <i className='fab fa-discord fa-lg   '></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
)
export default footer
