# Suspension Bridge

![Suspension Bridge overview](image/bridge-intro.png)

Vite, TypeScript, Three.js로 만든 실시간 현수교 씬 프로젝트입니다.

처음에는 장면 연습으로 시작했지만, 지금은 포트폴리오용으로 보여도 될 정도의 형태를 목표로 다듬었습니다. 브리지, 지형, 하늘, 수면, 도로 위 차량 흐름까지 전부 절차적으로 구성했고, 페이지를 열자마자 규모감과 구조감, 그리고 분위기가 바로 읽히는 장면을 만드는 데 집중했습니다.

## 링크

- 라이브 데모: [https://suspension-bridge.vercel.app](https://suspension-bridge.vercel.app)
- GitHub 저장소: [https://github.com/jinhyuk9714/suspension-bridge](https://github.com/jinhyuk9714/suspension-bridge)

## 장면 구성

- 주탑, 메인 케이블, 서스펜더, 앵커리지, 확장된 데크 숄더까지 포함한 절차적 현수교
- 정면광과 역광 모두에서 읽히도록 조정한 골든아워 라이팅
- 반사색이 과하게 틀어지지 않도록 보정한 수면 반사
- 지형, 원경 산맥, 식생, 구름으로 쌓은 환경 깊이
- 승용차, 트럭, 버스가 양방향으로 흐르는 ambient traffic
- 마우스와 키보드로 함께 조작하는 부드러운 카메라 컨트롤

## 기술 스택

- Vite
- TypeScript
- Three.js
- Vitest

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 Vite 로컬 주소를 열면 바로 확인할 수 있습니다.

프로덕션 빌드를 로컬에서 확인하려면:

```bash
npm run build
npm run preview
```

## 검증 명령

```bash
npm run typecheck
npm test -- --run
npm run build
```

## 조작 방법

- 마우스: orbit, pan, zoom
- `W` / `S`: 전후 이동
- `A` / `D`: 좌우 이동
- `R` / `F`: 카메라 타깃 상하 이동
- 방향키: 카메라 회전
- `Q` / `E`: 부드러운 줌

## 프로젝트 구조

- `src/app`: 씬 조립
- `src/core`: renderer, scene, camera, resize, animation loop
- `src/controls`: 마우스/키보드 카메라 제어
- `src/bridge`: 브리지 지오메트리와 재질 모듈
- `src/environment`: 지형, 수면, 하늘, 구름, 식생, 원경 산맥
- `src/traffic`: 도로 위 차량 시스템
- `src/postprocessing`: composer와 bloom 설정

## 참고

- 외부 3D 모델은 사용하지 않았습니다.
- 브리지와 주변 환경은 절차적 지오메트리와 조정된 재질로 구성했습니다.
- 코드 구조는 모듈 단위로 나눠서, 이후 연출이나 오브젝트를 확장하기 쉽게 유지했습니다.
