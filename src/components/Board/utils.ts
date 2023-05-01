import { BOARD_SIZE, ICellState } from '.'

const getNextPos = ({
  cellsById,
  currentCell,
  increment,
  oppositePlayer,
  capturingOnly,
  capture,
}: {
  cellsById: Record<string, ICellState>
  currentCell: ICellState
  increment: number
  oppositePlayer: string
  capturingOnly?: boolean
  capture?: boolean
}): { id: string; capturedId?: string } | undefined => {
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
  if (cellsById[nextPos].occupied === oppositePlayer && !capture) {
    return getNextPos({
      cellsById,
      currentCell: cellsById[nextPos],
      increment,
      oppositePlayer,
      capturingOnly,
      capture: true,
    })
  }
}

export const calcNextPositions = (
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
    const incPos1 = BOARD_SIZE - 1
    const incPos2 = BOARD_SIZE + 1
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

  let capturingPossible = false

  return config.increments
    .map((increment) => {
      const nextPos = getNextPos({
        cellsById,
        currentCell,
        increment: increment.val,
        oppositePlayer: config.oppositePlayer,
        capturingOnly: capturingOnly || increment.capturingOnly,
      })

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
