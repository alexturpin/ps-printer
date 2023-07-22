const HitFlags = {
  A: 2 ** 0,
  C: 2 ** 8,
  D: 2 ** 12,
  NS: 2 ** 16,
  M: 2 ** 20,
  NPM: 2 ** 24,
}

type Hit = keyof typeof HitFlags

const parseHits = (hit: number): Record<Hit, number> => {
  // Get the hit names sorted by their values in descending order
  const hitNames = (Object.keys(HitFlags) as Hit[]).sort((a, b) => HitFlags[b] - HitFlags[a])

  const result: Record<string, number> = {}

  for (const hitName of hitNames) {
    result[hitName] = Math.floor(hit / HitFlags[hitName])
    hit %= HitFlags[hitName]
  }

  return result
}

console.log(parseHits(8))

// HF or Incomplete if missing hits
