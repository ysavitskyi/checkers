import { useState, useCallback } from 'react'
import Cell from 'components/Cell'
import './index.css'

const GRID_SIZE = 8

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

  const onGridClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    console.log(event.target)
  }, [])

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

export default Grid
