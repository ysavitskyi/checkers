import { useCallback, useState } from 'react'
import Board from 'components/Board'
import Piece from 'components/Piece'
import './index.css'

type IBoardState = Exclude<
  React.ComponentProps<typeof Board>['historyItem'],
  undefined
>

const Game = () => {
  const historyAPI = useHistory()
  const { history, historyIndex, addHistoryItem } = historyAPI

  return (
    <div className="game">
      <div className="game-col game-col--left">
        <Board
          addHistoryItem={addHistoryItem}
          historyItem={history[historyIndex]}
        />
      </div>
      <div className="game-col game-col--right">
        <Turn isWhite={historyIndex % 2 === 0} />
        <History historyAPI={historyAPI} />
      </div>
    </div>
  )
}

const Turn: React.FC<{ isWhite: boolean }> = ({ isWhite }) => {
  return (
    <div className="flex f-acenter">
      <h2>Turn:</h2>
      <div style={{ width: '4em', height: '4em', position: 'relative' }}>
        <Piece isWhite={isWhite} disabled />
      </div>
    </div>
  )
}

const History: React.FC<{ historyAPI: ReturnType<typeof useHistory> }> = ({
  historyAPI,
}) => {
  const {
    history,
    historyIndex,
    setHistoryIndex,
    nextHistoryStep,
    prevHistoryStep,
    resetHistory,
  } = historyAPI

  const jumpHistory = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const historyIndex = +(event.target as HTMLButtonElement).value

      setHistoryIndex(historyIndex)
    },
    [setHistoryIndex]
  )

  return (
    <>
      <div className="flex f-acenter">
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
    </>
  )
}

const useHistory = () => {
  const [history, setHistory] = useState<IBoardState[]>([])
  const [historyIndex, setHistoryIndex] = useState(0)

  const addHistoryItem = useCallback((nextHistoryItem: IBoardState) => {
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
