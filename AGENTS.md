응, 당연히 그래야지. 포트폴리오를 “코드에 하드코딩”하면 그 순간부터 넌 블로그 운영자가 아니라 **배포 노예**가 된다. 포트폴리오도 CMS로 관리 가능하게 명세에 넣자.

아래는 **기능 명세서 v2 (포트폴리오 관리 포함)** 이야.

---

# 📄 기능 명세서 v2 — 포트폴리오 + 통합 블로그 CMS

## 1. 목적

* 개인 랜딩(포트폴리오)과 블로그를 하나의 서비스로 운영
* 관리자(Admin)가 **포트폴리오 콘텐츠 + 블로그 콘텐츠**를 모두 관리 가능
* 내 글 / 외부 글 / 북마크를 동일한 UI 카드로 통합 제공

## 2. 사용자 유형

### 2.1 방문자(Guest)

* 랜딩 페이지 열람
* 포트폴리오 섹션 열람
* 블로그 리스트/상세 열람

### 2.2 관리자(Admin)

* 로그인
* 포트폴리오 콘텐츠 CRUD
* 블로그 포스트 CRUD
* 외부 글/북마크 등록(OG 파싱)
* 이미지 업로드(OCI)

---

# 3. 기능 명세

## 3.1 랜딩 페이지 (`/`)

### 출력 섹션(동적)

* Hero(한 줄 소개, 서브 문구, CTA)
* About(짧은 소개)
* Skills/Stack(태그/아이콘 형태)
* Projects(대표 프로젝트 카드 리스트)
* Experience(경력/활동)
* Links(깃헙/링크드인/이메일 등)
* Blog Preview(최신 콘텐츠 3~6개)

### 요구사항

* 모든 내용은 DB에서 로딩(관리자 편집 가능)
* 반응형 UI, SEO 메타태그(기본값 + 관리자 수정 가능 옵션)

---

## 3.2 포트폴리오 관리(Admin)

### 3.2.1 랜딩 섹션 관리

* Hero 문구/CTA 링크 수정
* About 텍스트 수정
* Skills 태그 추가/삭제/정렬
* Links(소셜 링크) 추가/삭제/정렬

### 3.2.2 프로젝트 관리

* 프로젝트 추가/수정/삭제
* 프로젝트 카드 필드:

    * 제목, 요약, 상세 설명(옵션)
    * 기술 스택 태그
    * 썸네일 이미지(OCI)
    * 링크(깃헙/데모/문서 등)
    * 시작/종료일(옵션)
    * pinned 여부(랜딩 상단 고정)

### 3.2.3 경험(Experience) 관리

* 항목 추가/수정/삭제
* 필드:

    * 조직/역할/기간
    * 설명(불릿)
    * 링크(옵션)
    * 정렬 우선순위

---

## 3.3 통합 콘텐츠 리스트 (`/blog`)

### 콘텐츠 타입(동일 UI)

* Post(내 글)
* External(외부 글)
* Bookmark(북마크)

### 카드 공통 필드

* 썸네일: cover_image_url 또는 og_image_url
* 제목: title 또는 og_title
* 요약: excerpt 또는 og_description
* 날짜: published_at
* 뱃지: type 표시
* 클릭 동작:

    * post → 내부 상세로 이동
    * external/bookmark → 외부 링크 새 탭 이동

### 정렬/필터

* 기본 최신순
* 필터(옵션): 전체 / post / external / bookmark

---

## 3.4 게시글 상세 (`/blog/[slug]`)

* Markdown 렌더링
* Mermaid 지원
* 이미지 표시(OCI URL)
* 링크는 일반 링크로 표시(카드화 없음)
* SEO 메타 자동 설정(title/description)

---

## 3.5 관리자 로그인 (`/admin/login`)

* Supabase Auth
* 관리자만 접근 허용(RLS + 서버 가드)

---

## 3.6 블로그 포스트 CMS(Admin)

* 생성/수정/삭제
* draft/published 상태
* publish 시 published_at 자동 설정
* 커버 이미지 업로드/선택(OCI)
* Markdown 본문 편집

---

## 3.7 외부 글/북마크 등록(Admin)

* URL 입력
* 서버에서 OG 파싱 수행
* 결과 저장(캐시):

    * og_title, og_description, og_image_url, source_site
* 관리자가 파싱 결과를 수정 가능
* type 선택: external / bookmark

---

## 3.8 이미지 업로드(OCI)

* 관리자만 업로드 가능
* 업로드 성공 시 URL 반환
* 사용처:

    * 포트폴리오 프로젝트 썸네일/이미지
    * 블로그 커버/본문 이미지

---

# 4. 데이터 모델(개념)

## 4.1 `content_items` (블로그 통합)

* 이전 명세 그대로( post/external/bookmark )

## 4.2 `portfolio_pages` 또는 `portfolio_sections` (랜딩 섹션)

* section_key (hero/about/skills/links 등)
* content_json (섹션별 구조 JSON)
* updated_at

## 4.3 `portfolio_projects`

* title, excerpt, description
* stack_tags(text[])
* thumbnail_url
* links(json)
* pinned, sort_order
* created_at/updated_at

## 4.4 `portfolio_experiences`

* org, role, start/end
* bullets(text[])
* sort_order
