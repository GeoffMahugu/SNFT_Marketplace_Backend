import React from 'react'

export default function AddNftsExtraListItem({
  heading,
  headingIconName,
  subHeading,
  onAddPress
}) {
  return (
    <div className='add_nft_extras'>
      <div>
        <div className='d-flex align-items-center'>
          <i className={`${headingIconName} text-dark`}> </i>
          <h5>{heading}</h5>
        </div>
        <p>{subHeading}</p>
      </div>
      <span onClick={onAddPress}>
        <i className='fa fa-plus fa-lg '></i>
      </span>
    </div>
  )
}
