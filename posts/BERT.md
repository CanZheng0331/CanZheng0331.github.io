## 0 前言

现在的 LLM 几乎都是 Autoregressive 的，也就是 Transformer decoder 结构。我们也知道 GPT-2 在自然语言处理中打败了 BERT。

BERT 适合什么任务？尤其在无线通信领域？我找到了两片工作，可以探索一下。

## 1 BERT4beam

### 1.0 摘要

**背景与现状：** AI 被认为是 6G 的核心驱动力。目前的大模型研究主要集中在针对特定任务微调预训练的 LLMs。


**核心挑战：** 现有的模型难以适应不同的系统目标（Utilities）和系统规模（Scales）。


**主要方案：** 提出 BERT4beam 框架，将波束赋形优化建模为标记级序列学习（Token-level Sequence Learning）任务 。

**具体贡献：**


- 两套方案：针对单任务优化提出基础 BERT 模型，针对多任务优化提出 UBERT 模型 。


- 泛化性：基础 BERT 通过重构输入输出模块适应天线变化，而 UBERT 凭借 **细粒度标记化（Tokenization）** 策略，能直接泛化到不同任务和规模。


**结果：** 仿真显示该方法在各种任务中均能达到近乎最优的性能，优于现有 AI 模型 。

### 1.1 Introduction

**研究背景：AI 与 6G 的结合：** AI 被认为是 6G 网络的核心技术。相比 5G，6G 的场景更加复杂（如超大规模天线、超低延迟要求），传统的数学优化方法（如 CVX 凸优化、WMMSE 算法）虽然准确，但在实时性上表现不佳，且高度依赖精确的数学模型。

**现状与痛点：现有深度学习（DL）模型的局限性：** 论文通过对比指出，虽然目前的深度学习方法（如 MLP, CNN）在波束赋形上取得了一定进展，但存在以下三个核心局限：

- 泛化能力差 (Poor Generalization)： 目前的模型大多是“量身定做”的。如果你训练一个针对 4 天线、2 用户的模型，当系统变为 8 天线或 4 用户时，模型的输入/输出维度就对不上了，必须重新设计并重新训练。

- 无法处理多任务 (Task Specificity)： 同一个无线环境下，优化目标可能是“总速率最大化”，也可能是“能效最大化”。现有的模型通常只能学习一种映射关系，难以在一个模型中兼容多种不同的数学目标。

- 拓扑感知不足 (Lack of Topology Awareness)： 无线通信本质上是一个图结构（发射机、接收机和干扰关系）。传统的 MLP（多层感知机）忽视了这种空间拓扑关系，无法有效捕获用户间干扰的深层特征。

**核心动机：为什么要引入 BERT：** 这是引言中最精彩的部分，作者解释了为何选择 BERT (Bidirectional Encoder Representations from Transformers) 而非其他模型：

- 双向注意力机制 (Bidirectional Attention)： BERT 的核心是 Transformer 的 Encoder。它通过自注意力（Self-Attention）机制，可以让序列中的每个 Token 看到其他所有 Token。在波束赋形中，这意味着模型可以同时考虑所有用户间的干扰关系，这种“全局视野”完美契合了多用户干扰抑制的需求。

- 预训练与微调范式 (Pre-training & Fine-tuning)： 在大规模数据上进行预训练可以提取通用的信道特征（CSI Representation），然后在具体任务（如特定天线配置或特定优化目标）上进行微调。这极大地减少了针对新场景的训练成本。

- Tokenization 的灵活性： 通过将 CSI 数值转化为 Token，可以打破固定维度的限制。就像 NLP 处理不同长度的句子一样，BERT 也可以处理不同数量的用户或天线。

**论文的主要贡献：**

- 提出 BERT4beam 框架：首次将波束赋形优化定义为标记级的序列学习任务。

- 基础 BERT 模型：针对单一任务，展示了如何通过简单的模块重构来适应天线和目标的变化。

- UBERT 模型（通用 BERT）：引入“元素级标记化”和“任务嵌入（Task Embedding）”，实现了在单一模型下处理变规模、多任务的能力。

- 性能验证：通过仿真证明了其不仅在性能上逼近传统最优算法，且在泛化性上远超现有 AI 模型。

总结来说，引言部分成功地将 BERT 从 NLP 领域“翻译”到了物理层通信领域，论证了**把波束赋形看作处理一段带有干扰信息的序列**这一视角转换的科学价值。

### 1.2 系统模型和问题定义

#### 1.2.1 系统配置

论文首先设定了一个典型的下行链路 MU-MISO（多用户多输入单输出）系统场景：
- 发射端：一个 BS，配备 $N_T$ 根天线；
- 接收端：$K$ 个单天线 UEs；
- 信号模型：基站向这 $K$ 个用户发送信号。

发射信号向量 $\mathbf{x}$ 可以表示为：
$$\mathbf{x} = \sum_{k=1}^{K} \mathbf{w}_k s_k,$$
其中，$\mathbf{w}_k \in \mathbb{C}^{N_T \times 1}$ 是对应用户 $k$ 的波束赋形向量，$s_k$ 是发送给该用户的标量符号。

#### 1.2.2 接收信号与干扰模型

对于第 $k$ 个用户，收到的信号 $y_k$ 不仅包含自己的有用信号，还包含其他用户的干扰和热噪声：
- 有用信号：$\mathbf{h}_k^\mathsf{H} \mathbf{w}_k s_k$（$\mathbf{h}_k$ 是从基站到用户 $k$ 的信道向量）；
- 用户间干扰 (IUI)：$\sum_{i \neq k} \mathbf{h}_k^\mathsf{H} \mathbf{w}_i s_i$；
- 噪声：$n_k \sim \mathcal{CN}(0, \sigma_k^2)$。

基于此，计算出第 $k$ 个用户的 SINR（信噪比加干扰比）：$$\gamma_k = \frac{|\mathbf{h}_k^\mathsf{H} \mathbf{w}_k|^2}{\sum_{i \neq k} |\mathbf{h}_k^\mathsf{H} \mathbf{w}_i|^2 + \sigma_k^2}$$以及对应的可达速率：$$R_k = \log_2(1 + \gamma_k)$$

#### 1.2.3 系统效用函数

论文指出，不同的通信场景有不同的优化目标（Utilities），这体现了 BERT4beam 需要解决的通用性需求。文中定义了三种典型的目标函数 $U(\{\mathbf{w}_i\})$：
- 总速率 (Sum Rate, SR)：$\max \sum_{k=1}^K R_k$。目标是提高系统总吞吐量；
- 最小速率 (Min Rate, MR)：$\max \min_k R_k$。目标是保证所有用户间的公平性，提升最差用户的体验；
- 能量效率 (Energy Efficiency, EE)：$\max \frac{\sum R_k}{P_{total}}$。目标是在保证速率的同时尽量省电。

#### 1.2.4 优化问题定义
论文将波束赋形设计总结为一个受限优化问题：
- 目标：找到一组波束赋形向量 $\{\mathbf{w}_k\}_{k=1}^K$；
- 约束条件：总发射功率约束 $\sum_{k=1}^K \|\mathbf{w}_k\|_2^2 \le P_{Max}$。
- 
#### 1.2.5 总结

第二章不仅提供了数学背景，还揭示了波束赋形的核心逻辑困境：
- 耦合性：由于干扰项的存在，一个用户的波束向量 $\mathbf{w}_k$ 会影响所有其他用户的速率。这在数学上是非凸、高度耦合的。
- 维度敏感性：信道矩阵 $\mathbf{H} = [\mathbf{h}_1, \dots, \mathbf{h}_K]$ 的维度直接由 $K$ 和 $N_T$ 决定。

总结来说，第二章通过公式告诉我们：波束赋形本质上是根据输入的信道序列 $\mathbf{H}$，输出一套复杂的向量序列 $\mathbf{W}$。这种**序列对序列**的关系，正是论文后面引入 BERT 架构（处理序列学习的专家）的最根本原因。

### 1.3 基于 BERT 的单任务波束赋形优化

#### 1.3.0 单一任务的“可泛化”波束成形求解器
作者在单一系统目标（例如 SR / MR / EE 里的某一个）下，把传统的波束成形优化（求 $\mathbf{w}_k$）改写成 token 级序列学习：把每个用户的 CSI 当成一个 token，交给 BERT 的编码器用双向注意力学习“用户间干扰关系”，最后输出满足功率约束的波束向量。

#### 1.3.1 CSI Tokenization
——把复数 CSI 变成“每用户一个 token。

对第 $i$ 个用户，把复数信道向量 $\mathbf{h}_i\in \mathbb{C}^{N_T}$拆成实部、虚部并拼接成一个实值 token $\mathbf{t}_i = [ℜ(\mathbf{h}_i)^\mathsf{T}, ℑ(\mathbf{h}_i)^\mathsf{T}]^\mathsf{T}$。所有用户的 token 组成矩阵 $\mathbf{T}\in \mathbb{R}^{K\times 2N_T}$。

每个用户一个“词”，词里包含该用户从所有天线看到的复信道信息；后续注意力就能在“用户词”之间建模干扰耦合。

#### 1.3.2 BERT 模型

整体结构是：Embedding block → $L$ 个 Transformer Encoder Block (TEB) → Output layer。

##### Embedding block
——把 token 映射到高维特征。
$$T_\mathsf{emb}=\mathrm{ELU}(\mathrm{LN}(\mathbf{T}\mathbf{W}_\mathrm{fc})) \in \mathbb{R}^{K\times F} $$.

作用：对齐后续注意力模块的输入维度，同时 LN/ELU 提升训练稳定性与表达力。

##### TEB
——用双向多头注意力学“用户间上下文/干扰”。

- 多头注意力（MHA）：按 scaled dot-product attention 计算用户 token 间权重并汇聚（多头再 concat + 线性变换），再残差+LN。

- 前馈网络（FFN）：两层 FC，中间 GELU，再残差+LN。

关键点：BERT 的双向注意力适合这里，因为波束成形时本来就“同时知道所有用户 CSI”，并不是像语言生成那样只能看前文。


##### 输出层
- 先用两套实值权重把 $\mathbf{T}_\mathrm{sec}$ 映射到 $\mathbf{W}_\mathrm{out}\in \mathbb{C}^{K\times N_T}$；
- 再用 GPA（generalizable power adapter）把输出缩放到满足总功率约束（参数为 0 的“硬约束层”）：超标就按范数归一缩放，不超标就按$\sqrt{P_\mathrm{max}}$调整。
- 
意义：把约束满足从“学习出来”变成“结构保证”，减少违规解，提高跨功率预算的可迁移性。