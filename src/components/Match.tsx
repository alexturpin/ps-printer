import { useLocalStorage } from "@mantine/hooks"
import type { MatchInfo } from "../lib/match"
import { ActionIcon, Button, Card, Group, Stack, Title } from "@mantine/core"
import { IconChevronLeft, IconPrinter } from "@tabler/icons-react"
import { useLocation } from "wouter"

export const useMatch = (id: string) =>
  useLocalStorage<MatchInfo | null>({
    key: "match-" + id,
    defaultValue: null,
  })

export const Match = ({ params }: { params: Record<"id", string> }) => {
  const { id } = params
  const [, navigate] = useLocation()

  const [match] = useMatch(id)
  if (!match) return null

  return (
    <>
      <Group align="baseline" mb="md" spacing={4}>
        <ActionIcon onClick={() => navigate("/")}>
          <IconChevronLeft />
        </ActionIcon>
        <Title order={1}>{match.name}</Title>
      </Group>

      <Stack mb="md">
        {Object.entries(match.shooters).map(([id, shooter]) => (
          <Card key={id}>
            <Group position="apart">
              <Title order={4}>{shooter.label}</Title>
              <Button leftIcon={<IconPrinter />}>Print</Button>
            </Group>
          </Card>
        ))}
      </Stack>
    </>
  )
}
