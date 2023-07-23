import { ActionIcon, Button, Card, Group, Modal, Stack, Text, Title } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { useMatch } from "./Match"
import { useLocation } from "wouter"
import { formatDate } from "../lib/utils"
import { IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import { MatchInfo } from "../lib/match"

export const useMatches = () =>
  useLocalStorage<string[]>({
    key: "matches",
    defaultValue: [],
  })

export const MatchList = () => {
  const [matches] = useMatches()

  return (
    <Stack mb="md">
      {matches.map((match) => (
        <MatchListEntry key={match} id={match} />
      ))}
    </Stack>
  )
}

export const MatchListEntry = ({ id }: { id: string }) => {
  const [, navigate] = useLocation()
  const [matchToDelete, setMatchToDelete] = useState<MatchInfo | null>(null)

  const [matches, setMatches] = useMatches()

  const [match] = useMatch(id)
  if (!match) return null

  return (
    <>
      <Card>
        <Group position="apart">
          <Stack
            spacing={2}
            onClick={() => navigate(`/match/${id}`)}
            sx={{ cursor: "pointer", flexGrow: 1 }}
          >
            <Title order={4}>{match.name}</Title>
            <Title order={5} color="dimmed">
              Last modified: {formatDate(match.updatedAt)}
            </Title>
          </Stack>

          <ActionIcon onClick={() => setMatchToDelete(match)}>
            <IconTrash />
          </ActionIcon>
        </Group>
      </Card>

      <Modal
        opened={!!matchToDelete}
        onClose={() => setMatchToDelete(null)}
        title={matchToDelete?.name}
      >
        <Text mb="md">Are you sure you want to remove this match?</Text>
        <Group position="right">
          <Button color="gray" onClick={() => setMatchToDelete(null)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => {
              setMatches(matches.filter((m) => m !== id))
              setMatchToDelete(null)
            }}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  )
}
