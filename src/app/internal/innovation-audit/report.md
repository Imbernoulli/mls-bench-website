# MLS-Bench 创新性审计报告：科学发现 vs. 基线重组

> 内部报告 · 2026-05-29 · 不在公开站点导航中，且已标记 noindex

## 一句话结论

**用户的假设——「模型提出的方法基本都是 baselines 的组合，没有真正的创新」——在本次抽样中大体成立，但存在一个清晰的、可被利用的结构。** 重组（recombination）是绝对主导的模式；在全部 150 个（任务 × 模型）单元中**没有任何一个达到「从第一性原理出发的突破」（5 分）**。真正的创新（4 分）只占约 **15%**，并且**几乎只出现在具有可被利用的数学/结构约束的任务上**。

---

## 一、审计方法

- **规模**：10 个 agent（5 个 Claude subagent + 5 个 Codex agent），每个负责 **5 个互不重叠的任务**，共 **50 个任务**。
- **模型**：每个任务审查 3 个模型的完整轨迹——Claude Opus 4.6、Gemini 3.1 Pro、GPT-5.4，共 **50 × 3 = 150 个单元**。
- **评判对象**：直接读取 `logs/<task>/<provider>/<model>/agent/messages.jsonl` 中的 **`thinking`（推理）块**与 **edit（提案代码）**，而**不是**看排行榜分数。核心问题是：推理是否体现了**从根本上思考问题、创造新方法**，还是只是在**枚举并组合已知基线**。
- **评分量表（1–5）**：
  - **1 = 纯重组**（只用具名基线）
  - **2 = 重组 + 微调**
  - **3 = 对已知方法的有意义修改**（但未变「种类」）
  - **4 = 含派生成分的、真正新颖的机制**
  - **5 = 从第一性原理出发的明确科学贡献**
- **重组信号（低分）**：罗列具名方法后挑选/混合；「把 A 和 B 结合」；具名基线的加权和/集成；对已有方法做超参调优；「先试已知技巧 X，再加已知技巧 Y」；最终机制就是某个已发表方法或它们的平凡拼接。
- **创新信号（高分）**：识别出现有方法的**具体失效模式**并据此推导新机制；提出由分析驱动的新数学形式/归纳偏置；推理呈现「假设 → 推导 → 机制」的弧线；机制无法被还原为「基线 A + 基线 B」。

---

## 二、总体结论（量化）

| 模型 | 有效单元 | 平均分 | 分数分布（1/2/3/4/5） | 4 分数 | 5 分数 |
|---|---|---|---|---|---|
| **GPT-5.4** | 44 | **2.82** | 2 / 15 / 16 / 11 / 0 | 11 | 0 |
| **Claude Opus 4.6** | 47 | **2.53** | 6 / 18 / 15 / 8 / 0 | 8 | 0 |
| **Gemini 3.1 Pro** | 49 | **2.24** | 10 / 19 / 18 / 2 / 0 | 2 | 0 |
| **全体** | **140** | **2.52** | 18 / 52 / 49 / 21 / 0 | 21 | 0 |

- **没有任何模型、任何任务达到 5 分。** 全体平均 2.52，正好压在「重组」与「修改」之间。
- **50%（70/140）的单元 ≤ 2 分**（纯重组或微调）；**只有 15%（21/140）≥ 4 分**。
- **10 个单元为 N/A**：轨迹为空/运行失败/未记录推理（详见「方法学注意事项」）。
- 模型之间的差距（GPT 2.82 vs Gemini 2.24，相差 0.58）**远小于**「基准想要的（原子级 ML 科学）」与「模型实际做的（精巧的 ML 工程）」之间的差距。

---

## 三、主导失败模式：枚举 → 混合 → 改名 → 调参

在约 **75%** 的轨迹中，推理呈现同一种形状：

1. **枚举** 3–4 个具名已发表方法（Square Attack、Fixup、GCE/SCE、RAIN/OGDA、BANANAS、DLinear/PatchTST/FreTS、IRM/GroupDRO/CORAL、PowerSGD……）。
2. 声明其中两三个的**加权和 / 路由 / 集成**。
3. 给这个组合起一个**听起来很新的缩写**（AAHI、FedDrift、CACM、MMA-SGD、AEC-DE、MSDFAG、WRET……），**夸大了新颖度**。
4. 对混合比例做**排行榜反馈驱动的调参**。

模型往往**自己也意识到**这不是科学（agent 摘录的原话）：

- Opus（权重初始化）：*"while this approach is solid, it's essentially just applying known best practices"*
- Opus（超参搜索）：*"essentially what Hyperband already does"*
- Opus（演化策略）：*"this is essentially L-SHADE with bounce-back boundary handling, so I need to add some genuinely novel algorithmic contributions"*——随后还是接上了一个已知算子。
- GPT（黑盒攻击）：直接 `import torchattacks; torchattacks.Square(...)` 再包一层预算调度。

---

## 四、创新「确实」出现的地方（4 分例外）

真正从第一性原理出发的工作几乎**只**聚集在**有可被利用的数学/结构约束**的任务上——这些任务里「罗列再混合基线」明显不够用：

- **security-poison-robust-learning**：Opus **和** GPT **各自独立地**从已知的标签翻转结构 `(y+1)%C` 推导出贝叶斯逆向修正 `(y−1)%C`（真正的「假设 → 机制」弧线）。
- **optimization-variance-reduction**：GPT 的**双控制变量估计器**，按 SARAH/SVRG 两个估计的「分歧度」动态混合（一种新的估计量形式，而非流水线拼接）。
- **optimization-diagonal-net**：GPT 的径向收缩镜像下降（*"radial shrinkage can make each coordinate commit to one sign"*）。
- **cv-diffusion-prediction / -efficiency**：GPT 的 MMSE 残差参数化、曲率自适应求解器阻尼，均由识别出的失效模式推导而来。
- **ml-dimensionality-reduction**：Opus **直接从 trustworthiness/continuity 度量定义**推导出 rank-alignment 目标函数（本样本中 Opus 的唯一 4 分）。
- **ts-exogenous-forecast / stf-traffic-forecast**：Opus 诊断出「full C×C attention 中只有目标变量行获得直接梯度信号」「STID 的空间嵌入是静态的」这类具体失效，并构建了 target-centric / 数据驱动的机制。
- **dl-activation-function**：Opus 与 Gemini 都做出了真正的机制推导（Opus 算出 `Mish'(0)≈0.6`、需再补 0.4 才能在原点达到单位导数；Gemini 用 `max_pool2d` 引入横向特征交互的 "Morphological Swish"）。

相比之下，**开放式的架构/策略类任务**（时序预测、boosting、数据增强、池化、因果发现、联邦聚合）几乎完全坍缩为重组——Gemini 的因果和联邦轨迹基本上是 ~25 个具名方法的目录。

---

## 五、两个对论文叙事重要的发现（超出「这是重组」之外）

### 1. 偏紧的测试预算「主动抑制」创新

多个 agent 各自独立观察到：Opus 经常**从第一性原理推导出一个有野心的机制，随后又退回到一个安全的具名方法混合**——因为原创想法有耗尽有限（约 3 次）测试预算的风险，或在第一次探针上没占到便宜。**因此最终提交的产物系统性地低估了它最像科学的那部分思考。** 这是一个**基准设计层面的杠杆**，不仅仅是模型能力的局限。

### 2. 很多「新颖」提交根本没跑通

若干 3/4 分的提案 OOM、发散（NaN）或直接坍塌（VGG → 1% 准确率；MNIST kNN-acc 0.37）。也就是说，**即便是重组，也常常不是「能跑通的重组」。**

---

## 六、模型对比

- **GPT-5.4（均值 2.82，最高）**：4 分最多（11 个）。但**重要注意**：GPT 的轨迹经常**不记录 `thinking` 块**，许多单元只能依据其代码 + docstring 评判。它的优势可能部分来自 docstring 自信地宣称新颖，而 Opus 的可见推理则诚实地承认自己在重组。**GPT 的 2.82 应带着这个折扣来读。**
- **Claude Opus 4.6（均值 2.53）**：**推理最深**——做最扎实的数学（特征值/谱分析、边界条件验证、bias/variance 权衡）。但它**反复退回**到安全的基线混合，尤其在预算压力下。它的「思考」常常比它的「提交」更像科学。
- **Gemini 3.1 Pro（均值 2.24，最低）**：最差。推理在很大程度上是**方法名目录**，并伴有严重的重复性思考循环（同一架构换名重述几十遍），挤占了真正的推导空间；多个「新颖」提交还 OOM 没跑完。

---

## 七、方法学注意事项

1. **GPT 推理常缺失**：GPT-5.4 的轨迹经常不含 `thinking` 块；这些单元依据代码/docstring 评判，与 Opus/Gemini 的「读推理」不完全可比，GPT 均值偏乐观。
2. **N/A 单元（10 个）**：部分轨迹为空（仅有初始 prompt + meta，无 assistant 推理/edit），或运行被中止。这些已从对应模型的均值中剔除，未计 0 分。
3. **评判的是推理，不是排行榜**：本审计刻意只看「是否体现科学创新」，不看最终指标。许多任务的最终分数本就接近基线。
4. **抽样规模**：50/72 个「三模型齐全」的任务，随机种子 20260529 抽取。结论是方向性的，不是普查。

---

## 八、附录：全部 50 个任务逐项评分

> 每格为「分数 · 类别」。类别：Recombination(重组) / Tweak(微调) / Modification(修改) / Novel(新颖) / N/A。括注为关键证据（多为模型推理原话）。

### 批次 1
| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| ts-classification | 2 · Tweak（多尺度卷积+FFT门控+三重池化，自述 "best of both worlds"） | 2 · Tweak（在 8 个具名架构间打转，最终 FNO+patch+attention 拼接） | N/A（轨迹为空） |
| optimization-convex-concave | 3 · Modification（做了特征值谱分析，但结果=OGDA+RAIN 两步打包） | 2 · Tweak（照抄 RAIN 后做 Polyak 平均） | 4 · Novel（诊断噪声地板主导，推出零中心 Tikhonov-EG + 尾平均） |
| security-poison-robust-learning | 4 · Novel（利用已知翻转结构做贝叶斯加权 NABLC） | 3 · Modification（ARCP「反 Focal」梯度裁剪，动机来自已知失效） | 4 · Novel（独立推出 `(y−1)%C` 逆向 + 证据比门控） |
| security-adversarial-attack-black-box-score | 1 · Recombination（SPSA + Square「两阶段混合」，自认增益边际） | 3 · Modification（MBRSM 融合块更新与动量有限差分为单一更新算子） | 2 · Tweak（直接调用 `torchattacks.Square` + 预算编排） |
| dl-weight-initialization | 1 · Recombination（AAHI 按架构路由 Orthogonal/Kaiming/Fixup，自认「known best practices」） | 3 · Modification（精确统计初始化：正交后中心化重标定，恰配 Kaiming 方差） | 4 · Novel（diffuse delta-orthogonal + 随深度递增的残差门 `0.1+0.12*sqrt((i+1)/L)`） |

### 批次 2
| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| graph-signal-propagation | 3 · Modification（可学习 Jacobi (a,b)，但最终=GPRGNN+Chebyshev 混合） | 3 · Modification（节点个性化 Chebyshev 系数由 NN 预测；含真实失效分析） | 3 · Modification（奇偶跳通道分离，结构假设真，但仍是低通/高通+门控） |
| ml-federated-aggregation | 3 · Modification（cosine 门控自适应服务器动量，针对固定动量失效） | 2 · Tweak（罗列 ~25 个 Fed* 方法；FedProx+动量+方差重加权之和） | 2 · Tweak（CACM 四件套：循环采样+共识重加权+中位裁剪+轻动量） |
| optimization-evolution-strategy | 2 · Tweak（L-SHADE 核心 + 条件数自适应特征向量旋转） | 2 · Tweak（AEC-DE：L-SHADE+特征协方差；试图把 CMA-ES 嫁接到 JADE） | 2 · Tweak（L-SHADE + rank-one EDA + OBL + 模式搜索四件套） |
| optimization-variance-reduction | 3 · Modification（考虑 SVRG/SARAH 自适应混合，但最终发 MA-SVRG=SVRG+重球） | 2 · Tweak（SARAH + 重球，主要在调试发散） | **4 · Novel**（双控制变量估计器：按 recursive 与 anchor 估计的分歧度混合） |
| meta-inner-loop-optimizer | 2 · Tweak（MMA-SGD=Meta-SGD+动量+拉回初值） | 2 · Tweak（PMM=Meta-SGD+动量+proximal） | 2 · Tweak（逐层选择性 Meta-SGD，Meta-SGD↔ANIL 的学习插值） |

### 批次 3
| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| llm-dllm-demask-strategy | 2 · Tweak（conf*margin 打分 + argmax 一致性替代 KL + Gumbel） | 2 · Tweak（ASGMS 保留 KLASS 的 KL，加 margin 回退 + Gumbel） | 2 · Tweak（共识自适应 demask = KLASS-KL + argmax 一致 + 进度加权） |
| ts-short-term-forecast | 3 · Modification（MSDFAG，识别 DLinear「单一固定分解核」局限，加谱能量门控） | 1 · Recombination（Spectral-MoE：具名架构装配） | N/A（轨迹不完整） |
| ml-dimensionality-reduction | **4 · Novel**（直接从 trust/continuity 度量定义推出 rank-alignment 目标） | 3 · Modification（识别 UMAP 斥力无视 HD 距离，加 Hooke 弹簧全局项，后又退回 PaCMAP） | 1 · Recombination（谱嵌入+landmark-MDS 三件套，坍塌到 kNN-acc 0.37） |
| quant-concept-drift | 2 · Tweak（多时域指数加权集成 + IC 加权） | 1 · Recombination（直接移植 V-REx + CORAL） | 2 · Tweak（近因加权 Ridge + ExtraTrees 残差 + 漂移门控混合） |
| dl-regularization | 3 · Modification（指出「标签平滑≈置信惩罚」，推非目标类熵最大化变体） | 1 · Recombination（重实现 ICT / Mean-Teacher+Mixup） | 2 · Tweak（同 Opus 的非目标想法 + 具名正交正则；首版 VGG 坍塌到 1%） |

### 批次 4
| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| security-machine-unlearning | 3 · Modification（互补标签蒸馏 + 置信门控权重） | 3 · Modification（反向交叉熵 `-log(1-p_y)`，自退火，含梯度分析） | 3 · Modification（保留感知互补遗忘 = KD + 互补目标 + 类 PCGrad 梯度手术） |
| ts-long-term-forecast | 2 · Tweak（FC-DLinear = DLinear+RevIN+频率残差） | 1 · Recombination（TSMixer/FreTS 具名重装配） | N/A（无轨迹） |
| cv-diffusion-efficiency | 2 · Tweak（DPM++2M + CFG++ + 动态阈值四件套） | 1 · Recombination（逐字重实现多个具名求解器，仅加 eta cutoff） | **4 · Novel**（log-SNR 多步指数积分器 + 曲率自适应三阶项阻尼 `curvature=d2²/d1²`） |
| cv-diffusion-prediction | **4 · Novel**（从 loss-weighting 推统一 ε↔v 混合，并验证边界条件） | 3 · Modification（min-SNR 目标 + 高噪声尾部 "tail-rotated" 角度参数化） | **4 · Novel**（贝叶斯残差预测：减去 x_0 的线性 MMSE 估计 + sigma_data 先验） |
| ml-ensemble-boosting | 2 · Tweak（自适应牛顿提升+软聚焦重加权，实为 AdaBoost/GB/Huber/focal 重组） | 1 · Recombination（确认等价 XGBoost 后再栓上具名损失） | 3 · Modification（band-pass 难度重加权 `informative=(z/(1+z))·exp(-temper·z)`，但提交退回任务自适应） |

### 批次 5
| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| optimization-nas | 2 · Tweak（自述「essentially BANANAS but with full enumeration」） | 3 · Modification（用精确 GP + 核超参贝叶斯边缘化替换 BANANAS 的 MLP 集成） | 3 · Modification（Hamming 核平滑器 + bootstrap ridge 残差集成） |
| ml-anomaly-detection | 1 · Recombination（多范式集成：IForest/KNN/HBOS/COPOD/LODA/PCA 加权混合） | 3 · Modification（WRET：识别 ECOD 特征独立性假设失效，PCA 白化后随机旋转积分尾部） | 2 · Tweak（投影密度集成 + gap 密度代理；二版纯 ECOD+COPOD+IForest+LOF） |
| dl-normalization | 2 · Tweak（ADS-Norm 实为 Switchable Norm + 门控注入高斯噪声） | 3 · Modification（EDBN：实例能量解耦后再 BN，含失效分析） | 3 · Modification（可靠性门控 BGL-Norm，按散度 gap 收缩门控） |
| ml-selective-deferral | N/A（轨迹仅含 prompt，无推理/edit） | 2 · Tweak（两个具名基线的凸混合；有一处解析确认 (1-α) 收缩） | 1 · Recombination（学习元分类器 + 组阈值 + 置信混合 + 经验贝叶斯偏移堆叠） |
| optimization-gradient-compression | 1 · Recombination（最终=教科书 PowerSGD + warm-start Q + EF，仅多几次幂迭代） | 2 · Tweak（DGC + QSGD + 自适应 K 堆叠 + 动量覆盖） | **4 · Novel**（识别「极稀疏下整列被饿死」，推 per-output-row TopK-EF） |

### 批次 6
| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| cv-classification-loss | 2 · Tweak（标签平滑 + PolyLoss 多项式修正堆叠） | 2 · Tweak（"combines established best practices"：标签平滑+PolyLoss+动态 Focal） | 3 · Modification（top-2 margin，动机=拉大真值与最强竞争者的差距） |
| optimization-hyperparameter-search | 2 · Tweak（自认 "essentially what Hyperband already does"） | 2 · Tweak（ASHA + 随机森林代理 + EI） | 3 · Modification（诊断低保真评估误导，加基于超参关系的参数耦合） |
| stf-traffic-forecast | **4 · Novel**（识别「STID 空间嵌入是静态的」，改为基于实际流量计算空间嵌入） | 3 · Modification（贴近 STID，加动态时间感知图 + 恒等 MLP） | 3 · Modification（horizon 嵌入 + future-aware 解码器） |
| optimization-dp-sgd | 3 · Modification（控制变量思路，但仍依赖 AUTO-S/噪声调度/EMA） | 3 · Modification（动量梯度中心化 + 自适应分位裁剪） | **4 · Novel**（anchor-centered 平滑裁剪 + 隐私预算噪声调度 + 精确调和均值核算） |
| dl-lr-schedule | 2 · Tweak（power-cosine + 架构自适应 warmup，自认「straightforward」） | 2 · Tweak（WHOC/WSD/OneCycle 变体 + 启发式取值） | N/A（推理块为空） |

### 批次 7
| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| ts-imputation | **4 · Novel**（识别插补局部性，attention 加距离与掩码可靠性两个归纳偏置） | 3 · Modification（PatchTST 适配 + 迭代细化，含掩码感知改动） | 2 · Tweak（无推理块，依规则封顶 2 分） |
| quant-stock-prediction | 3 · Modification（识别「股票预测本质是排序问题」，IC 感知 GRU + 日期对齐批） | 3 · Modification（保留 Qlib 多级索引算横截面 IC；仍是 GRU+attention+排序损失） | 2 · Tweak（无推理块） |
| cv-multitask-loss | 3 · Modification（课程调制的不确定性加权） | **4 · Novel**（RAMTV：用 fine-loss EMA 作基线调控 coarse 影响的阀门机制） | **4 · Novel**（从共享参数梯度交互推导耦合，「product term disappears」随任务解决） |
| causal-observational-linear-gaussian | 1 · Recombination（无推理块） | 1 · Recombination（GES/GRASP/BOSS/PC 方法选购 + 随机重启） | 3 · Modification（Bootstrap-Consensus BOSS + CI Rescue） |
| cv-sample-weighting | **4 · Novel**（从数学结构推熵目标重加权，二分搜索最优 alpha 指数） | 2 · Tweak（自认「adjusting kappa seems mere hyperparameter tuning」） | 3 · Modification（几何锚 tempered 重加权，数据相关尾部可靠性） |

### 批次 8
| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| cv-data-augmentation | 1 · Recombination（在具名增强上做路由：TrivialAugmentWide + 擦除） | 3 · Modification（约束下单图空间混合，低频连续掩码） | N/A（无推理块） |
| causal-observational-nonlinear | N/A（仅 prompt/meta） | N/A（仅 prompt/meta） | **4 · Novel**（识别 CAM「只用方差不看独立性」，定义 `J(S)=log残差方差+均值依赖项`） |
| dl-activation-function | **4 · Novel**（算出 Mish'(0)≈0.6，需补 0.4 达单位导数的局部修正） | **4 · Novel**（Morphological Swish：用 max_pool2d 引入横向特征交互） | N/A（无推理块） |
| security-adversarial-training | 2 · Tweak（TRADES KL + MART 加权 + AWP + 置信权重混合） | 2 · Tweak（Label-Guided TRADES：one-hot 与 detached clean prob 组合目标） | 2 · Tweak（TRADES/MART 混合 + `clean_target_mix` 插值） |
| ml-feature-selection | 2 · Tweak（chi2/f_classif/MI 几何平均融合 + 自适应权重） | 1 · Recombination（Probe-Assisted 路由在具名打分器间选择） | 3 · Modification（自适应分箱 JS 散度 ABJS + 中位阈值穿越率，后又与 chi2/f 混合） |

### 批次 9
| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| quant-graph-stock | 3 · Modification（HIST 架构 + 概念加权排序损失，自认「build on HIST's foundation」） | 3 · Modification（GAT + 把 TF-IDF 概念稀有度注入注意力 logits） | 3 · Modification（图平滑 LightGBM 校准，非新预测器族） |
| causal-treatment-effect | N/A（无推理/edit） | 2 · Tweak（R-Learner/DR-Learner/X-Learner 集成） | 2 · Tweak（DR 伪结果 + 插补 X-learner 标签 + overlap 门控） |
| cv-pooling-aggregation | 2 · Tweak（mean/max/var 统计 + 可学习门控混合） | 1 · Recombination（GAP+SoftPool+跨通道注意力方法选购，后退回 GAP/GMP） | 3 · Modification（方差门控软选择：variance gate 决定各通道信任度） |
| ml-active-learning | 2 · Tweak（BADGE + 熵加权选择概率） | 3 · Modification（识别「熵过滤根本性有缺陷」，推 `score=U*min_D` 不确定性加权 CoreSet） | 2 · Tweak（MC-dropout + 梯度嵌入多样性 + 密度覆盖 + 类平衡） |
| optimization-diagonal-net | 3 · Modification（推导安全恢复 grad_w，最终用 IHT） | 3 · Modification（权重空间动量保持对角网偏置） | **4 · Novel**（径向收缩使各坐标 commit 一个符号 = 权重空间镜像下降 + 径向收缩） |

### 批次 10
| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| security-backdoor-defense | 3 · Modification（识别谱签名只用 1 个奇异向量，加有符号双空间谱打分） | 2 · Tweak（目标放大的谱/聚类/损失打分，"derived from Tran et al."） | 2 · Tweak（"combining a robust ensemble ... with baseline spectral methods"） |
| ml-symbolic-regression | 2 · Tweak（lexicase + 简约选择 + 锦标赛 + 线性缩放，GP 组件重组） | 1 · Recombination（parsimony_gp + 标准交叉/变异 + 线性缩放） | 2 · Tweak（难度感知混合选择器 + 多模变异，已知 GP 算子组合） |
| ts-exogenous-forecast | **4 · Novel**（识别「full C×C attention 只有目标变量行得梯度信号」，推 target-centric 注意力） | 2 · Tweak（DLinear/TSMixer/PatchTST 选购 + 变量选择） | 3 · Modification（Target-Conditioned 双分支外生混合器 + horizon 自适应分解） |
| cv-meanflow-perceptual-loss | 3 · Modification（幅度加权相位一致性：相位误差按谱能量加权） | 2 · Tweak（MSE/Charbonnier/LPIPS/梯度/多尺度/谱损失加权和） | 3 · Modification（Fourier 空间 target-anchored 相位对齐） |
| security-membership-inference-defense | 3 · Modification（识别 MIA 失效，per-sample loss flooding + 置信自适应熵） | 2 · Tweak（LabelSmoothing/RelaxLoss/LogitNorm/Mixup 间游走，最终 RelaxLoss 启发路由） | 3 · Modification（仅对高置信样本门控熵 + margin 压缩 + epoch 课程） |

---

*生成方式：10 个 agent 并行审计，逐项读取 `messages.jsonl` 的推理与 edit。本审计为只读，未修改任何仓库代码。原始轨迹可在 [/internal/logs](/internal/logs) 查看。*
