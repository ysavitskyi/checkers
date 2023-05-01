import React, { useState, useCallback, useEffect } from 'react'
import Cell from 'components/Cell'
import { calcNextPositions } from './utils'
import './index.css'

export const BOARD_SIZE = 8

export interface ICellState {
  id: string
  occupied: (typeof board)[number]['occupied']
}
export interface IPositionState {
  id: string
  capturedId?: string | undefined
}

const board = [...Array(BOARD_SIZE ** 2)].map((_, i) => {
  const isEmpty = (((i / BOARD_SIZE) ^ 0) + i + 1) % 2 > 0
  const player1 = i < BOARD_SIZE * (BOARD_SIZE / 2 - 1)
  const player2 = i > BOARD_SIZE * (BOARD_SIZE / 2 + 1) - 1
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

interface IBoardProps {
  addHistoryItem: (state: IBoardState) => void
  historyItem?: IBoardState
}
interface IBoardState {
  cellsById: Record<string, ICellState>
  activePieceId: string | null
  nextPositionsById: Record<string, IPositionState> | null
  step: number
  historic: boolean
}
const Board: React.FC<IBoardProps> = ({ historyItem, addHistoryItem }) => {
  const [state, setState] = useState<IBoardState>({
    cellsById: board.reduce(
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
    step: 0,
    historic: false,
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
      const nextState = {
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
        step: changeTurn ? state.step + 1 : state.step,
        historic: false,
        nextPositionsById,
      }

      // addHistoryItem(nextState)

      return nextState
    })
  }, [])

  const onBoardClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    // const target = event.target as HTMLElement
    const targetId = (event.target as HTMLElement).dataset.id

    // deactivate a piece if we click on non-highlighted cell
    // in case if there are no mandatory captures
    // TODO: need to consider the case with mandatory capturing
    setState((state) => {
      if (!targetId || !state.nextPositionsById?.[targetId]) {
        return { ...state, activePieceId: null, nextPositionsById: null }
      }

      return state
    })
  }, [])

  // update history in accordance to the state change
  useEffect(() => {
    console.log('current state: ', state)
    if (!state.historic) {
      addHistoryItem(state)
    }
  }, [addHistoryItem, state])

  // update state in accordance to the historic point
  useEffect(() => {
    if (historyItem) {
      setState({ ...historyItem, historic: true })
    }
  }, [historyItem])

  return (
    <div className="board-wrapper">
      <div
        className="board"
        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
        onClick={onBoardClick}
      >
        {board.map(({ id, isEmpty }) => {
          const occupied = state.cellsById[id]?.occupied || null
          const disabled =
            state.step % 2 // player1 turn
              ? occupied !== 'player2'
              : occupied !== 'player1'

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
  )
}

export default React.memo(Board)
