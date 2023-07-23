import { Button, FileButton } from "@mantine/core"
import { IconUpload } from "@tabler/icons-react"
import { parseMatchFile } from "../lib/match"
import { useMatches } from "./MatchList"
import { useErrorBoundary } from "react-error-boundary"
import { useLocation } from "wouter"

export const UploadMatch = () => {
  const [, navigate] = useLocation()
  const [matches, setMatches] = useMatches()
  const { showBoundary, resetBoundary } = useErrorBoundary()

  return (
    <FileButton
      onChange={(file) => {
        if (!file) return

        const reader = new FileReader()
        reader.onload = async () => {
          if (reader.result === null || !(reader.result instanceof ArrayBuffer)) return null

          try {
            const match = await parseMatchFile(reader.result)
            console.log(match)

            if (!matches.includes(match.id)) setMatches([...matches, match.id])

            const key = "match-" + match.id
            localStorage.setItem(key, JSON.stringify(match))
            window.dispatchEvent(
              new CustomEvent("mantine-local-storage", { detail: { key, value: match } }),
            )

            navigate(`/match/${match.id}`)
            resetBoundary()
          } catch (err) {
            showBoundary(err)
          }
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
  )
}
