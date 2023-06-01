import ActionButton, { ActionButtonProps } from "./ActionButton"

export interface QuestButtonProps extends ActionButtonProps {
  children: any
}

export default function QuestButton({
  children, ...props
}: QuestButtonProps) {
  return (
    <ActionButton
      {...props}
    >
      <div className="flex justify-between items-center grow">
        <div>{children}</div>

        <div className="">
          <div className="rounded-md bg-red-950 p-1.5 px-3 hover:cursor-pointer hover:opacity-90 text-sm">
            Verify
          </div>
        </div>
      </div>
    </ActionButton>
  )
}