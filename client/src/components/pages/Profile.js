import React, { useState, useEffect, useRef } from 'react'
import Clock from '../components/Clock'
import Footer from '../components/footer'
import { createGlobalStyle } from 'styled-components'
import { Formik } from 'formik'
import * as yup from 'yup'

import { create as ipfsHttpClient } from 'ipfs-http-client'
import { updateUserProfile } from '../../services/Services'
import { errorToaster, successToaster, warnToaster } from '../components/Toasts'
import Loader from '../components/Loader'
import { useFetchSigner, useFetchUser } from '../hooks/users'
import { useQueryClient } from 'react-query'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

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
const profileSchema = yup.object({
  userName: yup.string().required('User name is required'),
  Bio: yup.string(),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter email format'),

  websiteUrl: yup.string().url('Please Enter URL Format'),
  twitterName: yup.string(),
  instagramName: yup.string()
})

export default function Profile() {
  const profileUploadRef = useRef(null)
  const bannerUploadRef = useRef(null)

  const queryClient = useQueryClient()
  const { data: signerAddress } = useFetchSigner()

  const [bannerImage, setBannerImage] = useState(null)
  const [profileImage, setProfileImage] = useState(null)
  const [profileInfo, setProfileInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bannerImageLoading, setBannerImageLoading] = useState(false)
  const [profileImageLoader, setProfileImageLoader] = useState(false)
  const { data: user, status } = useFetchUser(signerAddress)
  console.log(user, status)

  const getUser = async () => {
    if (user) {
      setBannerImage(user?.user?.profileBanner)
      setProfileImage(user?.user?.profileImage)
      setProfileInfo(user?.user)
    }
  }
  useEffect(() => {
    console.log(signerAddress)
    getUser()
  }, [signerAddress, user])
  useEffect(() => {
    console.log(profileInfo)
  }, [profileInfo])

  const onBannerImageChange = async (e) => {
    setBannerImageLoading(true)
    var file = e.target.files[0]

    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`)
      })
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setBannerImageLoading(false)
      setBannerImage(url)
    } catch (error) {
      setBannerImageLoading(false)
      console.log('Error uploading file: ', error)
    }
  }
  const onProfileImageChange = async (e) => {
    var file = e.target.files[0]
    setProfileImageLoader(true)
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`)
      })
      setProfileImageLoader(false)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setProfileImage(url)
    } catch (error) {
      setProfileImageLoader(false)
      console.log('Error uploading file: ', error)
    }
  }

  const updateUser = async (values) => {
    setLoading(true)
    const body = {
      profileBanner: bannerImage,
      twitterUsername: values.twitterName,
      instagramUsername: values.instagramName,
      websiteUrl: values.websiteUrl,
      bio: values.Bio,
      walletAddress: signerAddress,
      userName: values.userName,
      email: values.email,
      profileImage: profileImage
    }

    const res = await updateUserProfile(body)
    if (res.status === 200) {
      setLoading(false)
      const data = await res.json()
      console.log(data)
      successToaster(data.message)
      setProfileInfo(data.user)
      queryClient.invalidateQueries('user')
    } else if (res.status === 400) {
      setLoading(false)
      const data = await res.json()
      console.log(data)
      warnToaster(data.message)
    } else {
      setLoading(false)
      errorToaster('Fail To Update Profile Try Again')
    }
  }

  return (
    <div>
      <Formik
        initialValues={{
          userName: profileInfo?.userName || '',
          Bio: profileInfo?.bio || '',
          email: profileInfo?.email || '',
          websiteUrl: profileInfo?.websiteUrl || '',
          twitterName: profileInfo?.twitterUsername || '',
          instagramName: profileInfo?.instagramUsername || ''
        }}
        onSubmit={(values, actions) => {
          updateUser(values)
          console.log('values', values)
        }}
        validationSchema={profileSchema}
        enableReinitialize={true}
        re
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
                      <h1 className='text-center'>Profile</h1>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className='container'>
              <div className='row'>
                <div className='col-lg-7 offset-lg-1 mb-5'>
                  <form
                    id='form-create-item'
                    className='form-border'
                    action='#'
                  >
                    <div className='field-set'>
                      <div className='spacer-single'></div>

                      <h5>Username</h5>
                      <input
                        type='text'
                        name='userName'
                        id='item_title'
                        className='form-control'
                        placeholder='Enter username'
                        value={values.userName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <p className='error-text'>
                        {touched.userName && errors.userName}
                      </p>

                      <div className='spacer-10'></div>
                      <h5>Bio</h5>
                      <textarea
                        rows={1}
                        type='text'
                        name='Bio'
                        id='item_title'
                        className='form-control'
                        placeholder='Tell the world who you are'
                        value={values.Bio}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      ></textarea>
                      <p className='error-text'>{touched.Bio && errors.Bio}</p>

                      <div className='spacer-10'></div>
                      <h5>Email Address *</h5>
                      <input
                        type='text'
                        name='email'
                        id='item_title'
                        className='form-control'
                        placeholder='Enter email'
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <p className='error-text'>
                        {touched.email && errors.email}
                      </p>

                      <div className='spacer-10'></div>
                      <h5>
                        <i className='fa fa-link'></i>
                        Your Site
                      </h5>
                      <input
                        type='text'
                        name='websiteUrl'
                        id='item_title'
                        className='form-control'
                        placeholder='Enter Website URL'
                        value={values.websiteUrl}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <p className='error-text'>
                        {touched.websiteUrl && errors.websiteUrl}
                      </p>

                      <div className='spacer-10'></div>
                      <h5>
                        <i className='fa fa-twitter'></i> Twitter username
                      </h5>
                      <input
                        type='text'
                        name='twitterName'
                        id='item_title'
                        className='form-control'
                        placeholder='Enter Twitter username'
                        value={values.twitterName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <p className='error-text'>
                        {touched.twitterName && errors.twitterName}
                      </p>

                      <div className='spacer-10'></div>
                      <h5>
                        <i className='fa fa-instagram'></i> Instagram username
                      </h5>
                      <input
                        type='text'
                        name='instagramName'
                        id='item_title'
                        className='form-control'
                        placeholder='Enter Instagram username'
                        value={values.instagramName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <p className='error-text'>
                        {touched.instagramName && errors.instagramName}
                      </p>

                      <div className='spacer-10'></div>

                      {loading ? (
                        <Loader width={40} height={40} />
                      ) : (
                        <input
                          type='button'
                          id='submit'
                          disabled={loading}
                          className='btn-main'
                          value={'Update Profie'}
                          onClick={handleSubmit}
                        />
                      )}
                    </div>
                  </form>
                </div>

                <div className='col-lg-3 col-sm-6 col-xs-12'>
                  <h5>Profile Image</h5>

                  <div
                    style={{
                      width: 220,
                      height: 220,
                      border: '1px solid #d3d3d3',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      borderRadius: '50%',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      className='edit__profile'
                      onClick={() => profileUploadRef.current.click()}
                    >
                      <i className='fa fa-pencil '></i>
                    </div>
                    {profileImageLoader ? (
                      <Loader width={50} height={50} />
                    ) : (
                      <label style={{ width: '100%', height: '100%' }}>
                        <img
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '50%'
                          }}
                          src={
                            profileImage
                              ? profileImage
                              : './img/author/author-1.jpg'
                          }
                          alt='profile '
                        />

                        <input
                          type='file'
                          ref={profileUploadRef}
                          hidden
                          onChange={onProfileImageChange}
                          accept='image/*'
                        />
                      </label>
                    )}
                  </div>
                  <h5 className=' mt-5'>Profile Banner</h5>

                  <div
                    style={{
                      width: 200,
                      height: 110,
                      borderRadius: 10,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: '1px solid #d3d3d3',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      className='edit__profile'
                      onClick={() => bannerUploadRef.current.click()}
                    >
                      <i className='fa fa-pencil '></i>
                    </div>
                    {bannerImageLoading ? (
                      <Loader width='50' height='50' />
                    ) : (
                      <label style={{ width: '100%', height: '100%' }}>
                        <img
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 10
                          }}
                          src={
                            bannerImage
                              ? bannerImage
                              : './img/collections/coll-item-3.jpg'
                          }
                          alt='banner '
                        />

                        <input
                          type='file'
                          ref={bannerUploadRef}
                          hidden
                          onChange={onBannerImageChange}
                        />
                      </label>
                    )}
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
