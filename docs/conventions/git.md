# Git Conventions

아래 규칙은 커밋 메시지의 **구조/타입/작성 방식**에 대한 기준입니다.

## Branches
- Default branch: `main`
- Branch naming: `{type}/{short-description}`
  - Types: `feature`, `fix`, `chore`, `docs`, `refactor`, `hotfix`
  - Example: `feature/auth-flow`

## Commit Message Format
```
{type}: {subject}

{body}

{footer}
```
- **Type**: 커밋 목적을 나타내는 태그
- **Subject**: 50자 이내, 현재형, 마침표 없이 작성
- **Body**(선택): 한 줄 72자 이내, What/Why 중심 (코드 상세는 지양)
- **Footer**(선택): `{Type}: {이슈 ID}` 형식 + 이슈 트래커 키워드 (Fixes/Resolves/Ref/Related to)

### Commit Types
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 작성/수정
- `style`: 포맷/세미콜론 등 스타일 변경
- `refactor`: 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드/도구/설정 변경

### Writing Notes
- 일관성 유지: 팀 내 합의된 규칙을 지속적으로 따르기
- 변경 사항 명확화: 커밋 메시지만으로 변경 내용을 파악 가능하게 작성
- 이슈 추적 용이: 이슈 트래커 ID를 포함해 변경 사항과 이슈 연결
- 가독성 향상: 간결하고 명확한 메시지로 협업 효율 개선

### Examples
```
feat: add sms classification endpoint
```

```
fix: prevent duplicate auth token refresh

Handle race condition in auth refresh flow by debouncing requests.
```

```
chore: update gradle wrapper

Fixes: #12 Related to: #8, #9
```

## PRs / Merges
- Prefer small, focused PRs
- Link related issues or tickets if available
- Include brief test notes in the PR description

## Repo Hygiene
- Do not commit secrets or credentials
- Keep generated artifacts out of git (see `.gitignore`)
