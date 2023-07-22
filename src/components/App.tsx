import { AppShell, Button, FileButton, Group, Header, Text } from "@mantine/core"
import { MatchList, useMatches } from "./MatchList"
import { Route, useLocation } from "wouter"
import { Match } from "./Match"
import { IconUpload } from "@tabler/icons-react"
import { parseMatchFile } from "../lib/match"

export const App = () => {
  const [, navigate] = useLocation()
  const [matches, setMatches] = useMatches()

  return (
    <AppShell
      padding="md"
      header={
        <Header height={50} p="xs">
          <Group position="apart">
            <Group onClick={() => navigate("/")} sx={{ cursor: "pointer" }}>
              <img src="/icon.svg" alt="Logo" width="32" />
              <Text>PS Printer</Text>
            </Group>
            <FileButton
              onChange={(file) => {
                if (!file) return

                const reader = new FileReader()
                reader.onload = async () => {
                  if (reader.result === null || !(reader.result instanceof ArrayBuffer)) return null

                  const match = await parseMatchFile(reader.result)
                  if (!matches.includes(match.id)) setMatches([...matches, match.id])
                  localStorage.setItem("match-" + match.id, JSON.stringify(match))
                }
                reader.readAsArrayBuffer(file)
              }}
              accept=".psc"
            >
              {(props) => (
                <Button size="xs" leftIcon={<IconUpload size={16} />} {...props}>
                  Upload match
                </Button>
              )}
            </FileButton>
          </Group>
        </Header>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      })}
    >
      <Route path="/" component={MatchList} />
      <Route path="/match/:id" component={Match} />
    </AppShell>
  )
}
