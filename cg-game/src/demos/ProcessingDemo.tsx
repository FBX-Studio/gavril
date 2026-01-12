import { useState } from 'react'
import { Card } from '../components/Card'
import { ConvolutionDemo } from './ConvolutionDemo'
import { Transform2DDemo } from './Transform2DDemo'

type Tab = 'filters' | 'transforms'

export function ProcessingDemo() {
  const [tab, setTab] = useState<Tab>('filters')

  const TabButton = ({ id, label }: { id: Tab; label: string }) => (
    <button
      className={[
        'rounded-xl px-3 py-2 text-xs font-semibold transition',
        tab === id ? 'bg-white/15 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10',
      ].join(' ')}
      onClick={() => setTab(id)}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm font-semibold text-white">Практика: обработка изображений и 2D-матрицы</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <TabButton id="filters" label="Фильтры (свёртка)" />
          <TabButton id="transforms" label="2D-преобразования" />
        </div>
      </Card>

      {tab === 'filters' ? <ConvolutionDemo /> : <Transform2DDemo />}
    </div>
  )
}
