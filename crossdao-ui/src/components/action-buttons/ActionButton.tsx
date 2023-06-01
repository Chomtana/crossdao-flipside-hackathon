export interface ActionButtonProps {
  color: string
  background: string
  icon?: string
  children: any
  onClick?: () => any
}

export default function ActionButton({ color, background, icon, children, onClick }: ActionButtonProps) {
  return (
    <div 
      className="rounded-xl p-3 px-4 flex items-center transition hover:cursor-pointer hover:scale-105"
      style={{
        color, background, maxWidth: 480,
      }}
      onClick={onClick}
    >
      {icon &&
        <div className="mr-3">
          <img src={icon} style={{ height: 28 }} />
        </div>
      }

      <div className="truncate flex grow">
        {children}
      </div>
    </div>
  )
}