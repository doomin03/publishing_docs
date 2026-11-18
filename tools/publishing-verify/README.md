# 퍼블리싱 검증 도구

HTML 목업·Figma·승인된 구현 캡처에서 만든 기준값을 실제 웹·앱 결과와 비교합니다. 기준 추출과 화면 캡처는 각 프로젝트의 기존 도구를 사용합니다. 비교 도구는 PNG와 수치 JSON을 입력받습니다.

```powershell
python -m pip install -r tools/publishing-verify/requirements.txt
python tools/publishing-verify/verify.py path/to/login-error.json --output path/to/new-result
```

## 화면·상태별 설정

경로는 설정 JSON 파일 기준입니다. `image`와 `metrics` 중 하나만 지정할 수도 있습니다. `context`는 보고서에 복사하는 재현 정보이며, 양쪽의 상태·크기·테마·폰트·배율은 캡처할 때 맞춥니다.

```json
{
  "case": "login/error",
  "context": { "viewport": "390x844", "theme": "light", "scale": 1 },
  "image": {
    "expected": "baseline/login-error.png",
    "actual": "captures/login-error.png",
    "channelTolerance": 0,
    "maxDiffRatio": 0
  },
  "metrics": {
    "expected": "baseline/login-error-metrics.json",
    "actual": "captures/login-error-metrics.json",
    "tolerances": { "submit.width": 0.5 }
  }
}
```

수치 파일은 안정적인 요소 ID와 속성을 키로 쓰는 JSON 객체입니다. 두 파일의 단위와 좌표 기준을 동일하게 맞춥니다. 위치·크기·여백·줄 높이·불투명도 등을 비교할 수 있습니다.

```json
{ "submit.width": 320, "submit.height": 48, "form.gap": 16 }
```

- **이미지**는 같은 크기의 단일 프레임 PNG를 검사합니다. 각 픽셀을 검정·흰색 배경에 합성해 RGB 채널 최댓값 차이가 `channelTolerance`보다 크면 차이로 셉니다. 차이 비율은 0~1 범위이며 `maxDiffRatio` 이하일 때 통과합니다. 크기가 다르면 실패합니다.
- **수치**는 `|actual - expected|`가 항목 허용치 이하일 때 통과합니다. 미지정 허용치는 0입니다. 빠지거나 추가된 키도 보고하고 실패 처리합니다.
- **결과**는 새 출력 폴더의 `report.json`에 남습니다. 같은 크기의 이미지에서 픽셀 차이가 있으면 빨간색으로 표시한 `diff.png`도 생깁니다. 종료 코드는 통과 0, 비교 실패 1, 잘못된 입력·실행 오류 2입니다.

## 기준 선택

Figma나 HTML 목업과 비교할 때는 화면·상태별로 승인된 기준과 출처를 기록합니다. 회귀 테스트에는 검수 후 승인한 실제 구현 캡처를 골든 이미지로 두고, 같은 환경에서 다시 캡처해 비교합니다. 기준 이미지는 별도로 검토 후 갱신합니다.

웹은 Playwright 캡처와 브라우저 측정값, Flutter는 골든 캡처와 테스트에서 측정한 위젯 크기·위치를 사용할 수 있습니다. 목업의 Markdown 스펙을 수치로 옮길 경우 반올림, 생략, 반복 축약을 고려하고 원래 측정값이 필요한 항목은 실행한 목업에서 얻습니다.

## 캡처에서 수치 JSON 만들기

웹은 상태를 재현하고 폰트 로드가 끝난 뒤, 대상 요소의 getBoundingClientRect()와 getComputedStyle()에서 필요한 값을 측정합니다. Flutter는 같은 화면 상태와 테마에서 WidgetTester.getSize()와 getTopLeft() 등으로 측정합니다. Figma는 대응 프레임의 로컬 좌표와 변수가 적용된 치수를 확인합니다. 세 환경에서 같은 의미의 요소 키를 사용하고, 페이지 좌표가 아닌 화면 또는 컨테이너 기준 좌표로 통일합니다. PNG 물리 픽셀과 레이아웃 논리 픽셀은 따로 기록합니다.

검증 대상은 이미지·수치이며, 실제 키보드·탭 순서·내비게이션 테스트는 프로젝트의 [검증 체크리스트](../../skills/publishing/references/common/checklist.md)에 기록합니다.

## 자체 검사

    python tools/publishing-verify/check.py

검사는 임시 폴더에서 통과, 이미지 차이, 크기 차이, 수치 누락·추가와 잘못된 입력을 재현합니다.
