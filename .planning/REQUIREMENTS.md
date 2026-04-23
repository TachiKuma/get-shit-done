# Requirements: GSD-CN 中文发行版基线 v2.0

**Defined:** 2026-04-23
**Last updated:** 2026-04-23
**Milestone:** v2.0 GSD-CN 中文发行版基线
**Status:** Phase 19 complete; all 7 requirements covered
**Core Value:** 中文用户可以直接使用默认简体中文的 `GSD-CN`，同时保持与上游 GSD 的行为一致性和共存能力

## v2.0 Requirements

### Product Identity

- [x] **CN-01**: 项目必须以 `GSD-CN` 作为唯一主线定位，对外明确表述为上游 `get-shit-done` 的非官方简体中文发行版
  - **Current:** `.planning` 主线仍保留大量“多语言本地化框架”叙事
  - **Target:** 活跃规划、README 方向与后续 phase 均以 `GSD-CN` 中文发行版定位展开
  - **Acceptance:** 活跃 `.planning` 文档存在一致的 `GSD-CN` 主线表述，且不再把“多语言本地化框架”作为当前唯一目标

- [x] **CN-02**: 第一阶段只承诺 `zh-CN` 中文发行版，其他语言支持必须明确延后
  - **Current:** 历史文档仍围绕 `en + zh-CN` 与其他 locale 的框架性治理展开
  - **Target:** 活跃 requirements、roadmap 与后续 phase 明确把 `zh-CN` 作为第一阶段唯一发行承诺
  - **Acceptance:** 活跃规划文档中对 `ja-JP` / `ko-KR` / `pt-BR` 的支持均被标记为 deferred 或 out of scope

### Namespace and Surface

- [x] **CN-03**: 所有用户可见入口必须统一切换到 `gsdcn` 前缀
  - **Current:** 用户可见入口仍以 `gsd-*` / `$gsd-*` 为主
  - **Target:** 命令、skills、workflows、tools、安装入口、文档示例与生成产物引用全部采用 `gsdcn` 前缀
  - **Acceptance:** Phase 验收时存在完整的用户可见入口清单，并确认上述表面全部已迁移到 `gsdcn` 前缀

### Compatibility and Coexistence

- [x] **CN-04**: 官方 `GSD` 与 `GSD-CN` 必须支持同机共存且互不覆盖
  - **Current:** 尚未定义共存隔离规则与覆盖边界
  - **Target:** 两套安装产物可在同一台机器上共存，不发生命令、配置或安装内容互相覆盖
  - **Acceptance:** 定义并验证安装级共存契约，确认官方 GSD 与 GSD-CN 可同时存在且互不破坏

- [x] **CN-05**: 官方 `GSD` 与 `GSD-CN` 必须支持同仓库/同工作区切换使用
  - **Current:** 尚未定义工作区级共存与切换行为
  - **Target:** 同一仓库内可明确切换调用官方 GSD 或 GSD-CN，而不造成规划或运行时歧义
  - **Acceptance:** 定义并验证工作区级切换契约，确认两套命令都可被明确调用

- [x] **CN-06**: 除显示文案、注释、默认语言、命令前缀外，其余行为必须与上游保持一致
  - **Current:** 尚未为新主线明确行为兼容性的硬边界
  - **Target:** 中文化只作用于显示层与命名空间层，不引入功能、流程或行为分叉
  - **Acceptance:** 活跃 spec、context 与后续 plan 中均把行为差异限定在允许列表内；任何超出项都被视为越界

### Delivery

- [x] **CN-07**: 第一阶段必须提供独立于官方原版的中文安装方式与差异说明
  - **Current:** 尚未定义 `GSD-CN` 的独立安装入口与中文 README 差异说明结构
  - **Target:** 用户可以基于中文文档完成安装，并清楚理解 `GSD-CN` 与官方原版的关系、差异与兼容边界
  - **Acceptance:** 活跃规划明确包含独立安装方式与 `README.md` 差异说明作为交付物

---

## Deferred / Out of Scope

| Item | Status | Reason |
|------|--------|--------|
| `ja-JP` / `ko-KR` / `pt-BR` 的同步发行 | Deferred | 第一阶段只承诺 `zh-CN` |
| 对上游功能行为做增强或产品级分叉 | Out of scope | 当前定位是兼容层，不是独立功能 fork |
| CCB 深度特化实施 | Deferred | 仅作为后续 roadmap item 记录 |
| 无必要的内部结构重构 | Out of scope | 与低冲突维护上游兼容层目标冲突 |
| 向上游仓库提交 PR | Out of scope | 当前项目定位为非官方发行版 |

## Traceability

| Requirement | Planned Phase | Status |
|-------------|---------------|--------|
| CN-01 | Phase 19 | Complete |
| CN-02 | Phase 19 | Complete |
| CN-03 | Phase 19 | Complete |
| CN-04 | Phase 19 | Complete |
| CN-05 | Phase 19 | Complete |
| CN-06 | Phase 19 | Complete |
| CN-07 | Phase 19 | Complete |

**Coverage:**
- v2.0 requirements: 7 total
- Complete: 7
- Pending: 0

## Notes on Changed Requirements

- v2.0 是项目主线重定义，不是对 v1.3 evidence-gap 的延续修补
- v1.0-v1.2 的已交付本地化与兼容基础继续保留并复用，但不再作为当前主线叙事中心
- v1.3 的证据链补齐工作被保留为 superseded context，不阻止 `GSD-CN` 新主线继续向前推进

---

*Requirements rewritten: 2026-04-23 for v2.0 GSD-CN baseline*
