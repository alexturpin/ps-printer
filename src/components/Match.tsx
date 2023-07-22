import { useLocalStorage } from "@mantine/hooks"
import type { MatchInfo } from "../lib/match"

export const useMatch = (id: string) =>
  useLocalStorage<MatchInfo | null>({
    key: "match-" + id,
    defaultValue: null,
  })

export const Match = ({ params }: { params: Record<"id", string> }) => {
  const { id } = params
  const [match] = useMatch(id)
  return (
    <div>
      <h1>{match?.name}</h1>
    </div>
  )
}
