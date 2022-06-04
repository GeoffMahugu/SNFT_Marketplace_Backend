import React from 'react'
import { Link } from '@reach/router'
import {categories} from '../../utils'



const getCategoryLogo = (cat) => {
  switch (cat) {
    case 'All':
      return 'fa fa-image';
    case 'Featured':
      return 'fa fa-search';
    case 'Art':
      return 'fa fa-globe';
    case 'Sport':
      return 'fa fa-vcard';
    case 'Exclusive':
      return 'fa fa-th';
    case 'Music':
      return 'fa fa-music';
    default:
      return 'fa fa-image';
  }
}

const catgor = () => (
  <div className='row'>
    {categories.map((cat, i) => <div key={i} className='col-md-2 col-sm-4 col-6 mb-3'>
      <Link className='icon-box style-2 rounded' to='/explore'>
        <i className={getCategoryLogo(cat)}></i>
        <span>{cat}</span>
      </Link>
    </div>)}
    {/* <div className='col-md-2 col-sm-4 col-6 mb-3'>
      <Link className='icon-box style-2 rounded' to='/explore'>
        <i className='fa fa-music'></i>
        <span>Music</span>
      </Link>
    </div>
    <div className='col-md-2 col-sm-4 col-6 mb-3'>
      <Link className='icon-box style-2 rounded' to='/explore'>
        <i className='fa fa-search'></i>
        <span>Domain Names</span>
      </Link>
    </div>
    <div className='col-md-2 col-sm-4 col-6 mb-3'>
      <Link className='icon-box style-2 rounded' to='/explore'>
        <i className='fa fa-globe'></i>
        <span>Virtual Worlds</span>
      </Link>
    </div>
    <div className='col-md-2 col-sm-4 col-6 mb-3'>
      <Link className='icon-box style-2 rounded' to='/explore'>
        <i className='fa fa-vcard'></i>
        <span>Trading Cards</span>
      </Link>
    </div>
    <div className='col-md-2 col-sm-4 col-6 mb-3'>
      <Link className='icon-box style-2 rounded' to=''>
        <i className='fa fa-th'></i>
        <span>Collectibles</span>
      </Link>
    </div> */}
  </div>
)
export default catgor
