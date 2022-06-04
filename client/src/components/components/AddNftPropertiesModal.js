import React, { useState, useEffect } from 'react'

export default function AddNftsPropertiesModal({
  displayModal,
  setNftProperties,
  nftProperties
}) {
  const [error, setError] = useState(false)
  const [properties, setProperties] = useState([{ type: '', name: '' }])
  const handleChangePropertyType = (value, index) => {
    let currentProperties = [...properties]
    currentProperties[index].type = value
    setProperties(currentProperties)
  }
  const handleChangePropertyName = (value, index) => {
    let currentProperties = [...properties]
    currentProperties[index].name = value
    setProperties(currentProperties)
  }
  const handleAddProperty = () => {
    let currentProperties = [...properties]
    currentProperties.push({ type: '', name: '' })
    setProperties(currentProperties)
  }
  const handleRemoveProperty = (index) => {
    let currentProperties = [...properties]
    currentProperties = currentProperties.filter((_, i) => i !== index)

    setProperties(currentProperties)
  }

  const handleSaveClick = () => {
    let valid = true
    properties.forEach((property) => {
      if (property.name === '' || property.type === '') {
        setError(true)
        valid = false
      }
    })

    if (valid) {
      setNftProperties(properties)
      displayModal(false)
    }
  }
  useEffect(() => {
    if (nftProperties?.length > 0) {
      setProperties(nftProperties)
    }
  }, [])
  return (
    <div className='checkout'>
      <div className='maincheckout'>
        <button className='btn-close' onClick={() => displayModal(false)}>
          x
        </button>
        <div className='heading'>
          <h3>Add Properties</h3>
        </div>
        <div
          className='detailcheckout '
          style={{ justifyContent: 'space-around' }}
        >
          <h6>Type</h6>
          <h6>Name</h6>
        </div>
        <div style={{ maxHeight: 300, overflow: 'scroll' }}>
          {properties?.map((property, i) => (
            <div className='detailcheckout mt-2' key={i}>
              <span
                className='form-control'
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  width: 70,

                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                onClick={() => handleRemoveProperty(i)}
              >
                x
              </span>

              <input
                type='text'
                name='buy_now_qty'
                id='buy_now_qty'
                style={{
                  borderLeft: 0,
                  borderRadius: 0,
                  marginRight: 10
                }}
                onChange={(e) => {
                  handleChangePropertyType(e.target.value, i)
                }}
                value={property.type}
                className='form-control'
                placeholder='Enter Type '
              />

              <input
                style={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0
                }}
                type='text'
                name='buy_now_qty'
                id='buy_now_qty'
                className='form-control'
                placeholder='Enter Name'
                value={property.name}
                onChange={(e) => {
                  handleChangePropertyName(e.target.value, i)
                }}
              />
            </div>
          ))}
        </div>
        <span className='add_more_btn' onClick={handleAddProperty}>
          Add More +
        </span>

        {error && (
          <p className='text-danger'>
            Please Fill All Properties Fields or Remove Empty Property
          </p>
        )}

        <input
          onClick={() => handleSaveClick()}
          value={'Save'}
          type='button'
          style={{ width: 100 }}
          className='btn-main lead mb-5'
        />
      </div>
    </div>
  )
}
