---
name: publishing
description: >-
  목업(HTML 스냅샷·계산값 스펙)이나 Figma 디자인을 앱(Flutter)·웹 화면으로 옮기는 퍼블리싱의
  읽는 법·정본 판정·검증·끝 조건. 목업/Figma 화면을 구현할 때, 「목업과 다르다」「Figma와 다르다」를
  고칠 때, 퍼블 감사·골든/시각 회귀 검수, 목업과 Figma 값이 어긋나 어느 쪽을 따를지 정할 때 쓴다.
---

# Publishing

공통 절차와 분기만 둔다. 상세는 `references/` 에서 해당 칸만 읽는다.

## 분기 — 입력 × 플랫폼

두 축은 독립이다. 칸의 파일과 `common/` 을 함께 읽는다.
한 화면에 입력이 둘이면 두 행을 다 읽고 `common/source-precedence.md` 를 먼저 적용한다.

| 입력 \ 플랫폼 | 앱 | 웹 |
|---|---|---|
| 목업 HTML | `mockup/html-input.md` + `app/flutter.md` | `mockup/html-input.md` + `web/web.md` |
| Figma | `figma/figma-input.md` + `app/flutter.md` | `figma/figma-input.md` + `web/web.md` |

입력 파일(`mockup/`·`figma/`)은 플랫폼을 가리지 않는다. 플랫폼 고유 내용은 `app/`·`web/` 에만 있다.

## 절차

1. 입력·플랫폼·범위(화면과 그 상태·상세 전부)를 확정한다.
2. 기준물을 확보한다. 없거나 낡았으면 만들지 말고 보고한다.
3. 기준물을 읽는다 — `common/reading-mockups.md`.
4. 고치기 전에 그 화면의 기존 시험·시각 기준선을 먼저 돌려 둔다.
5. 토큰과 기존 컴포넌트로 옮긴다 — `common/tokens.md`.
6. 「같다」를 판정한다 — `common/judgement.md` 전 항목.
7. 끝 조건을 모두 통과하고 어긋남을 표로 남긴다 — `common/checklist.md`.

## 규칙

- MUST NOT 원본 HTML 을 직접 풀어 값을 읽는다. 계산값 스펙만 읽는다.
- MUST 색·간격·타이포는 토큰 이름으로 쓴다.
- MUST NOT 기능(라우트·상태·API·값의 흐름)을 바꾼다. 퍼블은 겉모습만 바꾼다.
- MUST NOT 목업에 없다고 구현 요소를 지우거나, 목업에 없는 요소·상태를 지어낸다.
- MUST 테마·모드가 있으면 그 모드의 계산값으로 판정한다. 문장으로 판정하지 않는다.
- MUST 렌더해서 눈으로 본 것만 끝났다고 쓴다.
- MUST 모호하거나 정본끼리 어긋나면 추측하지 않고 묻는다.
- SHOULD 한 작업공간에 세션 하나, 한 세션에 화면 한 묶음.

## References

- `references/common/` - 출처 약어, 읽는 법, 정본 우선순위, 판정, 토큰, 끝 조건, 함정.
- `references/mockup/html-input.md` - HTML 목업·계산값 스펙 입력.
- `references/figma/figma-input.md` - Figma 입력 뼈대와 확인 필요 항목.
- `references/app/flutter.md` - Flutter 고유 주의점. `app/sportlog-case.md` 는 SportLog 사례.
- `references/web/web.md` - 웹 고유 항목. 대부분 TODO.
- `EVALUATION.md` - 이 스킬의 바탕이 된 `ver4-publishing` 평가.
