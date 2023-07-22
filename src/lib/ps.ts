export interface MatchDef {
  device_arch: string
  device_model: string
  app_version: string
  os_version: string
  match_id: string
  match_name: string
  match_type: string
  match_subtype: string
  match_usemaxstagetime: boolean
  match_track_ro: string
  match_docs: MatchDoc[]
  match_pointsdownvalue: number
  match_maxteamresults: number
  match_secure: boolean
  match_level: string
  match_date: string
  match_creationdate: string
  match_modifieddate: string
  match_penalties: any[]
  match_bonuses: any[]
  match_cats: string[]
  match_cls: string[]
  match_ctgs: string
  match_chkins: string[]
  match_procs: MatchProc[]
  match_dqs: MatchDq[]
  match_dnfs: MatchDnf[]
  match_stages: MatchStage[]
  match_shooters: MatchShooter[]
  match_divisionpfs: MatchDivisionpfs
  match_pfs: MatchPf[]
}

export interface MatchDoc {
  url: string
  name: string
  file: string
  type: string
  chksum: string
}

export interface MatchProc {
  uuid: string
  name: string
  warn?: boolean
}

export interface MatchDq {
  uuid: string
  name: string
}

export interface MatchDnf {
  uuid: string
  name: string
}

export interface MatchStage {
  stage_number: number
  stage_strings: number
  stage_scoretype: string
  stage_modifieddate: string
  stage_name: string
  stage_poppers: number
  stage_noshoots: boolean
  stage_numtargs: number
  stage_uuid: string
  stage_classictargets: boolean
  stage_classifier: boolean
  stage_classifiercode: string
  stage_tppoints: number
  stage_removeworststring: boolean
  stage_maxstringtime: number
  stage_doesntrequiretime: boolean
  stage_targets: StageTarget[]
}

export interface StageTarget {
  target_number: number
  target_reqshots: number
  target_maxnpms?: number
}

export interface MatchShooter {
  sh_uuid: string
  sh_uid: string
  sh_ln: string
  sh_fn: string
  sh_id: string
  sh_num: number
  sh_random: number
  sh_sqd: number
  sh_del: boolean
  sh_eml: string
  sh_cc: string
  sh_st: string
  sh_dvp: string
  sh_pf: string
  sh_grd: string
  mod_ctgs: string
  mod_chkins: string
  sh_wlk: boolean
  sh_mod: string
  mod_pr: string
  mod_dv: string
  mod_pf: string
  mod_sq: string
  mod_dl: string
  mod_dq: string
  sh_dq: boolean
}

export interface MatchDivisionpfs {
  PCC: Pcc
  "PCC Iron": PccIron
  Revolver: Revolver
  "Production Optics": ProductionOptics
  "PCC Optics": PccOptics
  Production: Production
  Standard: Standard
  Classic: Classic
  Open: Open
}

export interface Pcc {
  minor: number
}

export interface PccIron {
  minor: number
}

export interface Revolver {
  major: number
  minor: number
}

export interface ProductionOptics {
  minor: number
}

export interface PccOptics {
  minor: number
}

export interface Production {
  minor: number
}

export interface Standard {
  major: number
  minor: number
}

export interface Classic {
  major: number
  minor: number
}

export interface Open {
  major: number
  minor: number
}

export interface MatchPf {
  name: string
  short: string
  A: number
  B: number
  C: number
  D: number
  M: number
  NS: number
  disabled: string
}

export interface MatchScores {
  match_id: string
  match_scores: MatchScore[]
  match_scores_history: MatchScoreHistory[]
}

export interface MatchScore {
  stage_number: string
  stage_uuid: string
  stage_stagescores: StageStagescore[]
}

export interface StageStagescore {
  shtr: string
  mod: string
  popm: number
  poph: number
  rawpts: number
  str: number[]
  ts: number[]
  aprv: boolean
  udid: string
  dname: string
}

export interface MatchScoreHistory {
  shtr: string
  mod: string
  popm: number
  poph: number
  rawpts: number
  str: number[]
  ts: number[]
  meta?: Meum[]
  aprv: boolean
  udid: string
  dname: string
}

export interface Meum {
  k: string
  v: string
  t: string
}
