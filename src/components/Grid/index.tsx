import { useState, useCallback } from 'react'
import Cell from 'components/Cell'
import './index.css'

const GRID_SIZE = 8

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

const calcNextPositions = (
  cellsById: Record<string, ICellState>,
  id: string,
  capturingOnly?: boolean
) => {
  // the current cell is certainly occupied
  type TcurrentCell = ICellState & {
    occupied: Exclude<ICellState['occupied'], null>
  }
  const currentCell = cellsById[id] as TcurrentCell

  const config = ((
    occupied: TcurrentCell['occupied']
  ): {
    oppositePlayer: TcurrentCell['occupied']
    increments: { val: number; capturingOnly?: boolean }[]
  } => {
    const incPos1 = GRID_SIZE - 1
    const incPos2 = GRID_SIZE + 1
    const increments = [
      { val: incPos1 },
      { val: incPos2 },
      { val: -incPos1, capturingOnly: true },
      { val: -incPos2, capturingOnly: true },
    ]

    if (occupied === 'player1') {
      return {
        oppositePlayer: 'player2' as const,
        increments,
      }
    } else {
      return {
        oppositePlayer: 'player1' as const,
        increments: increments.map((increment) => ({
          ...increment,
          val: -increment.val,
        })),
      }
    }
  })(currentCell.occupied)

  const getNextPos = (
    currentCell: ICellState,
    increment: number,
    capturingOnly?: boolean,
    capture?: boolean
  ): { id: string; capturedId?: string } | undefined => {
    const nextPos = +currentCell.id + increment + ''

    // check if this pos is present
    if (!cellsById[nextPos]) return

    // check if the next cell is not occupied (need to skip if there's considering capturing)
    if (cellsById[nextPos].occupied === null && !capture && !capturingOnly) {
      return { id: nextPos }
    }

    if (cellsById[nextPos].occupied === null && capture) {
      return { id: nextPos, capturedId: currentCell.id }
    }

    // check if the next cell could be captured
    if (cellsById[nextPos].occupied === config.oppositePlayer && !capture) {
      return getNextPos(cellsById[nextPos], increment, capturingOnly, true)
    }
  }

  let capturingPossible = false

  return config.increments
    .map((increment) => {
      const nextPos = getNextPos(
        currentCell,
        increment.val,
        capturingOnly || increment.capturingOnly
      )

      if (nextPos?.capturedId) {
        capturingPossible = true
      }

      return nextPos
    })
    .reduce<
      | Record<string, { id: string }>
      | Record<string, { id: string; capturedId: string }>
    >((acc, nextPos) => {
      if (!nextPos) return acc

      return {
        ...acc,
        ...(capturingPossible
          ? nextPos.capturedId && { [nextPos.id]: nextPos }
          : { [nextPos.id]: nextPos }),
      }
    }, {})
}
interface ICellState {
  id: string
  occupied: (typeof grid)[number]['occupied']
}
interface IPositionState {
  id: string
  capturedId?: string | undefined
}

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
      console.log(changeTurn)

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
