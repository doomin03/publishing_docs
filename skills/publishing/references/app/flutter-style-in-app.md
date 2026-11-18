# Flutter 앱 내부 관리형

앱에서 테마와 공용 위젯을 관리하는 프로젝트에 적용한다. [설계 입력·테마·배율 공통 기준](flutter-style-architecture.md)을 함께 적용한다.

```text
docs/design/                      화면·상태·반응형 설계 문서
design/tokens/                    토큰 입력 또는 출처·대응 기록
lib/
  app/                           MaterialApp, 테마 선택, 앱 셸
  ui/tokens/                     팔레트·역할·간격·타이포
  ui/theme/                      앱 테마, Material 위젯 스타일
  ui/components/                 공통 앱바·버튼·입력·다이얼로그
  ui/responsive/                 배율 연결, 중단점, 공통 폭 제약
  features/<feature>/
    screens/                     화면 조립
    widgets/                     화면 전용 및 compact/wide 레이아웃
```

- 폴더 이름은 예시다. 기존 `themes/`, `style/`, `widgets/`가 같은 역할을 맡으면 해당 위치에서 변경한다. 신규 구조는 기존 경로와의 대응을 확인한 뒤 범위 안에서 적용한다.
- 공통 테마·토큰을 먼저 찾고 기능 위젯에서 재사용한다. 폰과 태블릿에서 같은 기능을 제공하면 상태·동작은 화면 계층에 두고 배치 위젯에서 공유한다.
- 레거시에 전역 크기 캐시가 있다면 회전, 분할 화면, 키보드에서 갱신 시점을 확인한다. 새 위젯의 로컬 배치는 실제 제약과 현재 인셋에서 계산한다.
