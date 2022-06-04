import React, { useState } from 'react'

import { create as ipfsHttpClient } from 'ipfs-http-client'
import UserPlaceholder from '../../assets/User-Placeholder.jpeg'
import {useCreateCollection} from '../hooks/collections'
import Loader from '../components/Loader'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

export default function CreateCollectionModal({ displayModal }) {
  const [collectionImage, setCollectionImage] = useState(null)
  const [collectionName, setCollectionName] = useState(null)
  const [collectionImageUrl, setCollectionImageUrl] = useState(null)
  const [collectionCoverImage, setCollectionCoverImage] = useState(null)
  const [collectionCoverImageUrl, setCollectionCoverImageUrl] = useState(null)
  const [error, setError] = useState(false)
  const {mutate: createCollection, status: addColStatus} = useCreateCollection()

  const handleSubmit = () => {
    if (
      !collectionName ||
      !collectionCoverImage ||
      !collectionImage ||
      !collectionCoverImageUrl ||
      !collectionImageUrl
    ) {
      setError(true)
      return
    }
    createCollection({name: collectionName, imageUrl: collectionImageUrl, coverUrl: collectionCoverImageUrl})
  }
  const onImageSelected = async (e) => {
    var file = e.target.files[0]

    setCollectionImage(file)
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`)
      })
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      console.log('objectUrl', url)
      setCollectionImageUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }
  const onCoverImageSelected = async (e) => {
    var file = e.target.files[0]

    setCollectionCoverImage(file)
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`)
      })
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      console.log('objectUrl', url)
      setCollectionCoverImageUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }
  return (
    <div className='checkout'>
      <div
        className='maincheckout'
        style={{ height: '90%', overflow: 'scroll' }}
      >
        <button className='btn-close' onClick={() => displayModal(false)}>
          x
        </button>
        <div className='heading'>
          <h3>Add Collection</h3>
        </div>

        <div className='itm d-flex' style={{ justifyContent: 'center' }}>
          <div className='nft_coll' style={{ width: 200, height: 240 }}>
            <div className='nft_wrap' style={{ height: 'inherit' }}>
              <img
                style={{
                  height: 170,
                  width: '100%',
                  objectFit: 'cover',
                }}
                src={
                  collectionCoverImageUrl
                    ? collectionCoverImageUrl
                    : UserPlaceholder
                }
                className='lazy img-fluid'
                alt=''
              />

              <div
                className='nft_coll_pp'
                style={{ position: 'absolute', left: '35%' }}
              >
                <img
                  className='lazy'
                  style={{ height: '60px' }}
                  alt=''
                  src={
                    collectionImageUrl ? collectionImageUrl : UserPlaceholder
                  }
                />

                <i className='fa fa-check'></i>
              </div>
              <div className='nft_coll_info' style={{ marginTop: 40 }}>
                <span onClick={() => {}}>
                  <h4>
                    {collectionName ? collectionName : 'Your Collection Name'}
                  </h4>
                </span>
                {/* <span>{uniqueId}</span> */}
              </div>
            </div>
          </div>
        </div>

        <div className='detailcheckout mt-4'>
          <input
            type='text'
            name='buy_now_qty'
            id='buy_now_qty'
            className='form-control'
            placeholder='Enter Collection Name'
            onChange={(e) => setCollectionName(e.target.value)}
          />
        </div>
        {error && !collectionName && (
          <p className='error-text'>Collection name is required</p>
        )}
        <div className='d-flex justify-content-between'>
          <div style={{ width: '48%' }}>
            <h5>Image</h5>
            <div className='d-create-file' style={{ padding: 10 }}>
              <p id='file_name'>PNG, JPG, GIF, WEBP Max 20mb.</p>

              {collectionImage && <p>{collectionImage.name}</p>}

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
                  accept='image/*'
                  multiple
                  onChange={onImageSelected}
                />
              </div>
            </div>
            {error && (!collectionImage || !collectionImageUrl) && (
              <p className='error-text'>Collection image is required</p>
            )}
          </div>
          <div style={{ width: '48%' }}>
            <h5>Cover Image</h5>
            <div className='d-create-file' style={{ padding: 10 }}>
              <p id='file_name'>PNG, JPG, GIF, WEBP Max 20mb.</p>

              {collectionCoverImage && <p>{collectionCoverImage.name}</p>}

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
                  accept='image/*'
                  multiple
                  onChange={onCoverImageSelected}
                />
              </div>
            </div>
            {error && (!collectionCoverImage || !collectionCoverImageUrl) && (
              <p className='error-text'>Collection image is required</p>
            )}
          </div>
        </div>
        {addColStatus === 'loading' && (
          <Loader width={40} height={40}/>
        )}
        <input
          value={'Add Collection'}
          type='button'
          className='btn-main lead mb-5'
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
}
