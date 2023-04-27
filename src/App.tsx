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

const grid = [...Array(GRID_SIZE ** 2)].map((_, i) => {
  const isEmpty = (((i / GRID_SIZE) ^ 0) + i + 1) % 2 > 0
  const player1 = i < GRID_SIZE * (GRID_SIZE / 2 - 1)
  const player2 = i > GRID_SIZE * (GRID_SIZE / 2 + 1) - 1
  const occupied: TCellOccupied =
    (player1 && 'player1') || (player2 && 'player2') || null

  return {
    id: String(i),
    occupied,
    isEmpty,
  }
})

const calcAvailableCells = (
  cellsById: Record<string, ICellState>,
  id: string
) => {
  const currentCell = cellsById[id]
  const availableCells: string[] = []

  const { oppositePlayer, incPos1, incPos2 } = (() => {
    if (currentCell.occupied === 'player1') {
      return {
        oppositePlayer: 'player2',
        incPos1: GRID_SIZE - 1,
        incPos2: GRID_SIZE + 1,
      }
    } else {
      return {
        oppositePlayer: 'player1',
        incPos1: -(GRID_SIZE - 1),
        incPos2: -(GRID_SIZE + 1),
      }
    }
  })()

  const checkNextPos = (
    currentCell: ICellState,
    increment: number,
    iteration = 0
  ) => {
    const nextPos = +currentCell.id + increment

    if (!cellsById[nextPos]) return

    if (cellsById[nextPos].occupied === null) {
      availableCells.push(`${nextPos}`)
    } else if (cellsById[nextPos].occupied === oppositePlayer) {
      checkNextPos(cellsById[nextPos], increment, iteration++)
    }
  }

  checkNextPos(currentCell, incPos1)
  checkNextPos(currentCell, incPos2)

  return availableCells
}

type TCellOccupied = 'player1' | 'player2' | null
interface ICellState {
  id: string
  occupied: TCellOccupied
}
const Grid: React.FC = () => {
  const [state, setState] = useState<{
    cellsById: Record<string, ICellState>
    activePieceId: string | null
    availableCells: string[]
    player1Turn: boolean
  }>({
    cellsById: grid.reduce(
      (acc, { id, isEmpty, occupied }) => ({
        ...acc,
        ...(!isEmpty && {
          [id]: {
            id,
            occupied,
          },
        }),
      }),
      {}
    ),

    activePieceId: null,
    availableCells: [],
    player1Turn: true,
  })

  const onCellClick = useCallback((id: string, isPieceTarget?: boolean) => {
    setState((state) => {
      if (isPieceTarget) {
        const availableCells = calcAvailableCells(state.cellsById, id)

        return { ...state, activePieceId: id, availableCells }
      }

      if (!state.activePieceId) {
        return state
      }

      if (state.activePieceId === id) {
        return { ...state, activePieceId: null, availableCells: [] }
      }

      const activeCell = state.cellsById[state.activePieceId]

      return {
        ...state,
        cellsById: {
          ...state.cellsById,
          [id]: { ...activeCell, id }, // put our active piece to the new cell
          [activeCell.id]: { ...activeCell, occupied: null }, // clear the previous cell
        },
        activePieceId: id,
      }
    })
  }, [])

  const onGridClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {},
    []
  )

  return (
    <div className="grid-wrapper">
      <div className="grid-wrapper-in">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
          onClick={onGridClick}
        >
          {grid.map(({ id, isEmpty }) => {
            const occupied = state.cellsById[id]?.occupied || null
            const disabled = state.player1Turn
              ? occupied !== 'player1'
              : occupied !== 'player2'

            return (
              <Cell
                key={id}
                id={id}
                onClick={onCellClick}
                isEmpty={isEmpty}
                isActive={id === state.activePieceId}
                occupied={occupied}
                disabled={disabled}
                highlighted={state.availableCells.includes(id)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

const App: React.FC = () => {
  return <Grid />
}

export default App
