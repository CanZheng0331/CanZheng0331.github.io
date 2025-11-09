2025/11/17-

---
由于文章太长，所有文献放在最前面：

<span id="ref1">[1]</span> [H. Lee, W. Zhou, M. Debbah and I. Lee, "On the Convergence of Large Language Model Optimizer for Black-Box Network Management," in IEEE Transactions on Communications, early access.](https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=11095730)

<span id="ref2">[2]</span> [Z. Xu, T. Zheng and L. Dai, "LLM-Empowered Near-Field Communications for Low-Altitude Economy," in IEEE Transactions on Communications, early access.](https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=11095730)


## 黑盒网络管理中大型语言模型优化器的收敛性研究 [[1]](#ref1)
### 写在前面
其实我对 LLM 做通信优化非常怀疑，尤其是我自己也做过 LLM 用于通信物理层的一些研究。在边缘，如果没有 GPU 而只用 CPU，有一些物理层的任务需要秒级的推理时间。尽管优化对时延的要求不比物理层，但就我接触到的一些工作来说，它们是迭代使用 LLM 的，包括下面要提到的论文。

后面我想通了，只要是发论文，管它能不能用，发就完了（bushi）。其实，我认为这种系统性能优化分为两种工作：一种是设计高效可用同时保持不错性能的算法；另一种是设计可能无法应用于实际，但可以接近理论最优解，或者可以提供一个性能 bound 的算法。从这个角度看，LLM 做优化问题明显是后面一种。

那么，既然复杂度非常高，那么它就需要提供一些传统算法、轻量级算法做不到的优势。那就是，可以将无法用数学语言/闭式解完美描述的问题用自然语言描述，并获得更好的性能。

### Abstract
未来的无线网络服务可能缺乏通用的数学模型（也就是很难用 closed-form 描述）——黑盒网络管理任务。

LLM 优化器（LLMO）框架（利用预训练的 LLM 作为优化智能体）最近被推广为一种很有前途的解决方案。该框架利用自然语言 prompt 描述给定的优化问题以及 LLM 自己生成的过去的解决方案。因此，LLM 可以在不知道目标函数的数学模型的情况下自主地获得有效的解。

本文首次为 LLMO 框架建立了理论基础。通过对 LLM 推理步骤的仔细研究，可以将 LLMO 过程解释为有限状态马尔可夫链，并证明了框架的收敛性。

本文的结果被扩展到多 LLM 架构，其中多个 LLM 的影响在收敛速度方面得到了严格的验证。

### 1 Introduction
为了满足未来无线通信系统的异构需求（也就是多目标优化），需要网络目标函数的数学模型（特别是定义网络性能的闭式表达式）以设计优化算法。然而：
1. 获取各种服务应用程序的精确模型是不可行的；
2. 此外，实际的无线通信网络包含几个问题，例如 CSI 不完善和硬件不完善。

因此，未来无线系统的性能指标往往缺乏闭式表达，从而导致黑盒优化（BBO）任务。 现有的网络优化方法，包括凸/非凸优化算法和基于深度学习的解决方案，严重依赖于梯度和 Hessians 的解析公式，无法解决目标函数不是以封闭形式给出的问题。

这些问题可以通过传统的 BBO 技术来解决，包括遗传算法（GA）、贝叶斯优化（BO）和无模型强化学习（RL）方法。这些方法利用从数值模拟或实际测量中获得的目标函数值，从而消除了对显式数学表达式的需要。传统的BBO方法需要大量的人工干预来确定超参数，如学习率、优化算法、神经网络架构和训练过程，因此它们的优化过程应该针对每个网络配置进行定制。因此，这些方法缺乏的泛化能力。

最近的研究表明，LLM 可以通过观察对其过去输出的反馈来相当地提高响应的质量。这样的属性使智能工作流能够通过反馈控制 LLM 的行为。经过大规模和多样化语料库的训练，LLM 可以使用输入提示中给出的几个示例来制定内部策略。这种上下文学习（in-context learning, ICL）能力使它们能够处理各种各样的无线资源分配和管理任务，而无需进行再训练。

在 LLMO 中，对过去 LLM 输出的奖励以新的提示形式提供，并指示 LLM 生成增强的解决方案。 迭代地用历史决策提示 LLM，使它们能够学习有效的优化策略。与现有的大量依赖超参数调优的BBO 技术相比，LLMO 不需要人为干预，因为它只依赖于预训练 LLM 的内部推理能力。

#### 1.1 相关工作
（详细的文献调研请见原文，这里只简单概括阶段性成果和限制）
1. LLMO 在凸优化问题中展示了其识别全局最优解的能力。后续中研究了更复杂的优化任务中的用例，在一些情况下优于传统的 BBO 算法。然而，LLMO 通常在未探索的解空间中挣扎，这使得解决一般的非凸优化任务变得具有挑战性；
2. 这个问题可以通过在 prompt 中提供附加信息来解决。LLM 设计用于执行已有的优化算法的操作，例如 GA 和梯度下降法。一些工作将目标函数的梯度向量直接纳入 prompt 中，性能优于传统的 LLMO。然而，这种方法需要人为制作 prompt 和目标函数的精确模型；
3. 一篇工作利用两个不同的 LLM 相互作用。试图克服过去 LLMO 框架有限的勘探能力。每个 LLM 都被分配到开发或探索候选解决方案。因此，可以有效地利用 LLM 的自主性来解决任何给定的非凸优化问题；
4. 无线通信网络中各种 BBO 任务的 LLMO 研究包括资源分配、无人机轨迹优化、接入点（AP）放置和网络切片。双 LLM 结构已扩展为通用的多 LLM 结构。与单个 LLM 相比，这种用于处理非凸资源管理问题的多 LLMO 方法有了显著改进。一篇工作表明，LLMO 可以达到与现有依赖数学模型的非凸优化算法几乎相同的性能；
5. 一篇工作将网络覆盖图视为只能通过模拟器评估的目标函数。此外，一篇工作还解决了网络切片问题，其目的是根据用户的服务质量需求将单个用户分配到适当的服务切片。 在这些情况下，由于缺乏数学模型，评估客观价值诉诸于计算昂贵的模拟。LLMO 在处理如此复杂的网络管理任务方面功能强大。

#### 1.2 创新点
本文首次通过分析 LLMO 的最优性和收敛性，给出了LLMO的理论基础。与传统的工作只简单地设计 LLMO 的启发式不同，本文建立了针对无线网络中一般非凸 BBO 任务的 LLMO 的最优性，重点是建立原始LLMO架构及其变体的理论分析。主要贡献总结如下：
1. 证明了 LLM 将优化变量视为有限语言空间内的离散表示。因此，LLMO 可以建模为马尔可夫链，其中根据过去的决策确定新的解决方案；
2. LLMO 的决策过程可以用有限状态马尔可夫链模型来表征。因此，LLM 作为一个随机智能体，将输入中的过去解映射到新的候选解。这为收敛性提供了理论保证，即 LLM 生成的解收敛于全局最优。在此基础上，我们可以推导出收敛的必要条件，为设计高效的 LLMO 提供指导；

    (1、2 感觉在说同一件事：即 LLM 迭代吐出来的答案越来越接近全局最优)

3. 分析扩展到一个通用的多 LLM 场景，其中几个 LLM 通过交换他们的决策历史来协作解决 BBO 问题，严格证明了这种多 LLMO 方法的最优性和收敛性，并考察了 LLM 个数对收敛速度的影响；
4. 通过大量的数值模拟验证了理论结果。LLMO 的可行性在各种网络问题中得到了验证，包括干扰信道（IFCs）、多用户广播信道（BCs）和大规模多输入多输出（MIMO）系统中的资源管理。在这些应用场景中，LLMO 被证明可以产生与现有优化算法几乎相同的性能。

### 2 LLM 优化器框架

考虑一个使奖励函数 $r(\cdot)$ 最大化的优化问题。我们的目标是确定一个表示网络策略的动作向量 $\mathbf{x}\in \mathbb{R}^D$。相应的问题可以表示为 
$$\max\_{\mathbf{x}\_\mathsf{min} \preceq \mathbf{x} \preceq \mathbf{x}\_\mathsf{max}} r(\mathbf{x}),\tag{1}$$
其中，$\mathbf{x}\_\mathsf{min}$ 和 $\mathbf{x}\_\mathsf{max}$ 分别是 $\mathbf{x}$ 的下界和上界。由于无线网络的复杂性，通常没有描述网络性能指标 $r(\cdot)$ 的数学模型。相反，奖励值可以通过数值模拟或现实世界的测量来评估。

LLM 作为 BBO 求解器，在不使用 $r(\cdot)$ 的任何数学模型的情况下，通过观察候选行为及其相应的奖励值来生成改进的行为。与传统的BBO技术不同，LLMO 框架不需要人为干预，例如超参数的额外微调和神经网络的再训练。这导致了高水平的泛化，使 LLM 能够普遍地解决各种网络问题。

然而，目前还没有基础性的研究建立 LLMO 的理论保证，特别是最优性和收敛性。所以现有的工作仅限于开发仅适用于特定系统的 LLMO 启发式方法。 为了充分了解 LLMO 的潜力和局限性，本文的目标是通过对 LLM 推理计算的严格分析来研究其基本原理。

#### 2.1 LLMO
LLMO 由以下组件构成:

- 预训练 LLM ($\mathcal{L}$)：生成候选解；
- 记忆单元 $\mathbb{M}^{(t)}$：存储历史动作与奖励；
- 采样算子 $\mathcal{S}(\cdot)$：选择若干高奖励样本作为上下文；
- 提示生成器 $\mathcal{P}(\cdot)$：构造新的输入 prompt；
- 奖励函数 $r(\cdot)$：通过仿真或实际测量获取反馈。

算法流程如下：

---
1. 初始化（$t=0$）：

- 随机生成种群大小 $P$ 的初始动作矩阵 $\mathbf{X}^{(0)} = [\mathbf{x}^{(0)}_1, \cdots, \mathbf{x}^{(0)}\_P]^\mathsf{T} \in \mathbb{R}^{P \times D}$。
- 计算奖励向量 $\mathbf{r}^{(0)} = [r(\mathbf{x}^{(0)}_1), \cdots, r(\mathbf{x}^{(0)}_P)]^\mathsf{T}$。
- 初始化内存 $\mathbb{M}^{(0)} = [\mathbf{X}^{(0)}, \mathbf{r}^{(0)}]$，最佳动作 $\mathbf{x}^{(0)}_{\mathsf{best}} = \arg\max_p r(\mathbf{x}^{(0)}_p)$，$r^{(0)}_{\mathsf{best}} = r(\mathbf{x}^{(0)}_{\mathsf{best}})$。
2. 迭代过程（$t = 1$ 到 $T$）：
- 采样上下文示例：
    $$[\mathbf{X}^{(t-1)}_{\mathsf{ex}}, \mathbf{r}^{(t-1)}_{\mathsf{ex}}] = \mathcal{S}(\mathbb{M}^{(t-1)}).$$
    - 精英采样（elitist sampler）：选内存中奖励最高的 $P$ 个动作-奖励对（推荐，用于收敛）。

    - LIFO 采样：选最近的 $P$ 个（简单，但探索性强）。
    $$[\mathbf{X}^{(t-1)}_{\mathsf{ex}}, \mathbf{r}^{(t-1)}_{\mathsf{ex}}] = 
    \begin{cases}
    [\mathbf{X}^{(t-1)}_{\mathsf{best}}, \mathbf{r}^{(t-1)}_{\mathsf{best}}], & \mathsf{elitist}, \\
    [\mathbf{X}^{(t-1)}, \mathbf{r}^{(t-1)}], & \mathsf{LIFO}.
    \end{cases}\tag{2}$$
- 生成提示：
    $$\mathsf{pmpt}^{(t-1)} = \mathcal{P}(\mathbf{X}^{(t-1)}\_{\mathsf{ex}}, \mathbf{r}^{(t-1)}\_{\mathsf{ex}}).\tag{3}$$
    提示结构（如 Fig. 2）：
    - 任务描述：说明优化目标（最大化奖励，动作维度 $D$，界限）。
    - 数据格式：解释 CSV 格式（前 $D$ 列动作，最后列奖励）。
    - 上下文示例：插入采样对（CSV 表格）。
    - 指令：要求生成 $P$ 个新动作（不同于历史，提升奖励，CSV 格式，无额外文本/代码）。


- LLM生成新动作：
    $$\mathbf{X}^{(t)} = \mathcal{L}(\mathsf{pmpt}^{(t-1)}) = [\mathbf{x}^{(t)}_1, \cdots, \mathbf{x}^{(t)}_P]^\mathsf{T}.\tag{4}$$
    计算 $\mathbf{r}^{(t)}$，更新最佳：若 $\max_p r(\mathbf{x}^{(t)}\_p) > r^{(t-1)}_{\mathsf{best}}$，则更新 $\mathbf{x}^{(t)}\_{\mathsf{best}}$ 和 $r^{(t)}\_{\mathsf{best}}$。
    - 更新内存：
    $$\mathbb{M}^{(t)} = \begin{bmatrix} \mathbf{X}^{(t)} & \mathbf{r}^{(t)} \\ \mathbf{X}^{(t-1)}_{\mathsf{ex}} & \mathbf{r}^{(t-1)}_{\mathsf{ex}} \end{bmatrix}.\tag{5}$$
    只保留新动作和上下文示例，避免内存爆炸。
3. 输出 $\mathbf{x}^{(T)}_{\mathsf{best}}$。
---

数学表述：

- 动作种群：$\mathbf{X}^{(t)} \in \mathbb{R}^{P \times D}$。
- 奖励评估：黑箱调用 $r(\cdot)$。
- 输出：$\mathbf{X}^{(t)} = \mathcal{L}(\mathcal{P}(\mathcal{S}(\mathbb{M}^{(t-1)})))$。

#### 2.2 无线网络中的实现

部署架构（Fig. 3）：

- 云服务器（GPU-enabled）：运行LLMO（推理、内存管理、采样、提示生成）。
- 交互流程：

  1. 云生成 $\mathbf{X}^{(t)}$（e.g., BS 传输策略）。
  2. 通过回程链路发送至 BS。
  3. BS 基于 $\mathbf{X}^{(t)}$ 发送导频至设备。
  4. 设备测量指标（信号强度、干扰、速率），反馈至 BS。
  5. BS 汇总成 $\mathbf{r}^{(t)}$，返回云。


- 开销分析：迭代 $T$ 增加性能，但加剧协调开销（导频/反馈）。需平衡 $T$（后续Section III 分析收敛以指导）。
- 适用场景：资源分配、UAV 轨迹、接入点放置、网络切片等黑箱任务。

#### 2.3 与提示工程的关系

- ICL：上下文示例作为“演示”，帮助 LLM 对齐新任务；
- CoT（Chain-of-Thought）变体：历史决策作为“思维链”，引导 LLM 逐步改进（零样本 CoT：从初始 $\mathbf{X}^{(0)}$ 自反馈）；
- 幻觉问题：LLM可能生成低质量动作（hallucination），但迭代反馈缓解；
- 优势：无需人工思维步，自主生成“思想”。

### 3 LLMO 的理论分析

#### 3.1 LLM 推理机制

LLM 推理包括编码、嵌入、Transformer 层和解码步骤。

在编码步骤中，自然语言输入通过分词器 $ \mathcal{T}(\cdot) $ 进行预处理，该分词器将 $\mathsf{pmpt}$ 划分为较小的 token。输入提示 $\mathsf{pmpt}$ 的 token 向量表示为
$$\mathbf{z}^{\mathsf{in}} = [z^{\mathsf{in}}_1, \cdots, z^{\mathsf{in}}_{N_{\mathsf{in}}}] = \mathcal{T}(\mathsf{pmpt}),
\tag{6}$$
其中 $ z^{\mathsf{in}}_i \in \mathbb{Z} $ 是输入提示的第 $ i $ 个 token，$ N_{\mathsf{in}} $ 表示 token 数量。

接下来，嵌入层 $ \mathcal{E}(\cdot) $ 将每个 token $ z^{\mathsf{in}}_i $ 转换为嵌入向量 $ \mathbf{e}^{\mathsf{in}}_i $： $ \mathbf{e}^{\mathsf{in}}_i = \mathcal{E}(z^{\mathsf{in}}_i) $。

嵌入集合 $ \mathbf{e}^{\mathsf{in}} \triangleq [\mathbf{e}^{\mathsf{in}}_1, \cdots, \mathbf{e}^{\mathsf{in}}_{N_{\mathsf{in}}}] $ 随后由 Transformer 层 $ \mathcal{A}(\cdot) $ 处理，该层包含多头掩码自注意力、前馈网络和层归一化。

当前 LLM 依赖自回归架构，依次确定输出 token。设 $z^{\mathsf{out}}_k $ 为第 $ k $ 个输出 token。给定之前的输出 token $ z^{\mathsf{out}}_{[1:k-1]} \triangleq [z^{\mathsf{out}}_1, \cdots, z^{\mathsf{out}}_{k-1}] $，我们使用 Transformer 层 $ \mathcal{A}(\cdot) $ 获得第 $ k $ 个输出 token $ z^{\mathsf{out}}_k $ 的 logit 向量 $ \mathbf{b}_k $，表示为

$$\mathbf{b}_k = \mathcal{A}([\mathbf{e}^{\mathsf{in}}, \mathbf{e}^{\mathsf{out}}_1, \cdots, \mathbf{e}^{\mathsf{out}}_{k-1}]),
\tag{7}$$

其中 $ \mathbf{e}^{\mathsf{out}}_k \triangleq \mathcal{E}(z^{\mathsf{out}}_k) $ 表示第 $ k $ 个输出token $ z^{\mathsf{out}}_k $ 的嵌入向量。设 $ p_{\mathcal{L}}(\cdot|\cdot) $ 为 LLM 学习的条件分布。生成第 $ k $ 个token $ z^{\mathsf{out}}_k $ 的概率为
$$p_{\mathcal{L}}(z^{\mathsf{out}}_k | z^{\mathsf{out}}_{[1:k-1]}, \mathbf{z}^{\mathsf{in}}) = \mathsf{softmax}(\mathbf{b}_k / \alpha)_{z^{\mathsf{out}}_k},
\tag{8}$$
其中 $ \alpha > 0 $ 表示控制输出随机性的温度参数。整个输出序列 $ \mathbf{z}^{\mathsf{out}} = [z^{\mathsf{out}}_1, \cdots, z^{\mathsf{out}}_{N_{\mathsf{out}}}] $ 自回归生成，直至采样到序列结束（EOS）token。

在 LLMO 框架中，输出动作种群 $ \mathbf{X}^{(t)} $ 以逗号分隔值（CSV）格式生成。这意味着 $ \mathbf{X}^{(t)} $ 是一个由数字字符、逗号和换行符组成的字符串。由于浮点数的有限精度和分词器 $ \mathcal{T}(\cdot) $ 的离散性质，所有可能的动作种群 $ \mathbf{X} $ 构成有限集合。这一观察在以下引理中被形式化。


// 到这勉强是 LLM 的基础，前段时间写学位论文的时候还稍微学了点，能看懂，后面貌似上强度了......
..






## LLM 赋能低空经济近场通信 [[2]](#ref2)

### 写在前面

这是 Linglong Dai 教授组的文章。他们组基本上所有代码都开源，且私以为在无线通信领域他们做的基本都是比较开创性的工作，即“画饼”类型的工作，我这种小卡拉米就跟在他们后面喝汤。这篇文章也是他们深耕的领域，即近场通信，只不过加上了低空经济的背景，和 LLM 做优化求解。其实乍一眼看还挺好奇：
1. 因为明明是优化问题，为什么可以通过监督学习去训练模型？
2. 貌似固定了用户数为 $K$，那么如果用户数变了，就得从头训练模型？

这是我的第一印象。带着这些问题，我开始读论文。

### 0 摘要
低空经济（LAE） 与 XL-MIMO 近场通信的自然结合：LAE 可利用近场波束聚焦（beamfocusing）特性精确聚焦能量到 UAV 位置，并通过额外距离维度提升频谱效率 （SE）。现有研究仅限于理想水平面场景，而LAE场景面临复杂挑战（如预编码和功率分配联合优化）。论文首次应用 LLM（如微调 GPT-2）解决 LAE 近场通信的频谱效率最大化问题，通过设计适配器（adapters）实现远近场用户区分和联合优化。模拟结果验证了方案的有效性和优越性。

### 1 引言

- 背景：LAE近年来备受关注，利用 UAV 等飞行设备支持城市交通、物流等应用。无线通信视角下，LAE 网络依赖 UAV 的无缝连接和轨迹规划。XL-MIMO 作为潜在关键技术，通过极大规模天线阵列（ELAA）提供更高空间分辨率和复用增益。在 XL-MIMO 中，随着天线数增加，近场区域扩大（例如，256 天线@30GHz 的近场区域约 326.5米），需采用球面波模型而非平面波。球面波模型引入距离维度，支持波束聚焦，如手电筒般精确集中能量。
  
- LAE 与近场通信的结合：UAV 比地面用户更接近 BS 天线，更易受益于近场通信。可利用波束聚焦缓解干扰，并通过位置分多址（LDMA）服务同角度不同距离的 UAV，提升频谱效率。
- 挑战：现有近场通信研究限于理想水平面，忽略 BS 高度和倾斜角，导致 LAE 场景模型复杂。需联合优化预编码和功率分配，区分远近场用户（UAV 和地面用户），并处理非凸优化问题。
- 贡献：

    - 新应用场景：首次探讨 LAE 与近场通信的协同，利用波束聚焦和距离域资源提升UAV性能。
    - 新系统模型：考虑 BS 高度和倾斜角，导致水平面近场区域变化，提出“有效近场区域”（Effective Near-Field Region, ENFR）概念。
    - 新技术：应用 LLM（微调 GPT-2）解决频谱效率最大化问题，实现远近场区分和预编码/功率分配联合优化。

### 2 系统模型

考虑一个下行 XL-MIMO 通信系统，其中 BS 部署了一个 $N$ 天线均匀线性阵列（ULA），为 $ K $ 个单天线用户提供服务。为简化分析，本文采用了一种简化的笛卡尔坐标模型，即在 $ x $  -  $ y $  -  $ z $ 坐标系中仅关注 $ x $  -  $ z $ 平面。$ x $  -  $ z $ 平面模型引入了基站高度 $ h_B $ 和倾斜角 $ \theta_{\text{tit}} $，这对于 LAE 的近场通信至关重要，也是本文系统模型在新型应用场景中的主要差异所在。

因此，在本文中，我们通过聚焦于水平距离和垂直高度这两个对 LAE 近场通信至关重要的维度来简化分析，同时为了表达的简洁性，忽略了 $ y $ 方向上的变化。相比之下，传统的 $ x $-$ y $ 平面模型完全无法考虑基站高度 $ h_B $ 和倾斜角 $ \theta_{\text{tit}} $ 的影响。为了清晰对比，我们在传统模型中同样忽略了 $ y $ 平面，这一对比关系如图 1 所示（这段没看懂，不知道想说明什么）。

为了统一表达，我们使用 $ (x_k, h_k) $ 来表示用户 $ k $ 的坐标（其中 $ h_k $ 可以是 0 或 $ h'_k $），并定义用户 $ k $ 的垂直角度为：$\theta_k = \tan^{-1}\left( \frac{|h_k - h_B|}{x_k} \right).$

设 $ \mathbf{h}_k \in \mathbb{C}^{N \times 1} $ 表示用户 $ k $ 的下行信道向量，则其接收信号可以表示为：


$$y_k = \mathbf{h}_k^H \mathbf{W} \mathbf{P} \mathbf{s} + n,\tag{1}$$

其中，$ \mathbf{W} = [\mathbf{w}_1, \mathbf{w}_2, \dots, \mathbf{w}_K] \in \mathbb{C}^{N \times K} $ 表示发射预编码矩阵，$ \mathbf{P} = \text{diag}\{\sqrt{P_1}, \sqrt{P_2}, \dots, \sqrt{P_K}\} \in \mathbb{C}^{K \times K} $ 表示功率分配矩阵，并满足总功率约束 $ \sum_{k=1}^K P_k \leq P $，$ P $ 为最大发射功率。$ \mathbf{s} $ 表示归一化功率的发射信号，满足 $ \mathbb{E}[\mathbf{s}\mathbf{s}^H] = \mathbf{I} $，$ n $ 表示接收端噪声，服从复高斯分布 $ \mathcal{CN}(0, \sigma^2) $，其中 $ \sigma^2 $ 为噪声方差。

*(注：为简化起见，本文采用准静态环境假设，即在信道相干时间内，无人机和地面用户的位置保持固定，这也是近场通信中进行预编码和功率分配的典型场景。)*

一般来说，信道模型可以根据电磁波传播特性分为远场模型和近场模型。瑞利距离（Rayleigh distance） 通常被视为远近场的边界，其定义为：$R = \frac{2D^2}{\lambda},$
其中 $ D $ 表示阵列孔径，$ \lambda $ 表示载波波长。在经典 MIMO 系统中，天线阵列的元素数量较少，瑞利距离相对较小，因此可以采用平面波传播模型来建模远场信道。Saleh-Valenzuela 模型（S-V）被广泛采用，远场信道 $ \mathbf{h}_k^{\text{far}} $ 可以表示为：
$$\mathbf{h}_k^{\text{far}} = \sqrt{N} \alpha_0 \mathbf{a}(\theta_0) + \sum_{l=1}^L \sqrt{\frac{N}{L}} \alpha_l \mathbf{a}(\theta_l),\tag{2}$$
其中，$ \alpha_0, \theta_0 $ 分别为直射路径（LoS）的复增益和出发角（AoD），$ \alpha_l, \theta_l $ 分别为第 $ l $ 条非直射路径（NLoS）的复增益和出发角，$ L $ 为 NLoS 路径总数。对于 ULA，波束导向向量 $ \mathbf{a}(\theta) $ 可以表示为：
$$\mathbf{a}(\theta) = \frac{1}{\sqrt{N}}
\begin{bmatrix}
1 \\
e^{j \pi \sin \theta} \\
\vdots \\
e^{j (N-1) \pi \sin \theta}
\end{bmatrix},\tag{3}$$
其中 $ \theta \in [-\pi/2, \pi/2] $ 表示物理方向。

在 XL-MIMO 系统中，随着基站天线数量的增加，近场区域显著扩大，因此必须采用球面波传播模型来精确表征近场信道 $ \mathbf{h}_k^{\text{near}} $：
$$
\mathbf{h}_k^{\text{near}} = \sqrt{N} \alpha_0 \mathbf{b}(\theta_0, r_0) + \sum_{l=1}^L \sqrt{\frac{N}{L}} \alpha_l \mathbf{b}(\theta_l, r_l),\tag{4}$$
此外，$ \mathbf{b}(\theta, r) $ 表示近场波束聚焦向量，其中 $ \theta = \theta_k - \theta_{\text{tit}} $ 是本文模型中的实际使用角度。与远场波束导向向量仅能将能量聚焦于特定方向不同，近场波束聚焦向量能够将能量精确聚焦于空间中的特定位置，这种特性也被称为近场波束聚焦。对于 ULA，近场波束聚焦向量 $ \mathbf{b}(\theta, r) $ 可以表示为：
$$\mathbf{b}(\theta, r) = \frac{1}{\sqrt{N}}
\begin{bmatrix}
e^{-j \frac{2\pi}{\lambda} (r_0 - r)} \\
\vdots \\
e^{-j \frac{2\pi}{\lambda} (r_{N-1} - r)}
\end{bmatrix},\tag{5}$$
其中，$ r_n $ 和 $ r $ 分别表示用户与第 $ n $ 个天线以及阵列中心之间的距离。$ r_n $ 可以表示为：
$$r_n = \sqrt{r^2 - 2 n d r \sin \theta + n^2 d^2}.$$
通过菲涅耳近似（Fresnel approximation），我们可以进一步得到：
$$r_n \approx r - n d \sin \theta + \frac{n^2 d^2 \cos^2 \theta}{2r},\tag{6}$$
其中近似 (a) 是通过泰勒展开 $ \sqrt{1 + x} \approx 1 + \frac{x}{2} - \frac{x^2}{8} + O(x^3) $ 得到的。从公式 (4) 和 (5) 可以看出，近场信道不仅与角度相关，还与距离密切相关。与简单的 XL-MIMO 系统建模不同，本文所采用的实际模型中，水平面上的近场区域发生了了显著变化，这一点将在下一节中进行详细分析。

### 3 有效近场区域

本文提出了一种称为**有效近场区域**（Effective Near-Field Region, ENFR）的概念，用以在所采用的实际 XL-MIMO 系统模型中定义水平面上的近场区域。具体而言，本文通过波束形成增益损失（beamforming gain loss）来定义 ENFR。在 ENFR 内，若采用远场波束形成向量，则波束形成增益损失低于预设阈值 $  \Delta  $，即
$$1 - |\mathbf{b}(\theta, r)^H \mathbf{a}(\theta)| \geq \Delta,$$
其中 $  \mathbf{a}(\theta) = \frac{1}{\sqrt{N}} [1, e^{j\pi\theta}, \dots, e^{j(N-1)\pi\theta}]^\mathsf{T}  $ 表示适用于 ULA 的远场波束形成向量。因此，ENFR 可通过以下引理进行定义。

> **Lemma 1：** 对于我们在第 II 节中讨论的实际 XL-MIMO 系统模型，ENFR 可以表示为
$$I_{\text{ENFR}} = \left[ \frac{h_B}{\tan \theta_k^-}, \frac{h_B}{\tan \theta_k^+} \right],\tag{7}$$
其中 $\theta_k^-$ 和 $\theta_k^+$ 是方程
$$\sin \theta_k \cos^2(\theta_k - \theta_{\text{tit}}) = \frac{2 h_B \beta_\Delta^2 \lambda}{N^2 d^2}$$
的两个解，而 $\beta_\Delta$ 是满足 $|G(\beta_\Delta)| = 1 - \Delta$ 的解，其中
$$|G(\beta)| = \left| \frac{\int_0^\beta e^{-j \frac{1}{2} \pi t^2} dt}{\beta} \right|.$$
 *几何解释*：
    - 水平距离 $x_k \in [x_{\min}, x_{\max}]$，对应 $\theta_k \in [\theta_k^+, \theta_k^-]$（注意角度递减）
    - 边界 $x = \frac{h_B}{\tan \theta}$，即从 BS 中心出发的两条切线与地面的交点

根据 **引理 1** ，我们可以发现，与现有文献中根据有效瑞利距离（Effective Rayleigh Distance, ERD）区分远场和近场区域的做法不同，在本文所采用的实际模型中，ENFR 将整个空间划分为了三个区域。随着与基站的水平距离增加，水平面被依次划分为:远场 → 近场 → 远场。当地面用户位于 ENFR 内时，它们可被视为近场用户，从而能够受益于近场波束聚焦。

由于本文考虑了基站天线的高度和倾斜角，以及水平面上的 ENFR，XL-MIMO 系统中的多用户 SE 最大化问题将变得更加复杂。将基站高度和倾斜角纳入模型，引入了理想水平面模型中不存在的挑战，例如近场边界随 $\theta_{\text{tit}}$ 和 $h_B$ 变化的复杂性，这要求针对 LAE 的用户分布进行自适应的分类和预编码。因此，如何应用 LLM 赋能 XL-MIMO 系统中的近场多用户通信，成为一个关键问题，这将在下一节中进行分析。

### 4 LLM 赋能的近场多用户通信

在本节中：
- 形式化定义近场多用户通信的频谱效率最大化问题；
- 详细阐述所提出的模型框架。具体而言，该模型能够联合实现远场与近场用户的区分，并设计多用户预编码矩阵，其核心优势将在后续章节中逐一展开；
- 总结了所提 LLM 方案相对于传统求解器的显著优势。

#### 4.1 问题形式化

根据接收信号表达式 (1)，用户 $ k $ 的 信干噪比（SINR）可表示为：

$$\text{SINR}_k = \frac{P_k |\mathbf{h}_k^H \mathbf{w}_k|^2}{\sum_{j\neq k} P_j |\mathbf{h}_k^H \mathbf{w}_j|^2 + \sigma^2}\tag{10}.$$


进而，其可达速率为：

$$R_k = \log_2 (1 + \text{SINR}_k).\tag{11}$$

因此，近场多用户通信的频谱效率最大化问题可建模为：

$$\boxed{
\begin{aligned}
\max_{\{\mathbf{W}, \mathbf{P}\}} \quad 
& \sum_{k=1}^K R_k = \sum_{k=1}^K \log_2 (1 + \text{SINR}_k) \\
\text{s.t.} \quad 
& \text{C1}: \sum_{k=1}^K P_k \leq P, \\
& \text{C2}: P_k \geq 0, \quad \forall k, \\
& \text{C3}: \alpha_N \leq \alpha_c, \\
& \text{C4}: R_k \geq R_{\min}, \quad \forall k, \\
& \text{C5}: \|\mathbf{w}_k\|^2 = 1, \quad \forall k.
\end{aligned}
}\tag{10}$$

其中：
- $\alpha_c \in [0,1]$ 为预设近场功率分配上限；
- $\alpha_N$ 定义为近场用户总功率占比，即：$P_N = \alpha_N P \leq \alpha_c P, $ 其中 $ P_N $ 为所有近场用户分配的总功率。



#### 4.2 远场与近场用户区分

1. 区分的必要性：准确区分远场与近场用户是系统性能的关键基石。错误分类将导致严重后果：

| 误分类策略 | 后果 |
|-----------|------|
| 全部视为远场用户 | 近场用户采用平面波模型 $\mathbf{a}(\theta)$ → 波束无法聚焦，能量发散，SINR 急剧下降 |
| 全部视为近场用户 | 远场用户采用球面波模型 $\mathbf{b}(\theta, r)$ → 计算复杂度 $ \mathcal{O}(N^2) $ 爆炸，存储开销巨大，且无性能增益 |

更严重的是：实际系统中难以精确获取用户距离 $ r $，无法通过“$ r \stackrel{?}{<} \text{ERD} $”进行阈值判断。

2. 分类对预编码策略的直接影响：用户分类结果直接决定预编码向量选择：

| 用户类型 | 预编码向量 | 优化目标 |
|---------|-----------|---------|
| 近场用户 | $\mathbf{b}(\theta_k, r_k)$ | 能量空间聚焦，实现“手电筒”效应 |
| 远场用户 | $\mathbf{a}(\theta_k)$ | 方向性波束，抑制角度域干扰 |

结合 C3 约束，近场用户可获得更高功率权重，实现：
   - 资源高效利用
   - 干扰精准抑制
   - 频谱效率最大化

3. 所提出的分类流程

> **步骤 1：信道输入预处理**
>- 将 $ K $ 个用户的复数信道向量拼接为矩阵：$\mathbf{H} = [\mathbf{h}_1, \mathbf{h}_2, \dots, \mathbf{h}_K] \in \mathbb{C}^{N \times K}$
>- 重排为实数张量：$\mathbf{X}_{\text{in}} \in \mathbb{R}^{K \times 2N}$
>- 进行批归一化（Batch Normalization）：$\mathbf{X}_{\text{norm}} = \frac{\mathbf{X}_{\text{in}} - \mu}{\sigma}$
>- 作用：加速梯度收敛，缓解深层网络训练不稳定

>**步骤 2：注意力编码器（Attention-based Encoder）**
>- 采用 $ L = 3 $ 层 可训练 Transformer 解码器块，输出：$\mathbf{X}_{\text{en}} = \text{Encoder}(\mathbf{X}_{\text{norm}}).$
...

>**步骤 3：嵌入投影（Embedding Projection）**
线性变换至 LLM 隐藏维度 $ d $（GPT-2 最小版 $ d=768 $）：$\mathbf{X}_{\text{emb}} \in \mathbb{R}^{K \times d}.$

>**步骤 4：LLM 骨干推理**
>- 输入 预训练 GPT-2 模型：$\mathbf{X}_{\text{LLM}} = \text{LLM}(\mathbf{X}_{\text{emb}})$
>- 微调策略：
>  1. 冻结：自注意力层 + MLP 主干
>  2. 微调：仅 Add 层 + LayerNorm 层
>  3. 优势：保留通用语言推理能力，适配无线优化任务
>  4. 可替换性：GPT-2 可换为 Llama、Qwen 等更大模型

>**步骤 5：输出投影与分类头**
>通过全连接 + Sigmoid 激活：
>$\mathbf{X}_{\text{out}} = \text{Sigmoid}(\text{Linear}(\mathbf{X}_{\text{LLM}}))$
>取第一维作为分类概率：$\hat{\mathbf{X}}_{\text{cl}} = \mathbf{X}_{\text{out}}[:, 0] \in [0,1]^K$
>使用 均方误差（MSE） 监督训练：$\text{Loss}_{\text{cl}} = \|\mathbf{X}_{\text{cl}} - \hat{\mathbf{X}}_{\text{cl}}\|_2^2$

#### 4.3 LLM 赋能的多用户预编码

1. 理论最优预编码结构启发
根据经典 ZF/MRT 混合预编码理论，最优预编码向量满足：
$$\mathbf{w}_k^* = \frac{
\left( \mathbf{I}_N + \sum_{j=1}^K \frac{\lambda_j}{\sigma^2} \mathbf{h}_j \mathbf{h}_j^H \right)^{-1} \mathbf{h}_k
}{
\left\| \cdot \right\|
}$$

启发：若能学习拉格朗日乘子 $\lambda_k$ 与功率 $ p_k $，即可恢复最优解。


2. LLM 输出头设计
LLM 输出 $ K \times 3 $ 维张量 $\mathbf{X}_{\text{out}}$：

   - $\mathbf{X}_{\text{out}}[:, 0]$ → 分类概率
   - $\mathbf{X}_{\text{out}}[:, 1]$ → 拉格朗日乘子 $\boldsymbol{\lambda} \in \mathbb{R}^K$
   - $\mathbf{X}_{\text{out}}[:, 2]$ → 原始功率向量 $\mathbf{p} \in \mathbb{R}^K$

功率缩放模块：为满足 C1 约束：$\mathbf{p} \leftarrow \mathbf{p} \cdot \min\left(1, \frac{P}{\sum_k p_k}\right)$
恢复模块（Recovery Module）：根据 $\boldsymbol{\lambda}, \mathbf{p}$ 与分类结果，构造：$\mathbf{W} = [\mathbf{w}_1, \dots, \mathbf{w}_K], \quad
\mathbf{P} = \text{diag}\{\sqrt{p_1}, \dots, \sqrt{p_K}\}$


3. 预编码优化损失函数：$\text{Loss}_{\text{pre}} = -\sum_{k=1}^K R_k + \gamma_1 \cdot \text{penal}$，其中惩罚项：$\text{penal} = \sum_{k=1}^K \max\{R_{\min} - R_k, 0\}\quad \text{(L1 惩罚)}$

4. 总损失函数: $\text{Loss} = \gamma_2 \cdot \text{Loss}_{\text{cl}} + \text{Loss}_{\text{pre}}$，平衡分类准确性与速率性能。


### 5 仿真结果

在本节中，我们通过全面的数值仿真验证所提出LLM 赋能近场多用户通信方案的有效性和优越性。我们从以下 **7 个关键维度** 进行评估：

| 评估维度 | 对应图表 |
|--------|--------|
| 1. ENFR 验证 | 图 4 |
| 2. 训练收敛性 | 图 5 |
| 3. 分类准确率 | 表 I |
| 4. 频谱效率 vs 用户数 $ K $ | 图 6 |
| 5. 频谱效率 vs 近场功率因子 $ \alpha_N $ | 图 7 |
| 6. 频谱效率 vs 最低速率 $ R_{\min} $ | 图 8 |
| 7. 频谱效率 vs 发射功率 $ P $ | 图 9 |
| 8. 计算复杂度对比 | 表 II |
| 9. 超参数敏感性分析 | 表 III |

---
#### 5.1 ENFR 验证：
验证 Section III 中推导的 ENFR 边界 是否准确。
    - 仿真方法：
      - 固定 BS 位置，倾斜角 5°
      - 用户沿水平线 $ x \in [0, 200] $ 移动，高度 $ h_k = 0 $
      - 计算归一化增益损失：$\Delta(x) = 1 - |\mathbf{b}(\theta(x), r(x))^H \mathbf{a}(\theta(x))|$
      - 设定阈值 $ \Delta = 0.1 $

   - 结果：
     - 增益损失随 $ x $ 呈 “下降 → 上升” 趋势
     - 最低点出现在 $ x \approx 60 $ m，符合理论预测
     - 两个交点 $ x_1 \approx 30 $ m, $ x_2 \approx 120 $ m
     - 理论 ENFR 区间：$ [h_B / \tan \theta_k^+, h_B / \tan \theta_k^-] \approx [32, 118] $ m
     - 仿真与理论误差 < 5%**，**验证 Lemma 1 正确性

   - 结论：ENFR 准确划分了“远-近-远”三段结构，为后续分类提供可靠依据。


#### 5.2 训练收敛性

- 目标：验证 LLM 模型是否稳定收敛。

- 训练细节：
  - 总损失：$ \text{Loss} = \gamma_2 \text{Loss}_{\text{cl}} + \text{Loss}_{\text{pre}} $
  - 初始学习率 1e-4，余弦退火
  - 每 10 epoch 记录验证损失

- 结果：
  - 训练损失：从 12.5 快速下降至 2.8（第 50 epoch）
  - 验证损失：第 304 epoch 达到最低点 2.31
  - 之后轻微震荡，无过拟合
  - 分类损失 $ \text{Loss}_{\text{cl}} $ 收敛至 < 0.01

- 结论：LLM 框架在 300 epoch 内高效收敛，训练稳定。

---

#### 5.3 分类准确率

- 目标：评估远/近场用户分类性能。

- 基准方法：
  - CNN：3层卷积 + 全连接
  - Transformer：6层编码器
  - 所提 LLM

- 结果（表 I）：
  - LLM 在 SNR>10 dB时，准确率 > 99%
  - 得益于 注意力机制捕捉用户间信道相关性
  - 传统方法受噪声干扰大，LLM 鲁棒性极强

---

#### 5.4 频谱效率 vs 用户数 $ K $

- 目标：验证多用户复用增益。

- 基准方案
  - Capacity：理论上界（穷尽搜索）
  - Near-field NOMA
  - LDMA
  - Far-field SDMA
  - CNN / Transformer

- 结果（图 6）：
- 所有方案随 $ K $ 增加，频谱效率上升（多用户分集）
  - LLM 曲线紧贴 Capacity 上界
  - LLM 提升显著，得益于：精准分类、近场波束聚焦、距离域 LDMA 复用

---

#### 5.5 频谱效率 vs 近场功率因子 $ \alpha_N $

- 目标：验证 C3 约束的灵活性。
- 设置：$ K=8, P=20 $ W，$ \alpha_N \in [0,1] $

- 结果：
  - $ \alpha_N = 0 $：全功率给远场 → 效率最低
  - $ \alpha_N = 1 $：全功率给近场 → 效率最高
  - LLM 自适应选择最佳 $ \alpha_N \approx 0.6 $
  - 相比固定 $ \alpha_N=0.5 $，提升 15%

- 结论：LLM 能动态感知近场用户数量与信道质量，智能分配功率。

---

#### 5.6 频谱效率 vs 最低速率 $ R_{\min} $
- 目标：验证公平性约束 C4。

- 设置：$ K=8, P=20 $ W，$ R_{\min} \in [0, 3] $ bit/s/Hz

- 结果：
  - $ R_{\min} = 0 $：无公平性 → 效率最高
  - $ R_{\min} $ 增大 → 效率下降（资源向弱用户倾斜）
  - LLM 始终最优，在 $ R_{\min}=2 $ 时仍达 27.5 bit/s/Hz
  - 其他方案在 $ R_{\min}>1.5 $ 时性能崩塌

- 结论：LLM 在高公平性需求下仍保持高效，适合异构 LAE 场景。

---

#### 5.7 频谱效率 vs 发射功率 $ P $（图 9）

- 目标：验证功率可扩展性。

- 设置：$ K=8, R_{\min}=1 $ bit/s/Hz

- 结果：
  - 所有方案随 $ P $ 增加而提升
  - LLM 在全功率范围领先
  
- 结论：LLM 接近理论最优，在高功率下优势更明显。

---

#### 5.8 计算复杂度对比
| 方案 | 训练时间 (per epoch) | 推理时间 (per sample) | 参数量 |
|------|---------------------|-----------------------|-------|
| CNN | 12.3 s | 8.1 ms | 0.8 M |
| Transformer | 28.7 s | 21.4 ms | 12.1 M |
| **LLM (GPT-2)** | **59.9 s** | **52.6 ms** | **129 M** |
| 传统优化 (CVX) | — | 1.2 s | — |

- 分析：
  -  LLM 参数多、推理慢，但性能提升远超开销
  - 可通过 模型蒸馏 / 量化 降低部署成本
  - 未来 6G 基站支持 AI 加速，可接受

---

#### 5.9. 超参数敏感性分析

- 目标：验证 $ \gamma_2 $（分类权重）的影响。

| $ \gamma_2 $ | 分类准确率 | 频谱效率 (bit/s/Hz) |
|-------------|-----------|---------------------|
| 0           | 87.2%     | 29.1                |
| 1           | 95.1%     | 30.8                |
| **5**       | **99.7%** | **31.2**            |
| **10**      | **99.9%** | **31.1**            |
| 20          | 100.0%    | 30.4                |

- 结论：$ \gamma_2 \in [5, 10] $ 为最优区间，平衡分类与优化。

---

## 仿真结论总结

| 结论 | 支撑证据 |
|------|---------|
| 1. ENFR 理论正确 | 图 4 仿真与 Lemma 1 高度吻合 |
| 2. LLM 训练稳定 | 图 5 快速收敛，无过拟合 |
| 3. 分类精度极高 | 表 I >99% 准确率 |
| 4. 频谱效率接近最优 | 图 6–9 紧贴 Capacity |
| 5. 动态适应性强 | 图 7 智能调节 $ \alpha_N $ |
| 6. 公平性鲁棒 | 图 8 高 $ R_{\min} $ 下仍高效 |
| 7. 计算开销可接受 | 表 II 性能提升远超代价 |

### 6 结论 

#### 结论
所提出的 LLM 赋能近场通信方案在 LAE 复杂场景 下，全面超越传统方法，为 6G 低空网络提供了高效、智能、鲁棒的通信范式。


#### 未来工作方向

1. 实时在线优化：结合信道预测，实现动态预编码
2. 不完美 CSI 场景：引入鲁棒训练
3. 多 BS 协作：扩展至分布式 LLM
4. ISAC 集成：近场感知 + 通信联合优化
5. 硬件实现：AI 加速器部署

---
