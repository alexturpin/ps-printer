import { useLocalStorage } from "@mantine/hooks"
import { ShooterInfo, type MatchInfo } from "../lib/match"
import {
  ActionIcon,
  Button,
  Card,
  Checkbox,
  Group,
  Modal,
  Space,
  Stack,
  Title,
} from "@mantine/core"
import { IconChevronLeft, IconPrinter } from "@tabler/icons-react"
import { useLocation } from "wouter"
import { useState } from "react"
import { formatDate } from "../lib/utils"

export const useMatch = (id: string) =>
  useLocalStorage<MatchInfo | null>({
    key: "match-" + id,
    defaultValue: null,
  })

export const Match = ({ params }: { params: Record<"id", string> }) => {
  const { id } = params
  const [, navigate] = useLocation()

  const [match] = useMatch(id)

  const [shooterToPrint, setShooterToPrint] = useState<ShooterInfo | null>(null)
  const [stagesToPrint, setStagesToPrint] = useState<Record<string, boolean>>({})
  const selectAll = () =>
    match &&
    setStagesToPrint(
      Object.fromEntries(Object.entries(match.stages).map(([stageNumber]) => [stageNumber, true])),
    )
  const selectNone = () => setStagesToPrint({})

  if (!match) return null

  return (
    <>
      <Group align="baseline" spacing={4}>
        <ActionIcon onClick={() => navigate("/")}>
          <IconChevronLeft />
        </ActionIcon>
        <Title order={1}>{match.name}</Title>
      </Group>
      <Title order={4} color="dimmed" mb="md">
        Last modified: {formatDate(match.updatedAt)}
      </Title>

      <Stack mb="md">
        {Object.entries(match.shooters).map(([id, shooter]) => (
          <Card key={id}>
            <Group position="apart">
              <Title order={4}>{shooter.label}</Title>
              <Button
                leftIcon={<IconPrinter />}
                onClick={() => {
                  setShooterToPrint(shooter)
                  selectAll()
                }}
              >
                Print
              </Button>
            </Group>
          </Card>
        ))}
      </Stack>

      <Modal
        title={shooterToPrint?.label}
        opened={!!shooterToPrint}
        onClose={() => setShooterToPrint(null)}
      >
        {Object.entries(match.stages).map(([stageNumber, stageName]) => (
          <Checkbox
            key={stageNumber}
            label={stageName}
            disabled={!shooterToPrint?.scores[stageNumber]}
            onChange={({ currentTarget }) => {
              setStagesToPrint({
                ...stagesToPrint,
                [stageNumber]: currentTarget.checked,
              })
            }}
            checked={
              stagesToPrint[stageNumber] === true &&
              typeof shooterToPrint?.scores[stageNumber] !== "undefined"
            }
            mb="sm"
          />
        ))}

        <Space mb="mb" />

        <Group align="flex-end">
          <Button color="gray" size="xs" onClick={() => selectAll()}>
            All
          </Button>

          <Button color="gray" size="xs" onClick={() => selectNone()}>
            None
          </Button>

          <Button
            sx={{ marginLeft: "auto" }}
            onClick={() => {
              const printOut = Object.entries(stagesToPrint)
                .filter(([, print]) => print)
                .sort()
                .map(([stageNumber]) => shooterToPrint?.scores[stageNumber])
                .join("\n\n\n")

              if (!printOut.trim()) return

              console.log(printOut)
            }}
          >
            Print
          </Button>
        </Group>
      </Modal>
    </>
  )
}
