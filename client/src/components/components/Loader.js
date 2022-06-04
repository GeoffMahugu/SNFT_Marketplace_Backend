import React from 'react'
import { Oval } from 'react-loader-spinner'

export default function Loader({ width, height, ariaLabel, color }) {
  return (
    <Oval
      height={width ? width : '100'}
      width={height ? height : '100'}
      color={color ? color : 'yellow'}
      ariaLabel={ariaLabel}
    />
  )
}
