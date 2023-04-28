import { useState, useCallback } from 'react'
import Cell from 'components/Cell'
import { calcNextPositions } from './utils'
import './index.css'

export const GRID_SIZE = 8

export interface ICellState {
  id: string
  occupied: (typeof grid)[number]['occupied']
}
interface IPositionState {
  id: string
  capturedId?: string | undefined
}

const grid = [...Array(GRID_SIZE ** 2)].map((_, i) => {
  const isEmpty = (((i / GRID_SIZE) ^ 0) + i + 1) % 2 > 0
  const player1 = i < GRID_SIZE * (GRID_SIZE / 2 - 1)
  const player2 = i > GRID_SIZE * (GRID_SIZE / 2 + 1) - 1
  const occupied =
    (player1 && ('player1' as const)) ||
    (player2 && ('player2' as const)) ||
    null

  return {
    id: String(i),
    occupied,
    isEmpty,
  }
})

const Grid: React.FC = () => {
  const [state, setState] = useState<{
    cellsById: Record<string, ICellState>
    activePieceId: string | null
    nextPositionsById: Record<string, IPositionState> | null
    player1Turn: boolean
  }>({
    cellsById: grid.reduce(
      (acc, { id, isEmpty, occupied }) => ({
        ...acc,
        ...(!isEmpty && {
          // sanitize empty cells
          [id]: {
            id,
            occupied,
          },
        }),
      }),
      {}
    ),
    activePieceId: null,
    nextPositionsById: null,
    player1Turn: true,
  })

  const onCellClick = useCallback((id: string, isPieceTarget?: boolean) => {
    setState((state) => {
      // set active piece
      if (isPieceTarget) {
        const nextPositionsById = calcNextPositions(state.cellsById, id)

        return { ...state, activePieceId: id, nextPositionsById }
      }

      // do nothing if there is no an active piece
      if (!state.activePieceId) {
        return state
      }

      const activeCell = state.cellsById[state.activePieceId]
      const capturedPieceId = state.nextPositionsById?.[id].capturedId
      const nextPositionsById =
        (capturedPieceId && calcNextPositions(state.cellsById, id, true)) || {}
      const changeTurn = Object.keys(nextPositionsById).length === 0

      // change the active piece position
      // calc the next positons, and if there no ones - change the player turn
      return {
        ...state,
        cellsById: {
          ...state.cellsById,
          [id]: { ...activeCell, id }, // put our active piece to the new cell
          [activeCell.id]: { ...activeCell, occupied: null }, // clear the previous cell
          ...(capturedPieceId && {
            [capturedPieceId]: { id: capturedPieceId, occupied: null },
          }),
        },
        activePieceId: changeTurn ? null : id,
        player1Turn: changeTurn ? !state.player1Turn : state.player1Turn,
        nextPositionsById,
      }
    })
  }, [])

  const onGridClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement

    // reset an activity if we click on non-highlighted cell
    if (!target.className.includes('cell--highlighted')) {
      setState((state) => ({
        ...state,
        activePieceId: null,
        nextPositionsById: null,
      }))
    }
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
                highlighted={!!state.nextPositionsById?.[id]}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Grid
