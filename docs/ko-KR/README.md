# GSD 문서

Get Shit Done (GSD) 프레임워크의 종합 문서입니다. GSD는 AI 코딩 에이전트를 위한 메타 프롬프팅, 컨텍스트 엔지니어링, 스펙 기반 개발 시스템입니다.

언어 버전: [English](../README.md) · [Português (pt-BR)](../pt-BR/README.md) · [日本語](../ja-JP/README.md) · [简体中文](../zh-CN/README.md) · [한국어](README.md)

영문 [`../README.md`](../README.md)이 canonical docs index입니다. 이 페이지는 한국어 mirror이며, 동일한 문서 인덱스 구조를 유지하고 아직 번역되지 않은 항목은 영어 fallback으로 명시합니다.

## 문서 목차

| 문서 | 대상 독자 | 설명 |
|------|-----------|------|
| [Architecture](ARCHITECTURE.md) | 기여자, 고급 사용자 | 시스템 아키텍처, 에이전트 모델, 데이터 흐름, 내부 설계 |
| [Feature Reference](FEATURES.md) | 전체 사용자 | 요구사항이 포함된 전체 기능 및 함수 문서 |
| [Command Reference](COMMANDS.md) | 전체 사용자 | 모든 명령어의 구문, 플래그, 옵션 및 예제 |
| [Configuration Reference](CONFIGURATION.md) | 전체 사용자 | 전체 설정 스키마, 워크플로우 토글, 모델 프로필, git 브랜칭 |
| [CLI Tools Reference](CLI-TOOLS.md) | 기여자, 에이전트 작성자 | 워크플로우 및 에이전트를 위한 `gsd-tools.cjs` 프로그래매틱 API |
| [Agent Reference](AGENTS.md) | 기여자, 고급 사용자 | 18개 전문 에이전트의 역할, 도구, 스폰 패턴 |
| [User Guide](USER-GUIDE.md) | 전체 사용자 | 워크플로우 안내, 문제 해결, 복구 방법 |
| [Context Monitor](context-monitor.md) | 전체 사용자 | 컨텍스트 윈도우 모니터링 훅 아키텍처 |
| [Discuss Mode](workflow-discuss-mode.md) | 전체 사용자 | discuss 단계의 assumptions 모드와 interview 모드 |

## 빠른 링크

- **최신 릴리스 노트:** [CHANGELOG](../CHANGELOG.md) 와 canonical [English README](../README.md#v1360-highlights) 를 참조하세요
- **시작하기:** [README](../README.md) → 설치 → `/gsd-new-project`
- **전체 워크플로우 안내:** [User Guide](USER-GUIDE.md)
- **모든 명령어 한눈에 보기:** [Command Reference](COMMANDS.md)
- **GSD 설정하기:** [Configuration Reference](CONFIGURATION.md)
- **시스템 내부 동작 원리:** [Architecture](ARCHITECTURE.md)
- **기여 또는 확장:** [CLI Tools Reference](CLI-TOOLS.md) + [Agent Reference](AGENTS.md)
- **수동 업데이트:** [manual-update.md](../manual-update.md) 는 아직 한국어 mirror가 없으므로 영어 fallback 문서로 사용합니다.
