import JSZip from "jszip"
import invariant from "tiny-invariant"
import { MatchDef, MatchPf, MatchScores } from "./ps"
import { formatScore } from "./scores"
import { outdent } from "outdent"

export type MatchInfo = {
  id: string
  name: string
  updatedAt: Date

  stages: Record<number, string>
  shooters: Record<string, ShooterInfo>
}

export type ShooterInfo = {
  label: string
  powerFactor: MatchPf
  scores: Record<string, string>
}

export const parseMatchFile = async (file: ArrayBuffer): Promise<MatchInfo> => {
  const { matchDef, matchScores } = await parsePSCFile(file)

  return {
    id: matchDef.match_id,
    name: matchDef.match_name,
    updatedAt: new Date(),

    stages: Object.fromEntries(
      matchDef.match_stages
        .map(({ stage_number, stage_name }) => [
          stage_number,
          /Stage \d+/.test(stage_name) ? stage_name : `${stage_number}: ${stage_name}`,
        ])
        .sort(),
    ),
    shooters: parseMatchScores(matchDef, matchScores),
  }
}

const parsePSCFile = async (file: ArrayBuffer) => {
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

const parseMatchScores = (matchDefinition: MatchDef, matchScores: MatchScores) => {
  const shooters: Record<string, ShooterInfo> = Object.fromEntries(
    matchDefinition.match_shooters.map(({ sh_uid, sh_ln, sh_fn, sh_dvp, sh_pf }) => {
      const dvp = sh_dvp
        .split(" ")
        .map((word) => word.at(0))
        .join("")

      const powerFactor = matchDefinition.match_pfs.find(
        (pf) => pf.name.toLowerCase() === sh_pf.toLowerCase(),
      )
      invariant(powerFactor, `Unknown power factor: ${sh_pf}`)

      const label = `${sh_ln}, ${sh_fn} (${dvp}/${powerFactor?.short})`

      return [sh_uid, { label, powerFactor: { ...powerFactor, NPM: 0 }, scores: {} }]
    }),
  )

  for (const matchScore of matchScores.match_scores)
    for (const score of matchScore.stage_stagescores) {
      const shooter = shooters[score.shtr]
      shooter.scores[matchScore.stage_number] = outdent`
        ${shooter.label}
        ${formatScore(matchDefinition, shooter.powerFactor, matchScore, score)}
      `
    }

  return shooters
}
