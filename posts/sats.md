# 分布式卫星通信

由于硕士研究生毕业需要考一个 Comprehensive Exam，其中，“卫星通信系统”的考题是：阅读下面两篇文章，然后由任课老师根据两篇文章的内容进行提问，遂整理于此。

PS1：该课程是本人的导师任课，本应是最轻松最水的（共考三门），结果最后是这门课最严格......

PS2：本文势必有许多 typo，因为本地编译的 $\LaTeX$ 代码与网站上渲染的有一些不同。虽不能保证之后有很大规模的改动（大概率考完试就晾在这了），但如果看到一些错误，会顺手修改。

（初稿由 Gemini、Grok 等 GenAI 生成）

## 多卫星协作网络：联合混合波束成形和用户调度设计

**摘要**：旨在解决低轨（LEO）卫星通信网络中，多卫星协作面临的复杂性和资源限制问题。该研究的核心贡献在于提出了一种新的联合混合波束成形和用户调度（JHU）方案，以显著提高网络的总频谱效率（SE）。

### 1 引言

#### 研究背景与动机

- **通信发展与挑战:** 随着 5G 及未来 6G 的发展，对全球无缝覆盖和高效传输的需求日益增长 。然而，传统地面通信网络在偏远地区、海上和极地等区域存在覆盖不足的问题 。卫星通信作为一种补充解决方案，能够凭借其广域覆盖能力，分担地面系统的通信负担 。

- **多卫星协作的潜力与挑战:** 多卫星协作可以有效扩展覆盖范围并提高频谱效率 。然而，卫星上的射频（RF）电路和计算资源有限 ，同时卫星与地面用户（GU）之间的距离远，导致信号传播损耗严重，信道信息（CSI）难以精确获取 。

- **现有研究的不足:** 现有研究中，波束成形设计与用户调度通常是分开进行的，未能充分利用两者之间的内在联系 。此外，大多数研究集中在单卫星场景，很少考虑多卫星协作传输 。
为应对上述挑战，论文提出了以下核心方案：

  1. 混合波束成形方法: 考虑到卫星硬件的限制，论文提出了一种混合波束成形方法 。该方法包含两个部分：

     - 模拟波束成形（Analog Beamforming）: 用于波束对齐 。由于卫星到地面用户的距离遥远，信道状态信息难以精确估计，因此该方法基于码本（codebook），可以减少信道状态信息反馈开销 。

     - 数字波束成形（Digital Beamforming）: 用于缓解干扰 。

  2. 启发式用户调度算法: 论文提出了一种启发式用户调度算法，根据多卫星协作网络总频谱效率的增量来确定卫星与地面用户之间的连接 。该算法具有多项式复杂性 。

  3. 联合混合波束成形和用户调度（JHU）方案: 论文认识到波束成形和用户调度的内在联系 ，提出了一种联合优化方案。该方案通过交替优化来共同设计波束成形和用户调度，从而显著提升网络性能 。

  4. 单连接与多连接场景: 该方案不仅适用于单个用户由单个卫星服务的单连接场景，也适用于一个用户可同时被多个卫星服务的多连接场景，以进一步提高性能。

### 2 系统模型

假设一个下行链路通信场景，在短时间周期（毫秒级）内，多颗 LEO 卫星协作使用全频率复用（FFR）为地面用户（GUs）提供服务。该模型考虑了实际约束，如卫星上有限的资源、传播损耗和干扰。重点强调通过星间链路（ISLs）和分布式计算实现卫星协作，同时使用真实的衰落和天线图案建模信道。优化问题旨在通过波束成形和用户调度最大化总谱效率（SE），受功率、波束和连接约束限制。

#### 2.1 系统架构
这一小节介绍了网络设置和硬件配置，强调多卫星如何协作服务 GUs。

**关键设置和假设：**
- 有 $ N\_u $ 个 GUs 请求服务，以及 $ N\_s $ 颗对至少一个 GU 可见的 LEO 卫星；
- 卫星在 Ka 频段运行，采用FFR，即整个网络复用相同频率，这提高了SE但引入了同信道干扰；
- 每个 GU 可以由多个卫星服务（多连接），每个卫星可以服务多个 GUs（上限有限）。
可见性集合：$ \mathcal{V}\_g $ 是 $\text{GU}\_g$ 的可见卫星集合，$ \mathcal{V}\_s $ 是卫星 $ s $ 服务的 GUs 集合；
- 卫星具有再生负载（允许板上信号处理），使用光学 ISLs 进行数据交换和分布式计算。地面站通过视距（LoS）链路定期发送星座拓扑，卫星间通过 ISLs 共享；
- GUs 使用非常小孔径终端（VSAT），这是单天线系统；
- 卫星使用面向地球的均匀平面阵列（UPA），采用混合模拟-数字波束成形架构；

    - UPA 结构：由 $ N\_b = N\_x^{\text{sub}} \times N\_y^{\text{sub}} $ 个子阵列组成，每个子阵列有 $ N = N\_x \times N\_y $ 个天线元件，连接到一个 RF 链；
    - 每个子阵列生成一个独立点波束，允许卫星同时服务最多 $ N\_b $ 个 GUs；
- 混合波束成形：模拟矩阵 $ \mathbf{F}\_s^A \in \mathbb{C}^{N \times N^s\_u} $ 用于波束对齐，数字矩阵 $ \mathbf{F}\_s^D \in \mathbb{C}^{N^s\_u \times N^s\_u} $ 用于干扰缓解，其中 $ N\_s^u $ 是卫星 $ s $ 服务的 GUs 数量。数据向量 $ \mathbf{x}\_s \in \mathbb{C}^{N^s\_u \times 1} $ 表示卫星 $ s $ 服务的 GUs 请求数据。

**含义：**

- 该架构强调卫星资源的限制（如 RF 链数量远少于天线元件），这与地面系统不同，旨在平衡性能和硬件约束。
- 通过 ISLs 和分布式计算，实现卫星间协作，适用于实际 LEO 星座如 Starlink。
- 假设短时间周期内拓扑稳定，忽略卫星运动的动态变化，但提到多普勒补偿已成熟，不在此讨论。

#### 2.2 信道模型

这一小节根据 3GPP 和 ITU-R 技术报告建模传播信道，考虑无雨云衰减的郊区场景，所有 GUs 分布在 LoS 条件下。

**关键公式和组件：**

- 卫星 $ s $ 和 $\text{GU}\_g$ 间的多输入单输出（MISO）信道：$ \mathbf{h}\_{sg} = \xi\_{sg} \cdot \mathbf{h}\_{sg}^s $，其中 $ \xi\_{sg} $ 是无线传播损耗，$ \mathbf{h}\_{sg}^s \in \mathbb{C}^{N \times 1} $ 是遵循 Loo 分布的小尺度衰落信道；
- 传播损耗：$ \xi\_{sg} = \sqrt{G\_S G\_{\text{GU},sg} \cdot 10^{-\text{PL}[\text{dB}]/10}} $，其中 $ G\_S $ 是卫星 UPA 增益，$ G\_{\text{GU},sg} $ 是 GU 侧天线增益；

- GU侧增益近似：$ G\_{GU,sg} \approx G\_{\max} \left( \frac{J\_1(u\_{sg})}{2u\_{sg}} + 36 \frac{J\_3(u\_{sg})}{u\_{sg}^3} \right)^2 $，其中 $ u\_{sg} = 2.07123 \sin \gamma\_{sg} / \sin \gamma\_{3\text{dB}} $，$ \gamma\_{sg} $ 是偏轴角，$ \gamma\_{3\text{dB}} $ 是GU天线 3-dB 角（见论文Fig. 3）。当 $ \gamma\_{sg} \to 0 $ 时接近 $ G\_{\max} $，多连接时只有主卫星获得最大增益；


- 大尺度路径损耗（PL）：$ \text{PL}[\text{dB}] = \text{PL}\_b + \text{PL}\_g + \text{PL}\_s$ ；

- 基本路径损耗：$ \text{PL}\_b = \text{FSPL}(d\_0, f\_c) + \text{SF} + \text{CL} $，其中 FSPL 取决于距离 $ d\_0 $ 和载波频率 $ f\_c $，SF 是阴影衰落（对数正态分布），CL 在 LoS 下为 0；
- 大气气体衰减 $ \text{PL}\\_g $ 取决于频率、海拔等；
- 闪烁衰减 $ \text{PL}\_s $ 只考虑对流层闪烁（Ka 频段忽略电离层）；


- 小尺度衰落：$ \mathbf{h}\_{sg}^s = \delta \left( m\_0 \mathbf{a}\_T^T(\phi\_{sg}, \theta\_{sg}) + \sum\_{l=1}^{N\_{cl}} \sum\_{i=1}^{N\_{ray}} m\_{li} \mathbf{a}\_T^T(\phi\_{sg,li}, \theta\_{sg,li}) \right) $，其中 $ \delta $ 归一化以满足 $ E[\|\mathbf{h}\_{sg}^s\|^2] = 1 $，$ m\_0 $ 和 $ m\_{li} $ 是直接路径和多径分量的复系数（幅度分别服从正态和 Rayleigh 分布，相位均匀分布）；

- 天线转向矢量：$ \mathbf{a}\_T(\phi, \theta) = \frac{1}{\sqrt{N}} [1, \dots, e^{-j \frac{2\pi}{\lambda} d ((N\_x-1) \cos \theta \cos \phi + (N\_y-1) \cos \theta \sin \phi)}]^T $，假设 $ d = \lambda/2 $ 以避免栅瓣；


- 多普勒效应：由于卫星运动显著，但假设高度可预测，已有成熟补偿技术，不在此讨论。


**含义：**

- 模型真实反映卫星通信的挑战，如长距离导致的严重传播损耗和不准确CSI估计；
- Loo 分布适合 GOOD 状态下的小尺度衰落，结合大尺度 PL，提供全面信道表示；
- GU 天线窄波束特性在多连接时引入增益减小，影响干扰和信号强度。

#### 2.3 信号模型和问题公式化

这一小节推导 GU 接收信号、SINR 和 SE，并公式化优化问题。

**信号模型：**

- $\text{GU}\_g$ 的接收信号：$$ y\_g = \sum\_{s \in V\_g} \alpha\_{sg} \mathbf{h}\_{sg}^H \mathbf{w}\_{sg} x\_g + \sum\_{g' \neq g} \sum\_{s \in V\_g} \alpha\_{sg'} \mathbf{h}\_{sg}^H \mathbf{w}\_{sg'} x\_{g'} + n\_g, $$

其中 $ \alpha\_{sg} \in \{0,1\} $ 表示链接（1 为连接），$ \mathbf{w}\_{sg} \in \mathbb{C}^{N \times 1} $ 是波束成形矢量，$ x\_g $ 是 $\text{GU}\_g$ 数据（$ E[|x\_g|^2] = 1 $），$ n\_g \sim \mathcal{CN}(0, \sigma\_s^2) $ 是噪声。
- SINR：$$ \gamma\_g = \frac{|\sum\_{s \in V\_g} \alpha\_{sg} \mathbf{h}\_{sg}^H \mathbf{w}\_{sg}|^2}{\sum\_{g' \neq g} |\sum\_{s \in V\_g} \alpha\_{sg'} \mathbf{h}\_{sg}^H \mathbf{w}\_{sg'}|^2 + \sigma\_s^2}. $$
- GU SE：$$ R\_g = \log\_2(1 + \gamma\_g). $$
- 总SE：$$ R = \sum\_{g=1}^{N\_u} R\_g. $$


**优化问题（OP）：**

目标：$ \max\_{\{\mathbf{w}\_{sg}, \alpha\_{sg}\}} \sum\_{g=1}^{N\_u} \log\_2(1 + \gamma\_g) $。
约束：

- C1: $ \sum\_g \alpha\_{sg} \|\mathbf{w}\_{sg}\|^2 \leq P\_T $，每个卫星功率上限 $ P\_T $。
- C2: $ \sum\_g \alpha\_{sg} \leq N\_b $，每个卫星服务 GUs 不超过 $ N\_b $。
- C3: $ \sum\_{s \in V\_g} \alpha\_{sg} \geq 1 $，每个 GU 至少连接一个卫星。
- C4: $ \alpha\_{sg} \in \{0,1\} $。


注意：OP不总是可行（C2 和 C3 可能冲突），优先 C2，尽量连接更多 GUs。目标函数非凸，变量耦合，无法直接求解。


**含义：**

引入 $ \alpha\_{sg} $ 处理离散链接分配，强调波束成形和调度的内在联系。
FFR下干扰显著，GU天线对齐第一个服务卫星，干扰受偏轴角影响。
该公式化铺垫后续节的混合波束成形（模拟对齐+数字缓解）和启发式调度算法，针对卫星特有约束如有限RF链和长距离。


### 3 混合预编码
第三节针对卫星有限的射频（RF）链和计算资源，提出了一种低复杂度的混合波束成形框架。模拟部分用于波束对齐，以减少信道状态信息（CSI）反馈开销；数字部分用于干扰缓解，以提升网络性能。该方法与第二节的系统模型紧密结合，强调码本设计和正则化零逼近（ZF）等实用技术，适用于多卫星协作场景。作者假设 GU 侧有完美 CSI，反馈链路无损，但实际卫星距离长导致信号衰减，该方法通过码本简化反馈。


#### 3.1 基于码本的模拟波束成形
这一小节介绍了模拟波束成形，用于波束对齐，基于二维离散傅里叶变换（DFT）码本，以减少CSI反馈开销。

**关键概念和假设：**

- 模拟波束成形针对卫星 UPA 的混合架构，RF 链数量远少于天线元件（$N$），旨在对齐波束以最大化信号强度。
- 使用码本设计：假设 GU 侧完美 CSI，卫星轨迹可预测，GU 可实时跟踪卫星并反馈信息。码本基于 DFT，适用于 UPA 的二维结构;
- 码本构建：一维 DFT 码本沿 x 轴为 $\mathbf{D}\_x$（$N\_x$ 维），当 $d = \frac{λ}{2}$ 时，$$\sin ϕ\_{x\_k} = 1 - \frac{2}{N\_x} \times k,$$
  
其中，$k=0$ 到$N\_x-1$。二维码本 $\mathbf{D} = \mathbf{D}\_x ⊗ \mathbf{D}\_y$，包含 $N$ 个正交码字，每个对应一个指向地球的定向波束。

**算法 1（Codebook-Based Analog Beamforming）：** 从 $\mathbf{D}$ 中选最佳 $K$（$≤N$）码字（试验中 $K=4$，以平衡开销），组合成新码字，满足模拟波束成形的等幅度约束;

- 输入：GU-卫星信道 $h\_{sg}$，码本 $D$。
- 输出：模拟波束成形矢量 $w^A\_{sg}$。
- 步骤：
  1. 计算每个码字 $\mathbf{D}\_{:,k}$ 的 $|\mathbf{h}\_{sg}^H \mathbf{D}\_{:,k}|^2$ ，选最大 $K$ 个码字 $c\_1,\cdots,c\_K$ ，形成 $\mathbf{D}\_K$；
  2. 求解 $\mathbf{D}\_K \mathbf{x}$ = $\mathbf{h}\_{sg}$ 的最小二乘解 $\mathbf{\hat{x}} = (\mathbf{D}\_K)^\dagger \mathbf{h}\_{sg}$（GU 侧计算）；
  3. GU 反馈码字索引和系数 $\mathbf{\hat{x}}$ 给卫星；
  4. 卫星组合 $\mathbf{w}'\_{sg} = \mathbf{D}\_K \mathbf{\hat{x}}$；
  5. 归一化每个分量：$\mathbf{w}^A\_{sg}(i) = {\mathbf{w}'\_{sg}(i)}\frac{\sqrt{N}} {|w'\_{sg}(i)|}$，确保等幅度。

复杂度：$K$ 小，反馈仅索引和系数，减少开销（卫星距离长，CSI 不准）。

**含义：**

- 该方法解决卫星 CSI 反馈难题：传统全 CSI 反馈开销大，此处仅反馈 $K=4$ 的索引和系数，适用于长距离卫星链路；
- DFT 码本正交性确保高效对齐，模拟部分独立于数字部分，便于后续优化；
- 轨迹可预测假设允许 GU 主动跟踪，实用性强，但 $K$ 选择需试验优化。

#### 3.2 数字波束成形

介绍了数字波束成形，用于干扰缓解，基于链接信息和模拟结果，采用正则化 ZF 方法。

**关键概念和假设：**

- 数字波束成形在模拟基础上进行，利用卫星 s 的信道矩阵 $\mathbf{H}\_s = [\cdots, \mathbf{h}\_{sg}^H, \cdots]$ $(N\_s^u × N, g ∈ V\_s)$ 和模拟矩阵  $\mathbf{F}^A\_s = [\cdots, \mathbf{w}^A\_{sg}, \cdots]$ $(N × N^s\_u)$。

- 广义信道矩阵 $\mathbf{\tilde{H}}\_s = H\_s F^A\_s$，基于 CSI 反馈获取；
- 采用正则化 ZF（RZF）：比纯 ZF 鲁棒，比最小均方误差（MMSE）简单，适用于 FFR 下的同信道干扰；
- 数字矩阵 $\mathbf{F}^D\_s = \sqrt{η} \mathbf{\tilde{H}}\_s^H (\mathbf{\tilde{H}}\_s \mathbf{\tilde{H}}\_s^H + β \mathbf{I}\_{N^s\_u})^{-1}$，其中：
  - $\sqrt{η}$ 为功率缩放，确保卫星功率等于 $P\_T$；
  - $\beta$ 为正则化参数，大系统极限下 $β\_\text{opt} = \frac{N\_s^u σ\_s^2}{P\_T}$。


- 混合矩阵 $\mathbf{F}^{HY}\_s = \mathbf{F}^A\_s · \mathbf{F}^D\_s = [..., \mathbf{w}\_{sg}, ...]$。
- 假设链接信息已知（后续用户调度提供），数字部分聚焦卫星内干扰（多 GU 服务）。

**含义：**

- RZF 平衡干扰消除和噪声放大：纯 ZF（$β=0$）在低 SNR 易噪声放大，正则化改善鲁棒性；
- 该方法低复杂度（矩阵逆 $\mathcal{O}((N\_s^u)^3)$），适用于卫星有限计算资源；
- 与用户调度耦合：数字波束成形需链接信息，铺垫第四节的联合优化，提升总 SE。

### 4 用户调度及其实现方案

第四节针对优化问题（OP）的离散链接变量 $α\_{sg}$，提出低复杂度的启发式算法，以多项式复杂度实现良好性能。该算法基于总谱效率（SE）增量确定卫星-GU 连接，支持单连接和多连接场景。方案强调波束成形与调度的耦合：分离式（SHU）独立执行，联合式（JHU）通过交替优化提升性能。该节与第三节的混合波束成形结合，铺垫第五节的仿真验证。假设链接基于可见卫星集 $V\_g$，资源约束为每个卫星最多服务 $N\_b$ 个 GU。


#### 4.1 用户调度
这一小节介绍了单连接和多连接的启发式用户调度算法，旨在确定卫星-GU 链接以最大化总 SE。

**关键概念和假设：**

- 穷举搜索不可行（复杂度随 $N\_u$ 指数增长），故采用启发式算法，复杂度多项式;
链接矩阵 $\mathbf{L}$ $(N\_s × N\_u)$，$\mathbf{L}\_{sg}$ 表示仅 $(s,g)$ 元素为 1 的矩阵。总 SE 表述为 $R = \mathcal{R}(L, H\_s, F\_s)$；
- SE 增量 $\Delta R\_{sg} = \mathcal{R}(\mathbf{L} + \mathbf{L}\_{sg}, \mathbf{H}\_s, \mathbf{F}\_s) - \mathcal{R}(\mathbf{L}, \mathbf{H}\_s, \mathbf{F}\_s)$ 
- 卫星资源集 S（有剩余资源的卫星），未服务 GU 集 G\_n（n为剩余 GU 数）。
- 优先单连接（每个 GU 仅一卫星），然后多连接（GU 可多卫星服务，但天线对齐第一个卫星，其他信号增益减小）。

**算法2（单连接）：** 先处理仅一可见卫星的 GU，然后按 $\Delta R\_{sg}$ 最大化建立链接，检查资源约束（$≤N\_b$）。

- 输入：信道 $\mathbf{H}\_s$，波束成形 $\mathbf{F}\_s$，可见集 $V\_g$;
- 输出：单连接链接 $\mathbf{L}$，集 $S$。
- 步骤：
  1. 初始化： $S=\{1, \cdots, N\_s\}$，$G\_n=\{1 \cdots,N\_u\}$，$\mathbf{L}=\mathbf{0}$；
  2. 处理 $|V\_g|=1$ 的 GU，建立链接，移除 $g$；
  3. 循环计算所有可能 $\Delta R\_{sg}$，选 $[ŝ,ĝ] = \arg \max\_{(s,g)}\Delta R\_{sg}$；
  4. 若卫星 $ŝ$ 有资源，建立 $\mathbf{L}(ŝ,ĝ)=1$，移除 $ĝ$；否则移除 $ŝ$；
  5. 直到 $n=0$；

**算法3（多连接）：** 基于 **算法2** 结果，继续添加链接。

- 输入：同上 + 单连接 $\mathbf{L}$，集 $S$。
- 输出：多连接 $\mathbf{L}$。
- 步骤：类似 **算法2**，但停止条件为 $\Delta R\_{ŝĝ} ≤0$ 或 $S$ 空。


**复杂度：**$M\_R$ 为 SE 计算次数，单连接O(Ns Nu^2)，多连接类似。


**含义：**

算法贪婪选择最大 SE 增量，确保高效链接分配，优先资源约束（C2 优先于 C3）。
多连接利用额外卫星提升 SE，但受 GU 天线窄波束影响（偏轴增益减小）。
与第三节耦合：调度需波束成形结果，反之亦然，引出联合方案。

#### 4.2 分离式和联合式混合波束成形与用户调度方案

这一小节提出两种方案：SHU（分离）和 JHU（联合），处理数字波束成形与调度的关系。

**关键概念和假设：**

- SHU：独立执行。模拟 $\mathbf{F}^A\_s$ 作为输入执行 **算法 2/3**，得链接 $\mathbf{L}$；然后数字波束成形，得 $\mathbf{F}^{HY}\_s$；最后计算SE。
- JHU：交替优化。调度中实时更新数字波束成形：计算 $\Delta R\_{sg}$时，用当前 $\mathbf{L}$ 计算 $\mathbf{F}^{HY}\_s = \mathcal{F}(L, H\_s, F^A\_s)$。

**算法4（JHU）：** 整合 **算法 2/3**，但 $\Delta R\_{sg}$中 $\mathbf{F}\_s$ 替换为 $\mathbf{F} (\mathbf{L} + \mathbf{L}\_{sg}, H\_s, \mathbf{F}^A\_s)$。

- 输入/输出：同**算法 2/3**。
- 步骤：单连接部分类似 **算法 2**，多连接类似**算法 3**，但 $\Delta R$ 计算包含实时波束成形。


**复杂度分析（表I）：** 穷举高（$O(2^{N\_s N\_u})$），SHU 低（$M\_R=O(N\_s N\_u^2)$），JHU 中等（$M\_{HY}$ 为波束成形计算，含矩阵逆等 $O((N\_s^u)^3)$）。

假设模拟波束成形独立，数字部分依赖链接。

**含义：**

- SHU 简单但未充分利用耦合，JHU 通过实时更新提升 SE，适用于卫星有限计算;
- 支持单/多连接，验证联合优于分离（第五节仿真）;
- 复杂度强调启发式实用性，避免穷举。

### 5 仿真结果

第五节通过仿真验证了联合混合波束成形和用户调度（JHU）方案的优越性，使用 STK 软件模拟 LEO 卫星运动和 MATLAB 处理性能指标。仿真考虑不同星座配置、GU 位置和天线参数，重点比较 JHU 与基准方案（如 AU：仅模拟波束成形+调度，SHU：分离式方案）。关键指标包括总谱效率（SE）、每用户 SE 分布、覆盖率和服务率。

结果显示 JHU 在总 SE 和每用户 SE 上显著优于基准，尤其在多连接模式下；星座倾角、卫星数量、GU 密度和天线 HPBW（半功率波束宽度）对性能有重大影响。仿真基于 24 小时采样（2022 年 9 月 1 日，北京时间），GU 分布在中国 80 个郊区地点（纬度 0°-54°）。


这一小节核心，分为三个子部分，比较 AU（基准：模拟+调度）、SHU（分离式）、S-JHU（单连接联合）和 M-JHU（多连接联合）。

#### 5.1 倾角选择（Inclination Selection）

**指标：** 覆盖率（覆盖 GU/总 GU）、服务率（服务 GU/总 GU）、平均总 SE（24 次实验均值）。
**结果（Table III, Fig. 6, Fig. 7）：**
  1. 覆盖率：倾角 ≥45° 时达 100%，低倾角（如 30°）仅 96.9%，因高纬度 GU 仰角低，导致路径损耗大，无法建立 LoS 链路；
  2. 服务率：倾角 ≥40° 时接近 100%，但随倾角增加略降（如 60° 为 99.5%），因高倾角下低纬 GU 可见卫星减少，资源竞争加剧；
  3. 平均总 SE：呈抛物线趋势，先增后减，峰值在 45°（所有方案一致，M-JHU 约 6-7 bps/Hz）。例如，30° 倾角下 SE 较低（因覆盖不足），60° 下 SE 略降（因卫星分布不均）。 
方案比较：M-JHU 在所有倾角下 SE 最高，提升 20%-30% vs. AU；S-JHU 次之，SHU 接近 AU 但优于纯模拟。

**含义：**

- 低倾角：高纬 GU 低仰角，大路径损耗，覆盖不足。
- 高倾角：低纬密集 GU 可见卫星减少，资源浪费。
- 45° 为最佳，平衡覆盖和服务；JHU 优于基准，M-JHU 进一步提升。


#### 5.2 算法性能分析（Algorithm Performance Analysis）

**结果（Figs. 8-10, Fig. 11, Fig. 12）：**

- 总 SE 波动：24 次实验中 SE 波动大（拓扑变化引起），平均值 M-JHU 最高（如 48/6/1 下 ≈6.5 bps/Hz，192/12/1 下 ≈8 bps/Hz），AU 最低（≈3 bps/Hz）。

- 相对提升（vs. AU，Fig. 11）：SHU 从 24.4% 降到 8%（卫星增多，干扰减）；S-JHU 和 M-JHU >2 倍，提升随卫星数略降，因卫星内 GU 减少，数字波束成形（RZF）作用弱化。

- HPBW 影响（Fig. 12）：M-JHU vs. S-JHU 提升随 HPBW 增而增（如 192/12/1 在 128° HPBW 下提升最高），因宽 HPBW 减小偏轴增益损耗，多连接更有效。

- 方案比较：联合优化（JHU）优于分离（SHU），多连接进一步提升 10%-20%，尤其小规模星座。


#### 5.3 GU 性能分析（GU Performance Analysis）
这一子部分考察单个 GU 的 SE 分布和密度影响，使用 5 个典型 GU（北京、上海等）和稀疏/密集场景。

**定量结果解读（基于 Fig. 13、Table IV）：**

- SE 波动：24 次实验中，北京/上海 SE 稳定（≈0.8 bps/Hz），喀什/南沙 峰值高（>1.5 bps/Hz），因边境位置可见卫星多、干扰少。
- 密度影响：稀疏 GU（D=400 km，12 个）平均 SE 1.048 bps/Hz，方差 0.351；密集（68 个）平均 0.732 bps/Hz，方差 0.154。稀疏 SE 高 43.2%，因独占功率和低干扰。
- 方案比较：JHU 在稀疏下提升大（多连接利用额外卫星），密集下稳定但 SE 低。

---

## 无蜂窝大规模非地面网络

### 1 引入

#### 1.1 背景与问题

- 目标与需求：下一代（xG）无线系统旨在提供全球普适连接，尤其覆盖偏远和挑战性地区（如沙漠、山脉、农村和海洋）。非地面网络（NTN），包括低地球轨道（LEO）、中地球轨道（MEO）和地球同步轨道（GEO）的卫星系统，近年来受到广泛关注，因其能覆盖地球任何位置，提供可靠的 3D 空间连接。
- LEO 优势：LEO 卫星因其低延迟、高信号质量、低成本和灵活部署，受到行业和学术界的极大兴趣。然而，LEO 卫星因低高度（500-2000 公里）和快速移动，覆盖范围有限，难以长时间服务单一区域。

#### 1.2 问题与挑战

- 覆盖与切换问题：LEO 卫星的覆盖半径约为 600 公里，远小于 GEO 卫星（覆盖地球三分之一）。为扩大覆盖，采用卫星巨型星座系统（数百至数千颗卫星），如 Starlink（已发射 5500 颗，计划增至 1.2 万颗）。但快速移动导致频繁的卫星和波束间切换，增加通信延迟，降低服务质量（QoS）。
- 传统局限：传统波束中心系统使用聚焦波束服务特定区域，但用户仅连接单一波束，边缘用户因信号减弱和干扰问题性能下降。在巨型星座中，切换更频繁（如 Iridium 系统每 52 秒一次），加剧了延迟和吞吐量下降。

#### 1.3 研究目标

核心问题：文章提出两个关键问题：

- 如何在减少切换频率的同时确保无缝连接？
- 如何为所有用户提供一致的高 QoS？

#### 1.4 主要贡献

- 用户中心合作框架：提出了一种用户中心合作通信框架，称为无细胞巨型非地面网络（CF-mNTN）。与传统波束中心系统（单一卫星服务其覆盖区域内用户）不同，CF-mNTN 通过多个 LEO 卫星同时使用相同时频资源服务所有用户设备（UE），动态调整卫星集群和联合传输，减少手移交并提高频谱效率和覆盖率。
- 统计 CSI 利用：CF-mNTN 仅依赖统计信道状态信息（CSI，如角度和路径损失）进行预编码和功率分配，避免了瞬时 CSI 获取的困难（因LEO的高移动性和传播延迟）。这降低了回程开销，并通过可实现速率分析和模拟证明其性能优于依赖瞬时 CSI 的传统合作传输方案。
- 性能提升：模拟结果显示，CF-mNTN 显著改善了频谱效率和覆盖率，尤其对边缘用户表现优异。


### 2 低轨卫星巨型星座系统
#### 2.1 系统模型
- 系统构成：考虑一个LEO卫星巨型星座系统，包含 $ L $ 颗 LEO 卫星，每颗卫星配备 $ N = N\_h \times N\_v $ 个均匀平面阵列（UPA）天线，共同服务 $ K $ 个单天线 UE。卫星集为 $ \mathcal{L} = \{1, 2, \ldots, L\} $，UE 集为 $ \mathcal{K} = \{1, 2, \ldots, K\} $。
- 卫星与 UE 关联：第 $ k $ 个 UE 的服务卫星集为 $ L\_k \subseteq \mathcal{L} $，第 $ l $ 个卫星关联的 UE 集为 $ K\_l = \{k \in K | l \in L\_k\} \subseteq \mathcal{K} $。
- 回程连接：LEO 卫星通过光学回程与中央节点（例如 MEO 或 GEO 卫星）连接，共享位置、统计 CSI、功率权重、传输数据和同步控制信号。
- 位置信息：第 $ l $ 个卫星和第 $ k $ 个 UE 的三维位置分别为 $ \mathbf{p}^\text{sat}\_l = [p^\text{sat}\_{l,x}, p^\text{sat}\_{l,y}, p^\text{sat}\_{l,z}]^T $ 和 $ \mathbf{p}^\text{sat}\_k = [p^\text{sat}\_{k,x}, p^\text{sat}\_{k,y}, p^\text{sat}\_{k,z}]^T $。卫星位置通过星历数据获取，UE 位置通过全球导航卫星系统（GNSS）及高级定位技术（如 TDOA、Doppler 移位、AOD）确定。
- 分组优化：为简化，邻近 UE 可分组，因其统计 CSI 相似（例如，$ N = 8 \times 8 $天线阵列的角分辨率约 7.2°），采用混合架构复用时频资源。

#### 2.2 信道模型


LEO 卫星高空特性使 LOS 概率高于地面网络，采用非阴影 Rician 衰落模型。 下行信道向量 $ \mathbf{h}\_{l,k} \in \mathbb{C}^N $ 表示为：
$$\mathbf{h}\_{l,k} = \sqrt{\frac{\beta\_{l,k}}{\kappa\_{l,k} + 1}} \left( \sqrt{\kappa\_{l,k}} e^{j2\pi(t\nu\_{l,k} - f\tau\_{l,k})} + \alpha\_{l,k} \right) \mathbf{a}(\theta\_{l,k}, \phi\_{l,k}),$$

  - $ \beta\_{l,k} $：大尺度衰落系数，包含卫星和 UE 天线增益 $G\_\text{sat}$ 和 $G\_\text{ue}$、自由空间路径损耗 $L^\text{free}\_{l,k} = \left( \frac{c}{4\pi f \|\mathbf{p}^\text{sat}\_l - \mathbf{p}^\text{ue}\_k\|^2} \right)^2$ 以及大气吸收 $L^\text{abs}\_{l,k} = \frac{L\_\text{zenith}(f)}{\sin \theta\_{l,k}}$。
  - $ \kappa\_{l,k} $：Rician K 因子，LOS 与 NLOS 功率比。
  - $ \nu\_{l,k} $：Doppler 移位，$ \nu\_{l,k} = \frac{f}{c} \frac{d}{dt} \|p\_{sat,l} - p\_{ue,k}\|^2 $。
  - $ \tau\_{l,k} $：LOS 传播延迟，$ \tau\_{l,k} = \frac{1}{c} \|\mathbf{p}^\text{sat}\_l - \mathbf{p}^\text{ue}\_k\|^2 $。
  - $ \alpha\_{l,k} \sim \mathcal{CN}(0, 1) $：小尺度衰落系数。
  - $ \mathbf{a}(\theta\_{l,k}, \phi\_{l,k}) $：UPA 导向向量，定义为水平和垂直导向向量的 Kronecker 积：
$$a(\theta\_{l,k}, \phi\_{l,k}) = a\_h(\theta\_{l,k}, \phi\_{l,k}) \otimes a\_v(\theta\_{l,k})$$
其中：
$$a\_h(\theta\_{l,k}, \phi\_{l,k}) = \left[ 1, e^{-j \frac{2\pi f d\_h}{c} \sin \theta\_{l,k} \cos \phi\_{l,k}}, \ldots, e^{-j (N\_h-1) \frac{2\pi f d\_h}{c} \sin \theta\_{l,k} \cos \phi\_{l,k}} \right]^T,$$
$$a\_v(\theta\_{l,k}) = \left[ 1, e^{-j \frac{2\pi f d\_v}{c} \cos \theta\_{l,k}}, \ldots, e^{-j (N\_v-1) \frac{2\pi f d\_v}{c} \cos \theta\_{l,k}} \right]^T,$$
$ d\_h $ 和 $ d\_v $ 分别为水平和垂直天线间距。

为简化表示，文章引入以下记号：

- $ \phi\_{l,k} = 2\pi (t \nu\_{l,k} - f \tau\_{l,k}), $
- $ v\_{l,k} = \frac{\beta\_{l,k}}{\kappa\_{l,k} + 1}, $
- $ \mathbf{a}\_{l,k} = \mathbf{a}(\theta\_{l,k}, \phi\_{l,k}), $

于是信道向量可重写为：

$$h\_{l,k} = \sqrt{v\_{l,k}} \left( \sqrt{\kappa\_{l,k}} e^{j \phi\_{l,k}} + \alpha\_{l,k} \right) \mathbf{a}\_{l,k}$$


统计CSI：$ \theta\_{l,k}, \phi\_{l,k}, \beta\_{l,k}, \kappa\_{l,k}, \nu\_{l,k}, \tau\_{l,k} $ 被归类为统计 CSI，因其主要由卫星和 UE 位置决定，变化缓慢。
小尺度衰落：$ \alpha\_{l,k} $依赖于周围散射体（如汽车、树叶），相干时间远短于统计 CSI。


#### 2.3 传统系统回顾

1) 波束中心系统：

   - 工作原理：LEO卫星使用多个聚焦波束覆盖指定区域（如 Starlink 的 48 个波束， footprint 直径约 200 公里），UE 连接信号最强的波束。
   - 局限：频繁的波束间和卫星间切换（如 Iridium 系统每分钟一次）导致延迟和 QoS 下降，边缘用户受干扰和信号减弱影响。


2) 无蜂窝大规模 MIMO 系统：

   - 工作原理：地面网络中，分布式接入点（AP）同时服务 UE，依赖瞬时 CSI 进行预编码。
   - NTN适用性问题：LEO 的高移动性和传播延迟（相干时间几毫秒，延迟 3-8 毫秒）使瞬时 CSI 难以获取，限制了其在 NTN 中的应用。


### 3 无蜂窝大规模非地面网络（CF-mNTN）

**CF-mNTN的核心特点**

1. 用户中心无边界服务与全频复用：CF-mNTN 动态调整 LEO 卫星与 UE 的关联，根据无线环境选择卫星集群，消除传统足迹边界的限制。所有卫星使用相同时频资源服务 UE，显著提升频谱效率；

2. 统计 CSI-based 数据传输与接收：使用统计 CSI（如角度、路径损失）进行下行预编码和解码，避免瞬时 CSI 的获取难度。统计 CSI 变化慢于瞬时 CSI，便于可靠获取；

3. 分布式预编码与合作功率分配：卫星本地确定统计预编码向量，中央节点优化卫星集群和功率权重。仅共享统计 CSI、集群索引和功率权重，减少回程信令开销。

#### 3.1 基于定位的统计 CSI 获取

LEO 卫星和 UE 通过 GNSS 及高级定位技术（如 TDOA、Doppler、AOD）获取位置 $\{p^\text{sat}\_l\}\_{l \in L}$ 和 $\{p^\text{ue}\_k\}\_{k \in K} $，包括：仰角和方位角 AOD（$ \theta\_{l,k}, \phi\_{l,k} $）、大尺度衰落系数 $\beta\_{l,k}$、Rician K 因子 $\kappa\_{l,k}$等。



- $\theta\_{l,k}, \phi\_{l,k}$ 通过相对位置向量 $\tilde{\mathbf{p}}\_{l,k} = R\_y^{-1}(\theta\_{sat,l}) R\_z^{-1}(\phi\_{sat,l}) (p\_{ue,k} - p\_{sat,l}) $转换为球坐标。
- $\beta\_{l,k} = G\_{sat} G\_{ue} L\_{free,l,k}^{-1} L\_{abs,l,k}^{-1} $，其中$ L\_{free,l,k} = \left( \frac{c}{4\pi f \|p\_{sat,l} - p\_{ue,k}\|^2} \right)^2 $，$ L\_{abs,l,k} = L\_{zenith}(f) / \sin \theta\_{l,k} $。
- $\nu\_{l,k} = \frac{f}{c} \frac{d}{dt} \|p\_{sat,l} - p\_{ue,k}\|^2 $，$ \tau\_{l,k} = \frac{1}{c} \|p\_{sat,l} - p\_{ue,k}\|^2 $。

延迟影响：位置误差因传播延迟引起（如 LEO-GEO 延迟 $\tau\_\text{sat} \approx 120 \, \text{ms}$，LEO-UE延迟 $\tau\_\text{ue} \approx 4 \, \text{ms}$），但误差 $\Delta r\_\text{sat} \approx 0.94 \, \text{km}$ 和 $\Delta r\_\text{ue} \approx 8 \times 10^{-5} \, \text{km}$ 相对于通信距离（1200 公里）可忽略。

#### 3.2 下行链路统计预编码

- 目标：在 CF-mNTN 中，LEO 卫星基于统计 CSI（$ \{\theta\_{l,k}, \phi\_{l,k}, \beta\_{l,k}, \kappa\_{l,k}, \nu\_{l,k}, \tau\_{l,k}\}\_{l \in L, k \in K} $）本地确定下行预编码向量 $\{w\_{l,k}\}\_{l \in L, k \in K}$，以优化联合传输。
- 挑战：传统 CF-mMIMO 使用最大比率传输（MRT）和迫零（ZF）预编码依赖瞬时 CSI，而 LEO 卫星仅拥有统计 CSI，因此需开发新方法。
- 方法：利用信道向量 $\mathbf{h}\_{l,k}$ 与 LOS 阵列导向向量 $\mathbf{a}\_{l,k}$ 的平行性，提出统计 MRT（sMRT）和统计 ZF（sZF）预编码：

  1. 统计MRT（sMRT）预编码

     - 目标：最大化信道增益 $ |\mathbf{h}\_{l,k}^H \mathbf{w}\_{l,k}| $。
     - 设计：sMRT预编码向量为：
$$\mathbf{w}\_{l,k}^{sMRT} \triangleq \frac{1}{\sqrt{N}} e^{j \phi\_{l,k}} \mathbf{a}\_{l,k},$$
其中 $\phi\_{l,k} = 2\pi (t \nu\_{l,k} - f \tau\_{l,k})$ 用于补偿 Doppler 移位和传播延迟，$N = N\_h \times N\_v$ 是天线数。
     - 增益分析：由于 $\mathbf{w}\_{l,k}^\text{sMRT}$ 与 $\mathbf{h}\_{l,k}$ 平行（LOS 主导），有：
$$\mathbf{h}\_{l,k}^H \mathbf{w}\_{l,k}^\text{sMRT} = \mathbf{h}\_{l,k}^H \cdot \frac{1}{\sqrt{N}} e^{j \phi\_{l,k}} \mathbf{a}\_{l,k}$$
规范化后：
$$\mathbf{h}\_{l,k}^H \mathbf{w}\_{l,k}^\text{sMRT} = \frac{\mathbf{h}\_{l,k}^H \mathbf{h}\_{l,k}}{\|\mathbf{h}\_{l,k}\|\_2} \cdot \frac{1}{\sqrt{N}} e^{j \phi\_{l,k}} \approx \frac{\|\mathbf{h}\_{l,k}\|^2}{\sqrt{N}},$$
最大化信道增益为$ \|\mathbf{h}\_{l,k}\|^2$。

   2. 统计 ZF（sZF）预编码

     - 目标：抑制用户间干扰（IUI），即 $\mathbf{h}\_{l,j}^H \mathbf{w}\_{l,k} = 0 $（$ j \neq k $）。
     - 设计：sZF 预编码向量为：
$$\mathbf{w}\_{l,k}^\text{sZF} \triangleq \frac{e^{j \phi\_{l,k}} \mathbf{A}\_l (\mathbf{A}\_l^H \mathbf{A}\_l)^{-1} \mathbf{e}\_k}{\|\mathbf{A}\_l (\mathbf{A}\_l^H \mathbf{A}\_l)^{-1} \mathbf{e}\_k\|\_2}$$
其中：

       - $ \mathbf{A}\_l = [\mathbf{a}\_{l,1}, \mathbf{a}\_{l,2}, \ldots, \mathbf{a}\_{l,K}] \in \mathbb{C}^{N \times K} $是第 $ l $ 个卫星的导向矩阵；
       - $ \mathbf{e}\_k \in \mathbb{R}^K $是第 $ k $ 个元素为 1、其余为 0 的向量。

#### 3.3 下行数据传输与统计解码

- 目标：LEO 卫星基于预编码向量联合传输数据，UE 利用统计 CSI 解码。
- 挑战：NTN 中信道相干时间短、传播延迟大，传统导频信号（如 5G NR 的 demodulation reference signals, DMRS）估计失效。
- 方法：利用信道硬化效应，基于统计 CSI 估计有效信道增益。

**发射信号：**
第 $l$ 个卫星的传输信号为：
$$\mathsf{x}\_l = \sqrt{\rho\_t} \sum\_{k \in K\_l} p\_{l,k} \mathbf{w}\_{l,k} \mathsf{s}\_k，$$

其中：

- $\rho\_t$ 是卫星发射功率；
- $\mathbf{w}\_{l,k} \in \mathbb{C}^N$ 是预编码向量，$ \|\mathbf{w}\_{l,k}\|\_2 = 1 $；
- $ p\_{l,k} \geq 0$ 是功率权重；
- $ \mathsf{s}\_k \sim \mathcal{CN}(0, 1)$ 是第 $k$ 个 UE 的数据符号。


**功率约束：**
$$\mathbb{E}[\|\mathsf{s}\_l\|\_2^2] = \rho\_t \sum\_{k \in K\_l} p\_{l,k}^2 \leq \rho\_t.$$

**接收信号：**
第 $ k $ 个 UE 的接收信号为：
$$\mathsf{y}\_k = \sum\_{l=1}^L \mathbf{h}\_{l,k}^H \mathsf{x}\_l + \mathsf{n}\_k,$$
代入：
$$\mathsf{y}\_k = \sqrt{\rho\_t} \sum\_{l \in \mathcal{L}\_k} p\_{l,k} \mathbf{h}\_{l,k}^H \mathbf{w}\_{l,k} \mathsf{s}\_k + \sqrt{\rho\_t} \sum\_{j \neq k} \sum\_{l \in \mathcal{L}\_j} p\_{l,j} \mathbf{h}\_{l,k}^H \mathbf{w}\_{l,j} \mathsf{s}\_j + \mathsf{n}\_k.$$
其中 $ \mathsf{n}\_k \sim \mathcal{CN}(0, \sigma\_n^2)$ 是高斯噪声；第一项是有效信道增益；第二项是用户间干扰（IUI）。

**信道硬化与统计解码：**

- 问题：传统导频因相干时间短（几毫秒）及延迟（3-8 毫秒）失效。
- 解决：利用多卫星联合传输的信道硬化效应：
$$\sum\_{l \in \mathcal{L}\_k} p\_{l,k} \mathbf{h}\_{l,k}^H \mathbf{w}\_{l,k} \to \mathbb{E}\left[\sum\_{l \in \mathcal{L}\_k} p\_{l,k} \mathbf{h}\_{l,k}^H \mathbf{w}\_{l,k}\right].$$

- 信号重写：
$$\mathsf{y}\_k = \gamma\_k^\text{ds} \mathsf{s}\_k + \gamma\_k^\text{bu} \mathsf{s}\_k + \sum\_{j \neq k} \gamma\_{k,j}^\text{ui} \mathsf{s}\_j + \mathsf{n}\_k,$$
其中：
  - 期望信道增益（desired signal term）：
$$\gamma\_k^\text{ds} \triangleq \mathbb{E}\left[\sqrt{\rho\_t} \sum\_{l \in L\_k} p\_{l,k} \mathbf{h}\_{l,k}^H \mathbf{w}\_{l,k}\right];$$

  - 波束赋形不确定性（beamforming uncertainty term）：
$$\gamma\_k^\text{bu} \triangleq \sqrt{\rho\_t} \sum\_{l \in L\_k} p\_{l,k} \mathbf{h}\_{l,k}^H \mathbf{w}\_{l,k} - \mathbb{E}\left[\sqrt{\rho\_t} \sum\_{l \in L\_k} p\_{l,k} \mathbf{h}\_{l,k}^H \mathbf{w}\_{l,k}\right];$$

  - 用户间干扰（IUI term）：
$$\gamma\_{k,j}^\text{ui} \triangleq \sqrt{\rho\_t} \sum\_{l \in L\_j} p\_{l,j} \mathbf{h}\_{l,k}^H \mathbf{w}\_{l,j}.$$

**可达速率：**

近似：将$ \gamma\_k^\text{bu}$、$\gamma\_{k,j}^\text{ui}$ 和 $\mathsf{n}\_k$ 视为有效噪声，使用速率近似：
$$R\_k^\text{CF-mNTN} = \log\_2 \left( 1 + \frac{|\gamma\_k^\text{ds}|^2}{\mathbb{E}[|\gamma\_k^\text{bu}|^2] + \sum\_{j \neq k} \mathbb{E}[|\gamma\_{k,j}^\text{ui}|^2] + \sigma\_n^2} \right)$$

定理1：提供闭合形式表达式（见原文(22)，需参考附录A），函数依赖于卫星集群 $ \{\mathcal{L}\_k\}\_{k \in K} $、功率权重$ \{p\_{l,k}\}\_{l \in L, k \in K} $ 和统计 CSI。

**关键点：**

- 信道硬化减少了对瞬时 CSI 的依赖。
- 速率优化依赖集群和功率分配，中央节点可进一步调整。

### 4 以用户为中心的低轨卫星集群和协同功率分配

- 目标：提出一种联合用户中心 LEO 卫星聚类和合作功率分配技术，确定最优卫星集群 $\{L\_k\}\_{k \in K}$ 和功率权重 $\{p\_{l,k}\}\_{l \in L, k \in K}$，最大化 UE 的最小可达速率 $R\_k^\text{CF-mNTN}$。
- 问题描述：优化问题形式化为最大最小（max-min）问题 P1，确保所有 UE 的 QoS 均匀。考虑实际场景中 UE 数量动态变化，通过调整活跃 UE 集 $K\_c \subseteq K$ 和将非活跃 UE 的 CSI/功率设为零，适应不同 UE 数。
- 挑战：$\mathcal{P}1$ 是非凸组合优化问题，由于卫星数量大（如 $L=10$、$K=5$、$K\_\text{max}=5$ 时可能卫星关联数达 $10^{12}$），穷举搜索不可行。
- 方法：将聚类问题重构为稀疏恢复问题，使用再加权 2 范数逼近处理稀疏约束，连续凸逼近（SCA）处理 SINR 约束，最终转化为凸二次锥规划（SOCP）求解。
- 优势：有效减少计算负担，提供近似最优解，支持 LEO 巨型星座的实际部署。


**优化问题 $\mathcal{P}1$（Max-Min问题）**
- 目标函数：最大化最小 UE 速率：
$$\max\_{\{\mathcal{L}\_k, p\_{l,k}\}\_{l \in \mathcal{L}, k \in \mathcal{K}}} \min\_{k \in \mathcal{K}} R\_k^\text{CF-mNTN}$$
其中 $R\_k^\text{CF-mNTN}$ 来自第三章的闭合形式（定理 1），依赖统计 CSI、聚类和功率。

- 约束：
  1. 每个卫星关联 UE 数不超过 $K\_\text{max}$（受限于 RF 链路数）：
$$|\mathcal{K}\_l| \leq K\_{\max} \quad \forall l \in \mathcal{L}$$
其中 $\mathcal{K}\_l = \{k \in \mathcal{K} \mid l \in \mathcal{L}\_k\} $。
  2. 每个卫星功率约束（归一化）：
$$\sum\_{k \in K\_l} p\_{l,k}^2 \leq 1 \quad \forall l \in \mathcal{L}$$

  3. 功率非负：
$$p\_{l,k} \geq 0 \quad \forall l \in \mathcal{L}, k \in \mathcal{K}$$

- 非凸性分析：$ R\_k^\text{CF-mNTN} $ 是分数函数的对数，加上组合聚类约束，使 $\mathcal{P}1$ 非凸，需要重构。


#### 4.1 稀疏恢复问题重构

- 稀疏功率向量定义：为每个 UE k 定义稀疏向量 $ \tilde{\mathbf{p}}\_k = [\tilde{p}\_{1,k}, \tilde{p}\_{2,k}, \dots, \tilde{p}\_{L,k}]^T \in \mathbb{R}^L $：
$$\tilde{p}\_{l,k} \triangleq 
\begin{cases} 
p\_{l,k} & \text{if } l \in \mathcal{L}\_k \\
0 & \text{otherwise}
\end{cases}$$

- 聚类映射：$ \mathcal{L}\_k$ 为 $\tilde{p}\_k$ 的非零元素索引：
$$\mathcal{L}\_k = \{ l \in \mathcal{L} \mid {1}\_{\mathbb{R}^+}(\tilde{p}\_{l,k}) = 1 \}$$
其中$ 1\_{\mathbb{R}^+}(x) = 1 $ 若$ x > 0 $，否则为0。
- 稀疏约束：聚类大小约束转化为稀疏度约束：
$$|\mathcal{K}\_l| \leq K\_{\max} \iff \sum\_{k=1}^K 1\_{\mathbb{R}^+}(\tilde{p}\_{l,k}) \leq K\_{\max}$$

- 速率重写：使用系数向量/矩阵重写 $R\_k^\text{CF-mNTN}$：
$$R\_k^\text{CF-mNTN} = \log\_2 \left( 1 + \frac{(\mathbf{b}\_k^T \tilde{\mathbf{p}}\_k)^2}{\sum\_{j=1}^K \|\mathbf{C}\_{k,j} \tilde{\mathbf{p}}\_k\|\_2^2 + \sum\_{j \neq k} \|\mathbf{D}\_{k,j} \tilde{\mathbf{p}}\_j\|\_2^2 + \sigma\_n^2} \right)$$
其中：

  - $ \mathbf{b}\_k = [b\_{1,k}, \dots, b\_{L,k}]^T \in \mathbb{R}^L $，$ b\_{l,k} = \sqrt{\rho\_t N \kappa\_{l,k} v\_{l,k}} $（sMRT）或$ \sqrt{\rho\_t \kappa\_{l,k} v\_{l,k}} \|\mathbf{A}\_l (\mathbf{A}\_l^H \mathbf{A}\_l)^{-1} \mathbf{e}\_k\|\_2^{-1} $（sZF）；
  - $ \mathbf{C}\_{k,j} = \text{diag}(c\_{1,k}, \dots, c\_{L,k}) \in \mathbb{R}^{L \times L} $，$ c\_{l,k} = \sqrt{\frac{\rho\_t}{N} v\_{l,k}} |a\_{l,k}^H a\_{l,j}| $（sMRT）或类似；
  - $ \mathbf{D}\_{k,j} = \begin{bmatrix} \Re\{d\_{1,k,j}\} & \cdots & \Re\{d\_{L,k,j}\} \\ \Im\{d\_{1,k,j}\} & \cdots & \Im\{d\_{L,k,j}\} \end{bmatrix} \in \mathbb{R}^{2 \times L} $，$ d\_{l,k,j} = \sqrt{\frac{\rho\_t}{N} \kappa\_{l,k} v\_{l,k}} e^{j(\phi\_{l,j} - \phi\_{l,k})} a\_{l,k}^H a\_{l,j} $（sMRT）或 0（sZF）。


**重构问题 $\mathcal{P}2$：** 引入辅助变量 $t = \min\_{k\in \mathcal{K}} \text{SINR}\_k$，等价于最大化 t：
$$\max\_{t, \{\tilde{p}\_k\}\_{k \in K}} t$$
- 约束：

  1. SINR 约束；
  2. 稀疏约束；
  3. 功率约束 $\sum\_{k=1}^K \tilde{p}\_{l,k}^2 \leq 1$；
  4. 非负约束。


- 优势：$\mathcal{P}2$ 将组合问题转化为稀疏优化，便于应用稀疏恢复原理。


#### 4.2 重加权 2 范数逼近

- 本质：用加权平方函数 $\omega\_{l,k} |\tilde{p}\_{l,k}|^2$ 逼近指示函数 $1\_{\mathbb{R}^+}(\tilde{p}\_{l,k})$，通过迭代更新权重 $\omega\_{l,k}$ 促进稀疏。
- 权重更新：
$$\omega\_{l,k} = \frac{1}{(\tilde{p}\_{l,k}^\text{prev})^2 + \epsilon^{-1}}$$
其中 $\epsilon > 0$ 是正则化因子，$\tilde{p}\_{l,k}^\text{prev}$ 是前一迭代值。
- 稀疏逼近：
$$\sum\_{k=1}^K 1\_{\mathbb{R}^+}(\tilde{p}\_{l,k}) \approx \sum\_{k=1}^K \omega\_{l,k} \tilde{p}\_{l,k}^2$$

- 交替求解：固定 $\{\tilde{p}\_k\}$ 更新 $\{\omega\_{l,k}\}$，然后固定 $\{\omega\_{l,k}\}$ 求解简化问题 $\mathcal{P}3$：
$$\max\_{t, \{\tilde{p}\_k\}\_{k \in K}} t$$
约束类似 $\mathcal{P}2$，但稀疏约束为 $\sum\_{k=1}^K \omega\_{l,k} \tilde{p}\_{l,k}^2 \leq K\_{\max}$。

- 优势：将非凸稀疏约束转化为凸二次约束，但 $\mathcal{P}3$ 仍因 SINR 分数约束非凸。

#### 4.3 连续凸逼近（SCA）功率分配

- 分数函数逼近：定义凸函数：
$$f(\tilde{\mathbf{p}}\_k, t) \triangleq \frac{(\mathbf{b}\_k^T \tilde{\mathbf{p}}\_k)^2}{t},$$
SINR 约束等价于：
$$f(\tilde{\mathbf{p}}\_k, t) \geq \sum\_{j=1}^K \|\mathbf{C}\_{k,j} \tilde{\mathbf{p}}\_k\|\_2^2 + \sum\_{j \neq k} \|\mathbf{D}\_{k,j} \tilde{\mathbf{p}}\_j\|\_2^2 + \sigma\_n^2,$$

Taylor展开：在一阶Taylor逼近下，前一迭代点 $(\tilde{p}\_k^\text{prev}, t^\text{prev})$ 处：
$$F(\tilde{\mathbf{p}}\_k, t \mid \tilde{p}\_k^\text{prev}, t^\text{prev}) = f(\tilde{\mathbf{p}}, t) + \nabla\_{\tilde{\mathbf{p}}\_k} f(\tilde{p}\_k^\text{prev}, t^\text{prev})^T (\tilde{p}\_k - \tilde{p}\_k^\text{prev}) + \partial\_t f(\tilde{p}\_k^\text{prev}, t^\text{prev}) (t - t^\text{prev})$$
简化：
$$F = \frac{(\tilde{p}\_k^\text{prev})^T \mathbf{b}\_k \mathbf{b}\_k^T (2 t^\text{prev} \tilde{p}\_k - t \tilde{p}\_k^\text{prev})}{(t^\text{prev})^2}$$
由于 f 凸，满足 F 的解也满足原约束。
问题 $\mathcal{P}4$：用 F 替换 f，得到凸 SOCP 问题：
$$\max\_{t, \{\tilde{\mathcal{p}}\_k\}\_{k \in \mathcal{K}}} t$$
SINR 约束为逼近 SINR，其他约束同 $\mathcal{P}3$。
SOCP 重构：约束可转化为二次锥形式 $\|\mathbf{A} \mathbf{x} + \mathbf{b}\|\_2 \leq \mathbf{c}^T \mathbf{x} + d $，目标线性，使用求解器（如 SDPT3）求解最优 $(t^\text{opt}, \{\tilde{p}\_k^\text{opt}\}\_{k \in K}) $。
迭代：更新 $\tilde{p}\_k^\text{prev}= \tilde{p}\_k^\text{opt}$、$t^\text{prev} = t^\text{opt}$，重复直到收敛。


#### 4.4 算法1：以用户为中心的 LEO 卫星分簇及协同功率分配算法

- 输入：统计 CSI、$ \rho\_t $、$K\_\text{max}$、$ \epsilon $。
- 初始化：计算系数 $\{\mathbf{b}\_k, \mathbf{C}\_{k,j}, \mathbf{D}\_{k,j}\} $，$ \omega\_{l,k} = 1 $。
- 外迭代（再加权）：直到稀疏约束满足。

- 内迭代（SCA）：初始化 $\tilde{\mathbf{p}}\_k^\text{prev} = \mathbf{0}\_L $、$ t^\text{prev} = 0 $，求解P4直到收敛。
更新$ \tilde{\mathbf{p}}\_k^\text{prev}$、$\omega\_{l,k}$。

- 输出：$ \mathcal{L}\_k = \{l \in L \mid 1\_{\mathbb{R}^+}(\tilde{p}\_{l,k}) = 1\} $，$p\_{l,k} = \tilde{p}\_{l,k} $（$l \in \mathcal{L}\_k$）。

#### 4.5 计算复杂度分析

- 内迭代：SOCP 求解复杂度 $\mathcal{O}((LK)^{3.5})$（内点法，变量数 LK）。
- 总体：$\mathcal{O}((LK)^{3.5} N\_\text{max}^\text{inner} N\_\text{max}^\text{outer})$，其中 $N\_\text{max}^\text{inner}$ 和 $N\_\text{max}^\text{outer}$ 分别为内/外迭代最大次数。

### 5 可达速率分析：CF-mNTN 与传统 CF-MIMO 系统

- 核心区别：CF-mNTN 使用统计 CSI（角度、路径损失等）进行下行预编码，而 CF-mMIMO 依赖瞬时 CSI。在地面网络中，瞬时 CSI 有效，但 NTN 中 LEO 的高移动性（相干时间短）导致估计误差大。
- 目标：推导 CF-mMIMO 的可达速率，并证明 CF-mNTN 在 LEO 环境中优于 CF-mMIMO，尤其在高 SNR 下。
- 关键观察：导频污染（pilot contamination）在 NTN 中更严重，因为信道相干时间短。
- 假设：时分双工（TDD）系统，利用信道互易性从上行导频估计下行 CSI。

#### 5.1 传统 CF-mMIMO 的可达速率分析

- 过程：LEO 卫星从 UE 的上行导频信号获取瞬时下行 CSI，使用最小均方误差（MMSE）估计和瞬时 MRT（iMRT）预编码。
- 挑战（Remark 1）：导频序列非正交（$\tau\_p < K$）导致导频污染，在 NTN 中因相干时间短而加剧。

**上行导频接收与处理**

- 导频序列：第k个UE的导频序列 $\psi\_k \in \mathbb{C}^{\tau\_p}$，$|\psi\_k|\_2 = 1$，$\tau\_p$ 为序列长度；
- 接收信号：第 $l$ 个卫星的接收导频信号 $\mathsf{Y}\_l \in \mathbb{C}^{N × \tau\_p}$：
$$\mathsf{Y}\_l = \sqrt{\eta\_t} \sum\_{j=1}^K \mathbf{h}\_{l,j} \mathbf{\psi}\_j^H + \mathsf{N}\_l,$$
其中 $\eta\_t$ 是 UE 上行功率，$N\_l \sim \mathcal{CN}(0\_{N \times \tau\_p}, \sigma\_n^2 \mathbf{I}\_N)$ 是噪声。
- 投影处理：投影到 $\psi\_k$，得到：
$$\tilde{\mathsf{y}}\_{l,k} \triangleq \frac{1}{\sqrt{\eta\_t}} \mathsf{Y}\_l \psi\_k = \mathbf{h}\_{l,k} + \sum\_{j \neq k} \mathbf{h}\_{l,j} \psi\_j^H \psi\_k + \frac{1}{\sqrt{\eta\_t}} \tilde{\mathbf{n}}\_{l,k}$$
其中 $\tilde{n}\_{l,k} = N\_l \psi\_k$。第二项是导频污染。

**MMSE 信道估计**

- 估计：MMSE估计 $\hat{\mathbf{h}}\_{l,k}$：
$$\hat{\mathbf{h}}\_{l,k} = \mathbb{E}\{\mathbf{h}\_{l,k}\} + \text{Cov}(\mathbf{h}\_{l,k}, \tilde{\mathbf{y}}\_{l,k}) \mathbf{V}(\tilde{\mathbf{y}}\_{l,k})^{-1} \left( \tilde{\mathbf{y}}\_{l,k} - \mathbb{E}\{\tilde{\mathbf{y}}\_{l,k}\} \right)$$
- 展开：
$$\hat{\mathbf{h}}\_{l,k} = e^{j \phi\_{l,k}} \sqrt{\kappa\_{l,k} v\_{l,k}} \mathbf{a}\_{l,k} + v\_{l,k} \mathbf{a}\_{l,k}^H \mathbf{V}\_{l,k}^{-1} \left( \tilde{\mathbf{y}}\_{l,k} - \sum\_{j=1}^K \psi\_j^H \psi\_k e^{j \phi\_{l,j}} \sqrt{\kappa\_{l,j} v\_{l,j}} \mathbf{a}\_{l,j} \right) \mathbf{a}\_{l,k}$$
- 其中协方差矩阵：
$$\mathbf{V}\_{l,k} \triangleq \mathbf{V}(\tilde{\mathbf{y}}\_{l,k}) = \sum\_{j=1}^K v\_{l,j} |\psi\_j^H \psi\_k|^2 \mathbf{a}\_{l,j} \mathbf{a}\_{l,j}^H + \frac{\sigma\_n^2}{\eta\_t} \mathbf{I}\_N$$


**瞬时 MRT（iMRT）预编码**

- 预编码向量：
$$\mathbf{w}\_{l,k}^{iMRT} \triangleq \frac{\hat{\mathbf{h}}\_{l,k}}{\sqrt{\mathbb{E}\{\|\hat{\mathbf{h}}\_{l,k}\|\_2^2\}}} = \frac{\hat{\mathbf{h}}\_{l,k}}{\sqrt{N (\kappa\_{l,k} + x\_{l,k,k}) v\_{l,k}}}$$
其中x\_{l,k,k} = v\_{l,k} \mathbf{a}{l,k}^H \mathbf{V}{l,k}^{-1} \mathbf{a}\_{l,k}（MMSE属性）。

- 可达速率

- 接收信号与解码：类似第三章，使用统计 CSI 解码：
$$R\_k^\text{CF-mMIMO} = \log\_2 \left( 1 + \frac{|\gamma\_k^\text{ds}|^2}{\mathbb{E}\{|\gamma\_k^\text{bu}|^2\} + \sum\_{j \neq k} \mathbb{E}\{|\gamma\_k^\text{ui}|^2\} + \sigma\_n^2} \right),$$
其中 $\gamma\_k^\text{ds}$、$\gamma\_k^\text{bu}$、$\gamma\_k^\text{ui}$ 与前文类似，但使用 $w\_{l,k}^\text{iMRT}$。
- 定理 2：iMRT 下的闭合形式，包含 ${x\_{l,j,k}}$ 项（导频非正交度）：
$$x\_{l,j,k} = v\_{l,k} \psi\_k^H \psi\_j \mathbf{a}\_{l,j}^H \mathbf{V}\_{l,j}^{-1} \mathbf{a}\_{l,k}$$

- Remark 2：CF-mNTN 的期望信号和波束不确定性低于 CF-mMIMO，但由于 LOS 主导（$\kappa\_{l,k} ≫ 1$），期望信号下降较小，而不确定性下降显著。

#### 5.2 CF-mNTN 与 CF-mMIMO 的可实现速率比较

- 场景：大天线数 $N$（高频 Ka-band，LEO 使用大规模阵列）。
- 简化：利用导向向量正交性 $|\mathbf{a}\_{l,k}^H \mathbf{a}\_{l,j}| = N \delta\_{k,j}$（Kronecker $\delta$）。
- 证明：在高 SNR 下，若满足一定条件，CF-mNTN > CF-mMIMO。


- 命题 1：大 $N$ 下的简化表达式

  1. CF-mNTN（sMRT/sZF）：
$$R\_k^\text{CF-mNTN} = \log\_2 \left( 1 + \frac{\rho\_t N \left( \sum\_{l \in L\_k} p\_{l,k} \sqrt{\kappa\_{l,k} v\_{l,k}} \right)^2}{\rho\_t N \sum\_{l \in L\_k} p\_{l,k}^2 v\_{l,k} + \sigma\_n^2} \right)$$

  2. CF-mMIMO（iMRT）：
$$R\_k^\text{CF-mMIMO} = \log\_2 \left( 1 + \frac{\rho\_t N \left( \sum\_{l \in L\_k} p\_{l,k} \sqrt{(\kappa\_{l,k} + x\_{l,k,k}) v\_{l,k}} \right)^2}{\rho\_t N \sum\_{l \in L\_k} p\_{l,k}^2 \left( 1 + \frac{\kappa\_{l,k} x\_{l,k,k} } {(\kappa\_{l,k} + x\_{l,k,k})} \right) v\_{l,k} + \sigma\_n^2} \right)$$
其中 $x\_{l,k,k} = \frac{\eta\_t N v\_{l,k}}{(\eta\_t N v\_{l,k} + \sigma\_n^2)}$。

- 引理1：SINR 函数重写
定义向量：$q\_k = [p\_{l,k} \sqrt{v\_{l,k} \kappa\_{l,k}} / 2 | l \in L\_k]^T$ 等。
SINR 函数 $h(x) = (q\_k^T x + r\_k)^2 / (t\_k^T x + u\_k)，x = 0\_{|L\_k|}$（CF-mNTN）或 $x\_k = [x\_{l,k,k} | l \in L\_k]^T$（CF-mMIMO）。
于是：
$$R\_k^\text{CF-mNTN} = \log\_2 (1 + h(\mathbf{0}\_{|\mathcal{L}\_k|})), \quad R\_k^\text{CF-mMIMO} \leq \log\_2 (1 + h(\mathbf{x}\_k)).$$



- 命题2：充分条件
h凸：$h(\mathbf{0}\_{|\mathcal{L}\_k|}) ≥ h(x\_k) - ∇h(x\_k)^T x\_k$。
需要证明 $∇h(x\_k)^T x\_k ≤ 0$，即：
$$\frac{\mathbf{q}\_k^T \mathbf{x}\_k}{r\_k} \leq \frac{\mathbf{t}\_k^T \mathbf{x}\_k}{\mathbf{t}\_k^T \mathbf{x}\_k + 2 u\_k}$$

充分条件：$(\kappa\_min - 3) α\_min ≥ 1$，其中 $\kappa\_\text{min} = \text{min}\ \kappa\_{l,k}，\alpha\_\text{min} = \text{min}\ \eta\_t N v\_{l,k} / \sigma\_n^2$。

- 定理3：CF-mNTN 优越性
在高 SNR 下，若条件满足，则 $R\_k^\text{CF-mNTN} > R\_k^\text{CF-mMIMO}$。


### 6 数值结果

#### 6.1 模拟设置

- 系统参数：模拟假设 $L=20$ 颗 LEO 卫星，每卫星配备 $N=8×8=64$ 个 UPA 天线，$K=10$ 个单天线 UE。最大关联 UE 数$K\_\text{max}=8$，LEO 轨道高度 550 km，倾角 53°，覆盖范围700×700 km²（STK模拟），UE随机分布在 200km 半径内。载波频率 f=5 GHz，带宽 B=20 MHz，Rician K-factor $\kappa$=15-20 dB，卫星天线增益 $G\_\text{sat}=3 dB$，UE 增益$G\_\text{ue}=0 dB$，发射功率 $\rho\_t=40 dBm$（卫星），$\eta\_t$=30 dBm（UE），噪声功率 $\sigma\_n^2$=-140 dBm，正则化因子 $\epsilon=10^{-10}$。
- 信道模型：非阴影 Rician 衰落，包括 LOS 和 NLOS 分量，统计 CSI 从位置推导（GNSS + TDOA + Doppler）。
- 比较方案：
  1. CF-mMIMO（iMRT，$\tau\_p$=4 导频）；
  2. 单卫星 SLNR 预编码；
  3. 单卫星 sMRT 预编码；
  4. 64 波束波束中心系统。
  - 所有方案使用 SCA 功率分配，确保公平性。

CF-mMIMO（iMRT，τ\_p=4导频）。
单卫星SLNR预编码。
单卫星sMRT预编码。
64波束波束中心系统。

- 背景：L 选择基于可见卫星数（20-30），K 基于天线分辨率（约 8UE/卫星）。

#### 6.2 仿真结果分析

**图3：总速率 vs SNR**

- 结果：
  1.  CF-mNTN 在SNR=30 dB 时，sMRT 比 CF-mMIMO 提升 7.5%（约1-2 bit/s/Hz），sZF 可能更高。
  2. 低 SNR 时 sMRT 优于 sZF（噪声主导，增益最大化效果好）；高 SNR 时 sZF 优于 sMRT（IUI 抑制）。
  3. CF-mMIMO 性能随 SNR 下降，因导频污染和 CSI 过时；波束中心和单卫星系统最低。


- 含义：CF-mNTN 的统计 CSI 鲁棒性在 NTN 中优于瞬时 CSI，尤其高 SNR 下，验证定理 3。

**图4：总速率 vs LEO 卫星数量**

- 结果：

  1. CF-mNTN 随 L 增加，R\_tot 显著提升，L=10 时 sZF 比 SLNR 高 45.2%，L=40 时达 70%。
  2. 单卫星和波束中心系统速率变化小，因无干扰控制。


- 含义：用户中心聚类和功率分配有效抑制跨卫星干扰，巨型星座（L>20）放大优势。

**图5：最小速率 vs LEO 卫星数量**


- 结果：

  1. CF-mNTN $R\_\text{min}$ 随 L 增加提升，较距离聚类+SCA 高 20%（约0.5-1 bit/s/Hz）。
  2. 均匀功率分配最差，因无优化。


- 含义：算法1 的聚类和功率分配优化边缘 UE 性能，确保 QoS 均匀。

**图6：总速率 vs UE数量**

- 结果：
  1. sMRT 随 K 增加显著提升，因多用户增益；sZF 渐趋饱和，因信道相关性增加。
  2. CF-mMIMO 随 K 增加下降更快，因导频污染加剧。


- 含义：CF-mNTN 适应多 UE 场景，sMRT 适合密集环境，sZF 在高 K 下受限。

**图7：总速率 vs Rician K-factor**

- 结果：

  1. CF-mNT 随 κ 增加提升，因 LOS 主导减少波束不确定性（$γ\_k^{bu}$ 降低）。
  2. κ=30 dB 时，CF-mNTN 接近 CF-mMIMO，因 NLOS 分量可忽略。
  3. 单卫星系统不变，因无统计优化。


- 含义：CF-mNTN在高κ（LOS环境）中表现最佳，验证统计CSI的适应性。

**图8：最小速率 vs 天线数量**


- 结果：

  1. N=64 时，CF-mNTN sMRT 比 CF-mMIMO 提升 8.3%，比 SLNR/sMRT/波束中心提升 350%/373%/529%。
  2. 随 N 增加，增益扩大，因IUI减少。


- 含义：大规模 MIMO 增强 CF-mNTN 优势，适合 Ka-band 部署。

**图9：最小速率 vs SNR**

- 结果：

  1. 密集场景 $R\_\text{min}$ 最高（约 5-6 bit/s/Hz），稀疏最低（3-4 bit/s/Hz）。
  2. 随 SNR 增加，密集场景增益最大。


- 含义：CF-mNTN 在高密度环境下表现最佳，支持巨型星座无缝连接。

**图10：迭代次数累积分布**

- 结果：SCA 和 $\ell\_2$-norm在 20 次内收敛，总算法在 35 次内收敛。


- 含义：算法 1 计算效率高，适合实时优化。

**关键发现与含义**

1. 性能优越性：CF-mNTN 总速率和最小速率显著优于基准方案，尤其高 SNR、大 N 和 LOS 环境，验证理论（定理 3）。
2. 鲁棒性：统计 CSI 避免导频污染和CSI过时影响，适应 LEO 高移动性。
3. 可扩展性：随 L、N 增加性能提升，密集环境最优，支持 xG 应用（如UAM）。
4. 算法有效性：聚类和功率分配优化边缘 UE，20% 最小速率增益。
5. 局限：sZF 在高 K 下受信道相关性影响，$\kappa$ 低时表现受限；假设理想回程。