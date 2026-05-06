# Suspension Bridge

![Suspension Bridge overview](image/bridge-intro.png)

Vite, TypeScript, Three.js로 만든 실시간 현수교 3D 시각화 프로젝트입니다. 브리지, 지형, 하늘, 수면, 도로 위 차량 흐름을 절차적으로 구성해 브라우저에서 바로 탐색할 수 있는 장면으로 만들었습니다.

## 링크

- 라이브 데모: [https://suspension-bridge.vercel.app](https://suspension-bridge.vercel.app)
- GitHub 저장소: [https://github.com/jinhyuk9714/suspension-bridge](https://github.com/jinhyuk9714/suspension-bridge)

## 프로젝트 방향

처음에는 장면 연습으로 시작했지만, 현재 구조는 포트폴리오용 3D 시각화 프로젝트에 맞춰 모듈화되어 있습니다. 외부 3D 모델을 가져오기보다 브리지와 주변 환경을 코드로 생성하고, 카메라 조작과 ambient traffic을 더해 규모감과 구조감을 보여주는 데 집중했습니다.

## 장면 구성

- 주탑, 메인 케이블, 서스펜더, 앵커리지, 데크 숄더를 포함한 절차적 현수교
- 정면광과 역광 모두에서 읽히도록 조정한 골든아워 라이팅
- 반사색을 보정한 수면 표현
- 지형, 원경 산맥, 식생, 구름으로 구성한 환경 깊이
- 승용차, 트럭, 버스가 양방향으로 흐르는 ambient traffic
- 마우스와 키보드로 함께 조작하는 카메라 컨트롤

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

프로덕션 빌드 확인:

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
- `W / S`: 전후 이동
- `A / D`: 좌우 이동
- `R / F`: 카메라 타깃 상하 이동
- 방향키: 카메라 회전
- `Q / E`: 부드러운 줌

## 프로젝트 구조

```text
src/
  app/              # experience 조립
  core/             # renderer, scene, camera, resize, animation loop
  controls/         # 마우스와 키보드 카메라 제어
  bridge/           # 브리지 geometry와 material 모듈
  environment/      # 지형, 수면, 하늘, 구름, 식생, 원경 산맥
  traffic/          # 도로 위 차량 시스템
  postprocessing/   # composer와 bloom 설정
```

## 참고 사항

- 외부 3D 모델은 사용하지 않았습니다.
- 브리지와 주변 환경은 절차적 geometry와 조정된 material로 구성했습니다.
- 코드 구조는 모듈 단위로 나눠 이후 연출이나 오브젝트를 확장하기 쉽게 유지했습니다.
