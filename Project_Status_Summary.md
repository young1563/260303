# 🌐 Game Research Insight Portfolio - Project Summary
**Last Updated**: 2026-02-23
**Primary Goal**: 게임 시장 분석 데이터 및 기획 인사이트를 시각화하여 전달하는 반응형 웹 포트폴리오 제작 및 유지보수.

---

## 🛠 1. Technical Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Vanilla CSS (Custom properties, Flexbox/Grid)
- **Typography**: Google Fonts (Inter, Outfit, Noto Sans KR, Pretendard)
- **Animations**: CSS Keyframes, Intersection Observer (Scroll Reveal), JS Parallax (Hero section)
- **Assets**: SVG Icons (Material Symbols, Lucide-like custom paths)

---

## 📂 2. Core Architecture & File Structure

### Root Directory
- `index-ko.html` / `index.html`: 메인 대시보드 (한국어/영어)
- `glossary-ko.html` / `glossary.html`: 게임 개발/비즈니스 용어 사전
- `research-ko.html` / `research.html`: 전체 리서치 목록

### Assets & Resources
- `/css/style.css`: 전역 스타일 및 애니메이션 정의
- `/js/main.js`: 스크롤 인터랙션, 탭 필터링, 패럴랙스 로직
- `/img/`: 리포트용 시각 자료 및 로컬 이미지 소스
- `/research/`: 상세 분석 아티클 (HTML 형태)
  - `global-report-2025-ko.html`, `block-blast-analysis-ko.html` 등
- `/data/`: 프로젝트 원본 데이터 및 심층 리포트 (Markdown/PDF)
  - `deep-research-report.md`, `hypercasual_research.pdf` 등

---

## 🚀 3. Current Implementation Status

### ✅ Completed
- [x] 메인 대시보드 레이아웃 및 반응형 디자인 적용
- [x] 스크롤 리빌 애니메이션 (Fade-in, Slide-in) 및 프리로더 구현
- [x] 리서치 카드 탭 필터링 기능 (시장 분석 / 게임 분석)
- [x] 주요 리포트 본문 템플릿화 및 데이터 시각화 (Chart.js 연동 예시)
- [x] 다국어(KO/EN) 전환 내비게이션 기반 마련

### 🛠 In Progress / Pending Issues
1. **Pizza Ready 분석 페이지**:
    - **상태**: 템플릿 생성 완료, 세부 분석 내용 대기 중.
    - **할 일**: `pizze-ready-analysis-ko.html` 본문 기획 및 차트 데이터 구성.
2. **다국어 콘텐츠 확충**:
    - 주요 분석글들의 영어 버전 최신화 필요.
3. **SEO 최적화**:
    - 각 분석 페이지별 메가 태그 및 구조화 데이터(JSON-LD) 보완.

---

## 📝 4. Hand-over Instructions
이 프로젝트는 유니티 공장 시스템이 아닌 **웹사이트 제작 프로젝트**입니다. 
다음 세션 시작 시:
> "게임 리서치 웹사이트 프로젝트입니다. 현재 `index-ko.html`에 **Pizza Ready** 카드를 추가하고 `research/pizze-ready-analysis-ko.html` 기본 템플릿을 생성했습니다. 요청 시 해당 페이지의 세부 내용을 작성하거나 새로운 분석 아티클을 추가하면 됩니다."

---

## 📌 5. Design Principles
- **Aesthetics**: Glassmorphism 테마, 부드러운 그라데이션, 마우스parallax 효과 유지.
- **Responsiveness**: 모바일 우선(Mobile-first) 대응 필수.
- **Data Clarity**: 통계 수치는 반드시 시각적 요소(Card, Chart)와 병행 표기.
