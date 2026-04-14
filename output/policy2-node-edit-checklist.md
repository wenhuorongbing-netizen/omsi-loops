# Policy 2 逐节点改稿清单

源文件：`lang/en-EN/game.xml`

## 执行范围

- 只改英文母稿的叙事层；中文本地化在英文定稿后同步。
- 不动数值、条件、顺序、奖励、解锁、资源公式。
- 本轮目标是统一化精修，不是推翻现有剧情母版。
- 所有改动都要回答一句话：这段文本在世界观上补了什么，在玩家理解上减了什么噪音？

## 生产与校对规则

- 生产顺序：`P0 主干分支 -> P1 Startington/Jungle 体系化 -> P2 Valhalla/Commerceville 对位化 -> P3 终局与尾声`
- 校对顺序：`世界逻辑校对 -> 区域文风校对 -> 机制语义校对 -> 长度与可读性校对 -> 本地化一致性校对`
- Tooltip 统一写法：`这是什么 -> 它在世界里意味着什么 -> 一句机制语义`
- 失败文案统一避免：`你不够好`、`你失败了`
- Valhalla 禁用词：`真正的归宿`、`最终认可`、`唯一正确`
- Startington 禁用词：`堕落`、`报应`、`失败路线`、`坏结局`
- Commerceville 禁用词：`纯罪恶都市`
- 终局禁用词：`天选`、`命中注定`

## 文风锚点

- `talk_to_witch`：允许危险知识显得老练、具体、像世界经验，不写廉价黑魔法。
- `guru`：保留高处视角、探索者口吻、非官方通道的可信感。
- `meander` `story_7-9`：锁为 Startington 身份母版，只做同逻辑扩写。
- `mana_well` `story_1`：锁为“残余系统节点”母版。
- `the_spire` `tooltip` `story_1`：锁为“废墟转攀升机器”母版。
- `journey_forth` `story_1`：锁为“未被许可的地图”母版。

## 建议术语表 v0

| English | 英文母稿语义 | 中文建议 |
| --- | --- | --- |
| Judgement | 体系对人的归属判定，不是考试合格 | `归属判定`、`判定归属` |
| Recognition | 被体系命名、接纳、记录 | `接纳`、`承认` |
| Blessing | 被高位秩序合法回应的超越 | `赐福`、`神恩` |
| Sacrifice | 主动失去，以换取杠杆或回应 | `献祭`、`技术性失去` |
| Underworld | 礼貌地图不承认但始终存在的路线 | `冥府捷径`、`地下渡路` |
| Rift | 不稳定撕裂，危险捷径 | `裂隙` |
| Portal | 成熟可控的通路 | `传送门`、`稳定通道` |
| Trial | 某体系如何验证、组织、分配你 | `试炼`、`试场` |
| Worth | 可被尊敬、可被记录、可被利用的价值 | `价值`、`分量` |
| Order | 可被维持、记录、征收、分配的秩序 | `秩序` |
| Ruin | 仍在运转的残骸，不是空洞废墟 | `废墟`、`残骸` |
| Salvage | 从旧系统里回收仍可用之物 | `回收`、`打捞` |
| Residue | 被抽干后仍残留的系统痕迹 | `残余`、`余留物` |

## 叙事总表

### P0 主干分支

| ID | 区域 | 行动 | 文本层级 | 阶段结构 | 叙事功能 | 当前问题 | 目标效果 | 必须保留信息 | 禁止剧透点 | 对位节点 | 修改优先级 | 校对状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `story_num_0` | 开场 | Global Story 0 | 章节文本 | 第一次接触写陌生 | 起点异常 | 重点仍偏事故说明，日常被刺穿的反差还不够强 | 先立普通人，再立循环异常 | courier、眼镜碎、液体、mana 枯竭触发 loop | 不提前暗示天选或神明安排 | `meet_people`、`heal_the_sick` | P0 | 待改 |
| `meet_people` | Beginnersville | Meet People | tooltip、story_1-6 | 陌生 -> 熟练 -> 内化 | 分支前兆 | 多元价值已出现，但缺第一颗分支种子的收束句 | 让玩家尽早知道“值得尊敬”不止一种标准 | useful、trustworthy、liked 的分化 | 不提前点名 Valhalla、Startington | `warrior_lessons`、`mage_lessons` | P0 | 待统一 |
| `warrior_lessons` | Beginnersville | Warrior Lessons | tooltip、story_1-6 | 陌生 -> 熟练 -> 内化 | 价值位移 | 秩序语义已在，但还像单纯战斗成长 | 强化纪律、承担、维持秩序的价值语义，同时不写成唯一正道 | Iron、纪律、重复受试 | 不写成唯一正确道路 | `mage_lessons`、`face_judgement` | P0 | 待统一 |
| `mage_lessons` | Beginnersville | Mage Lessons | tooltip、story_1-7 | 陌生 -> 熟练 -> 内化 | 方法变化 | 合法越界感已在，但“另一种强大”还可以更明确 | 让洞察、越界、技巧成为可尊敬的方法论 | observation、interpretation、cross-discipline | 不把法师路线写成邪门旁门 | `warrior_lessons`、`wizard_college` | P0 | 待统一 |
| `heal_the_sick` | Beginnersville | Heal The Sick | tooltip、story_1-6 | 陌生 -> 熟练 -> 内化 | 世界提示 | “感激”和“被注意”已分开，但需更稳定地贯穿层级 | 建立善行与高层回应不是同一套计量 | gratitude、reputation、stranger powers notice | 不提前说明谁在注意你 | `seek_blessing`、`dark_sacrifice` | P0 | 待统一 |
| `talk_to_hermit` | Forest Path | Talk To Hermit | tooltip、story_1-7 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 世界提示 | 40% 节点已说出核心，但前后层级文风还未完全跟上 | 用隐喻把“世界不用一把尺子量所有人”说出口 | 道路、边界、山会问不同问题 | 不提前公开双分支结构 | `talk_to_witch`、`climb_mountain` | P0 | 待统一 |
| `talk_to_witch` | Forest Path | Talk To Witch | tooltip、story_1-8 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 分支前兆 | 母版已强，但 50%-80% 需要更稳定地服务“某些门不为循规蹈矩者开” | 把禁忌知识写成世界经验，不写成反社会姿态 | bargains、taboos、doors for the dutiful | 不把 Startington 说成惩罚 | `talk_to_hermit`、`dark_magic` | P0 | 锚点锁定 / 待补中段 |
| `dark_magic` | Forest Path | Dark Magic | tooltip、story_1-4 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 价值位移 | 已有 trespass 语义，但四阶段结构未完全稳定 | 固定为好奇、试探、掌控、价值位移 | reputation 下降、shadow realm、taking rather than asking | 不把它写成廉价邪恶快感 | `mage_lessons`、`totem` | P0 | 待补层 |
| `dark_ritual` | Forest Path | Dark Ritual | tooltip、story_1-5 | 熟练 -> 内化 -> 世界观反照 | 方法变化 | 已接近目标，需统一 transactional rather than rewarding 语义 | 把仪式写成合同、交易、失去换杠杆 | soulstones、blood、contract、credit exhausted | 不写成爽文式堕落快感 | `seek_blessing`、`dark_sacrifice` | P0 | 待统一 |
| `read_books` | Merchanton | Read Books | tooltip、story_1-5 | 陌生 -> 熟练 -> 内化 | 分支前兆 | 童书与阅读成长感很强，但“历史如何记人”还可更尖锐 | 借历史与故事提前埋下多资格并存 | myths、chronicles、travelogues disagree | 不提前明说山上分流标准 | `meet_people`、`decipher_runes` | P0 | 待统一 |
| `underworld` | Merchanton | Underworld | tooltip、story_1 | 第一次接触写陌生 -> 世界观反照 | 文明对位 | 文本已对，但仍可更明确其对 Valhalla 合法性的反讽 | 让玩家意识到隐秘路线一直存在，只是被体面秩序省略 | ferryman、coins、known omission、to Commerceville | 不剧透 Commerceville 全貌 | `face_judgement`、`town7` | P0 | 待统一 |
| `climb_mountain` | Mt. Olympus | Climb Mountain | tooltip、story_1-7 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 世界提示 | tooltip 已转向“结构会读你”，前段 story 仍偏普通登山 | 把登山从地理移动改成接近会分类你的结构 | ruins、altar、being sorted | 不提前揭示判定结果 | `face_judgement`、`guru` | P0 | 待统一 |
| `decipher_runes` | Mt. Olympus | Decipher Runes | tooltip、story_1-8 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 文明对位 | 记忆与历史已在，但矛盾评价体系还不够显性 | 让同一座山同时保存互相矛盾却成立的标准 | stories、magic manuals、do not let us be forgotten | 不直接讲分支门槛 | `read_books`、`check_walls` | P0 | 待改 |
| `check_walls` | Mt. Olympus | Check Walls | tooltip、story_1-8 | 陌生 -> 熟练 -> 内化 | 文明对位 | 现稿偏探宝与抱怨，铭文式分化表达不足 | 补出“高处召见、深处收留”的镜像感 | hidden alcoves、glowing liquid、illusion logic | 不剧透 Startington 明线 | `face_judgement`、`the_spire` | P0 | 待改 |
| `guru` | Mt. Olympus | Guru | tooltip、story_1 | 世界观反照 | 方法变化 | 母版已成立，只缺与 `face_judgement` 的衔接句 | 保持高质量锚点，只补“不是只有 altar 一条门” | explorers、invisible gateway、gods were explorers | 不贬低 altar 路线 | `face_judgement`、`guided_tour` | P0 | 锚点锁定 / 待衔接 |
| `face_judgement` | Mt. Olympus | Face Judgement | tooltip、story_1-4 | 陌生 -> 世界观反照 | 文明对位 | story 已较准，但 tooltip 与结果层级还可更统一成“归属判定” | 从合格/失败彻底改为“被何种体系接纳或未回应” | altar、recognized by gods、answered from below、met with silence | 不提前透露下路细节 | `guru`、`dead_trial` | P0 | 待统一 |

### P1 Startington / Jungle

| ID | 区域 | 行动 | 文本层级 | 阶段结构 | 叙事功能 | 当前问题 | 目标效果 | 必须保留信息 | 禁止剧透点 | 对位节点 | 修改优先级 | 校对状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `story_num_7` | 转场 | Global Story 7 | 章节文本 | 第一次接触写陌生 | 区域身份 | 已去掉惩罚论，但仍可更快立“仍在运转的文明残骸” | 首段就取消 dumping pit 误读 | red sky、familiar road、spire、kept functioning | 不把下路写成失败结局 | `town5`、`meander` | P1 | 待统一 |
| `town5` | Startington | 区域描述 | 区域描述 | 第一次接触写陌生 | 区域身份 | 已接近目标，只需统一整体术语 | 固定 Startington = salvage、residue、unwelcome rules | once familiar place、spire、ten beams、salvage | 不回退成 shadow realm = dark place | `meander`、`the_spire` | P1 | 锚点统一 / 待复核 |
| `meander` | Startington | Meander | tooltip、story_1-9 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 区域身份 | 核心母版已成，后续新增层级需避免跑偏 | 锁定“学会读懂废墟如何继续运转” | market street、economy、replacement order | 不把它写成单纯乱逛 | `guided_tour`、`explore_jungle` | P1 | 锚点锁定 / 待延续 |
| `mana_well` | Startington | Mana Well | tooltip、story_1-4 | 陌生 -> 熟练 -> 内化 | 方法变化 | 母版已强，后续只需延续“残余流量”逻辑 | 把采集写成从被抽干 infrastructure 抢回剩余流量 | ley line、acrid residue、siphoning to Spire、timing matters | 不写成天然馈赠点 | `mana_geyser`、`invest` | P1 | 锚点锁定 / 待延续 |
| `destroy_pylons` | Startington | Destroy Pylons | tooltip、story_1-3 | 陌生 -> 熟练 -> 内化 | 方法变化 | 方向正确，但 story 层级可再强调“拆旧神 infrastructure” | 永远不是纯破坏，而是拆继承下来的约束机器 | stabilizers、inherited infrastructure、outer locks | 不写成纯反抗爽点 | `tidy_up`、`build_tower` | P1 | 待统一 |
| `raise_zombie` | Startington | Raise Zombie | tooltip、story_1-4 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 文明对位 | 已有 labor reserve 语义，但和活人社会结构的镜像还可更清楚 | 升级成“死者劳动体系”并与组队/营地形成对位 | cemetery、labor reserve、inventory、army/workforce blur | 不写成中二召唤术 | `gather_team`、`rescue_survivors` | P1 | 待统一 |
| `purchase_supplies` | Startington | Purchase Supplies | tooltip、story_1 | 第一次接触写陌生 | 区域身份 | 现稿较准，但经济面还可再铺一点城市感 | 明确走私、回收、旧库存、死地贸易 | salvage market、scarcity pricing、ruin economy | 不写成单一黑市奇观 | `collect_taxes`、`invest` | P1 | 待补层 |
| `dark_sacrifice` | Startington | Dark Sacrifice | tooltip、story_1-3 | 陌生 -> 熟练 -> 内化 | 方法变化 | 已接近目标，但每层都要落回“失去是一种技术” | 让 sacrifice 与 Startington 生存技术绑定 | loss as technique、dark gods closer、transactional | 不只写祭祀氛围 | `dark_ritual`、`seek_blessing` | P1 | 待统一 |
| `the_spire` | Startington | The Spire | tooltip、story_1-6 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 区域身份 | 母版已成立，后续要防止退回普通爬塔 | 固定“把废墟剩余物转成攀升可能的机器” | leftovers into ascent、central machine、door maze | 不写成奖杯塔 | `heroes_trial`、`build_tower` | P1 | 锚点锁定 / 待延续 |
| `dead_trial` | Startington | Dead Trial | tooltip、story_1-3 | 陌生 -> 熟练 -> 世界观反照 | 文明对位 | 当前已对，但与 Heroes Trial 的文明镜像仍可更显性 | 强化“组织被废弃之物”的试炼性质 | necropolis as process、zombie-only model、calibrated dead | 不写成恶趣味墓地本 | `heroes_trial`、`face_judgement` | P1 | 待统一 |
| `journey_forth` | Startington | Journey Forth | tooltip、story_1 | 第一次接触写陌生 -> 世界观反照 | 方法变化 | 母版已对，后续只需统一“非许可道路”语义 | 明确离开方式是沿被遗弃地图继续前进 | survivors、smugglers、re-opened route | 不写成普通 travel action | `open_portal`、`escape` | P1 | 锚点锁定 / 待延续 |
| `story_num_8` | 转场 | Global Story 8 | 章节文本 | 第一次接触写陌生 | 区域身份 | 已写成 Startington 外溢，但还可更集中到同一主题 | 定义 Jungle = Startington 逻辑向野外蔓延 | trader、ruined walls、refugee-animal paths | 不开全新主题 | `town6`、`explore_jungle` | P1 | 待统一 |
| `town6` | Jungle Path | 区域描述 | 区域描述 | 第一次接触写陌生 | 区域身份 | 文本已强，重点是不要被后续节点拉回纯野区 | 固定 Jungle 为 borderland、feral route、survivor-made world | ruins、survivor camps、paths close | 不写成纯怪物区 | `story_num_8`、`totem` | P1 | 锚点统一 / 待复核 |
| `explore_jungle` | Jungle | Explore Jungle | tooltip、story_1-8 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 区域身份 | 已接近目标，但“路径会自我闭合”需更稳定贯穿 | 让玩家体感世界主动排斥离开者 | self-closing paths、survivors、totem clearing | 不把它写成普通探图 | `open_portal`、`underworld` | P1 | 待统一 |
| `fight_jungle_monsters` | Jungle | Fight Jungle Monsters | tooltip、story_1-10 | 陌生 -> 熟练 -> 内化 | 方法变化 | 已摆脱英雄征伐，但结尾还可更明确环境压力 | 强化领地冲突、环境敌意、系统性围猎 | siege pressure、territorial governance、repurposed ruin | 不写英雄狩猎成就感 | `fight_frost_giants`、`rescue_survivors` | P1 | 待统一 |
| `rescue_survivors` | Jungle | Rescue Survivors | tooltip、story_1-3 | 陌生 -> 熟练 -> 内化 | 价值位移 | 方向已对，可再明确“这条线也会重组活人” | 证明暗线不只会使用死者，也会重建共同体 | find、help、assure、camp becomes community | 不写成单次善举插曲 | `raise_zombie`、`prepare_buffet` | P1 | 待统一 |
| `prepare_buffet` | Jungle | Prepare Buffet | tooltip、story_1-5 | 陌生 -> 熟练 -> 内化 | 价值位移 | 黑色幽默已削弱，但“临时丰饶仪式”还可更聚焦 | 让废墟路线第一次出现共同体仪式感 | brief shared feast、camp expects tomorrow | 不写成单纯恶搞吃人/血包梗 | `great_feast`、`rescue_survivors` | P1 | 待统一 |
| `totem` | Jungle | Totem | tooltip、story_1-4 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 文明对位 | 已有本地知识感，但与学院的系统对位还可更明晰 | 建立地方性、经验性、有效但不体面的知识体系 | knowledge hammered into shape、living tradition | 不神化成万能神器 | `wizard_college`、`dark_magic` | P1 | 待统一 |
| `open_rift` | Cross-route | Open Rift | tooltip、story_1 | 第一次接触写陌生 | 方法变化 | 仍偏旧写法，危险捷径技术树的第一段不够清楚 | 写成不稳定撕裂与粗暴接通 | Startington shortcut、cannot carry supplies、tear reality | 不写成高阶便利功能 | `open_portal`、`underworld` | P1 | 待改 |
| `open_portal` | Cross-route | Open Portal | tooltip、story_1 | 熟练 -> 内化 | 方法变化 | tooltip 已有成长性，story 还需补“成熟掌控” | 和 `open_rift` 构成危险技术成熟链 | weak barrier grove、repeatable exit、safer not free | 不写成零成本传送 | `open_rift`、`spatiomancy` | P1 | 待补层 |

### P2 Valhalla / Commerceville

| ID | 区域 | 行动 | 文本层级 | 阶段结构 | 叙事功能 | 当前问题 | 目标效果 | 必须保留信息 | 禁止剧透点 | 对位节点 | 修改优先级 | 校对状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `story_num_6` | 转场 | Global Story 6 | 章节文本 | 第一次接触写陌生 | 区域身份 | 已从成功结局退开，但还可更早指出制度化分类 | 写成被制度承认的文明，而非最终奖赏区 | forms、bureaucrat god、categorized welcome | 不写“终于到正确路线” | `story_num_7`、`guided_tour` | P2 | 待统一 |
| `story_num_10` | 转场 | Global Story 10 | 章节文本 | 第一次接触写陌生 | 区域身份 | 现稿仍偏旧版导游冒险文本，尚未承担 Commerceville 的主题第一印象 | 抵达时就写出“有秩序的抽取系统”与合法外观 | city gates、guide、tax collectors、bank | 不写成单纯新城开图 | `town7`、`invest` | P2 | 待改 |
| `town4` | Valhalla | 区域描述 | 区域描述 | 第一次接触写陌生 | 区域身份 | 已较准，后续需要给维护成本留足接口 | 固定“识别、命名、投入使用”的城市身份 | citizenship、blessing、rank、reputation administered | 不写真正归宿 | `guided_tour`、`seek_citizenship` | P2 | 待统一 |
| `guided_tour` | Valhalla | Guided Tour | tooltip、story_1-9 | 陌生 -> 熟练 -> 内化 | 区域身份 | 仍残留“完美城市观光”基调，治理感和记录感不足 | 展示 Valhalla 如何把人转成公共身份 | tours、beautification code、city hall、upper class access | 不写成仙境介绍册 | `meander`、`canvass` | P2 | 待改 |
| `canvass` | Valhalla | Canvass | tooltip、story_1-6 | 陌生 -> 熟练 -> 内化 | 世界提示 | 现稿有趣但偏散，公共身份与治理网络尚未收束 | 展示慈善、预算、规训如何构成城市纹理 | charity, beautification fund, city hall | 不剧透 Commerceville 的反面镜子 | `collect_taxes`、`seminar` | P2 | 待改 |
| `seek_citizenship` | Valhalla | Citizenship | tooltip、story_1-6 | 陌生 -> 熟练 -> 内化 | 世界提示 | 方向已对，但要更稳地服务“被记录与被治理” | 让 citizenship 成为公共身份入编而非奖章 | exam、history/law/culture、plaque、rights and obligations | 不写最终认可 | `face_judgement`、`dead_trial` | P2 | 待统一 |
| `wizard_college` | Valhalla | Wizard College | tooltip、story num 1-13 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 文明对位 | 现稿很强，但需要更明确承接 Totem/Dark Magic/The Spire | 构成制度化知识与其他知识体系的对位中心 | tuition、duels、ranked advancement、all schools of magic | 不新增学院外 lore 支线 | `totem`、`dark_magic`、`the_spire` | P2 | 待统一 |
| `seek_blessing` | Valhalla | Seek Blessing | tooltip、story_1-3 | 陌生 -> 熟练 -> 内化 | 文明对位 | 仍偏传统祈福，代价与合法性对位不够 | 与 Dark Sacrifice 平级：都以代价换超越，只是语气与合法性不同 | quiet rite、favor、battle service | 不写成白路线免费奖励 | `dark_sacrifice`、`dark_ritual` | P2 | 待改 |
| `build_housing` | Valhalla | Build Housing | tooltip、story_1-3 | 陌生 -> 熟练 -> 内化 | 世界提示 | 现稿偏施工笑话，秩序机器的维护成本不足 | 让 Valhalla 显得要靠建设、分区、维护持续运转 | architecture knowledge、rezoned blocks、repeatable house form | 不写成轻松地产致富 | `purchase_supplies`、`collect_taxes` | P2 | 待改 |
| `collect_taxes` | Valhalla | Collect Taxes | tooltip、story_1-2 | 熟练 -> 内化 | 世界提示 | 已有合法抽取感，但还可更明显接回秩序机器 | 写出秩序也靠征收、文书和强制执行维持 | obscure clause、rent ahead of schedule、bureaucracy threat | 不把住户写成纯笑料 | `invest`、`insurance_fraud` | P2 | 待改 |
| `tidy_up` | Valhalla | Tidy Up | tooltip、story_1、5-7 | 陌生 -> 熟练 -> 内化 | 区域身份 | 当前偏从 mess 读八卦，尚未回扣秩序维护成本 | 让“仙境”显出清洁、修补、恢复秩序的劳动成本 | feast aftermath、cleanup crews、patterns in refuse | 不把 Valhalla 写成单纯虚伪 | `destroy_pylons`、`prepare_buffet` | P2 | 待改 |
| `town7` | Commerceville | 区域描述 | 区域描述 | 第一次接触写陌生 | 区域身份 | 仍是旧版“阴郁逐利城市”，远未达到主题要求 | 改成有秩序的抽取系统，拆穿合法性外观 | trade hub、order, extraction, appearance of law | 不写纯罪恶都市 | `town4`、`invest` | P2 | 待改 |
| `explorers_guild` | Commerceville | Explorers Guild | tooltip、story_1-5 | 陌生 -> 熟练 -> 内化 | 世界提示 | 世界广度感强，但“探索被制度收编”还不够显 | 让探索也成为被组织、记录、发包的劳动 | maps、survey, shortcuts, guildmaster knows more | 不把探索浪漫化成纯自由 | `guru`、`guided_tour` | P2 | 待改 |
| `thieves_guild` | Commerceville | Thieves Guild | tooltip、story_1-9 | 陌生 -> 熟练 -> 内化 | 文明对位 | 仍有犯罪爽文腔，组织化镜像不够强 | 成为 Valhalla 的反面镜子：同样高效、同样把人当单位 | ranks、tests、boss、guild procedures | 不写 Robin Hood 正义剧 | `seek_citizenship`、`wizard_college` | P2 | 待改 |
| `rob_warehouse` | Commerceville | Rob Warehouse | tooltip、story_1-7 | 陌生 -> 熟练 -> 内化 | 方法变化 | 现稿偏传统 heist 升级，抽取系统语义不足 | 写成对库存、安保、物流的逆向接管 | guards、crew、auction warehouse、insured goods | 不写成单纯刺激偷窃 | `build_housing`、`collect_taxes` | P2 | 待改 |
| `insurance_fraud` | Commerceville | Insurance Fraud | tooltip、story_1-7 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 文明对位 | 主题非常接近，但仍带 Robin Hood 自我粉饰 | 让资本化秩序显成另一种抽取系统 | claims、documentation、impersonation、director folder | 不写成替天行道 | `seek_blessing`、`collect_taxes` | P2 | 待改 |
| `guild_assassin` | Commerceville | Guild Assassin | tooltip、story_1-6 | 陌生 -> 熟练 -> 内化 | 文明对位 | 现稿偏暗杀爽文，和制度镜像联系不够 | 写成高度专业化、外包化的人命处理行业 | guild dues、targets across world、brands、hearts | 不写个人复仇传奇 | `fight_frost_giants`、`gods_trial` | P2 | 待改 |
| `invest` | Commerceville | Invest | tooltip、story_1-5 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 世界提示 | 银行诡异感已强，但资本抽取逻辑还可更直接 | 把资本化秩序写成可持续抽取与记账机器 | perpetual account、sigils, contract, teller as conduit | 不剧透终局时间修复逻辑 | `mana_well`、`collect_interest` | P2 | 待统一 |
| `collect_interest` | Commerceville | Collect Interest | tooltip、story_1-4 | 熟练 -> 内化 -> 世界观反照 | 价值位移 | 规则漏洞感强，但“抽取系统”主旨还可更收束 | 让收益显得像系统自动从未来抽走价值 | soul-contracts、bank bound by rule、nobody stops you | 不写成单纯 exploit 笑话 | `invest`、`restore_time` | P2 | 待改 |
| `seminar` | Commerceville | Seminar | tooltip、story_1-4 | 陌生 -> 熟练 -> 内化 | 方法变化 | 目前更像搞笑 MLM，主题连接太弱 | 让领导术、说服术也成为可出售的抽取技能 | paid entry、attention capture、mailing list annoyance | 不写成单纯笑场段子 | `canvass`、`wizard_college` | P2 | 待改 |

### P3 终局与尾声

| ID | 区域 | 行动 | 文本层级 | 阶段结构 | 叙事功能 | 当前问题 | 目标效果 | 必须保留信息 | 禁止剧透点 | 对位节点 | 修改优先级 | 校对状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `story_num_11` | 转场 | Global Story 11 | 章节文本 | 第一次接触写陌生 | 区域身份 | 仍偏老版冒险口气，神权残响感不足 | 定义 Valley of Olympus = 神权残响，不是普通终盘地图 | no Mt. Olympus, ruined tower, challenge inscription | 不写成欢乐屠神预告 | `town8`、`build_tower` | P3 | 待改 |
| `town8` | Valley of Olympus | 区域描述 | 区域描述 | 第一次接触写陌生 | 区域身份 | 现稿过短，只到“被注视” | 补成山被挖空后仍残留神权注视的空场 | mountain-shaped hole、gods looking down | 不剧透修复时间结果 | `story_num_11`、`restore_time` | P3 | 待改 |
| `build_tower` | Valley of Olympus | Build Tower | tooltip、story_1-7 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 终局收束 | 现稿有气势，但“用残骸反制定义世界的人”不够集中 | 明确你在用世界碎片反制神权定义 | temporal stones、hauling persists、tower forms back to Valhalla | 不写成单纯 comeback montage | `the_spire`、`destroy_pylons` | P3 | 待改 |
| `gods_trial` | Valley of Olympus | Gods Trial | tooltip、story_1-11 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 终局收束 | 仍偏怪物层层闯关，保安系统语义不足 | 让玩家感到这是神权在继续定义“你配不配” | tower floors, monsters, gods waiting above | 不写成传统百层塔爽文 | `dead_trial`、`face_judgement` | P3 | 待改 |
| `challenge_gods` | Valley of Olympus | Challenge Gods | tooltip、story_1-18 | 陌生 -> 熟练 -> 内化 -> 世界观反照 | 终局收束 | 单场战斗写得热闹，但全局主题提醒不足 | 持续提醒这不是打强敌，而是打默认规则的保安系统 | seven gods、stat-based counters、throne claim | 不写命中注定弑神 | `seek_blessing`、`gods_trial` | P3 | 待改 |
| `restore_time` | Valley of Olympus | Restore Time | tooltip、story_1、尾声待增 | 顶段写世界观反照 | 终局收束 | 现稿有史诗感，但缺“回答世界如何运转”的临门文本与分路尾声 | 把结局写成理解、承受、重构后的回答 | throne, powers of gods, weaving timelines | 不写天选收束 | `story_num_0`、`collect_interest` | P3 | 待改 |

## 逐节点编辑单

### P0 主干分支

#### `story_num_0` / Global Story 0

- 保留什么：`courier` 身份、眼镜碎裂、包裹液体、mana 枯竭触发 loop。
- 删什么：任何会让开场像“命运选中你”的神秘感堆砌。
- 补什么：进镇前的工作疲惫、普通差事、突然异常穿透日常的瞬间；把重点从“事故设定”转成“普通生活被异常刺穿”。
- 参考语气：保持日常尺度，像 `Meet People` 前的生活感，不要一上来就高概念。
- 目标效果：玩家先认同自己是被拖进来的普通人，再开始理解循环机制。
- 一句话回答：补出“异常穿透普通生活”的开场基调，减掉“主角本来就特殊”的噪音。

#### `meet_people`

- 保留什么：村民对 usefulness、trustworthiness、likability 的不同判断。
- 删什么：把结尾夸张笑点当主轴的处理，避免稀释分支种子。
- 补什么：在 tooltip 或 40%-60% story 里明确一句“同一个村子里，人们对值得尊敬的人也各不相同”。
- 参考语气：朴素、观察式，不要讲大道理。
- 目标效果：把第一颗分支种子放在玩家最早接触到的社会判断里。
- 一句话回答：补出“价值标准从一开始就多元”，减掉“后面分支突然从天而降”的噪音。

#### `warrior_lessons`

- 保留什么：Iron 的纪律、 endurance、重复受试、dirty fighting 反向证明纪律。
- 删什么：任何会把 warrior 路线写成唯一正道的价值判断。
- 补什么：把“秩序、纪律、承担”从战斗技巧提升为一种能维持局面的价值语言。
- 参考语气：硬朗但不神圣，强调实践中的稳定性。
- 目标效果：让玩家理解武者路线代表的是一种合法且可尊敬的强大。
- 一句话回答：补出“秩序型价值也能构成正当力量”，减掉“战士只是朴素物理路线”的噪音。

#### `mage_lessons`

- 保留什么：observation、interpretation、test what a rule means、cross-discipline curiosity。
- 删什么：把法师课写成高贵学院预演的暗示。
- 补什么：把“洞察、越界、技巧”明确成另一种合法强大，而不是 warrior 的附属版本。
- 参考语气：机敏、分析型，允许一点越线的快感，但不写成犯禁。
- 目标效果：让 mage lessons 成为方法论分流，而不是职业 flavor。
- 一句话回答：补出“技巧型越界也能构成体面的力量”，减掉“合法路线只有纪律与服从”的噪音。

#### `heal_the_sick`

- 保留什么：诊断、治疗、告知三段结构；感谢与 reputation 的关联。
- 删什么：把“做好事会得到更高回应”写成直接因果。
- 补什么：把“被人感谢”和“被更高层力量注意到”稳稳分开，至少在 tooltip 和高段 story 各落一次。
- 参考语气：克制、近人，不要神叨。
- 目标效果：让善行成为社会性价值，不自动升级成宇宙性认证。
- 一句话回答：补出“感谢与回应不是一把尺子量出来的”，减掉“善行自动通向神恩”的噪音。

#### `talk_to_hermit`

- 保留什么：道路、边界、旧时代记忆、山会问不同问题。
- 删什么：过多关于名字和年龄的悬疑占比。
- 补什么：用山、路、门、风向的隐喻，把“世界不会用一把尺子衡量所有人”说出口。
- 参考语气：像老旅人顺手点拨，不像 lore NPC 自我揭密。
- 目标效果：让分流观念先以隐喻出现，再由山顶具象化。
- 一句话回答：补出“世界的尺子不止一把”，减掉“判定系统到山顶才临时出现”的噪音。

#### `talk_to_witch`

- 保留什么：bargains、taboos、dutiful people打不开的门、与 Hermit 的旧纠葛。
- 删什么：过量的八卦式爱情背景占主位。
- 补什么：把 50%-80% 故事层稳定成“有些门永远不会为循规蹈矩的人开”这类世界经验，不写成对守规矩者的讥讽。
- 参考语气：以 `story_5` 为中心，危险但成熟，像长期活下来的知识。
- 目标效果：把 Witch 锁成暗线价值与文风锚点。
- 一句话回答：补出“越界知识源自生存经验”，减掉“黑暗路线只是叛逆姿态”的噪音。

#### `dark_magic`

- 保留什么：trespass、take rather than ask、shadow realm 作为下一阶段接口。
- 删什么：单点技能升级式写法。
- 补什么：按四阶段重排：好奇、试探、掌控、价值位移；最后明确“你开始默认有些事可以直接拿，而不是请求”。
- 参考语气：冷、干、有效，不写狂喜。
- 目标效果：让 Dark Magic 改变的是取用世界的默认姿态。
- 一句话回答：补出“力量会重写拿取与请求的边界”，减掉“只是学会更强法术”的噪音。

#### `dark_ritual`

- 保留什么：blood、soulstones、contract、repeat business、credit exhausted。
- 删什么：任何会把 ritual 写成奖赏高潮的措辞。
- 补什么：在 tooltip 和前两层 story 都统一 `transactional rather than rewarding` 语义。
- 参考语气：行政合同感，比宗教崇拜感更强。
- 目标效果：把 ritual 固定成一套冷酷可计算的交换机制。
- 一句话回答：补出“黑暗回应是合同而不是祝福”，减掉“黑暗力量特别爽”的噪音。

#### `read_books`

- 保留什么：童年读物、 myths、chronicles、travelogues 的分歧。
- 删什么：只把它当 Intelligence 训练的单线成长。
- 补什么：用历史角度提前说出“被记住的人，从来不是按同一种资格被记住的”。
- 参考语气：阅读者的发现感，不要硬讲主题。
- 目标效果：让图书馆成为历史维度的分支前兆。
- 一句话回答：补出“历史记忆也遵循多种资格”，减掉“分支只是当下社会判断”的噪音。

#### `underworld`

- 保留什么：Charon、coins、route as omission、直达 Commerceville。
- 删什么：末尾单纯搞笑的 afterlife 吐槽主导段落。
- 补什么：强化“隐秘路径一直存在，只是体面社会假装它不存在”。
- 参考语气：安静、合法得可疑，像所有重要人物都默认知道。
- 目标效果：让 Underworld 成为对 Valhalla 合法性的第一记反讽。
- 一句话回答：补出“被省略的路一直在运转”，减掉“秘密通道只是彩蛋”的噪音。

#### `climb_mountain`

- 保留什么： ruins、旧文明遗迹、summit altar、being sorted。
- 删什么：把大部分前段都写成普通旅行见闻。
- 补什么：从中段开始把登山改写成“接近一种会读懂你的结构”。
- 参考语气：越往上越像接近问题本身，而不是接近景点。
- 目标效果：让山本身先成为阅读器，判定才不是突兀机关。
- 一句话回答：补出“山在读你”的结构感，减掉“只是去终点拿剧情”的噪音。

#### `decipher_runes`

- 保留什么： myths、manuals、do not let us be forgotten。
- 删什么：把内容主要写成 runes 提供两门技能说明书。
- 补什么：让同一座山保存互相矛盾却同时成立的评价体系，历史、英雄、法术并置不求统一。
- 参考语气：考古阅读感，带一点文明末日的急迫。
- 目标效果：说明山顶的分流不是突发 whim，而是整座山一直保存的多标准传统。
- 一句话回答：补出“同一文明内部也有多套标准”，减掉“神的判定是唯一来源”的噪音。

#### `check_walls`

- 保留什么：illusory walls、hidden alcoves、glowing liquid。
- 删什么：纯探宝抱怨与“早知道第一次就该摸墙”的主导比例。
- 补什么：加一条铭文式表达，服务“有些人被高处召见，有些人被深处收留”。
- 参考语气：半考古、半发现被藏起来的备用系统。
- 目标效果：把深处的接纳逻辑埋在山内部，而不是等 Startington 才出现。
- 一句话回答：补出“高处与深处都是接纳装置”，减掉“下路突然从地板里掉出来”的噪音。

#### `guru`

- 保留什么：gods were explorers、invisible gateway、not every gate waits at the altar。
- 删什么：不删核心母版，只删多余解释。
- 补什么：加一句与 `face_judgement` 的衔接，明确这是绕开 altar 的已知前例。
- 参考语气：维持现稿，少量补桥。
- 目标效果：锁定为高处合法体系也并非只有官式入口。
- 一句话回答：补出“高处也存在非官方入口”，减掉“Valhalla 只靠判定才可抵达”的噪音。

#### `face_judgement`

- 保留什么：recognized by gods、answered from below、met with silence 三结果。
- 删什么：任何 `成功/失败` 或 `合格/不合格` 口吻。
- 补什么：tooltip 改成“判定归属”，结果文本统一为“被某种体系接纳或未被回应”。
- 参考语气：庄重、分类、冷静，不写考试感。
- 目标效果：把主干分支的语言彻底从 morality/test 切到 belonging/response。
- 一句话回答：补出“山顶在判定归属而非考核成绩”，减掉“路线是好坏分支”的噪音。

### P1 Startington / Jungle

#### `story_num_7` / Global Story 7

- 保留什么：red sky、熟悉道路被重写、中央 Spire、不是被丢弃的坑。
- 删什么：任何会让 Startington 看起来像“坏结局收容所”的措辞。
- 补什么：在首段更快落下“另一套仍在运转的文明残骸”。
- 参考语气：克制、不卖惨，先写结构感。
- 目标效果：玩家第一次抵达就知道这不是惩罚，而是另一套回应。
- 一句话回答：补出“被遗弃后仍继续运转的文明”，减掉“低声望掉进垃圾场”的噪音。

#### `town5` / Startington 区域描述

- 保留什么：once familiar place、salvage、residue、忘却之上的运转。
- 删什么：任何廉价 shadow realm = dark place 的空泛描述。
- 补什么：只做术语统一，不重写核心句法。
- 参考语气：沿用现稿和 `meander`。
- 目标效果：把区域描述锁成 Startington 的身份底座。
- 一句话回答：补出“熟悉世界被重写后的残余秩序”，减掉“这里只是阴暗版新地图”的噪音。

#### `meander`

- 保留什么：市场街、 wells、pylons、graveyard、routes、replacement order。
- 删什么：任何会把行为降格成乱逛的描述。
- 补什么：后续新增 story 只能继续“读懂废墟如何运转”，不能换主题。
- 参考语气：完全对齐现稿 75%-100%。
- 目标效果：锁为 Startington 全线叙事母版。
- 一句话回答：补出“废墟仍可被阅读为社会结构”，减掉“Startington 只是怪地方”的噪音。

#### `mana_well`

- 保留什么：被 Spire 抽走的 mana、acrid residue、timing is part of scavenging。
- 删什么：天然馈赠、神秘泉眼式写法。
- 补什么：若补层级，只写“从被榨干 infrastructure 抢回剩余流量”。
- 参考语气：完全靠 `story_1` 和 `story_2` 的系统口吻延伸。
- 目标效果：资源点本身也服务 Startington 的抽取主题。
- 一句话回答：补出“残余系统仍在抽取与回流”，减掉“井里单纯有魔力可拿”的噪音。

#### `destroy_pylons`

- 保留什么：stabilizers、inherited infrastructure、outer locks。
- 删什么：爽文式 vandalism。
- 补什么：让每层 story 都落到“拆旧神 infrastructure”而不是“打坏东西”。
- 参考语气：机械、结构、解除约束。
- 目标效果：把破坏行为重新定义为拆除继承的系统件。
- 一句话回答：补出“你在拆的是继承下来的秩序部件”，减掉“只是反派式搞破坏”的噪音。

#### `raise_zombie`

- 保留什么：labor reserve、inventory、army/workforce/salvage crew blur。
- 删什么：黑暗召唤、廉价亵渎感。
- 补什么：把死者劳动体系与活人营地形成清楚镜像。
- 参考语气：冷静、结构化、非惊悚。
- 目标效果：说明 Startington 的社会组织不只处理活人。
- 一句话回答：补出“死者也被纳入劳动与组织逻辑”，减掉“Raise Zombie 只是邪术按钮”的噪音。

#### `purchase_supplies`

- 保留什么：scarcity pricing、ruin economy、no haggling。
- 删什么：它只是过路买包的处理。
- 补什么：补足走私、拆解、旧库存、死地贸易的城市面。
- 参考语气：交易即生存，不浪漫化。
- 目标效果：让 Startington 看起来像城市，不像副本前置商店。
- 一句话回答：补出“废墟里也有稳定但残酷的经济”，减掉“这里只剩怪物和废墟”的噪音。

#### `dark_sacrifice`

- 保留什么：loss is a technique、dark gods easier to reach、transactional。
- 删什么：单纯祭祀气氛或恐怖景观。
- 补什么：每一层都要写清“失去是一种技术”。
- 参考语气：短、硬、结算感。
- 目标效果：把 sacrifice 变成 Startington 生存方法的一部分。
- 一句话回答：补出“失去本身也是可学习的技术”，减掉“这里只会献祭求强”的噪音。

#### `the_spire`

- 保留什么：leftovers into ascent、central machine、town's unnatural metabolism。
- 删什么：普通爬塔、奖杯塔、资格塔语言。
- 补什么：后续层级继续围绕“把废墟剩余物转成攀升可能的机器”展开。
- 参考语气：沿用 tooltip 和 `story_1`，像在读机器。
- 目标效果：让 Spire 成为整条 Startington 线的象征节点。
- 一句话回答：补出“攀升来自残余系统的再组织”，减掉“这是另一个英雄之塔”的噪音。

#### `dead_trial`

- 保留什么：necropolis as process、calibrated dead、returns usable labor。
- 删什么：纯墓地闯关或死灵恶趣味。
- 补什么：和 `heroes_trial` 做镜像，前者组织废弃之物，后者公开承认英雄。
- 参考语气：流程化、工业化、冷淡。
- 目标效果：把 dead trial 立成 Startington 文明逻辑的制度镜子。
- 一句话回答：补出“被废弃之物也能被制度化组织”，减掉“死者试炼只是黑暗版英雄试炼”的噪音。

#### `journey_forth`

- 保留什么：survivors、smugglers、re-opened trail、abandoned map。
- 删什么：普通旅行和“离开城镇去下一张图”的处理。
- 补什么：若补，只补“这条路不是被允许，而是被一遍遍重新打开”。
- 参考语气：沿用现稿，一条被人硬画出来的路。
- 目标效果：把通往 Jungle 的移动写成路线观念的升级。
- 一句话回答：补出“你开始走未被许可但持续有效的道路”，减掉“只是换场景”的噪音。

#### `story_num_8` / Global Story 8

- 保留什么：same abandoned logic、roots over wound、survivor-made paths。
- 删什么：把 Jungle 写成全新主题的转场。
- 补什么：更集中地定义它是 Startington 逻辑向野外蔓延。
- 参考语气：从石头逻辑过渡到根系逻辑。
- 目标效果：让玩家把 Jungle 当成同一文明问题的外延，而不是新章节跳转。
- 一句话回答：补出“废墟逻辑会继续往野外长”，减掉“Jungle 另开一套主题”的噪音。

#### `town6` / Jungle Path 区域描述

- 保留什么：borderland、survivor camps、paths that close、stranger materials。
- 删什么：野区说明式概述。
- 补什么：只做术语统一，保持它是 Startington 在野外的延伸。
- 参考语气：紧贴现稿。
- 目标效果：锁定 Jungle 的身份与气质。
- 一句话回答：补出“野外也在继续搭建替代社会”，减掉“这里只是危险森林”的噪音。

#### `explore_jungle`

- 保留什么：people-made markers、camp logic、totem clearing、self-closing paths。
- 删什么：普通探索完成度叙事。
- 补什么：把“路径会自我闭合、世界主动排斥离开者”贯穿到中后段。
- 参考语气：环境在回应你，不是地图静止等待。
- 目标效果：让探索变成和一片会动的边境谈判。
- 一句话回答：补出“路线本身会反抗被穿越”，减掉“只是找出口”的噪音。

#### `fight_jungle_monsters`

- 保留什么：siege pressure、territorial behavior、repurposed ruins。
- 删什么：英雄征伐、 trophy hunting 腔调。
- 补什么：继续写环境压力和领地冲突，而不是战绩感。
- 参考语气：敌对生态，不是荣耀狩猎。
- 目标效果：战斗也服务 Jungle 的生存主题。
- 一句话回答：补出“你在对抗的是环境化的敌意”，减掉“英雄清怪推进地图”的噪音。

#### `rescue_survivors`

- 保留什么：find、help、assure 三段；camp becomes community。
- 删什么：把它写成温情插曲、和主线无关。
- 补什么：更明确地证明这条线不只会使用死者，也会重新组织活人。
- 参考语气：克制温度，不煽情。
- 目标效果：作为暗线的情感平衡器和伦理证明。
- 一句话回答：补出“废墟路线也会重建活人的共同体”，减掉“暗线只会工具化他人”的噪音。

#### `prepare_buffet`

- 保留什么：brief shared feast、camp expects tomorrow、temporary abundance。
- 删什么：只剩黑色幽默的吃喝段子。
- 补什么：把它写成废墟路线第一次建立共同体仪式。
- 参考语气：短暂丰饶、脆弱但真实。
- 目标效果：让希望第一次以集体仪式而非个人变强出现。
- 一句话回答：补出“临时丰饶也能生成共同体”，减掉“只是回血吃饭动作”的噪音。

#### `totem`

- 保留什么：knowledge hammered into shape、living tradition、not academic magic。
- 删什么：把它写成神秘万能柱子。
- 补什么：与 `wizard_college` 的制度化知识形成正面对位。
- 参考语气：地方性、经验性、有效但不体面。
- 目标效果：把 Jungle 的知识体系立成可与学院平行比较的一极。
- 一句话回答：补出“地方传承也能稳定地产生有效知识”，减掉“非学院知识只是迷信”的噪音。

#### `open_rift`

- 保留什么：tear in reality、只能过人不能带补给、去 Startington。
- 删什么：英勇刺激感过强的撕裂场面。
- 补什么：明确它是不稳定、粗暴、伤世界的危险捷径技术。
- 参考语气：难看但有效。
- 目标效果：作为 `open_portal` 的前级，对比出路线成长。
- 一句话回答：补出“捷径最初是粗暴撕裂出来的”，减掉“高阶玩家便利传送”的噪音。

#### `open_portal`

- 保留什么：repeatable exit、safer not free、weak barrier grove。
- 删什么：把它写成无成本成熟魔法。
- 补什么：story 层明确从不稳定裂隙进化到可控通路。
- 参考语气：技术成熟、代价仍在。
- 目标效果：让路线成长体现在“掌控捷径”而非单纯“更快”。
- 一句话回答：补出“危险捷径也能被训练成方法”，减掉“传送门只是自动化功能升级”的噪音。

### P2 Valhalla / Commerceville

#### `story_num_6` / Global Story 6

- 保留什么：forms、bureaucrat god、categorized welcome。
- 删什么：任何像到达终极奖赏区的凯旋口吻。
- 补什么：让“被制度承认的文明”在前十秒就落地。
- 参考语气：礼貌、整洁、行政化。
- 目标效果：玩家知道这里是被记录和分类的世界，不是天堂。
- 一句话回答：补出“Valhalla 是制度文明而非奖赏区”，减掉“高声望上天堂”的噪音。

#### `story_num_10` / Global Story 10

- 保留什么：city gates、guide、tax collectors、bank、初到 Commerceville 的方向感。
- 删什么：旧版“可疑导游带你看新城”的轻冒险基调。
- 补什么：在抵达段就点明这里不是纯黑市，而是合法外观很强的抽取系统。
- 参考语气：热闹、周到、算计精准。
- 目标效果：Commerceville 的第一印象先是秩序和收费，而不是犯罪和混乱。
- 一句话回答：补出“Commerceville 的秩序本身就是抽取装置”，减掉“只是另一座有坏人的城市”的噪音。

#### `town4` / Valhalla 区域描述

- 保留什么：recognized、named、put to work、administered。
- 删什么：任何会被读成“最终归宿”的词。
- 补什么：让维护成本与公共身份的线索能够被后续动作接住。
- 参考语气：精确、平整、文明机器。
- 目标效果：区域描述本身就预告管理、征收、赐福、登记。
- 一句话回答：补出“秩序来自持续管理”，减掉“Valhalla 天然完美”的噪音。

#### `guided_tour`

- 保留什么：beautification code、markets、city hall、wizard college 一闪而过。
- 删什么：单纯观光与“完美城市真好看”的比重。
- 补什么：展示这里如何把访客转成可被治理、可被记录、可被评价的公共身份。
- 参考语气：表面礼貌、背后分类。
- 目标效果：让玩家通过 tour 看到 Valhalla 的治理面。
- 一句话回答：补出“城市会先把你变成可管理对象”，减掉“guided tour 只是地图解锁”的噪音。

#### `canvass`

- 保留什么：charity funds、city hall、预算与家户网络。
- 删什么：偏散的神明生活趣闻。
- 补什么：把慈善、预算、 beautification、审视陌生人的流程串成治理网络。
- 参考语气：公共行政的家户触角。
- 目标效果：让玩家看到“善举、审查、规范”是同一套城市肌理。
- 一句话回答：补出“Valhalla 通过公益与登记触达每个住户”，减掉“canvass 只是彩蛋闲聊”的噪音。

#### `seek_citizenship`

- 保留什么：visitor vs citizen、exam、stone plaque、rights and obligations。
- 删什么：把通过考试写成被彻底认可的人生胜利。
- 补什么：强化“被记录、被治理、被纳入秩序机器”的公共身份语义。
- 参考语气：行政流程，不煽情。
- 目标效果：让 citizenship 成为被系统编目，而不是拿到奖牌。
- 一句话回答：补出“公民身份是纳入系统，不是终极认可”，减掉“考过就成为正确之人”的噪音。

#### `wizard_college`

- 保留什么：学费、 duel 评级、不同魔法同台竞争、极高完成度。
- 删什么：不重写主体，不额外加 lore 支线。
- 补什么：只在 tooltip 或 rank 节点补出它与 `totem`、`dark_magic`、`the_spire` 的方法论对位。
- 参考语气：维持现稿强度。
- 目标效果：把学院锁为制度化、可认证、标准化知识的高点。
- 一句话回答：补出“学院是知识被制度化之后的样子”，减掉“它只是更强法师塔”的噪音。

#### `seek_blessing`

- 保留什么：quiet rite、favor、fight giants 作为前置代价。
- 删什么：免费祈祷得加成的轻巧感。
- 补什么：与 `dark_sacrifice` 平级，都写成以代价换超越，只是合法性与语气不同。
- 参考语气：庄严、节制、带服役感。
- 目标效果：让 blessing 不再像白线赠品，而是合法化的交换。
- 一句话回答：补出“赐福也是交换而非白送”，减掉“光明路线不用付出代价”的噪音。

#### `build_housing`

- 保留什么：分区、建筑规范、重复建房的制度性。
- 删什么：过多施工笑话和手艺人轻松感。
- 补什么：写出 Valhalla 不是仙境，而是靠持续维护和扩建维持的秩序机器。
- 参考语气：规整、重复、带轻度行政感。
- 目标效果：让 housing 成为秩序维护成本的一环。
- 一句话回答：补出“秩序需要被不断建出来”，减掉“Valhalla 已完成无需维护”的噪音。

#### `collect_taxes`

- 保留什么：法律条文、提前征收、bureaucracy threat。
- 删什么：单纯收租发财爽点。
- 补什么：更直接地呈现合法抽取如何维持这套城市运转。
- 参考语气：冷、合法、站得住脚但不干净。
- 目标效果：把秩序与抽取的关系说透。
- 一句话回答：补出“秩序也靠抽取与执行维持”，减掉“Valhalla 只会给予不索取”的噪音。

#### `tidy_up`

- 保留什么：cleanup crews、feast aftermath、patterns in refuse。
- 删什么：纯看热闹八卦神明的重心。
- 补什么：让 tidy up 成为“维持秩序外观”的必要劳动。
- 参考语气：从残渣读出制度，而不是从残渣读出笑话。
- 目标效果：Valhalla 的光洁感背后出现维护成本。
- 一句话回答：补出“整洁是一种持续劳动成果”，减掉“Valhalla 天生就没有脏乱”的噪音。

#### `town7` / Commerceville 区域描述

- 保留什么：贸易中心、人人逐利的气氛。
- 删什么：dark dour、honest work 不行这类泛黑帮城市概括。
- 补什么：明确这里是最适合拆穿合法性外观的有序抽取系统。
- 参考语气：明亮、干净、算得过来，比 Startington 更文明也更抽取。
- 目标效果：把 Commerceville 接回全局主题，而非当作犯罪支线区。
- 一句话回答：补出“秩序不等于纯洁”的城市样本，减掉“这里只是罪恶都市”的噪音。

#### `explorers_guild`

- 保留什么：map work、survey、shortcuts、guildmaster knows more。
- 删什么：纯自由冒险者公会的浪漫色彩。
- 补什么：探索也会被制度收编，会被发包、交图、评级、换取通行技术。
- 参考语气：干练、职业、少量旧手艺。
- 目标效果：说明连“看世界”都能成为制度内劳动。
- 一句话回答：补出“探索也会被编入组织流程”，减掉“探索天然属于自由者”的噪音。

#### `thieves_guild`

- 保留什么：rank、tests、boss、组织纪律。
- 删什么：偷盗爽文、自嘲式 Robin Hood。
- 补什么：强调其高效、组织化、把人当单位，成为 Valhalla 的反面镜子。
- 参考语气：职业化、不多话、流程明确。
- 目标效果：让玩家感到这不是乱贼，而是另一种制度。
- 一句话回答：补出“非法组织也能像正统机构一样高效运转”，减掉“只是地下搞笑公会”的噪音。

#### `rob_warehouse`

- 保留什么：guards、crew、auction warehouse、insured goods。
- 删什么：单纯提升规模的 heist 片逻辑。
- 补什么：补出物流、仓储、安保、库存管理也是制度权力的一部分。
- 参考语气：对系统动手术，不是耍帅。
- 目标效果：让抢仓成为对 Commerceville 物资流的逆向接管。
- 一句话回答：补出“仓库是秩序的物质接口”，减掉“抢仓只是更大的偷窃”的噪音。

#### `insurance_fraud`

- 保留什么：claims、documentation、伪装、director folder。
- 删什么：`Robin Hood` 自我辩护和道德轻描淡写。
- 补什么：让保险、信息、风险转售显成资本化秩序的抽取机制。
- 参考语气：账务、法律、冷幽默。
- 目标效果：把 Commerceville 主题拉回“合法外观下的抽取”。
- 一句话回答：补出“资本化秩序也是另一种掠夺机器”，减掉“骗保只是机智犯罪”的噪音。

#### `guild_assassin`

- 保留什么：guild dues、跨区 targets、hearts、branding。
- 删什么：个人传奇式暗杀职业升级感。
- 补什么：强调这是一套专业化、合同化、跨区外包的人命处理体系。
- 参考语气：安静、专业、制度冷酷。
- 目标效果：成为 Commerceville 最尖锐的制度镜像。
- 一句话回答：补出“暴力也能被公会化与外包化”，减掉“Assassin 只是酷职业”的噪音。

#### `invest`

- 保留什么：perpetual account、ritual contract、teller、sigils。
- 删什么：纯诡异银行奇观的观看感。
- 补什么：更直接地写“资本化秩序是另一种抽取系统”。
- 参考语气：礼貌、自动、可怕地可靠。
- 目标效果：让银行成为 Commerceville 主题的中心接口。
- 一句话回答：补出“资本靠合同与记账持续抽取”，减掉“Invest 只是累积资源功能”的噪音。

#### `collect_interest`

- 保留什么：soul-contracts、bank bound by rule、nobody stops you。
- 删什么：只剩 exploit 笑点。
- 补什么：把 interest 写成系统自动从未来和规则中抽走价值。
- 参考语气：平静得反常。
- 目标效果：让收益本身也显得有代价、有制度阴影。
- 一句话回答：补出“被动收益也是抽取系统的延长”，减掉“收利息只是数值奖励”的噪音。

#### `seminar`

- 保留什么：付费入场、 attention capture、领导术养成。
- 删什么：纯 MLM 段子与搞笑受害者视角。
- 补什么：把 Seminar 写成把魅力与领导也商品化、培训化、抽取化。
- 参考语气：包装精致、内容可疑、效果真实。
- 目标效果：让技巧路线接回 Commerceville 的主题主线。
- 一句话回答：补出“连人格影响力都能被包装出售”，减掉“Seminar 只是喜剧插段”的噪音。

### P3 终局与尾声

#### `story_num_11` / Global Story 11

- 保留什么：没有 Mt. Olympus、ruined tower、challenge inscription。
- 删什么：轻松屠神和冒险笑谈口气。
- 补什么：首段就写出 Valley of Olympus 是神权残响留下的空场。
- 参考语气：空旷、回声、被看着。
- 目标效果：让终局地图先成为一个回答世界如何运转的空间。
- 一句话回答：补出“神权退场后仍留着结构回声”，减掉“只是最后一张大地图”的噪音。

#### `town8` / Valley of Olympus 区域描述

- 保留什么：mountain-shaped hole、gods looking down。
- 删什么：过短导致的信息空白。
- 补什么：把“神权残响”具体化为被挖空的场域、残留的视线、等待被回答的问题。
- 参考语气：留白多，但不空泛。
- 目标效果：区域描述本身就进入终局主题。
- 一句话回答：补出“被移走的山也仍在施加定义”，减掉“这里只是空地搭塔”的噪音。

#### `build_tower`

- 保留什么：temporal stones、persistent hauling、tower takes shape。
- 删什么：单纯 comeback montage。
- 补什么：围绕“你在用世界残骸反制定义世界的人”组织 story 全层级。
- 参考语气：耐性、反构、工程感。
- 目标效果：build tower 不只是修路，而是用残余物挑战神权定义。
- 一句话回答：补出“残骸也能被重新组织成反制力量”，减掉“Build Tower 只是终局材料条”的噪音。

#### `gods_trial`

- 保留什么：百层、team combat、 gods waiting above。
- 删什么：仅按怪物种类写战斗花样。
- 补什么：持续提醒“他们还想继续定义你是否配得上”。
- 参考语气：防线、筛查、继续被定义。
- 目标效果：把 tower trial 从爬塔改成神权保安系统。
- 一句话回答：补出“试炼是在延长旧规则的筛选”，减掉“只是百层战斗流程”的噪音。

#### `challenge_gods`

- 保留什么：七神、各自的战斗方法、最终 throne claim。
- 删什么：只剩 boss 连战的热闹。
- 补什么：在段间反复提醒玩家挑战的是整套默认规则的守卫者。
- 参考语气：对抗规则执行者，而非宿命决斗。
- 目标效果：最终战主题收束到“反制定义权”。
- 一句话回答：补出“你在打的是规则的保安系统”，减掉“只是终极 boss rush”的噪音。

#### `restore_time`

- 保留什么：claim powers、throne、weaving timelines、world made whole。
- 删什么：只写“最后一键通关”的完成感。
- 补什么：加一段临门文本，说明这不是按按钮，而是终于有能力回答世界如何运转；补三段可变尾声，分别偏 `Valhalla`、`Startington/Jungle`、`Commerceville/技巧路线`。
- 参考语气：理解、承受、重构，不写天命。
- 目标效果：结局收束到主题，而不是停在数值终点。
- 一句话回答：补出“终局是对世界运行方式的回答”，减掉“赢了神就自然能修时间”的噪音。

## 本版变更单 v0

### 本版新增了哪些世界认知

- 玩家会更早知道：同一世界从来不只用一种标准衡量人。
- 玩家会更清楚：Valhalla、Startington、Commerceville 不是善恶梯度，而是三套不同的组织与抽取逻辑。
- 玩家会更清楚：Startington 和 Jungle 不是惩罚区，而是仍在运转、并继续生长的替代文明。
- 玩家会更清楚：Blessing、Sacrifice、Interest、Tax、Ritual 都是“以代价换回应”的不同合法性版本。
- 玩家会更清楚：终局挑战的不是单个强敌，而是默认规则的维护系统。

### 本版不新增哪些攻略信息

- 不新增任何数值、条件、奖励、效率、掉落、层数、资源公式信息。
- 不新增任何隐藏解锁、最优路线、声望阈值技巧、速通提示。
- 不新增任何会让玩家提前预知具体分支结果的剧透句。
- 不把原本由玩家在流程中发现的地图、组织、试炼结果直接摊开讲完。
- 不把任何路线写成官方推荐路线或坏结局路线。
