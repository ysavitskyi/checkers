import React, { useState, useCallback, useEffect } from 'react'
import Cell from 'components/Cell'
import { Dictionary } from 'utils'
import {
  BOARD_SIZE,
  getRegularSteps,
  getMandatorySteps,
  getAllMandatorySteps,
  getPlayerByStep,
  getOppositePlayer,
} from './utils'
import './index.css'

export interface ICellState {
  id: string
  occupied: (typeof board)[number]['occupied']
}
export interface ICellStateOccupied extends ICellState {
  occupied: Exclude<ICellState['occupied'], null>
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
interface IBoardState {
  cellsById: Dictionary<ICellState>
  activePieceId: string | null
  step: number
  /** shortcut for the next mandatory positions */
  nmp: Dictionary<{ id: string; capturedId: string }[]>
  /** shortcut for the next regular positions */
  nrp: string[]
  historic: boolean
}
const Board: React.FC<{
  addHistoryItem: (state: IBoardState) => void
  historyItem?: IBoardState
}> = ({ historyItem, addHistoryItem }) => {
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
    step: 0,

    nmp: {},
    nrp: [],

    historic: false,
  })

  const playerTurn = getPlayerByStep(state.step)
  const mandatoryPieces = Object.keys(state.nmp)

  const onCellClick = useCallback((id: string, isPieceTarget?: boolean) => {
    if (isPieceTarget) {
      setState((state) => {
        // check if there are mandatory steps
        if (state.nmp[id]?.length) {
          return {
            ...state,
            activePieceId: id,
            nrp: state.nmp[id].map(({ id }) => id),
          }
        }

        return {
          ...state,
          activePieceId: id,
          nrp: getRegularSteps(
            state.cellsById,
            state.cellsById[id] as ICellStateOccupied
          ),
        }
      })
    } else {
      // this stage will happen when we click on a highlighted cell
      setState((state) => {
        // do nothing if there is no an active piece
        if (!state.activePieceId) {
          alert(
            'Please, pick up an appropriate piece to perform such an action!'
          )
          return state
        }

        const activeCell = state.cellsById[state.activePieceId]
        const capturedPieceId = state.nmp[state.activePieceId]?.find(
          ({ id: targedId }) => targedId === id
        )?.capturedId
        const cellsById = {
          ...state.cellsById,
          // put an active piece to a new cell
          [id]: { ...activeCell, id },
          // remove an active piece from a previous cell
          [activeCell.id]: { ...activeCell, occupied: null },
          // remove a captured piece if it is
          ...(capturedPieceId && {
            [capturedPieceId]: { id: capturedPieceId, occupied: null },
          }),
        }
        const targetCell = cellsById[id] as ICellStateOccupied

        // build a new state for a finished turn
        const newState: typeof state = {
          ...state,
          cellsById,
          activePieceId: null,
          step: state.step + 1,
          historic: false,
          nmp: {},
          nrp: [],
        }

        if (capturedPieceId) {
          // calc the mandatory steps for the current active piece
          const nmp = getMandatorySteps(cellsById, targetCell)

          if (nmp.length !== 0) {
            newState.activePieceId = id
            // prevent finish current turn
            newState.step = state.step
            // prevent history record
            newState.historic = true
            newState.nmp = { [id]: nmp }
            newState.nrp = nmp.map(({ id }) => id)

            return newState
          }
        }
        // calc the mandatory steps for the next player
        const nmp = getAllMandatorySteps(
          cellsById,
          getOppositePlayer(targetCell.occupied)
        )
        const nmpEntries = Object.entries(nmp)

        if (nmpEntries.length === 1) {
          newState.activePieceId = nmpEntries[0][0]
        }

        newState.nmp = nmp
        newState.nrp = nmpEntries
          .map(([_, value]) => value.map(({ id }) => id))
          .flat()

        return newState
      })
    }
  }, [])

  const onBoardClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const targetId = (event.target as HTMLElement).dataset.id

    // deactivate a piece if we click on non-highlighted cell
    // in case if there are no mandatory captures
    setState((state) => {
      if (!targetId || !state.nrp.includes(targetId)) {
        const nmpEntries = Object.entries(state.nmp)

        return {
          ...state,
          activePieceId: nmpEntries.length === 1 ? nmpEntries[0][0] : null,
          nrp: nmpEntries.map(([_, value]) => value.map(({ id }) => id)).flat(),
        }
      }

      return state
    })
  }, [])

  // update history in accordance to the state change
  useEffect(() => {
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
          const disabled = mandatoryPieces.length
            ? !mandatoryPieces.includes(id)
            : playerTurn !== occupied

          return (
            <Cell
              key={id}
              id={id}
              onClick={onCellClick}
              isEmpty={isEmpty}
              isActive={id === state.activePieceId}
              occupied={occupied}
              disabled={disabled}
              highlighted={state.nrp.includes(id)}
            />
          )
        })}
      </div>
    </div>
  )
}

export default React.memo(Board)
