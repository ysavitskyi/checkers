import { composeCls } from 'utils'
import './index.css'

const Piece: React.FC<{
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void
  isWhite?: boolean
}> = ({ onClick, isWhite }) => {
  return (
    <div
      className={composeCls(['piece'], { 'piece--white': isWhite })}
      onClick={onClick}
    />
  )
}

export default Piece
