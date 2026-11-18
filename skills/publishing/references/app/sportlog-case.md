# SportLog 사례 — Ver4 자녀앱 (Flutter)

SportLog 플릿 전용 이름·경로를 여기에만 둔다. 다른 프로젝트에는 적용하지 않는다.
경로·브랜치·수치는 **2026-11-18 에 읽은 문서 기준**이고 낡을 수 있다. 쓰기 전에 원문을 다시 본다.

## 자리

- 기준은 플릿 루트다. 위치는 설정/환경에 따라 다르다(기록 당시 Windows 의 작업 폴더 아래 `sportlog/`, 워크트리에서는 `../`).
- 계산값 스펙: `ver4-html/_spec/<화면>.md`, 목록은 `ver4-html/_spec/README.md`.
- 정지 스냅샷: `ver4-html/pages/sapp/` — 상태는 `<화면>--<상태>.html`(`_rules`).
- 기준 그림(390×844): `ver4-html/_tools/golden/mockup/`(`ver4-publishing` §1).
- 나란히 대조 틀: `ver4-html/_tools/frame.html`, 검수판 `ver4-html/_tools/golden.html`(`PUB-FLOW` Index, `PUB-GOLDEN`).
- 원장(생성물, 손으로 고치지 않음): `PUB-STATES.md`·`PUB-GOLDEN.md`·`PUB-MAP.md`.
- 재생성 절차: `TRAPS.md` §21 「재생성 순서」, `ver4-html/PUBLISHING.md` §5. 명령은 원문에서 복사한다.

## 테마

- 자녀앱은 인증·셸 화면을 빼면 **캐릭터 테마가 켜진 상태가 정본**이다(`ver4-publishing` §2, `TRAPS` §21).
- 테마는 런타임 JS(`prototype/ver3/character-theme.js`)가 `--tone-*`·`--theme-surface` 로 모든 색을 재매핑한다.
- 앱 쪽 테마 배경은 `app.dart` 의 `CharacterBackdrop` 한 겹이고, 화면 `Scaffold` 바탕은 투명이다(`PUB-FLOW` §4-9).
- 2026-10-26 전 legacy 스냅샷 35장은 테마가 빠진 흰 카드였다. 그때의 「불투명」 판정은 믿지 않는다(`TRAPS` §21).

## 토큰

- 자녀 화면 브랜드는 `DkColors.brand`. `V4Color.homePrimary` 는 **홈 캔버스 전용**이다(`ver4-publishing` §3).
- 스펙 색 뒤의 `DkColors.*`·`V4Color.*` 는 값이 같은 후보다. 홈 전용 이름이 붙어도 홈 밖에 쓰지 않는다.
- 퍼블 토큰을 더하는 자리: `packages/sportlog_ui/lib/src/tokens/ver4_child.dart`(`_rules` 「값 쓰는 법」).
- 목업 변수↔토큰 값 대조표: `design/tokens/ver4-mapping.md`(`PUBLISHING` §2-3). Figma 시트가 박은 색은 이 표에 없다(`design-4.0` §4.2).
- 배율: 목업 px 에 `.w`(세로도 `.w`), 글자 `.sp`, 모서리·정사각 `.r`. 근거 = 저장소 `docs/guide/publishing/08-SCALE.md`(`PUB-FLOW` §3).
- 새 위젯은 레인 접두어를 붙인다. 같은 이름 충돌로 통합 빌드가 세 번 깨졌다(`_rules`).

## 컴포넌트 대응 — 이름·주의만

| 목업 요소 | 컴포넌트 | 주의 | 출처 |
|---|---|---|---|
| 상단 바(`.appbar`) | `ChildSubNav` + `V4ChildAppBar` | 둘을 함께 대조한다. 뒤로 있을 때 제목 가운데 | `ver4-publishing` §3, `PUB-FLOW` §1-1 |
| 상단 바(전체 화면, ver3 묶음) | (별도) | `.app-statusbar`+`.app-appbar`+`header` 라 위 규칙을 쓰지 않는다 | `PUB-FLOW` §1·§4 |
| 설정 행(`.setrow`) | 공용 행으로 흡수 대상(`ChildSetRow` 등 넷이 따로 논다) | 행 높이는 목업 값 쪽 토큰 | `PUB-FLOW` §1-2 |
| 공지 행 | `V4ChildNoticeRow` | 날짜 슬롯이 빠진 채 만들어졌다 — 오독 사고 | `PUB-FLOW` §4 「24」 |

## 골든

- 시험: `app/test/ver4_goldens_test.dart`, `app/test/visual_regression_test.dart`(`ver4-publishing` §4).
- 자리·이름: `app/test/visual_goldens/ver4/<route>__<state>.png`(`PUB-GOLDEN` 규칙).
- 기준선 생성·갱신은 **WSL2 Ubuntu 에서만**. Windows 에서는 `test/support/visual.dart` 의 `visualGoldensSupported` 가 거짓이라 skip 된다(`PUB-GOLDEN`).
- Windows 허용치 비교기 `app/test/support/windows_golden.dart`(환경 변수 `GOLDEN_WINDOWS_TOLERANCE`)는
  기록 당시 develop 에 없고 일부 브랜치에만 있었다. 지금 있는지 먼저 확인한다(`ver4-publishing` §4).
  넘으면 `app/test/failures/` 에 차이 그림이 남는다.
- 실행 명령은 `PUB-GOLDEN.md`·`ver4-publishing` 원문에서 복사한다. 여기 박제하지 않는다.

## 운영

- 한 워크트리에 세션 하나. 둘이면 ARB(`app_ko.arb`)가 서로 덮인다(`TRAPS` §21, `ver4-publishing` §5).
- 한 세션에 화면 한 묶음. 맥락이 커지기 전에 끝내고 닫는다(`ver4-publishing` §5).
- 화면 하나를 끝낼 때마다 커밋·push·보고. 메시지에 바꾼 값과 닫은 상태·상세를 적는다(`_rules`). push 범위는 그 레인 규칙을 따른다.
