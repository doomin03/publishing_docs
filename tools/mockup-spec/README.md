# mockup-spec — 목업 계산값 스펙 생성기

목업 HTML 은 한 장에 수백 KB, 대부분이 CSS 다.
사람이나 AI 가 원본을 직접 읽으면 캐스케이드·`!important`·`display:none`·테마 재매핑을 잘못 푼다.
이 도구는 헤드리스 Chrome 으로 목업을 렌더하고,
브라우저가 이미 계산한 값만 화면당 수 KB 의 `<out>/<화면>.md` 로 뽑는다.
색에는 값이 같은 토큰 이름을 붙인다.
출력 형식은 [`SPEC-FORMAT.md`](SPEC-FORMAT.md)가 정의한다.

## 전제

- Node 18 이상. 의존성은 없다(표준 라이브러리만).
- Chrome 또는 `chrome-headless-shell` 실행 파일 하나.
- **목업 서버를 따로 띄우지 않는다.**
  도구가 설정의 `root` 폴더를 `127.0.0.1` 에 정적 파일로 직접 내보내고, 끝나면 닫는다.
  하네스(`spec.html`)가 iframe 안 문서를 읽으려면 같은 출처여야 하기 때문이다.
- 목업은 정적 HTML 이어야 한다. API 응답·SPA 라우팅이 있어야 그려지는 목업은 지금은 안 된다.
- 목업이 `http://127.0.0.1:<포트>/…` 절대 주소를 품고 있으면 설정 `port` 에 그 포트를 준다.
  그 포트를 다른 프로세스가 쓰고 있으면 바로 오류로 멈춘다.

## 사용법 (Windows PowerShell)

```powershell
# 1) 예시 설정을 복사해 경로를 고친다
Copy-Item tools\config\web.example.json tools\config\web.json

# 2) Chrome 경로 — 설정 "chrome" 대신 환경변수로 줘도 된다(환경변수가 앞선다)
$env:CHROME = "C:\Program Files\Google\Chrome\Application\chrome.exe"

# 3) 화면 하나만
node tools\mockup-spec\spec.js --config tools\config\web.json login-default

# 4) 전체 (목록 README.md 도 다시 쓴다)
node tools\mockup-spec\spec.js --config tools\config\web.json

# 파서 자체 검사 (Chrome 불필요)
node tools\mockup-spec\check.js
```

- 설정 경로는 `--config` 대신 `$env:MOCKUP_SPEC_CONFIG` 로 줘도 된다.
- 화면 이름은 `pages` 폴더 안 파일 이름에서 `.html` 을 뗀 것이다.
  인자가 없으면 `pages` 의 `*.html` 전부를 돈다(`index.html`·`_` 로 시작하는 파일 제외).
- 출력은 탭으로 나뉜 한 줄씩이다: `화면 테마 font|NOFONT|FONT-NOT-CHECKED 원본KB→스펙KB`.
  `NOT-FOUND`·`NO-OUTPUT` 이 하나라도 나오면 종료 코드가 1 이다. 그 화면만 인자로 다시 돌린다.
- Chrome 은 화면마다 하나씩, 동시에 `jobs` 개까지 뜬다.
  메모리가 빠듯하거나 다른 작업이 브라우저를 쓰는 중이면 `$env:JOBS = 1` 로 돌린다.

## 설정 항목

설정은 JSON 하나다. 예시는 `../config/app.example.json`(Flutter 앱), `../config/web.example.json`(웹).
상대 경로는 **설정 파일이 있는 폴더 기준**이다.

| 항목 | 필수 | 기본값 | 뜻 | 환경변수 |
|---|---|---|---|---|
| `root` | ✓ | — | 정적으로 내보낼 루트. 목업이 참조하는 자산이 모두 이 아래 있어야 한다 | — |
| `pages` | | `.` | `root` 기준 목업 폴더 | — |
| `out` | ✓ | — | 스펙을 쓸 폴더 | — |
| `chrome` | ✓* | — | Chrome·headless shell 실행 파일 | `CHROME` |
| `viewport` | | `[390, 844]` | 창·iframe 크기 `[너비, 높이]` | — |
| `fonts` | | `[]` | 확인할 웹폰트의 이름과 별칭. 명시적으로 로드된 폰트가 있으면 머리말에 표시하고, 같은 글꼴이면 `ff`를 생략한다. OS 설치 폰트와 개별 글리프의 실제 사용 여부는 별도로 확인한다 | — |
| `themeAttr` | | `""` | 테마 값을 담은 속성(예 `data-theme`). 처음 만나는 요소의 값과 인라인 `--변수` 를 쓴다 | — |
| `meta` | | 없음 | 원본에서 뽑아 머리말에 붙일 정규식 | — |
| `port` | | `0`(빈 포트) | 내장 서버 포트. 목업에 절대 주소가 박혀 있을 때만 쓴다 | — |
| `jobs` | | `4` | 동시에 띄울 Chrome 수 | `JOBS` |
| `virtualTimeBudget` | | `20000` | Chrome `--virtual-time-budget` (ms) | `VTB` |
| `tokens` | | `[]` | 토큰 파일 목록. 앞의 것이 이름 우선순위가 높다 | — |

\* 설정이나 `CHROME` 중 하나는 있어야 한다. 없거나 파일이 없으면 바로 오류로 멈춘다.

`tokens` 의 한 항목은 `{ "file": "…", "format": "dart|css|json", "prefix": "…" }` 이다.

| `format` | 읽는 모양 | 붙는 이름 |
|---|---|---|
| `dart` | `static const name = Color(0xAARRGGBB)` | `prefix + name` (예 `AppColors.primary`) |
| `css` | `--name: #hex` (`#rgb`·`#rrggbb`·`#rrggbbaa`) | `prefix + --name` |
| `json` | 문자열 잎 또는 `{ "$value" }`·`{ "value" }` 객체 | `prefix + 경로.이름` |

- `rgba()` 처럼 hex 가 아닌 값은 읽지 않는다.
- 알파가 `ff` 가 아닌 토큰은 이름이 붙지 않는다. 역조회는 알파를 뺀 `#rrggbb` 로 하기 때문이다.
- 같은 이름이 라이트·다크에 다른 값으로 있으면 두 값 모두 그 이름을 받는다.
- 새 플랫폼은 `config.js` 의 `PARSERS` 에 함수 하나(본문 → `[[hex, 이름]]`)를 더한다.

## 파일

- `spec.js` - 진입점. 설정을 읽고, 서버를 열고, 화면마다 Chrome 을 돌려 스펙을 쓴다.
- `spec.html` - Chrome 안에서 목업을 iframe 으로 열고 계산값 트리를 JSON 으로 내놓는 하네스.
- `format.js` - 계산값 트리 → 스펙 줄. 색 → 토큰 역조회.
- `config.js` - 설정 읽기와 토큰 파서.
- `serve.js` - `root` 와 하네스를 같은 출처로 내보내는 정적 서버.
- `check.js` - Chrome 없이 도는 파서·포맷 자체 검사.
- `SPEC-FORMAT.md` - 출력 형식 계약.
