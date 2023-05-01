import React, { useCallback } from 'react'
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
      if (highlighted) {
        onClick(id)
      }
    },
    [id, onClick, highlighted]
  )

  const onPieceClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled) {
        onClick(id, true)
        event.stopPropagation()
      }
    },
    [id, onClick, disabled]
  )

  return isEmpty ? (
    <div className="cell cell--empty" />
  ) : (
    <div
      className={composeCls(['cell'], {
        'cell--highlighted': highlighted,
      })}
      data-id={id}
      onClick={onCellClick}
    >
      {occupied && (
        <Piece
          onClick={onPieceClick}
          isWhite={occupied === 'player1'}
          isActive={isActive}
          disabled={disabled}
        />
      )}
      {/* for debugging purposes */}
      {/* <sub
        style={{
          position: 'absolute',
          color: 'green',
          pointerEvents: 'none',
        }}
      >
        {id}
      </sub> */}
    </div>
  )
}

export default React.memo(Cell)
