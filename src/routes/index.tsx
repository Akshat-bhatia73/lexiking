import { Button } from "@/components/ui/button"
import { convexQuery } from "@convex-dev/react-query"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { api } from "convex/_generated/api"
import type { Id } from "convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { useState } from "react"

export const Route = createFileRoute("/")({ component: App })

function App() {
  const { data, isLoading } = useSuspenseQuery(convexQuery(api.tasks.get, {}))
  const changeCompletionStatus = useMutation(api.tasks.put)

  const [isUpdating, setIsUpdating] = useState<Id<"tasks"> | undefined>(
    undefined
  )

  const handleChangeCompletionStatus = async (
    id: Id<"tasks">,
    status: boolean
  ) => {
    setIsUpdating(id)
    await changeCompletionStatus({
      id,
      isCompleted: status,
    })
    setIsUpdating(undefined)
  }

  return (
    <div className="min-h-svh p-6">
      {isLoading && <p>Loading...</p>}
      {data.map((task) => {
        return (
          <div>
            <h1>{task.text}</h1>
            <Button
              onClick={() =>
                handleChangeCompletionStatus(task._id, !task.isCompleted)
              }
              disabled={isUpdating === task._id}
            >
              {isUpdating === task._id
                ? "Updating..."
                : task.isCompleted
                  ? "Mark not done"
                  : "Mark done"}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
