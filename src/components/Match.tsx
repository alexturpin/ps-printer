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
  TextInput,
  Title,
} from "@mantine/core"
import { IconChevronLeft, IconPrinter, IconSearch, IconX } from "@tabler/icons-react"
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

  const [filter, setFilter] = useState("")

  const [match] = useMatch(id)
  const shooters = Object.values(match?.shooters ?? [])
    .filter(
      (shooter) =>
        !filter.trim().length ||
        shooter.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()),
    )
    .sort((a, b) => {
      if (a.squad === b.squad) return a.name.localeCompare(b.name)
      return a.squad - b.squad
    })

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

      <TextInput
        size="lg"
        icon={<IconSearch />}
        placeholder="Filter"
        onChange={({ currentTarget }) => setFilter(currentTarget.value)}
        value={filter}
        rightSection={
          filter.trim().length ? (
            <ActionIcon onClick={() => setFilter("")}>
              <IconX />
            </ActionIcon>
          ) : null
        }
        mb="md"
      />

      <Stack mb="md">
        {shooters.map((shooter, idx) => (
          <>
            {shooter.squad !== shooters[idx - 1]?.squad && (
              <Title mb="md" key={`squad-${shooter.squad}`}>
                Squad {shooter.squad}
              </Title>
            )}

            <Card key={shooter.id}>
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
          </>
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
                .join("\n\n")

              if (!printOut.trim()) return

              console.log(printOut)

              if (navigator.share) {
                navigator.share({
                  title: shooterToPrint?.label,
                  text: printOut + "\n\n\n",
                })
              }
            }}
          >
            Print
          </Button>
        </Group>
      </Modal>
    </>
  )
}
