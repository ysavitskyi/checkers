import { useCallback, useState } from 'react'
import Grid from 'components/Grid'
import './index.css'

type IGridState = Exclude<
  React.ComponentProps<typeof Grid>['historyStep'],
  undefined
>

const Game = () => {
  const [history, setHistory] = useState<IGridState[]>([])
  const [historyIndex, setHistoryIndex] = useState(0)

  const jumpHistory = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const historyIndex = +(event.target as HTMLButtonElement).value

      setHistoryIndex(historyIndex)
    },
    []
  )

  const addHistoryStep = useCallback(
    (historyItem: IGridState, reset?: boolean) => {
      setHistory((history) => {
        if (!historyItem) return history

        const newStep = historyItem.step

        if (reset) {
          setHistoryIndex(newStep)

          return history.slice(0, newStep).concat(historyItem)
        }

        if (history[history.length - 1]?.step >= newStep) {
          return history
        }

        setHistoryIndex(newStep)

        return [...history, historyItem]
      })
    },
    []
  )

  return (
    <div className="game">
      <div className="game-col game-col--left">
        <Grid
          addHistoryStep={addHistoryStep}
          historyStep={history[historyIndex]}
        />
      </div>
      <div className="game-col game-col--right">
        <h2>History: </h2>
        <ol>
          {history.map((_, index) => (
            <li key={index}>
              <button
                value={index}
                onClick={jumpHistory}
                type="button"
                disabled={historyIndex === index}
              >
                Go to
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export default Game
