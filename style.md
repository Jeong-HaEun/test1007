---
name: crystal-glass-tomato-theme
description: 극대화된 투명도와 맑은 크리스탈 유리 질감의 글래스모피즘 토마토 UI 가이드. 얇고 선명한 프리즘 테두리, 높은 투명도와 딥 블러, 앰비언트 글로우 오브젝트 기반.
---

# Crystal Ultra-Glass Tomato Design Guide

## 스타일 콘셉트
- 텁텁하거나 불투명한 흰색 박스를 완전히 배제하고, 배경의 빛과 형태가 투과되는 맑은 크리스탈 유리(Clear Crystal Glass) 질감 구현.
- 배경의 화사한 앰비언트 글로우 오브젝트와 고심도 블러(`blur(24px)`), 얇은 프리즘 빛 반사 테두리를 통해 투명감과 텍스트 가독성을 동시 확보.

---

## 디자인 토큰 & 글래스 시스템

```css
:root {
  /* Surface & Base */
  --bg-base: #FAF5F2;
  --glass-surface: rgba(255, 255, 255, 0.32);
  --glass-surface-hover: rgba(255, 255, 255, 0.45);
  --glass-border: 1px solid rgba(255, 255, 255, 0.75);
  --glass-inner-glow: inset 0 1.5px 1px rgba(255, 255, 255, 0.95);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.05);
  --glass-blur: blur(24px) saturate(180%);

  /* Typography */
  --text-main: #1A1210;
  --text-muted: #5F524E;
  --text-placeholder: #9E918C;

  /* Accent (Tomato) */
  --accent-tomato: #E54331;
  --accent-tomato-hover: #CE3322;
  --accent-tomato-soft: rgba(229, 67, 49, 0.12);
  --accent-tomato-glow: rgba(229, 67, 49, 0.32);
}
```
