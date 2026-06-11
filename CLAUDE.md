> **참조 우선순위**: 전역 `C:\Users\Codelab\.claude\CLAUDE.md` → 이 파일 → `apps/mobile/CLAUDE.md` 또는 `apps/api/CLAUDE.md` (작업 앱에 해당하는 것만)

# CLAUDE.md
@AGENTS.md  ← Codex와 공유하는 프로젝트 규칙 전체

## Claude Code 전용

### MCP / 도구 사용
- 파일 읽기 전 항상 Read tool로 최신 상태 확인
- 여러 파일 동시 편집 시 Edit tool 사용 (Write 덮어쓰기 금지)
- 터미널 명령 실행 전 의도를 한 줄 설명

### 메모리 활용
- 대화가 길어지면 중요한 결정사항을 local/history.md에 기록
- 세션 시작 시 local/history.md 먼저 확인

### 한국어 응답
- 코드 외 모든 응답은 한국어로