import { Card, Stack } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { useMatch } from "./Match"
import { useLocation } from "wouter"

export const useMatches = () =>
  useLocalStorage<string[]>({
    key: "matches",
    defaultValue: [],
  })

export const MatchList = () => {
  const [matches] = useMatches()

  return (
    <>
      <Stack mb="md">
        {matches.map((match) => (
          <MatchListEntry key={match} id={match} />
        ))}
      </Stack>
    </>
  )
}

export const MatchListEntry = ({ id }: { id: string }) => {
  const [, navigate] = useLocation()

  const [match] = useMatch(id)
  if (!match) return null

  return (
    <>
      <Card onClick={() => navigate(`/match/${id}`)} sx={{ cursor: "pointer" }}>
        {match?.name}
      </Card>
    </>
  )
}
