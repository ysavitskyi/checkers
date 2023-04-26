import { useState, useCallback } from 'react'
import './app.css'

const GRID_SIZE = 8

const composeCls = (
  cls: string[],
  clsComputable: Record<string, boolean | undefined>
) => {
  return Object.entries(clsComputable)
    .reduce((acc, [key, value]) => {
      if (value) {
        acc.push(key)
      }

      return acc
    }, cls)
    .join(' ')
}

const Piece: React.FC<{
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void
  isWhite?: boolean
}> = ({ onClick, isWhite }) => {
  return (
    <div
      className={composeCls(['piece'], { 'piece--white': isWhite })}
      onClick={onClick}
    />
  )
}

const Cell: React.FC<{
  id: string
  isEmpty: boolean
  player1: boolean
  player2: boolean
  isActive: boolean
  onClick: (id: string, isPieceTarget?: boolean) => void
}> = ({ id, isEmpty, player1, player2, isActive, onClick }) => {
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
      className={composeCls(['cell'], { 'cell--active': isActive })}
      onClick={onCellClick}
    >
      {player1 && <Piece onClick={onPieceClick} isWhite />}
      {player2 && <Piece onClick={onPieceClick} />}
    </div>
  )
}

const grid = [...Array(GRID_SIZE ** 2)].map((_, i) => {
  const isEmpty = (((i / GRID_SIZE) ^ 0) + i + 1) % 2 > 0
  const player1 = i < GRID_SIZE * (GRID_SIZE / 2 - 1)
  const player2 = i > GRID_SIZE * (GRID_SIZE / 2 + 1) - 1

  return {
    id: String(i),
    player1,
    player2,
    isEmpty,
  }
})

interface ICellState {
  id: string
  player1: boolean
  player2: boolean
}
const Grid: React.FC = () => {
  const [state, setState] = useState<{
    cellsById: Record<string, ICellState>
    activePieceId: string | null
  }>({
    cellsById: grid.reduce(
      (acc, { id, isEmpty, player1, player2 }) => ({
        ...acc,
        ...(!isEmpty && {
          [id]: {
            id,
            player1,
            player2,
          },
        }),
      }),
      {}
    ),
    activePieceId: null,
  })

  const onCellClick = useCallback((id: string, isPieceTarget?: boolean) => {
    setState((state) => {
      if (isPieceTarget) {
        return { ...state, activePieceId: id }
      }

      if (!state.activePieceId) {
        return state
      }

      if (state.activePieceId === id) {
        return { ...state, activePieceId: null }
      }

      const activeCell = state.cellsById[state.activePieceId]

      return {
        ...state,
        cellsById: {
          ...state.cellsById,
          [id]: { ...activeCell, id }, // put our active piece to the new cell
          [activeCell.id]: { ...activeCell, player1: false, player2: false }, // clear the previous cell
        },
        activePieceId: id,
      }
    })
  }, [])

  return (
    <div className="grid-wrapper">
      <div className="grid-wrapper-in">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        >
          {grid.map(({ id, isEmpty }) => (
            <Cell
              key={id}
              onClick={onCellClick}
              isEmpty={isEmpty}
              isActive={id === state.activePieceId}
              {...state.cellsById[id]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const App: React.FC = () => {
  return <Grid />
}

export default App
