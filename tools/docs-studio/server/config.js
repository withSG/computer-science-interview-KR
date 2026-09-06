import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

/** 앱 디렉터리: tools/docs-studio */
export const APP_ROOT = path.resolve(here, '..')

/** 저장소 루트. tools/docs-studio 에서 두 단계 위. 환경변수로 덮어쓸 수 있다. */
export const REPO_ROOT = path.resolve(process.env.REPO_ROOT || path.join(APP_ROOT, '..', '..'))

/** 다이어그램이 사는 곳 */
export const DIAGRAM_DIR = path.join(REPO_ROOT, 'assets', 'diagrams')

/** 편집 이력 (gitignore 됨) */
export const HISTORY_DIR = path.join(APP_ROOT, '.history')

export const PORT = Number(process.env.PORT || 5174)

export const ai = {
  key: process.env.OPENAI_API_KEY || '',
  baseUrl: (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
  model: process.env.OPENAI_MODEL || 'gpt-4o',
  modelSvg: process.env.OPENAI_MODEL_SVG || process.env.OPENAI_MODEL || 'gpt-4o',
  timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS || 180000),
}

/** 저장소 루트 기준 상대경로를 절대경로로. 루트 밖으로 나가면 던진다. */
export function resolveInRepo(relPath) {
  if (typeof relPath !== 'string' || relPath.length === 0) {
    throw new Error('경로가 비어 있다')
  }
  if (relPath.includes('\0')) throw new Error('경로에 NUL 이 있다')
  const abs = path.resolve(REPO_ROOT, relPath)
  const rel = path.relative(REPO_ROOT, abs)
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`저장소 밖의 경로: ${relPath}`)
  }
  return abs
}

/** 절대경로를 저장소 기준 POSIX 상대경로로 (URL·키로 쓰기 위해 항상 슬래시) */
export function toRepoRel(abs) {
  return path.relative(REPO_ROOT, abs).split(path.sep).join('/')
}
