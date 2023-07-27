import { outdent } from "outdent"
import invariant from "tiny-invariant"
import { MatchDef, MatchScore, StageStagescore, StageTarget } from "./ps"
import { formatDate } from "./utils"

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

type TargetHits = Record<Hit, number> & { NPM?: number }

const parseTargetHits = (target: StageTarget, hit: number) => {
  // Get the hit names sorted by their values in descending order
  const hitNames = (Object.keys(hitFlags) as Hit[]).sort((a, b) => hitFlags[b] - hitFlags[a])

  const partialHits: Partial<TargetHits> = {}

  for (const hitName of hitNames) {
    partialHits[hitName] = Math.floor(hit / hitFlags[hitName])
    hit %= hitFlags[hitName]
  }

  const hits = partialHits as TargetHits
  const complete = hits.A + hits.C + hits.D + hits.M + hits.NPM === target.target_reqshots

  return {
    ...hits,
    complete,
  }
}

export const formatScore = (
  matchDefinition: MatchDef,
  matchScore: MatchScore,
  score: StageStagescore,
): string => {
  const stage = matchDefinition.match_stages.find(
    (stage) => stage.stage_uuid === matchScore.stage_uuid,
  )
  invariant(stage, `Unknown stage: ${matchScore.stage_uuid}`)
  const stageName = stage.stage_name
  const mod = new Date(`${score.mod}Z`)
  const modifiedAt = formatDate(mod)
  const time = score.str[0] ?? 0

  const procedures = (score.proc_cnts ?? []).map((procs) => {
    const [id, count] = Object.entries(procs)[0]
    const proc = matchDefinition.match_procs.find((proc) => proc.uuid === id)
    invariant(proc, `Unknown procedure: ${id}`)
    return `  ${proc.name} ${count}`
  })

  const dnfs = (score.dnfs ?? []).map((id) => {
    const dnf = matchDefinition.match_dnfs.find((dnf) => dnf.uuid === id)
    invariant(dnf, `Unknown DNF: ${id}`)
    return `  ${dnf.name}`
  })

  const dqs = (score.dqs ?? []).map((id) => {
    const dq = matchDefinition.match_dqs.find((dq) => dq.uuid === id)
    invariant(dq, `Unknown DQ: ${id}`)
    return `  ${dq.name}`
  })

  let hasNPM = false
  const targets = (score.ts ?? []).map((hit, targetNumber) => {
    const target = stage.stage_targets.find((t) => t.target_number === targetNumber + 1)
    invariant(target, `Unknown target: ${targetNumber}`)

    if (target.target_maxnpms) hasNPM = true
    return parseTargetHits(target, hit)
  })

  let complete = true
  const hits = targets.reduce(
    (acc, target) => {
      if (!target.complete) complete = false
      for (const hitType of hitTypes) acc[hitType] += target[hitType]
      return acc
    },
    Object.fromEntries(hitTypes.map((hitType) => [hitType, 0])) as TargetHits,
  )

  const points = score.rawpts ?? 0
  const additionalPenalties = Math.round(((score.apen ?? 0) / 100) * points)
  const procedureCount = score.proc ?? 0
  const penalties = (hits.M + hits.NS + procedureCount) * 10 + additionalPenalties

  const hitFactor = Math.max(points - penalties, 0) / time

  const header = outdent`
    Stage: ${stageName}
    ${modifiedAt} (current)
  `

  const scored = outdent`
    A: ${hits.A}
    C: ${hits.C}
    D: ${hits.D}
    M: ${hits.M}
    NS: ${hits.NS}
    ${hasNPM ? `NPM: ${hits.NPM}` : "\0"}
    Proc: ${procedureCount}
    ${additionalPenalties > 0 ? `Additional Penalties: ${score.apen}%` : "\0"}
    ${procedures.length > 0 ? procedures.join("\n") : "\0"}
    Time: ${time.toFixed(2)}

    ${complete ? `HF: ${hitFactor.toFixed(4)}` : "Incomplete"}
  `.replace(`\0\n`, "")

  if (score.dnfs?.length) {
    return outdent`
      ${header}

      Did Not Fire
      ${dnfs.join("\n")}
    `
  }

  if (score.dqs?.length) {
    return outdent`
      ${header}

      Disqualified
      ${dqs.join("\n")}
    `
  }

  return outdent`
    ${header}
    
    ${scored}
  `
}
