import { outdent } from "outdent"
import invariant from "tiny-invariant"
import { MatchDef, MatchPf, MatchScore, StageStagescore, StageTarget } from "./ps"

const hitFlags = {
  A: 2 ** 0,
  C: 2 ** 8,
  D: 2 ** 12,
  NS: 2 ** 16,
  M: 2 ** 20,
  NPM: 2 ** 24,
}

const hitTypes = ["A", "C", "D", "M", "NS", "NPM"] as const

export type Hit = (typeof hitTypes)[number]

type TargetHits = Record<Exclude<Hit, "NPM">, number> & { NPM?: number }

const parseTargetHits = (target: StageTarget, hit: number) => {
  // Get the hit names sorted by their values in descending order
  const hitNames = (Object.keys(hitFlags) as Hit[]).sort((a, b) => hitFlags[b] - hitFlags[a])

  const partialHits: Partial<TargetHits> = {}

  for (const hitName of hitNames) {
    partialHits[hitName] = Math.floor(hit / hitFlags[hitName])
    hit %= hitFlags[hitName]
  }

  const hits = partialHits as TargetHits
  const complete = hits.A + hits.C + hits.D + hits.M + (hits.NPM ?? 0) === target.target_reqshots

  return {
    ...hits,
    complete,
  }
}

export const formatScore = (
  matchDefinition: MatchDef,
  powerFactor: MatchPf,
  matchScore: MatchScore,
  score: StageStagescore,
): string => {
  const stage = matchDefinition.match_stages.find(
    (stage) => stage.stage_uuid === matchScore.stage_uuid,
  )
  invariant(stage, `Unknown stage: ${matchScore.stage_uuid}`)
  const stageName = stage.stage_name
  const mod = new Date(`${score.mod}Z`).toString()
  const time = score.str[0]

  const targets = score.ts.map((hit, targetNumber) => {
    const target = stage.stage_targets.find((t) => t.target_number === targetNumber + 1)
    invariant(target, `Unknown target: ${targetNumber}`)
    return parseTargetHits(target, hit)
  })
  let points = 0
  let complete = true
  const hits = targets.reduce(
    (acc, target) => {
      if (!target.complete) complete = false

      for (const hitType of hitTypes) {
        acc[hitType] += target[hitType] ?? 0
        if (hitType !== "NPM") points += target[hitType] * powerFactor[hitType]
      }

      return acc
    },
    Object.fromEntries(hitTypes.map((hitType) => [hitType, 0])) as TargetHits,
  )

  const hitFactor = (points / time).toFixed(4)

  return outdent`
    Stage: ${stageName}
    ${mod} (current)

    A: ${hits.A}
    C: ${hits.C}
    D: ${hits.D}
    M: ${hits.M}
    NS: ${hits.NS}
    ${typeof hits.NPM === "number" ? `NPM: ${hits.NPM}` : ""}
    Proc: ${0 /*TODO*/}
    Time: ${time}

    ${complete ? `HF: ${hitFactor}` : "Incomplete"}
  `
}
