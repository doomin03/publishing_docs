# 입력: Figma

## 화면과 상태 찾기

- 지정된 파일·페이지·섹션·프레임을 확인하고 프레임 링크 또는 노드 ID를 기록한다. 버전이 지정되면 버전 링크도 남긴다. 라이브 파일은 확인 시점을 기록한다.
- 파일만 주어지면 대상 화면 이름과 프로젝트 인계 기록에서 프레임을 좁힌다. 후보가 충돌하면 해당 화면만 확인을 요청한다.
- 화면 전체 상태는 프레임·오버레이, 컴포넌트 상태는 Variants, 전환은 Prototype 연결을 확인한다. 상태가 모호하면 연결된 명세나 기존 동작까지 확인한다.
- 네이티브 Figma Specs를 사용할 수 있으면 독립 Spec 또는 Design 파일에 포함된 Spec에서 조건과 예외를 읽는다. 프로젝트에서 연결한 외부 명세도 출처로 쓸 수 있다.

## 스펙 축적과 재사용

- 화면·상태별 기록에 프레임 링크, 버전 또는 확인 시점, 플랫폼·프레임 크기·변수 모드, 레이어 구조·문구·치수·스타일, 변수 바인딩, 상태 전환 근거, 스크린샷을 필요한 범위에서 담는다.
- Figma의 값은 지정 디자인 노드와 모드에서 읽는다. 브라우저·앱 실행값은 대상 구현을 렌더링해 별도로 확인한다.
- 변수는 컬렉션·모드·별칭을 확인하고, 프로젝트 대응표나 코드에서 같은 의미의 토큰을 찾는다.
- 필요한 노드부터 조회한다. 조회 결과를 재사용할 때 동일한 파일·노드·버전·모드인지 확인한다. 라이브 파일의 변경 여부를 확인할 수 없으면 캐시를 과거 자료로 표시한다. 접근 실패나 호출 제한으로 확인하지 못한 항목은 미확인으로 기록한다.
- HTML도 있으면 [화면별 기준 판정](../common/source-precedence.md)을 적용한다.

## 공식 문서

- [Guide to Specs in Figma](https://help.figma.com/hc/en-us/articles/44049066011671-Guide-to-Specs-in-Figma)
- [Guide to Dev Mode in Figma](https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode-in-Figma)
- [View a file’s version history](https://help.figma.com/hc/en-us/articles/360038006754-View-a-file-s-version-history)
