## DeepSense 6G 数据集的几个新奇用法

2026.03.15（第 0 节-第 3 节）

### 0 写在前面

众所周知，DeepSense 6G 数据集是 ASU 的 Ahmed Alkhateeb 组制作的用于做感知辅助通信的真实场景开源数据集。这几年来，多数用于毫米波通信中的波束选择（Selection）、预测（Prediction）、追踪（Tracking），或者阻塞预测（Blockage Prediction）。

为什么没有衍生到更多的任务去呢？其实最大的问题，就是——作为通信相关的数据集，没有信道状态信息（CSI）！当然，真实场景肯定没法采集想象中的 $\mathbf{h}$，其实数据集中有 beam-wise power spectrum，勉强算作通信模态。这也限制了很多人使用它做其他工作。

现在有很多开源数据集，都提供 CSI 作为模态之一，但是没有像 DeepSense 6G 这样，场景全、感知模态多，且在真实场景下测量的数据集。当然，Synthetic 的数据集，写个论文也没什么毛病就是了。

面临这些困难，有很多研究者研究出了一些“巧思”，基于上述困难也依然做出了不少有趣的工作。

叠甲：本文中涉及到的所有文章，都有可取之处，不然也不会被我提及（并非我很了不起的意思）。我做出的讨论也都是基于学术上的正常范围。如果原作者有幸/不幸看到这篇文章，并发现文中叙述有事实错误或不妥之处，请发邮件给我，我会删除或修改其中内容。

---

### 1 没有信道？构建一个！

[Vision-Assisted Near-Field Channel Estimation for XL-MIMO Systems](https://ieeexplore.ieee.org/document/11146883)

这篇论文用视觉辅助近场的信道估计。直觉上来说，视觉可以提取目标用户的角度 $\theta$ 和距离 $d$，自然能够估计出其位置，并用每根天线到用户的距离 $r^{(n)}$ 去构造信道向量 $\mathbf{h}$：

$$\mathbf{h} = \frac{c}{4 \pi f_c r^{(n)}}\left[e^{-j2\pi \frac{f}{c}r^{(1)}}, e^{-j2\pi \frac{f}{c}r^{(2)}}, \cdots,e^{-j2\pi \frac{f}{c}r^{(N)}}\right]^\mathsf{T}.$$

这篇论文考虑了近场的球面波前，使用了清华戴凌龙教授组提出的极坐标码本，将信道表示为在极域的稀疏形式，并做稀疏恢复（OMP）。

算是（我读过的论文中）第一个想出，将 GPS 信息转化为几何信息，并且估计出位置信息的。

我没搞明白的点如下：
- 首先它只给出了距离的公式，且是线阵的第 1 个阵元（或是中间阵元，未知）的距离，而没有告诉我们如何计算每个 $r^{(n)}$；
- 其次，角度怎么算呢？论文中没有给出；
- 最后，考虑的信道太简单了，似乎没有多径，只有一个 LoS 信道。当然我理解视觉难以捕捉散射体的特性，即便可以，信道又是基于 GPS 位置虚构的，所以无法与视觉对应。这篇论文的核心思想，又是使用视觉缩短 OMP 的搜索范围，所以只能这么设定。

[LLM Enabled Beam Training for Pinching Antenna Systems (PASS)](https://arxiv.org/abs/2511.09453)

我对夹子天线不太了解（仅限于半年前看过 Yuanwei Liu & Zhiguo Ding 的 Tutorial 视频的水平），但是个人感觉这篇也应该是构造出来的信道，没来得及仔细读，等发表后有机会我会拜读并更新这个部分。

---

### 2 也就是说，你假设你做的是信道估计？（玩一个大部分人都不懂的梗）

[Vision Aided Channel Prediction for Vehicular Communications: A Case Study of Received Power Prediction Using RGB Images](https://ieeexplore.ieee.org/document/11033218)

严格说，这篇不是经典意义上的信道估计，更准确地说，它做的是基于视觉的接收功率预测，而不是从导频或接收信号里恢复瞬时 CSI。要硬说这是信道估计，也可以是，因为接收功率里包含路损、delay、Doppler 效应等等。

作者们也写道，“It also should be explained that since datasets from *DeepSense 6G* uses only received power to describe wireless channel, ...”，足以表达他们的无奈。

不过，接收功率预测倒是很少有人做过，所以也值得参考。文中提到：“...although mmWave receiver is a 16-element antenna array, we only use data of one certain channel.” 虽然没展开写，但也不难看出，数据集中提供的 64 维码本对应的 beam-wise power spectrum，他们每次实验只使用其中一个维度。那就是很传统的一维时序预测任务了。


[Reading Radio from Camera: Visually-Grounded, Lightweight, and Interpretable RSSI Prediction](https://arxiv.org/abs/2510.25936)

这篇论文的大概意思是，感知到 Received signal strength indicator（RSSI）的映射，按无线传播机理拆成两个更容易学、也更可解释的部分来预测。

首先，给出 RSSI 的公式： $\mathrm{RSSI} = -\mathrm{PL}+\mathrm{SF}$，其中，路损主要反映距离导致的衰减，阴影主要反映遮挡物、环境障碍带来的额外波动。

然后，有视觉信息作为场景语义（也就是跟两者都相关）；位置信息与路损强相关；目标检测框能帮助建模遮挡物对阴影损耗的影响。

我这里没看到消融实验，比如视觉、位置、bbox 的 embedding 全部被用于预测路损或阴影，或者只用位置信息做路损估计？从论文内容看，这个组合更像是基于传播机理做出的架构假设，而不是被严格消融验证出来的最优设计。

---

### 3 倒反天罡：用视觉信息和波束方向修正带噪 GPS 坐标

[Pixel-Level GPS Localization and Denoising using Computer Vision and 6G Communication Beams](https://ieeexplore.ieee.org/document/10901399)

我本身也做过城市峡谷效应（Urban Canyon）下的多模态定位，所以对 story-telling 比较熟悉：GNSS 因为城市高楼阻挡和多径，误差会很大，所以要用一些方法修正，或者直接弃用，使用无线信号或其他感知方法定位。

这篇论文的想法是前者，即：RGB 摄像头，能看到场景里有哪些车、它们大概在图像哪个方位；毫米波的窄波束，能提供“信号大概来自哪个方向”的线索。那么这两种额外模态就可以帮助判断：当前通信的发射车到底是图像里的哪一个目标，它在视觉上对应哪个稳定位置区域，再利用这种视觉锚点去修正 GPS 位置估计。

实验方法也是在 GPS 位置信息加高斯，标准差用米衡量。这里写得也不太清楚，到底是局部坐标系下的米作为定位标准，还是 GPS 位置用式（6）转换到 Haversine distance？如果是前者，那为啥需要用到式（6）；如果是后者，距离误差（米）是怎么精准控制的？
