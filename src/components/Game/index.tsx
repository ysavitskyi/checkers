import { useCallback, useState } from 'react'
import Grid from 'components/Grid'
import './index.css'

type IGridState = Exclude<
  React.ComponentProps<typeof Grid>['historyItem'],
  undefined
>

const Game = () => {
  const {
    history,
    historyIndex,
    addHistoryItem,
    setHistoryIndex,
    nextHistoryStep,
    prevHistoryStep,
    resetHistory,
  } = useHistory()

  const jumpHistory = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const historyIndex = +(event.target as HTMLButtonElement).value

      setHistoryIndex(historyIndex)
    },
    [setHistoryIndex]
  )

  return (
    <div className="game">
      <div className="game-col game-col--left">
        <Grid
          addHistoryItem={addHistoryItem}
          historyItem={history[historyIndex]}
        />
      </div>
      <div className="game-col game-col--right">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2>History:</h2>
          &nbsp;
          <button onClick={prevHistoryStep} disabled={historyIndex === 0}>
            Prev
          </button>
          &nbsp;
          <button
            onClick={nextHistoryStep}
            disabled={historyIndex === history.length - 1}
          >
            Next
          </button>
          &nbsp; ... &nbsp;
          <button onClick={resetHistory} disabled={history.length <= 1}>
            Reset
          </button>
        </div>

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

const useHistory = () => {
  const [history, setHistory] = useState<IGridState[]>([])
  const [historyIndex, setHistoryIndex] = useState(0)

  const addHistoryItem = useCallback((nextHistoryItem: IGridState) => {
    setHistory((history) => {
      const lastHistoryItem = history.slice(-1)[0]

      setHistoryIndex(nextHistoryItem.step)

      if (lastHistoryItem?.step >= nextHistoryItem.step) {
        return history.slice(0, nextHistoryItem.step).concat(nextHistoryItem)
      }

      return history.concat(nextHistoryItem)
    })
  }, [])

  const nextHistoryStep = useCallback(
    () => setHistoryIndex((historyIndex) => historyIndex + 1),
    []
  )
  const prevHistoryStep = useCallback(
    () => setHistoryIndex((historyIndex) => historyIndex - 1),
    []
  )

  const resetHistory = useCallback(() => {
    setHistory((history) => history.slice(0, 1))
    setHistoryIndex(0)
  }, [])

  return {
    history,
    historyIndex,
    addHistoryItem,
    setHistoryIndex,
    nextHistoryStep,
    prevHistoryStep,
    resetHistory,
  }
}

export default Game
