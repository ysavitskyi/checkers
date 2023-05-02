import { ICellState, ICellStateOccupied } from '.'
import { Dictionary } from 'utils'

export const BOARD_SIZE = 8

const pieceNavConfig = (() => {
  const incPos1 = BOARD_SIZE - 1
  const incPos2 = BOARD_SIZE + 1
  const increments = [
    { val: incPos1 }, // forward left
    { val: incPos2 }, // forward right
    { val: -incPos1, capturingOnly: true }, // backward left
    { val: -incPos2, capturingOnly: true }, // backward right
  ]

  return {
    player1: {
      oppositePlayer: 'player2' as const,
      increments,
    },
    player2: {
      oppositePlayer: 'player1' as const,
      increments: increments.map((increment) => ({
        ...increment,
        val: -increment.val,
      })),
    },
  }
})()

export const getPlayerByStep = (step: number) =>
  step % 2 === 0 ? 'player1' : 'player2'

export const getOppositePlayer = (player: 'player1' | 'player2') =>
  player === 'player1' ? 'player2' : 'player1'

export const getRegularSteps = (
  cellsById: Dictionary<ICellState>,
  cell: ICellStateOccupied
) => {
  const curPieceNavConfig = pieceNavConfig[cell.occupied]

  return curPieceNavConfig.increments.reduce<string[]>((acc, increment) => {
    const nextPos = +cell.id + increment.val + ''

    // check if this pos is present
    if (!increment.capturingOnly && cellsById[nextPos]?.occupied === null) {
      return [...acc, nextPos]
    }

    return acc
  }, [])
}

export const getMandatorySteps = (
  cellsById: Dictionary<ICellState>,
  cell: ICellStateOccupied
) => {
  const curPieceNavConfig = pieceNavConfig[cell.occupied]

  return curPieceNavConfig.increments.reduce<
    { id: string; capturedId: string }[]
  >((acc, increment) => {
    const nextPos = +cell.id + increment.val + ''
    const nextNextPos = +cell.id + increment.val * 2 + ''

    // check if this pos is present
    if (
      cellsById[nextPos]?.occupied === curPieceNavConfig.oppositePlayer &&
      cellsById[nextNextPos]?.occupied === null
    ) {
      return [...acc, { id: nextNextPos, capturedId: nextPos }]
    }

    return acc
  }, [])
}

export const getAllMandatorySteps = (
  cellsById: Dictionary<ICellState>,
  occupied: ICellStateOccupied['occupied']
) => {
  return Object.values(cellsById).reduce<
    Dictionary<ReturnType<typeof getMandatorySteps>>
  >((acc, cell) => {
    if (cell.occupied === occupied) {
      const cellMandatorySteps = getMandatorySteps(
        cellsById,
        cell as ICellStateOccupied
      )

      return {
        ...acc,
        ...(cellMandatorySteps.length && {
          [cell.id]: cellMandatorySteps,
        }),
      }
    }

    return acc
  }, {})
}
