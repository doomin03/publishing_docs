# 목업 계산값 스펙 형식

목업(HTML)과 Figma 두 입력은 같은 형식의 스펙을 내야 한다.
이 문서가 그 계약이다.
`spec.js` 가 HTML 쪽 구현이고,
Figma 쪽 도구는 이 문서를 따라 같은 파일을 만들어야 한다(MUST).
퍼블리싱 에이전트는 원본 대신 이 파일만 읽는다.

## 1. 파일 배치

- 화면 하나에 파일 하나: `<out>/<화면>.md`.
  `<화면>` 은 목업 파일 이름에서 `.html` 을 뗀 것이다(Figma 는 프레임 이름).
- 전체를 다시 만들 때만 `<out>/README.md` 목록을 함께 쓴다(§6).
  일부 화면만 만들 때는 목록을 건드리지 않는다.
- 사람이 손으로 고치지 않는다(MUST NOT). 다시 생성한다.

## 2. 화면 파일 구조

````
# <화면> — 목업 계산값 스펙

- 원본: `<루트 기준 경로>` (<원본 KB>KB)[ · <메타>]
- 테마: `<테마 값>` (`<테마 속성>` — 색은 이 테마로 재매핑된 계산값이다)   또는   없음
- 폰트: <기본 글꼴> 로드됨 | 🔴 <기본 글꼴> 미로드 — … | 확인 안 함 · 뷰포트 <W>×<H> · 문서 높이 <N>px
- 읽는 법: `선택자 [x,y w×h] 속성` · 들여쓰기=포함 관계 · ×N=같은 모양 반복 · `#hex=토큰` 은 값이 같은 토큰

```
<트리 줄…>
```
````

- `<메타>` 는 원본 안에서 설정 `meta` 정규식에 처음 맞은 문자열이다. 없으면 ` · ` 부터 뺀다.
- 「폰트」가 🔴 이면 글자 박스의 너비·높이를 믿지 않는다.
- Figma 쪽은 `원본` 에 파일 키·노드 ID 를,
  `테마` 에 변수 모드 이름을 쓴다(SHOULD).

## 3. 트리 줄

```
{들여쓰기}{선택자} [{x},{y} {w}×{h}] {속성 · 속성 …}{반복}
```

- 들여쓰기: 두 칸이 한 단계 포함 관계다.
- 선택자: `태그[.클래스1.클래스2][#id]`. 클래스는 앞의 두 개까지만.
  Figma 는 노드 타입(`frame`·`text`·`instance` …)과 레이어 이름을 같은 자리에 쓴다(SHOULD).
- 박스: 뷰포트 왼쪽 위 기준 px 정수(반올림). 스크롤은 0 인 상태다.
- 속성: 아래 순서로, 값이 있을 때만 ` · ` 로 잇는다. 단위 `px` 는 뗀다(`bgimg`·`shadow`·`border`·`blur` 제외).

| 약어 | CSS 계산값 | Figma 대응(권고) |
|---|---|---|
| `bg` | `background-color` | 단색 fill |
| `bgimg` | `background-image` (90자에서 자름, `url(파일이름)` 만 남김) | 그라디언트·이미지 fill |
| `blur` | `backdrop-filter` | Background blur |
| `shadow` | `box-shadow` (70자에서 자름) | Drop/Inner shadow |
| `border` | 위쪽 테두리 `너비 스타일 색` | stroke |
| `r` | `border-radius` | corner radius |
| `pad` | `padding` | auto layout padding |
| `gap` | `gap` | item spacing |
| `op` | `opacity` | layer opacity |
| `pos` | `position` | absolute 배치면 `absolute` |
| `ovf` | `overflow` | clip content 면 `hidden` |
| `fit` | `object-fit` | 이미지 scale mode |
| `row`·`col`·`grid` | flex 방향 또는 grid, 뒤에 `align-items` `justify-content` (`space-` → `s-`) | auto layout 방향·정렬 |
| `font` | `크기/굵기 [lh줄높이] [ls자간] [ff 글꼴] c 색 [정렬] 「글자」` | text 스타일 |
| `img` | `<img>` 의 파일 이름 | 이미지 fill 의 원본 이름 |

- 기본값은 쓰지 않는다:
  `none` `normal` `auto` `0px` `rgba(0, 0, 0, 0)` `1` `visible` `static` `block`
  `inline` `start` `row` `stretch` `flex-start` `fill` `0px 0px 0px 0px`.
- `font` 는 그 요소가 자기 글자(직속 텍스트 노드, 40자까지)를 가질 때만 쓴다.
  `ff` 는 설정의 기본 글꼴이 아닐 때만 붙는다(24자에서 자름).
- `반복`: 선택자와 너비·높이가 같은 형제가 잇따르면 첫 줄만 쓰고 ` ×N` 을 붙인다.
  나머지의 글자는 ` 나머지「a · b」` 로 모은다(80자에서 자름).

## 4. 색 표기

`#rrggbb[aa][=이름1[|이름2][@NN%]]`

- 알파가 1 이면 `aa` 를 쓰지 않는다.
- `=이름` 은 알파를 뺀 `#rrggbb` 가 같은 토큰의 이름이다. 최대 둘, `|` 로 잇는다.
  설정 `tokens` 의 순서대로 먼저 붙고, 그다음이 테마 요소의 인라인 `--변수` 다.
- 이름이 붙고 알파가 1 보다 작으면 `@NN%` 로 불투명도를 덧붙인다.
- 값이 같다고 뜻이 같지는 않다. 후보가 둘이면 사람이 고른다.

## 5. 생략 규칙

- 보이지 않는 요소(`display:none`·`visibility:hidden`·너비나 높이 0)는 뺀다.
- `script`·`style`·`link`·`meta`·`template` 는 뺀다.
- 글자도 이미지도 없고 상속되는 글자 속성 말고는 스타일도 없는 껍데기는
  지우고 자식을 한 단계 올린다. `svg` 는 남긴다.

## 6. 목록 파일 (`README.md`)

머리말 한 줄(원본 합계 KB → 스펙 합계 KB)과
`| 화면 | 테마 | 폰트 | 스펙 |` 표 하나다. 화면 이름순, 폰트 칸은 `✓` 또는 `🔴`.
