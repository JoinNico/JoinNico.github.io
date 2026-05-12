# Git 提交与 Merge Request 流程说明

本文档用于说明公司当前最小 Git 提交流程：本地修改代码、创建功能分支、提交 signed commit、推送远程分支，并在 GitLab 创建 Merge Request。

适用场景：

- u-boot、tps-imager 等公司内部 GitLab 仓库
- 单人开发一个功能、修复或移植任务
- 需要通过 Merge Request 进入主开发分支的代码变更

## 提交前原则

提交前先确认以下几点：

- 不直接在 `main`、`master` 或主开发分支上提交业务修改。
- 每个任务使用一个独立分支。
- 一个 commit 尽量只表达一个清晰目的。
- 提交信息要说明“改了什么、为什么改、如何验证”。
- 涉及贡献协议或内核/u-boot 风格仓库时，使用 `git commit -s` 添加 `Signed-off-by`。
- 推送后通过 GitLab 创建 Merge Request，由审核人 review 后合并。


## 标准提交流程



```bash
# 进入仓库目录：
cd /path/to/repo

# 查看当前状态：
git status
git branch

# 从当前提交创建并切换到新分支：
git checkout -b uboot_xxx

# 查看修改内容：
git status
git diff

# 添加所有修改、新增、删除文件：
git add .

# 确认暂存区内容：
git status
git diff --staged

# 提交代码，并自动添加 `Signed-off-by`：
git commit -s

# 推送当前分支到远程仓库，并建立本地分支与远程分支的跟踪关系：
git push --set-upstream origin uboot_xxx

# 之后同一个分支再次推送时，可以直接执行：
git push
```

说明：
- `git add .` 会先把当前目录下所有修改、新增、删除文件加入暂存区。
- `git checkout -b uboot_xxx` 会基于当前提交创建新分支，并切换过去。
- 暂存区内容会跟随切换后的新分支，因此后续 `git commit -s` 会提交到新分支。
- 为了避免误把无关文件加入暂存区，更推荐先 `git status` 和 `git diff` 检查，再执行 `git add .`。

## Commit Message 标准

提交信息推荐结构：

```text
<scope>: <short summary>

<why this change is needed>
<what this change does>
<how it was tested>

Signed-off-by: Your Name <your.email@example.com>
```

第一行要求：

- 简短明确，建议不超过 72 个字符。
- 使用英文小写开头的模块名或范围，例如 `board`、`drivers`、`config`、`tps`。
- 说明实际动作，不写空泛描述。

示例：

```text
board: add initial support for ra6530

Add the initial board configuration, device tree and default
environment needed to boot RA6530 from the standard TPS image flow.

Tested by building u-boot and booting the board from SD card.

Signed-off-by: Yunhao Gu <yunhao.gu@intchains.com>
```

常见 scope 示例：

```text
board: add initial support for xxx
config: enable xxx feature
drivers: fix xxx timeout handling
image: update TPS image list
build: add packaging script
docs: add submit workflow
```

## 使用 AI 辅助写 Commit

AI 可以帮助整理 commit message，但不要让 AI 替你决定技术事实。提交前必须人工确认内容准确。

推荐先查看暂存区 diff：

```bash
git diff --staged
```

把 diff 或修改摘要发给 AI，并使用类似提示词：

```text
请根据下面的 git diff 帮我写一个符合公司 Git 提交规范的英文 commit message。

要求：
- 第一行使用 "<scope>: <summary>" 格式
- 说明为什么改、改了什么、如何测试
- 语言使用英文
- 不要虚构测试结果
- 不要包含 Signed-off-by 行，因为我会使用 git commit -s 自动生成

Diff:
<粘贴 git diff --staged 输出>
```

如果代码或业务内容涉及公司敏感信息，不要把完整代码粘贴到外部 AI 工具。可以只提供文件列表和人工摘要：

```text
修改文件：
- board/xxx/xxx.c
- configs/xxx_defconfig
- arch/arm/dts/xxx.dts

修改摘要：
- 新增 xxx 单板初始化配置
- 启用 eMMC 和 USB 启动支持
- 调整默认环境变量

测试情况：
- 已执行 make xxx_defconfig
- 已执行 make -j8
- 已在 RA6530 板卡上验证启动成功

请帮我生成 commit message。
```

AI 生成后，人工检查：

- 是否准确描述了真实修改。
- 是否包含没有执行过的测试。
- 是否泄露内部信息。
- 第一行是否清晰。
- body 是否解释了必要背景。

## GitLab Merge Request 流程

推送成功后，登录 GitLab 对应仓库。

创建 Merge Request：

- 点击页面提示中的 `Create merge request`。
- 或进入左侧 `Merge Requests`，点击 `New merge request`。

选择分支：

- Source branch：刚推送的功能分支，例如 `uboot_xxx`。
- Target branch：主开发分支，通常是 `main`、`master` 或项目指定开发分支。

填写 MR 标题：

```text
board: add initial support for ra6530
```

填写 MR 描述：

```text
## Summary
- Add initial support for RA6530 board.
- Enable required boot and storage configuration.
- Add default environment settings for TPS image flow.

## Test
- make ra6530_defconfig
- make -j8
- Booted RA6530 board from SD card successfully.

## Notes
- No known compatibility impact on existing boards.
```

指定审核人后提交 MR。

## 提交前自检清单

提交前检查：

- `git status` 只包含本次任务相关文件。
- `git diff --staged` 已人工确认。
- 没有提交编译产物、临时文件、日志、私钥、账号密码。
- commit message 清晰说明了修改目的。
- 使用了 `git commit -s`。
- 本地至少执行过必要的构建或测试。

MR 前检查：

- 分支名清楚。
- MR 标题与 commit 第一行风格一致。
- MR 描述包含 Summary 和 Test。
- 目标分支选择正确。
- 已指定审核人。

## 常用命令速查

```bash
git status
git branch
git checkout -b uboot_xxx
git diff
git add .
git diff --staged
git commit -s
git push --set-upstream origin uboot_xxx
git push
```

查看最近提交：

```bash
git log --oneline --decorate --graph -10
```

查看当前分支对应远程：

```bash
git branch -vv
```

撤销暂存但保留文件修改：

```bash
git restore --staged .
```

放弃某个文件的本地修改：

```bash
git restore path/to/file
```

删除本地功能分支：

```bash
git branch -d uboot_xxx
```

删除远程功能分支：

```bash
git push origin --delete uboot_xxx
```
丢弃所有已跟踪文件的修改
repo forall -c 'git reset --hard HEAD'	

删除未跟踪的文件和目录
repo forall -c 'git clean -fd'	

更彻底，包括忽略文件（如 .gitignore 中的）
repo forall -c 'git clean -fdx'	

将每个仓库切换到 manifest 指定的版本
repo sync -d	