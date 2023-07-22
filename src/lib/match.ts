import JSZip from "jszip"
import { MatchDef, MatchScores } from "./ps"

export type MatchInfo = {
  id: string
  name: string
  updatedAt: Date
}

export const parseMatchFile = async (file: ArrayBuffer): Promise<MatchInfo> => {
  const { matchDef, matchScores } = await parsePSCFile(file)

  return {
    id: matchDef.match_id,
    name: matchDef.match_name,
    updatedAt: new Date(),
  }
}

export const parsePSCFile = async (file: ArrayBuffer) => {
  const zip = await JSZip.loadAsync(file)

  const matchScoresFile = zip.file("match_scores.json")
  const matchDefFile = zip.file("match_def.json")

  if (!matchScoresFile || !matchDefFile) {
    throw new Error("Missing required file in zip")
  }

  const matchDef = JSON.parse(await matchDefFile.async("text")) as MatchDef
  const matchScores = JSON.parse(await matchScoresFile.async("text")) as MatchScores

  return { matchDef, matchScores }
}
