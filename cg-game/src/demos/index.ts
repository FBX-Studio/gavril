import { RasterVectorDemo } from './RasterVectorDemo'
import { ColorModelsDemo } from './ColorModelsDemo'
import { BresenhamDemo } from './BresenhamDemo'
import { ClippingDemo } from './ClippingDemo'
import { StegoLsbDemo } from './StegoLsbDemo'
import { ProcessingDemo } from './ProcessingDemo'

import React from 'react'

export function Demo({ demoId }: { demoId: string }) {
  switch (demoId) {
    case 'raster-vector':
      return React.createElement(RasterVectorDemo)
    case 'color-models':
      return React.createElement(ColorModelsDemo)
    case 'bresenham':
      return React.createElement(BresenhamDemo)
    case 'clipping':
      return React.createElement(ClippingDemo)
    case 'stego-lsb':
      return React.createElement(StegoLsbDemo)
    case 'processing':
      return React.createElement(ProcessingDemo)
    default:
      return null
  }
}
