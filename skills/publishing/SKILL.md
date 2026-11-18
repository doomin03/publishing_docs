---
name: publishing
description: >-
  HTML 목업이나 Figma 디자인을 앱·웹 화면으로 구현하고 검수한다. 화면·상태별 기준을 확인하고,
  디자인과 구현의 차이를 수정하거나 HTML과 Figma 간 불일치를 판정할 때 사용한다.
---

# Publishing

## 입력 × 플랫폼

| 입력 | 앱 | 웹 |
|---|---|---|
| HTML 목업 | [HTML](references/mockup/html-input.md) + 앱 기술 스택 지침 | [HTML](references/mockup/html-input.md) + [웹](references/web/web.md) |
| Figma | [Figma](references/figma/figma-input.md) + 앱 기술 스택 지침 | [Figma](references/figma/figma-input.md) + [웹](references/web/web.md) |

Flutter 앱은 [Flutter](references/app/flutter.md)를 읽는다. 다른 앱 스택은 대상 저장소의 실행·스타일·검증 지침을 따른다.
두 입력이 있는 화면은 두 입력 지침을 읽고 같은 조건의 화면·상태를 대응시킨다.

## 작업 절차

1. 요청과 저장소 지침에서 대상 앱·화면·상태, 실행 방법, 테마 및 검증 조건을 찾는다.
2. [기준 판정](references/common/source-precedence.md)에 따라 화면·항목별 출처를 확인한다. 불일치로 판단이 필요한 항목은 보류하고 나머지는 진행한다.
3. [화면 읽기](references/common/reading-mockups.md)를 참고해 문구·구조·비주얼·상태를 추출하고 주요 사용자 흐름과 기대 결과를 확인한다.
4. 관련 테스트·시각 기준선이 있으면 확인하고, [토큰](references/common/tokens.md)과 기존 컴포넌트를 재사용한다.
5. 요청 범위에서 구현한다. 스타일 수정 과정에서 라우트·상태·API·데이터 흐름을 유지한다.
6. 변경 화면을 실행해서 [판정 기준](references/common/judgement.md)과 [체크리스트](references/common/checklist.md)에 따라 시각 결과와 실제 사용자 동작을 검증한다.
