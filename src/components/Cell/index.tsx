import { useCallback } from 'react'
import { composeCls } from 'utils'
import Piece from 'components/Piece'
import './index.css'

const Cell: React.FC<{
  id: string
  isEmpty: boolean
  occupied: 'player1' | 'player2' | null
  disabled: boolean
  isActive: boolean
  highlighted: boolean
  onClick: (id: string, isPieceTarget?: boolean) => void
}> = ({ id, isEmpty, occupied, isActive, disabled, highlighted, onClick }) => {
  const onCellClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onClick(id)
    },
    [id, onClick]
  )

  const onPieceClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onClick(id, true)
      event.stopPropagation()
    },
    [id, onClick]
  )

  return isEmpty ? (
    <div className="cell cell--empty" />
  ) : (
    <div
      className={composeCls(['cell'], {
        'cell--active': isActive,
        'cell--disabled': disabled,
        'cell--highlighted': highlighted,
      })}
      onClick={onCellClick}
    >
      {occupied && (
        <Piece onClick={onPieceClick} isWhite={occupied === 'player1'} />
      )}
    </div>
  )
}

export default Cell
