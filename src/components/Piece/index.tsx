import { composeCls } from 'utils'
import './index.css'

const Piece: React.FC<{
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void
  isActive: boolean
  disabled: boolean
  isWhite?: boolean
}> = ({ onClick, isWhite, isActive, disabled }) => {
  return (
    <div
      className={composeCls(['piece'], {
        'piece--white': isWhite,
        'piece--active': isActive,
        'piece--disabled': disabled,
      })}
      onClick={onClick}
    />
  )
}

export default Piece
