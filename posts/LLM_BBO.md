# LLM for Optimization in Wireless Communications

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
    $$[\mathbf{X}^{(t-1)}\_{\mathsf{ex}}, \mathbf{r}^{(t-1)}\_{\mathsf{ex}}] = \mathcal{S}(\mathbb{M}^{(t-1)}).$$
    - 精英采样（elitist sampler）：选内存中奖励最高的 $P$ 个动作-奖励对（推荐，用于收敛）。

    - LIFO采样：选最近的 $P$ 个（简单，但探索性强）。
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






## LLM 赋能低空经济近场通信 [[1]](#ref1)

### 写在前面

这是 Linglong Dai 教授组的文章。他们组基本上所有代码都开源，且私以为在无线通信领域他们做的基本都是比较开创性的工作，即“画饼”类型的工作，我这种小卡拉米就跟在他们后面喝汤。这篇文章也是他们深耕的领域，即近场通信，只不过加上了低空经济的背景，和 LLM 做优化求解。其实乍一眼看还挺好奇：
1. 因为明明是优化问题，为什么可以通过监督学习去训练模型？
2. 貌似固定了用户数为 $K$，那么如果用户数变了，就得从头训练模型？

这是我的第一印象。带着这些问题，我开始读论文。




...
---
<span id="ref1">[1]</span> [H. Lee, W. Zhou, M. Debbah and I. Lee, "On the Convergence of Large Language Model Optimizer for Black-Box Network Management," in IEEE Transactions on Communications, early access.](https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=11095730)

