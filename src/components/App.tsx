import { Alert, AppShell, Container, Group, Header, Text } from "@mantine/core"
import { ReactNode } from "react"
import { ErrorBoundary, FallbackProps, useErrorBoundary } from "react-error-boundary"
import { Route, useLocation } from "wouter"
import { Match } from "./Match"
import { MatchList } from "./MatchList"
import { UploadMatch } from "./UploadMatch"

export const Fallback = ({ error }: FallbackProps) => {
  return (
    <AppWrapper>
      <Alert color="red" title="Something went wrong">
        <pre>{error.message}</pre>
      </Alert>
    </AppWrapper>
  )
}

export const AppWrapper = ({ children }: { children: ReactNode }) => {
  const [, navigate] = useLocation()
  const { resetBoundary } = useErrorBoundary()

  return (
    <AppShell
      padding="md"
      header={
        <Header height={50} p="xs">
          <Group position="apart">
            <Group
              onClick={() => {
                resetBoundary()
                navigate("/")
              }}
              sx={{ cursor: "pointer" }}
            >
              <img src="/icon.svg" alt="Logo" width="32" />
              <Text>PS Printer</Text>
            </Group>
            <UploadMatch />
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
      <Container>{children}</Container>
    </AppShell>
  )
}

export const App = () => (
  <ErrorBoundary FallbackComponent={Fallback}>
    <AppWrapper>
      <Route path="/" component={MatchList} />
      <Route path="/match/:id" component={Match} />
    </AppWrapper>
  </ErrorBoundary>
)
