# Skill Registry

<!-- gentle-ai:skill-registry-contract -->
This registry indexes available skills by their triggers and paths. Delegator agents use this index to locate and load relevant skill instructions.
<!-- /gentle-ai:skill-registry-contract -->

| Skill | Trigger / Description | Scope | Path |
| --- | --- | --- | --- |
| branch-pr | Create Gentle AI pull requests with issue-first checks. Trigger: creating, opening, or preparing PRs for review. | global | /home/haku/.gemini/skills/branch-pr/SKILL.md |
| chained-pr | Trigger: PRs over 400 lines, stacked PRs, review slices. Split oversized changes into chained PRs that protect review focus. | global | /home/haku/.gemini/skills/chained-pr/SKILL.md |
| cognitive-doc-design | Design docs that reduce cognitive load. Trigger: writing guides, READMEs, RFCs, onboarding, architecture, or review-facing docs. | global | /home/haku/.gemini/skills/cognitive-doc-design/SKILL.md |
| comment-writer | Write warm, direct collaboration comments. Trigger: PR feedback, issue replies, reviews, Slack messages, or GitHub comments. | global | /home/haku/.gemini/skills/comment-writer/SKILL.md |
| go-testing | Trigger: Go tests, go test coverage, Bubbletea teatest, golden files. Apply focused Go testing patterns. | global | /home/haku/.gemini/skills/go-testing/SKILL.md |
| issue-creation | Create Gentle AI issues with issue-first checks. Trigger: creating GitHub issues, bug reports, or feature requests. | global | /home/haku/.gemini/skills/issue-creation/SKILL.md |
| judgment-day | Trigger: judgment day, dual review, adversarial review, juzgar. Run blind dual review, fix confirmed issues, then re-judge. | global | /home/haku/.gemini/skills/judgment-day/SKILL.md |
| react-19 | React 19 patterns with React Compiler. Trigger: When writing React components - no useMemo/useCallback needed. | global | /home/haku/.gemini/skills/react-19/SKILL.md |
| skill-creator | Trigger: new skills, agent instructions, documenting AI usage patterns. Create LLM-first skills with valid frontmatter. | global | /home/haku/.gemini/skills/skill-creator/SKILL.md |
| skill-improver | Trigger: improve skills, audit skills, refactor skills, skill quality. Audit and upgrade existing LLM-first skills. | global | /home/haku/.gemini/skills/skill-improver/SKILL.md |
| skill-registry | Trigger: update skills, skill registry, actualizar skills, after skill changes. Index available skills by trigger and path. | global | /home/haku/.gemini/skills/skill-registry/SKILL.md |
| typescript | TypeScript strict patterns and best practices. Trigger: When writing TypeScript code - types, interfaces, generics. | global | /home/haku/.gemini/skills/typescript/SKILL.md |
| work-unit-commits | Plan commits as reviewable work units. Trigger: implementation, commit splitting, chained PRs, or keeping tests and docs with code. | global | /home/haku/.gemini/skills/work-unit-commits/SKILL.md |
