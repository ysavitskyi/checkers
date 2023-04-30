import { composeCls } from 'utils'
import './index.css'

const Piece: React.FC<{
  disabled: boolean
  isWhite: boolean
  isActive?: boolean
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}> = ({ disabled, isWhite, isActive, onClick }) => {
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
