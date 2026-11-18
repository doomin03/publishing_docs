# 기존 `ver4-publishing` 스킬 평가

대상: `~/.claude/skills/ver4-publishing/SKILL.md` (60줄, 2026-11-18 기준).
이 스킬을 일반화한 결과가 같은 폴더의 `SKILL.md` 다.

## 결론

SportLog Ver4 자녀앱 한 프로젝트용으로는 **좋은 스킬**이다.
판정 기준이 날카롭고 근거 문서(`TRAPS.md` §21)를 단다.
범용 퍼블리싱 스킬로는 **부적합**하다.
Flutter·SportLog 이름에 묶여 있고,
낡을 값을 박제했고,
상태 원장·기능 불변·Figma 입력이 빠졌다.

## 항목별

| 기준 | 판정 | 근거 |
|---|---|---|
| description 구체성 | 좋음 | 트리거 상황(「목업과 다르다」, 퍼블 감사)과 이름(`DkColors`·골든 파일명)이 있다. 다만 「Figma 적용 시트」를 내세우고 본문에 Figma 처리가 없다 |
| SKILL.md 길이 | 좋음 | 60줄. 더 붙일 자리가 없다는 뜻이기도 하다 |
| references 분리 | 없음 | 전부 본문. 입력·플랫폼이 늘면 넣을 곳이 없다 |
| 코드 복사 | 경미 | 테스트 명령 한 블록. 경로가 바뀌면 같이 낡는다 |
| 낡을 값 박제 | 나쁨 | 절대경로 `C:/workspace/project/sportlog/`, 브랜치 `feature/jhm_w1`·「지금 어느 슬롯에도 체크아웃 안 됨」, 커밋 `e71507164`, 허용치 3%, 색 예시 `#f3f2e9`, 파일 크기 130~170KB |
| 판정 기준 | 있음 | §3 「같다」의 판정 — 토큰 스팟체크로 끝내지 않는다 |
| 금지 | 있음 | §1 원본 HTML 직독 MUST NOT, 스펙 없으면 대신하지 않는다 |
| 실수 | 일부 | §2·§5 에 사고가 있으나 증상·원인·처리 형식이 아니다 |
| 끝 조건 | 약함 | 「렌더로 확인」과 골든 명령만 있다. 체크리스트가 없다 |

## 빠진 것 (정본에는 있다)

- 상태 전부가 한 화면이다 — `PUB-STATES.md` 규칙, `PUB-GOLDEN.md` 「한 상태 = 골든 한 장」.
- 기능은 건드리지 않는다 — `PUB-FLOW.md` §5. 스냅샷에 없다고 지우지 않는다.
- 문구 diff, 애니메이션 — `ver4-html/PUBLISHING.md` §2·§4, `PUB-FLOW.md` §3.
- 기준물이 없으면 만들지 않는다 — `PUB-FLOW.md` §0.
- 시스템 UI 안전영역 — `_pub-prompts/_rules.md`.
- Figma 입력의 정본·호출 한도 — SportLog 저장소 `docs/ops/style-workflow.md` §0·§6.

## 새 스킬에서 바꾼 것

- 공통 절차·분기만 `SKILL.md` 에 두고, 입력(`mockup/`·`figma/`) × 플랫폼(`app/`·`web/`)으로 references 를 나눴다.
- SportLog 고유 이름·경로·명령은 `references/app/sportlog-case.md` 로 격리했다.
- 낡을 값은 「설정/환경에 따라 다름」으로 바꾸고, 출처만 남겼다.
- 함정은 `TRAPS.md` 근거가 있는 것만 증상·원인·처리로 옮겼다.
