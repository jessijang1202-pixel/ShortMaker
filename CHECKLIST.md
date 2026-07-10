# 영상 품질 체크리스트

SnapReel이 생성하는 숏폼 영상의 품질 기준을 정리한 문서입니다.
새 기능을 추가하거나 프롬프트를 수정할 때 이 목록을 함께 점검하세요.

---

## 1. 인트로(0~8초, Veo AI 클립) 자막

> 2026-07 추가 — 훅 구간은 영상의 첫인상이라 자막 임팩트가 가장 중요합니다.

- [ ] 자막을 8초 내내 한 줄로 길게 띄우지 않는다 (읽다가 지루해짐)
- [ ] 3~6개의 짧은 캡션 조각(2~5단어)으로 나눠 순차적으로 노출한다
- [ ] 각 조각의 시간 구간(start~end)이 0초부터 duration까지 빈틈없이 이어진다
- [ ] 가장 강력한 키워드가 담긴 조각을 맨 앞(첫 1초 안)에 배치한다
- [ ] 자막 스타일이 일반 본문 폰트가 아니라 굵고(font-black) 색이 강한(브랜드 컬러 배경 칩) 형태로 강조된다
- [ ] 데이터: `VeoCoreClip.captions: CaptionBurst[]` — AI가 안 주면
      `splitIntoCaptionBursts()`로 자동 폴백 분할된다 (누락 없이 항상 존재)

구현 위치:
- 프롬프트 규칙: `src/prompts/index.ts` → `buildScriptSplitPrompt()`
- 파싱/폴백: `src/services/gemini.service.ts` → `generateScriptSplit()`,
  `src/utils/captionBursts.ts`
- 렌더링: `src/components/steps/StoryboardStep.tsx` (미리보기),
  `src/components/steps/VeoClipStep.tsx` (고급 모드 편집 화면)

---

## 2. 후반부(8~30초, 슬라이드 6개) 자막

- [ ] 화면 텍스트(`on_screen_text`)는 1~2줄, 한눈에 읽히는 길이
- [ ] 자막 위치/크기/스타일은 레퍼런스 분석 결과(`subtitleNarration`)를 따른다
      — 없으면 트렌드 기본값(`TREND_DEFAULT_STYLE`) 사용
- [ ] `subtitleEnabled`가 꺼져 있으면 자막을 아예 표시하지 않는다

---

## 3. 레퍼런스 스타일 반영

- [ ] 레퍼런스 영상을 올렸다면 컨셉·색감·자막 위치/크기/스타일·BGM·효과음이
      실제 결과물(대본 톤, 슬라이드 이미지, 자막)에 반영된다
- [ ] 레퍼런스가 없으면 최신 숏폼 트렌드 스타일로 자동 대체된다

---

## 4. 영상 길이/구성

- [ ] 전체 길이: 30초 (Veo 8초 + 슬라이드 22초, 6개 장면)
- [ ] 각 슬라이드 씬: 3~4초 내외

---

## 5. 톤/안전성

- [ ] 기획 단계의 "피해야 할 표현"(bannedExpressions)이 대본에 등장하지 않는다
- [ ] 확인되지 않은 사실을 단정하지 않는다
- [ ] 브랜드 로고·특정 심벌·타 브랜드명이 프롬프트/화면에 노출되지 않는다
