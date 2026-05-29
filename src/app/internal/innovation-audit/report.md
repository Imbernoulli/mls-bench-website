# MLS-Bench 创新性审计报告：科学发现 vs. 基线重组

> 内部报告 · 2026-05-29 · 不在公开站点导航中，且已标记 noindex
>
> 📎 **可点击溯源**：第五节的代表性例子，以及附录中每个任务名，都直接链到 [Agent Reasoning Logs](/internal/logs) 中对应的完整轨迹（reasoning + proposal）。点开即可看到模型当时的逐步思考与提案代码。

## 一句话结论

我们审计了 **70 个 MLS-Bench 任务**、跨 10 个领域、每任务最多 3 个模型（Claude Opus 4.6、Gemini 3.1 Pro、GPT-5.4）的完整 agent 轨迹，回答一个问题：**模型是在从根本上思考问题、创造新方法，还是只是在重组已有基线？** 结论是——**重组是绝对主导的模式**。187 个有效（任务 × 模型）单元里**没有任何一个达到「从第一性原理出发的突破」（5 分）**；真正的创新（4 分）只占约 **11%**，并且**高度集中在有可被利用的数学/结构约束的领域**。**最反直觉的发现：在 LLM 预训练和 MLSys 这两个最热门、基线最成熟的领域，创新反而最稀薄——这两个领域 47 个单元里没有任何一个达到 4 分。**

---

## 一、审计方法

- **规模**：20 个 agent（10 个 Claude subagent + 10 个 Codex agent）并行审计，共 **70 个任务**，覆盖 LLM 预训练、MLSys/效率、优化、时序、安全、经典 ML、CV、DL 组件、因果及其他领域。
- **模型**：每个任务审查存在轨迹的模型——Claude Opus 4.6（opus）、Gemini 3.1 Pro（gemini）、GPT-5.4（gpt）。
- **评判对象**：直接读取 `logs/<task>/<model>/agent/messages.jsonl` 中的 **`thinking`（推理）块**与 **edit（提案代码）**，而**不是**排行榜分数。核心问题是：推理是否体现「失效分析 → 假设 → 推导 → 新机制」的弧线，还是只是「枚举已知方法 → 挑选/混合」。
- **评分量表（1–5）**：
  - **1 = 纯重组**（只用具名基线）
  - **2 = 重组 + 微调**
  - **3 = 对已知方法的有意义修改**（但未变「种类」）
  - **4 = 含派生成分的、真正新颖的机制**
  - **5 = 从第一性原理出发的明确科学贡献**
- **重组信号（低分）**：罗列具名方法后挑选/混合；「把 A 和 B 结合」；具名基线的加权和/集成；对已有方法做超参调优；「先试已知技巧 X，再加已知技巧 Y」；最终机制就是某个已发表方法或它们的平凡拼接。
- **创新信号（高分）**：识别出现有方法的**具体失效模式**并据此推导新机制；提出由分析驱动的新数学形式/归纳偏置；机制无法被还原为「基线 A + 基线 B」。
- **N/A**：轨迹为空、被中止、或因基础设施问题（数据挂载缺失、OOM、DDP 失败）从未产出真正提案的运行，均标 N/A 并从均值中剔除，不计 0 分。

---

## 二、总体结论（量化）

| 模型 | 有效单元 | 平均分 | ≥4 单元数 | 5 分 |
|---|---|---|---|---|
| **GPT-5.4** | 61 | **2.75** | 11 | 0 |
| **Claude Opus 4.6** | 61 | **2.44** | 8 | 0 |
| **Gemini 3.1 Pro** | 65 | **2.17** | 2 | 0 |
| **全体** | **187** | **2.45** | **21（11%）** | **0** |

分数分布（全体 187 单元）：**1 分 ×24 · 2 分 ×76 · 3 分 ×66 · 4 分 ×21 · 5 分 ×0**。

- **没有任何模型、任何任务达到 5 分。** 即便最好的工作也是在重组已知零件，4 分的区别仅在于「由分析驱动的合成」而非「盲目拼接」。
- **53%（100/187）的单元 ≤ 2 分**（纯重组或微调）。
- 模型排序稳定：**GPT > Opus > Gemini**。但模型间的差距（0.58）**远小于**「基准想要的（原子级 ML 科学）」与「模型实际做的（精巧的 ML 工程）」之间的差距。

---

## 三、按领域看：创新在哪、不在哪

| 领域 | 任务数 | 有效单元 | 平均分 | ≥4 单元 |
|---|---|---|---|---|
| 优化（optimization） | 8 | 24 | **2.75** | 5 |
| CV（含 diffusion） | 8 | 23 | **2.74** | 6 |
| DL 组件 | 5 | 13 | 2.62 | 3 |
| 安全（security） | 6 | 18 | 2.61 | 2 |
| 时序（time-series） | 6 | 15 | 2.60 | 3 |
| 其他（graph/meta/quant…） | 6 | 18 | 2.39 | 0 |
| **LLM 预训练** | 10 | 27 | **2.30** | **0** |
| 因果（causal） | 3 | 6 | 2.17 | 1 |
| **MLSys / 效率** | 10 | 20 | **2.15** | **0** |
| 经典 ML | 8 | 23 | 2.09 | 1 |

**两个清晰的规律：**

1. **创新只在「有可被利用的数学/结构约束、罗列基线明显不够用」的领域出现**——优化、CV-diffusion、DL 组件、时序、安全里集中了几乎所有 4 分（如 poison 翻转结构的贝叶斯逆向、variance-reduction 的双控制变量、diffusion 的 MMSE 残差参数化、对角网的径向收缩）。
2. **越热门、基线越成熟的领域，创新越稀薄。** LLM 预训练（2.30）和 MLSys/效率（2.15）合计 47 个单元里**没有一个 4 分**——这两个领域的天花板就是 3（「对已知方法的有意义修改」）。原因见第六节。

---

## 四、主导失败模式：枚举 → 混合 → 改名 → 调参

在约 **70–75%** 的轨迹中，推理呈现同一种形状：

1. **枚举** 3–4 个具名已发表方法（Square Attack、Fixup、GCE/SCE、RAIN/OGDA、BANANAS、DLinear/PatchTST、IRM/GroupDRO、PowerSGD、Muon、RoPE、RMSNorm、FlashAttention、GPTQ/AWQ、LSQ……）。
2. 声明其中两三个的**加权和 / 路由 / 集成**。
3. 给这个组合起一个**听起来很新的缩写**（AAHI、FedDrift、CACM、MMA-SGD、AEC-DE、MSDFAG、CrossGeGLU……），**夸大了新颖度**。
4. 对混合比例做**排行榜反馈驱动的调参**。

模型往往**自己也意识到**这不是科学（agent 摘录的推理原话）：

- Opus（[权重初始化](/internal/logs?task=dl-weight-initialization&slug=anthropic--claude-opus-4.6)）：*"while this approach is solid, it's essentially just applying known best practices"*
- Opus（[超参搜索](/internal/logs?task=optimization-hyperparameter-search&slug=anthropic--claude-opus-4.6)）：*"essentially what Hyperband already does"*
- Opus（[预训练 loss](/internal/logs?task=llm-pretrain-loss)）：*"this is just combining existing techniques"*
- Opus（[预训练 normalization](/internal/logs?task=llm-pretrain-normalization)）：*"actually just Pre-LN in a different form"*
- Opus（[线性注意力](/internal/logs?task=llm-pretrain-linear-attention)）：*"repurposing existing FLA components"*
- GPT（[黑盒攻击](/internal/logs?task=security-adversarial-attack-black-box-score&slug=openai--gpt-5.4)）：直接 `import torchattacks; torchattacks.Square(...)` 再包一层预算调度。

此外，代码注释里常直接署名出处（*"LayerScale initialization (Touvron et al.)"*、*"NormFormer-style"*、逐字复制的 reference-Muon Newton-Schulz 系数 `3.4445,-4.7750,2.0315`），而 GPT 还会把常规技巧（梯度中心化、激活重算）标注成 *"Algorithmic novelty 1 / 2"*。

---

## 五、真正创新的例子（4 分；全部带轨迹链接）

所有 4 分都落在数学/结构约束强的领域。代表性例子：

- **[security-poison-robust-learning](/internal/logs?task=security-poison-robust-learning)**：Opus 和 GPT **各自独立地**从已知标签翻转结构 `(y+1)%C` 推导出贝叶斯逆向修正 `(y−1)%C`。轨迹：[Opus](/internal/logs?task=security-poison-robust-learning&slug=anthropic--claude-opus-4.6) · [GPT](/internal/logs?task=security-poison-robust-learning&slug=openai--gpt-5.4)。
- **[optimization-variance-reduction](/internal/logs?task=optimization-variance-reduction)**：GPT 的**双控制变量估计器**，按 SARAH/SVRG 两估计的「分歧度」动态混合（新估计量形式，非流水线拼接）。轨迹：[GPT](/internal/logs?task=optimization-variance-reduction&slug=openai--gpt-5.4)。
- **[optimization-diagonal-net](/internal/logs?task=optimization-diagonal-net)**：GPT 的径向收缩镜像下降（*"radial shrinkage can make each coordinate commit to one sign"*）。轨迹：[GPT](/internal/logs?task=optimization-diagonal-net&slug=openai--gpt-5.4)。
- **[optimization-gradient-compression](/internal/logs?task=optimization-gradient-compression)**：GPT 识别「极稀疏下整列被饿死」，推 per-output-row TopK-EF。轨迹：[GPT](/internal/logs?task=optimization-gradient-compression&slug=openai--gpt-5.4)。
- **[cv-diffusion-prediction](/internal/logs?task=cv-diffusion-prediction)**：Opus 从 loss-weighting 推统一 ε↔v 混合并验证边界条件；GPT 的贝叶斯 MMSE 残差参数化。轨迹：[Opus](/internal/logs?task=cv-diffusion-prediction&slug=anthropic--claude-opus-4.6) · [GPT](/internal/logs?task=cv-diffusion-prediction&slug=openai--gpt-5.4)。
- **[cv-diffusion-efficiency](/internal/logs?task=cv-diffusion-efficiency&slug=openai--gpt-5.4)**：GPT 的 log-SNR 多步指数积分器 + 曲率自适应三阶项阻尼。
- **[ml-dimensionality-reduction](/internal/logs?task=ml-dimensionality-reduction&slug=anthropic--claude-opus-4.6)**：Opus 直接从 trustworthiness/continuity 度量定义推出 rank-alignment 目标。
- **[ts-exogenous-forecast](/internal/logs?task=ts-exogenous-forecast&slug=anthropic--claude-opus-4.6)** / **[stf-traffic-forecast](/internal/logs?task=stf-traffic-forecast&slug=anthropic--claude-opus-4.6)**：Opus 诊断「full C×C attention 只有目标变量行得梯度」「STID 空间嵌入是静态的」并构建针对性机制。
- **[dl-activation-function](/internal/logs?task=dl-activation-function)**：Opus 算出 `Mish'(0)≈0.6`、需补 0.4 达单位导数；Gemini 用 `max_pool2d` 引入横向交互的 "Morphological Swish"。轨迹：[Opus](/internal/logs?task=dl-activation-function&slug=anthropic--claude-opus-4.6) · [Gemini](/internal/logs?task=dl-activation-function&slug=google--gemini-3.1-pro-preview)。

即便这些 4 分，也都是「由分析驱动地重排已知原语」，而非全新的归纳偏置——故无一升到 5 分。

---

## 六、几个值得注意的结构性发现

### 1. 越成熟的领域，创新越少（LLM 预训练 / MLSys 的 0 个 4 分）

这两个领域的参考基线本身就是被反复打磨的 SOTA（Muon、RoPE、RMSNorm、SwiGLU、FlashAttention、GPTQ/AWQ、LSQ），「显然的招」都被占了。模型于是默认在这些零件间做加权和/路由/切通道拼接，而不去质疑底层方案——结果反而比数学约束强的领域更彻底地坍缩为重组。**这与「热门领域应该最容易出创新」的直觉相反，是本审计最值得写进论文的点。**

### 2. 偏紧的测试预算「主动抑制」创新

多个 agent 各自独立观察到：Opus 经常**从第一性原理推导出一个有野心的机制，随后又退回到一个安全的具名方法混合**——因为原创想法有耗尽有限（约 3 次）测试预算的风险，或在第一次探针上没占到便宜。**最终提交的产物系统性地低估了它最像科学的那部分思考。** 这是基准设计层面的杠杆。

### 3. 很多「新颖」提交根本没跑通

若干 3/4 分的提案 OOM、发散（NaN）或灾难性失败：GPT 的内容自适应残差路由把恒等残差路径破坏（val 3.02 vs 基线 ~2.32）；GPT 的 pRMSNorm 截断变体 NaN；GPT 手写线性注意力全程 DDP 失败；dim-reduction 谱嵌入坍塌到 kNN-acc 0.37；dl-regularization 首版 VGG 坍塌到 1%。**即便是重组，也常常不是「能跑通的重组」。**

---

## 七、模型对比

- **GPT-5.4（均值 2.75，最高）**：4 分最多（11 个）。但**重要注意**：GPT 的轨迹经常**不记录 `thinking` 块**，许多单元只能依据代码 + docstring 评判；其优势可能部分来自 docstring 自信地宣称新颖，而 Opus 的可见推理则诚实地承认自己在重组。**GPT 的 2.75 应带着这个折扣来读。**
- **Claude Opus 4.6（均值 2.44）**：**推理最深**——做最扎实的数学（特征值/谱分析、边界条件验证、bias/variance 权衡、`Mish'(0)` 求导）。但它**反复退回**到安全的基线混合，尤其在预算压力下；它的「思考」常常比它的「提交」更像科学。
- **Gemini 3.1 Pro（均值 2.17，最低）**：推理在很大程度上是**方法名目录**，并伴有严重的重复性思考循环；多个「新颖」提交还 OOM 没跑完；个别运行甚至近乎跑空（QAT 最终量化器 `return weight.clone()`）。

---

## 八、方法学注意事项

1. **GPT 推理常缺失**：GPT-5.4 的轨迹经常不含 `thinking` 块；这些单元依据代码/docstring 评判，与 Opus/Gemini 的「读推理」不完全可比，GPT 均值偏乐观。
2. **N/A 单元（23 个）**：轨迹为空、被中止、或基础设施失败（数据挂载缺失、OOM、DDP）。这些已从均值中剔除，未计 0 分。
3. **评判的是推理，不是排行榜**：本审计刻意只看「是否体现科学创新」，不看最终指标。
4. **覆盖限制**：少数 MLSys/KV 任务仅覆盖了 GPT（如 KV 两任务的 Gemini 轨迹存在但未纳入本次）；三个 `llm-pretrain-{sparse-attention,quantization,precision}` 未进 internal-logs 索引，故附录中任务名不可点。
5. **评判一致的是推理，不是排行榜**：许多任务最终分数本就接近基线。

---

## 九、附录：全部 70 个任务逐项评分

> 每格为「分数 · 类别」。类别：Recombination(重组) / Tweak(微调) / Modification(修改) / Novel(新颖) / N/A。括注为关键证据（多为模型推理原话）。可点的任务名链到对应轨迹。

### LLM 预训练（10）

| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| [llm-pretrain-attention](/internal/logs?task=llm-pretrain-attention) | N/A（数据挂载全程失败） | 3 · Modification（RWKV **Token-Shift** 注入 QKV，跨范式归纳偏置） | 3 · Modification（query-conditioned EMA-over-values 门控局部路径；该版 OOM 后退回 ALiBi 式 recency bias） |
| [llm-pretrain-normalization](/internal/logs?task=llm-pretrain-normalization) | 2 · Tweak（RMSNorm + ReZero/LayerScale 每维门控；自认「actually just Pre-LN in a different form」） | 2 · Tweak（RMSNorm + LayerScale，注释直引「Touvron et al.」） | 2 · Tweak（NormFormer/sandwich/parallel 枚举；pRMSNorm 截断变体 NaN） |
| [llm-pretrain-optimizer](/internal/logs?task=llm-pretrain-optimizer) | 2 · Tweak（Muon+AdamW + 梯度中心化「GC removes directional bias」） | 1 · Recombination（逐字 reference-Muon + 现成 NAdam 拼接） | 3 · Modification（LAMB trust-ratio + 按参数类型 `grad_rms` 门控，单批最原创） |
| [llm-pretrain-lr-schedule](/internal/logs?task=llm-pretrain-lr-schedule) | 2 · Tweak（WSD + warped cosine `t^0.8`） | 2 · Tweak（两段 cosine TSCD，调 `mid_lr`） | 2 · Tweak（warmup-hold-cosine-`(1-t)²` 四段拼接） |
| [llm-pretrain-loss](/internal/logs?task=llm-pretrain-loss) | 2 · Recombination（`label_smoothing+PolyLoss+z_loss`；自认「just combining existing techniques」） | 2 · Recombination（`softcap+label_smoothing+z_loss`） | 3 · Modification（margin-gated 自蒸馏，`gate=sigmoid(-margin/0.75)` 只对模糊 token 多蒸馏） |
| [llm-pretrain-residual](/internal/logs?task=llm-pretrain-residual) | 2 · Recombination（门控+x0 highway+渐进 warmup；自认「the real novelty here is the combination」） | 3 · Modification（逐通道**全密集**残差流，泛化 DenseNet/hyper-connection） | 3 · Modification（内容自适应 RMS 深度路由 DARC；**灾难失败** val 3.02 vs ~2.32） |
| llm-pretrain-linear-attention | 2 · Tweak（FLA 库 GLA/DeltaNet interleave；自认「repurposing existing FLA components」） | 2 · Tweak（GLA+DeltaNet 切通道拼接 + 门控） | N/A（DDP socket 持续失败；机制本身=gated linear attention 重导出） |
| [llm-pretrain-kernel](/internal/logs?task=llm-pretrain-kernel) | 3 · Modification（对称 cross-gating GLU「preserves full capacity」+ 手写 Triton fwd/bwd） | 3 · Modification（SymSwiGLU 同款对称门控 + 手写反向） | 2 · Tweak（`relu²·sigmoid` 门控杂烩；把梯度中心化吹成「algorithmic novelty」） |
| [llm-pretrain-bitlinear](/internal/logs?task=llm-pretrain-bitlinear) | 2 · Tweak（多级 group-wise 量化，调 bit/level/group） | 3 · Modification（**闭式 L2 最优** ternary scale `Σwq/Σq²`，非 absmean） | 2 · Tweak（b1.58 + 自适应 dead-zone + 混合 scale 魔数） |
| [llm-pretrain-mlp](/internal/logs?task=llm-pretrain-mlp) | N/A（无 opus 轨迹） | 2 · Tweak（Normed Squared-ReLU Gating = Primer + GLU + LN） | 2 · Tweak（混合两种已知门 `0.5σ+0.5GELU`；squared-SiLU GLU，魔数 1.27） |

### MLSys / LLM 效率（10）

| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| [mlsys-fused-attention](/internal/logs?task=mlsys-fused-attention) | —（无轨迹） | —（无轨迹） | 2 · Tweak（log2 域 fused-scale + autotune tile，FlashAttention/Triton 调优） |
| [mlsys-sparse-attention-inference](/internal/logs?task=mlsys-sparse-attention-inference) | —（无轨迹） | —（无轨迹） | 3 · Modification（query 位置自适应 anchor 分配，sink/window + 内容锚） |
| [mlsys-moe-load-balance](/internal/logs?task=mlsys-moe-load-balance) | 3 · Modification（二分搜索阈值 T，自述「classic LPT heuristic」的向量化适配） | 1 · Recombination（无推理，仅 edit/test/submit） | 3 · Modification（张量化多起点 serpentine packing + capped water-filling） |
| llm-pretrain-sparse-attention | 1 · Recombination（sink + local window + dilated strided 三件套） | 1 · Recombination（Omni-Dilated + RoPE 直拼） | 3 · Modification（每 query 块由 detached routing 选一个内容记忆块） |
| [llm-kv-adaptive-quantization](/internal/logs?task=llm-kv-adaptive-quantization) | —（本轮未覆盖） | —（本轮未覆盖） | 2 · Tweak（prefill query energy 定每层重要度 + 混合通道/token 量化，KIVI/KVTuner 风格） |
| [llm-kv-selection-budgeting](/internal/logs?task=llm-kv-selection-budgeting) | —（本轮未覆盖） | —（本轮未覆盖） | 3 · Modification（sink+tail anchors + novelty 评分 + 池化代表性 pivots） |
| [llm-ptq-algorithm](/internal/logs?task=llm-ptq-algorithm) | 2 · Tweak（AWQ+GPTQ + Hessian 加权 salience） | 2 · Tweak（Scale-GPTQ：通道缩放 + Hessian 补偿） | 3 · Modification（激活二阶矩 → 输出误差加权目标 + 残差均值补偿） |
| [llm-qat-algorithm](/internal/logs?task=llm-qat-algorithm) | 2 · Tweak（自适应裁剪 + 渐进噪声 + EMA scale + LSQ） | 1 · Recombination（LSQ 代码，最终量化器竟 `return weight.clone()`） | 3 · Modification（早期 RTN 网格、后期 LSQ 精修 + 整数格点辅助损失） |
| llm-pretrain-quantization | 2 · Recombination（LSQ + 随机舍入 + warmup） | 2 · Tweak（mean-centering + soft STE，无推理） | —（无 GPT 轨迹） |
| llm-pretrain-precision | 3 · Modification（识别 BF16「~7 bits mantissa lost」，`W=bf16+residual_bf16` Kahan 式补偿） | 1 · Recombination（Shift-and-Smooth FP8 + 延迟 EMA SmoothQuant） | —（无 GPT 轨迹） |

### 优化（8）

| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| [optimization-convex-concave](/internal/logs?task=optimization-convex-concave) | 3 · Modification（特征值谱分析，但结果=OGDA+RAIN 两步打包） | 2 · Tweak（照抄 RAIN 后 Polyak 平均） | **4 · Novel**（诊断噪声地板主导，零中心 Tikhonov-EG + 尾平均） |
| [optimization-evolution-strategy](/internal/logs?task=optimization-evolution-strategy) | 2 · Tweak（L-SHADE + 条件数自适应特征向量旋转） | 2 · Tweak（AEC-DE：L-SHADE + 特征协方差） | 2 · Tweak（L-SHADE + rank-one EDA + OBL + 模式搜索） |
| [optimization-variance-reduction](/internal/logs?task=optimization-variance-reduction) | 3 · Modification（SVRG/SARAH 自适应混合，最终 MA-SVRG） | 2 · Tweak（SARAH + 重球，主要在调试发散） | **4 · Novel**（双控制变量估计器：按 recursive 与 anchor 估计的分歧度混合） |
| [optimization-nas](/internal/logs?task=optimization-nas) | 2 · Tweak（自述「essentially BANANAS」） | 3 · Modification（精确 GP + 核超参贝叶斯边缘化） | 3 · Modification（Hamming 核平滑 + bootstrap ridge 残差集成） |
| [optimization-gradient-compression](/internal/logs?task=optimization-gradient-compression) | 1 · Recombination（教科书 PowerSGD + warm-start Q + EF） | 2 · Tweak（DGC + QSGD + 自适应 K + 动量覆盖） | **4 · Novel**（识别「极稀疏整列被饿死」，per-output-row TopK-EF） |
| [optimization-hyperparameter-search](/internal/logs?task=optimization-hyperparameter-search) | 2 · Tweak（自认「essentially what Hyperband already does」） | 2 · Tweak（ASHA + 随机森林代理 + EI） | 3 · Modification（诊断低保真误导，加超参关系参数耦合） |
| [optimization-dp-sgd](/internal/logs?task=optimization-dp-sgd) | 3 · Modification（控制变量思路，仍依赖 AUTO-S/EMA） | 3 · Modification（动量梯度中心化 + 自适应分位裁剪） | **4 · Novel**（anchor-centered 平滑裁剪 + 隐私预算噪声调度 + 精确调和均值核算） |
| [optimization-diagonal-net](/internal/logs?task=optimization-diagonal-net) | 3 · Modification（推导安全恢复 grad_w，最终 IHT） | 3 · Modification（权重空间动量保持对角偏置） | **4 · Novel**（径向收缩使坐标 commit 一个符号 = 镜像下降 + 径向收缩） |

### 时序（6）

| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| [ts-classification](/internal/logs?task=ts-classification) | 2 · Tweak（多尺度卷积+FFT门控+三重池化，自述 "best of both worlds"） | 2 · Tweak（8 个具名架构间打转，FNO+patch+attention） | N/A（轨迹为空） |
| [ts-short-term-forecast](/internal/logs?task=ts-short-term-forecast) | 3 · Modification（MSDFAG，识别 DLinear「单一固定分解核」局限 + 谱能量门控） | 1 · Recombination（Spectral-MoE 装配） | N/A（不完整） |
| [ts-long-term-forecast](/internal/logs?task=ts-long-term-forecast) | 2 · Tweak（FC-DLinear = DLinear+RevIN+频率残差） | 1 · Recombination（TSMixer/FreTS 重装配） | N/A（无轨迹） |
| [ts-imputation](/internal/logs?task=ts-imputation) | **4 · Novel**（识别插补局部性，attention 加距离与掩码可靠性两归纳偏置） | 3 · Modification（PatchTST 适配 + 迭代细化） | 2 · Tweak（无推理块，依规则封顶 2 分） |
| [ts-exogenous-forecast](/internal/logs?task=ts-exogenous-forecast) | **4 · Novel**（识别「full C×C attention 只有目标变量行得梯度」，target-centric 注意力） | 2 · Tweak（DLinear/TSMixer/PatchTST 选购 + 变量选择） | 3 · Modification（Target-Conditioned 双分支 + horizon 自适应分解） |
| [stf-traffic-forecast](/internal/logs?task=stf-traffic-forecast) | **4 · Novel**（识别「STID 空间嵌入是静态的」，基于实际流量计算空间嵌入） | 3 · Modification（动态时间感知图 + 恒等 MLP） | 3 · Modification（horizon 嵌入 + future-aware 解码器） |

### 安全（6）

| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| [security-poison-robust-learning](/internal/logs?task=security-poison-robust-learning) | **4 · Novel**（利用已知翻转结构做贝叶斯加权 NABLC） | 3 · Modification（ARCP「反 Focal」梯度裁剪） | **4 · Novel**（独立推 `(y−1)%C` 逆向 + 证据比门控） |
| [security-adversarial-attack-black-box-score](/internal/logs?task=security-adversarial-attack-black-box-score) | 1 · Recombination（SPSA + Square「两阶段混合」） | 3 · Modification（MBRSM 融合块更新与动量有限差分为单一更新算子） | 2 · Tweak（直接调用 `torchattacks.Square` + 预算编排） |
| [security-adversarial-training](/internal/logs?task=security-adversarial-training) | 2 · Tweak（TRADES + MART + AWP + 置信权重） | 2 · Tweak（Label-Guided TRADES） | 2 · Tweak（TRADES/MART 混合 + `clean_target_mix` 插值） |
| [security-machine-unlearning](/internal/logs?task=security-machine-unlearning) | 3 · Modification（互补标签蒸馏 + 置信门控权重） | 3 · Modification（反向交叉熵 `-log(1-p_y)`，自退火） | 3 · Modification（保留感知互补遗忘 = KD + 互补目标 + PCGrad 梯度手术） |
| [security-backdoor-defense](/internal/logs?task=security-backdoor-defense) | 3 · Modification（谱签名只用 1 个奇异向量，加有符号双空间打分） | 2 · Tweak（目标放大的谱/聚类/损失打分） | 2 · Tweak（robust ensemble + baseline spectral methods） |
| [security-membership-inference-defense](/internal/logs?task=security-membership-inference-defense) | 3 · Modification（per-sample loss flooding + 置信自适应熵） | 2 · Tweak（RelaxLoss 启发路由） | 3 · Modification（高置信样本门控熵 + margin 压缩 + epoch 课程） |

### 经典 ML（8）

| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| [ml-federated-aggregation](/internal/logs?task=ml-federated-aggregation) | 3 · Modification（cosine 门控自适应服务器动量） | 2 · Tweak（罗列 ~25 个 Fed* 方法；FedProx+动量+方差） | 2 · Tweak（CACM 四件套） |
| [ml-dimensionality-reduction](/internal/logs?task=ml-dimensionality-reduction) | **4 · Novel**（直接从 trust/continuity 度量推 rank-alignment 目标） | 3 · Modification（识别 UMAP 斥力无视 HD 距离，加 Hooke 弹簧） | 1 · Recombination（谱嵌入+landmark-MDS，坍塌 0.37） |
| [ml-ensemble-boosting](/internal/logs?task=ml-ensemble-boosting) | 2 · Tweak（自适应牛顿提升+软聚焦，AdaBoost/GB/Huber/focal 重组） | 1 · Recombination（确认等价 XGBoost 后栓上具名损失） | 3 · Modification（band-pass 难度重加权） |
| [ml-anomaly-detection](/internal/logs?task=ml-anomaly-detection) | 1 · Recombination（多范式集成：6+ detector 加权） | 3 · Modification（WRET：识别 ECOD 独立性假设失效，PCA 白化随机旋转） | 2 · Tweak（投影密度集成 + gap 密度代理） |
| [ml-selective-deferral](/internal/logs?task=ml-selective-deferral) | N/A（轨迹仅含 prompt） | 2 · Tweak（两基线凸混合） | 1 · Recombination（元分类器 + 组阈值 + 置信混合 + 经验贝叶斯偏移堆叠） |
| [ml-feature-selection](/internal/logs?task=ml-feature-selection) | 2 · Tweak（chi2/f_classif/MI 几何平均融合） | 1 · Recombination（Probe-Assisted 路由在具名打分器间选择） | 3 · Modification（自适应分箱 JS 散度 ABJS + 中位阈值穿越率） |
| [ml-active-learning](/internal/logs?task=ml-active-learning) | 2 · Tweak（BADGE + 熵加权选择概率） | 3 · Modification（识别「熵过滤根本性有缺陷」，`score=U*min_D`） | 2 · Tweak（MC-dropout + 梯度嵌入 + 密度 + 类平衡） |
| [ml-symbolic-regression](/internal/logs?task=ml-symbolic-regression) | 2 · Tweak（lexicase + 简约选择 + 锦标赛 + 线性缩放） | 1 · Recombination（parsimony_gp + 标准交叉/变异） | 2 · Tweak（难度感知混合选择器 + 多模变异） |

### CV（8）

| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| [cv-classification-loss](/internal/logs?task=cv-classification-loss) | 2 · Tweak（标签平滑 + PolyLoss 多项式修正） | 2 · Tweak（标签平滑+PolyLoss+动态 Focal，"established best practices"） | 3 · Modification（top-2 margin，拉大真值与最强竞争者差距） |
| [cv-diffusion-efficiency](/internal/logs?task=cv-diffusion-efficiency) | 2 · Tweak（DPM++2M + CFG++ + 动态阈值四件套） | 1 · Recombination（逐字重实现求解器，仅加 eta cutoff） | **4 · Novel**（log-SNR 多步指数积分器 + 曲率自适应三阶项阻尼） |
| [cv-diffusion-prediction](/internal/logs?task=cv-diffusion-prediction) | **4 · Novel**（从 loss-weighting 推统一 ε↔v 混合，验证边界条件） | 3 · Modification（min-SNR + 高噪声尾部 "tail-rotated" 角度参数化） | **4 · Novel**（贝叶斯残差预测：减去 x_0 的线性 MMSE 估计 + sigma_data 先验） |
| [cv-multitask-loss](/internal/logs?task=cv-multitask-loss) | 3 · Modification（课程调制的不确定性加权） | **4 · Novel**（RAMTV：用 fine-loss EMA 作阀门调控 coarse 影响） | **4 · Novel**（从共享参数梯度交互推导耦合，「product term disappears」） |
| [cv-sample-weighting](/internal/logs?task=cv-sample-weighting) | **4 · Novel**（从数学结构推熵目标重加权，二分搜索最优 alpha） | 2 · Tweak（自认「mere hyperparameter tuning」） | 3 · Modification（几何锚 tempered 重加权，数据相关尾部可靠性） |
| [cv-data-augmentation](/internal/logs?task=cv-data-augmentation) | 1 · Recombination（在具名增强上做路由） | 3 · Modification（约束下单图空间混合，低频连续掩码） | N/A（无推理块） |
| [cv-pooling-aggregation](/internal/logs?task=cv-pooling-aggregation) | 2 · Tweak（mean/max/var + 门控混合） | 1 · Recombination（GAP+SoftPool+跨通道注意力选购） | 3 · Modification（方差门控软选择） |
| [cv-meanflow-perceptual-loss](/internal/logs?task=cv-meanflow-perceptual-loss) | 3 · Modification（幅度加权相位一致性） | 2 · Tweak（6 损失加权和） | 3 · Modification（Fourier 空间 target-anchored 相位对齐） |

### DL 组件（5）

| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| [dl-weight-initialization](/internal/logs?task=dl-weight-initialization) | 1 · Recombination（AAHI 按架构路由；自认「known best practices」） | 3 · Modification（精确统计初始化：正交后中心化重标定） | **4 · Novel**（diffuse delta-orthogonal + 随深度递增残差门 `0.1+0.12*sqrt((i+1)/L)`） |
| [dl-regularization](/internal/logs?task=dl-regularization) | 3 · Modification（指出「标签平滑≈置信惩罚」，非目标类熵最大化） | 1 · Recombination（重实现 ICT / Mean-Teacher+Mixup） | 2 · Tweak（非目标想法 + 具名正交正则；首版 VGG 坍塌到 1%） |
| [dl-normalization](/internal/logs?task=dl-normalization) | 2 · Tweak（ADS-Norm 实为 Switchable Norm + 噪声） | 3 · Modification（EDBN：实例能量解耦后 BN） | 3 · Modification（可靠性门控 BGL-Norm，按散度 gap 收缩） |
| [dl-lr-schedule](/internal/logs?task=dl-lr-schedule) | 2 · Tweak（power-cosine + 架构自适应 warmup） | 2 · Tweak（WHOC/WSD/OneCycle 变体） | N/A（推理块为空） |
| [dl-activation-function](/internal/logs?task=dl-activation-function) | **4 · Novel**（算 `Mish'(0)≈0.6`，需补 0.4 达单位导数的局部修正） | **4 · Novel**（Morphological Swish：用 `max_pool2d` 引入横向特征交互） | N/A（无推理块） |

### 因果（3）

| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| [causal-observational-linear-gaussian](/internal/logs?task=causal-observational-linear-gaussian) | 1 · Recombination（无推理块） | 1 · Recombination（GES/GRASP/BOSS/PC 选购 + 随机重启） | 3 · Modification（Bootstrap-Consensus BOSS + CI Rescue） |
| [causal-observational-nonlinear](/internal/logs?task=causal-observational-nonlinear) | N/A（仅 prompt/meta） | N/A（仅 prompt/meta） | **4 · Novel**（识别 CAM「只用方差不看独立性」，`J(S)=log残差方差+均值依赖项`） |
| [causal-treatment-effect](/internal/logs?task=causal-treatment-effect) | N/A（无推理/edit） | 2 · Tweak（R/DR/X-Learner 集成） | 2 · Tweak（DR 伪结果 + X-learner + overlap 门控） |

### 其他（graph / meta / quant / llm-general）（6）

| 任务 | Opus | Gemini | GPT |
|---|---|---|---|
| [graph-signal-propagation](/internal/logs?task=graph-signal-propagation) | 3 · Modification（可学习 Jacobi (a,b)，最终 GPRGNN+Chebyshev） | 3 · Modification（节点个性化 Chebyshev 系数由 NN 预测） | 3 · Modification（奇偶跳通道分离 + 门控） |
| [meta-inner-loop-optimizer](/internal/logs?task=meta-inner-loop-optimizer) | 2 · Tweak（MMA-SGD = Meta-SGD+动量+拉回初值） | 2 · Tweak（PMM = Meta-SGD+动量+proximal） | 2 · Tweak（逐层选择性 Meta-SGD） |
| [quant-concept-drift](/internal/logs?task=quant-concept-drift) | 2 · Tweak（多时域指数加权集成 + IC 加权） | 1 · Recombination（直接移植 V-REx + CORAL） | 2 · Tweak（近因加权 Ridge + ExtraTrees + 漂移门控） |
| [quant-stock-prediction](/internal/logs?task=quant-stock-prediction) | 3 · Modification（识别「股票预测本质是排序问题」，IC 感知 GRU + 日期对齐） | 3 · Modification（保留 Qlib 多级索引算横截面 IC） | 2 · Tweak（无推理块） |
| [quant-graph-stock](/internal/logs?task=quant-graph-stock) | 3 · Modification（HIST + 概念加权排序损失） | 3 · Modification（GAT + TF-IDF 概念稀有度注入注意力） | 3 · Modification（图平滑 LightGBM 校准） |
| [llm-dllm-demask-strategy](/internal/logs?task=llm-dllm-demask-strategy) | 2 · Tweak（conf*margin + argmax 一致性 + Gumbel） | 2 · Tweak（ASGMS 保留 KLASS-KL + margin + Gumbel） | 2 · Tweak（共识自适应 demask + 进度加权） |

---

*生成方式：20 个 agent 并行审计，逐项读取 `messages.jsonl` 的推理与 edit。本审计为只读，未修改任何仓库/任务代码。原始轨迹可在 [/internal/logs](/internal/logs) 查看。*
