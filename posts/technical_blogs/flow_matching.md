# Flow Matching 整理笔记
2026/07/21

## 0 写在前面

前段时间做了一个有关 flow matching 的工作，最近通过 EDAS bug 查到应该是 accept 了，所以打算在做 presentation slides 之前先复习一下生成模型和 flow matching，顺便留下一些记录供参考。

这个模型看着挺唬人，实则了解过后直观上是非常简单的数学。因为做工程应用，也不需要考虑 high level 的数学底层原理。

---

## 1. 生成建模：从“生成对象”到“分布采样”

### 1.1 将生成对象表示为向量

图像、视频和分子结构等对象都可以表示为高维向量 $z\in\mathbb R^d$。例如，一张高为 $H$、宽为 $W$、具有三个 RGB 通道的图像可以写成 $z\in\mathbb R^{H\times W\times 3}$；在数学处理中，也可以将其展平成 $\mathbb R^d$ 中的向量。我们不直接研究“图片”“视频”或“蛋白质”，而是研究高维空间中的向量。


### 1.2 生成就是从数据分布中采样

设真实数据服从未知的数据分布 $p_{\mathrm{data}}$。生成一个新对象，就是产生一个随机样本 $z\sim p_{\mathrm{data}}$。

这里的 $p_{\mathrm{data}}(z)$ 可以理解为：对象 $z$ 在真实数据中出现的合理程度。例如，在“生成狗的图片”这一任务中，真实狗的图片应具有较高概率，而纯噪声、街道图片或猫的图片应具有较低概率。

不过，我们通常并不知道 $p_{\mathrm{data}}$ 的概率密度表达式。训练时拥有的只是有限数据集：

$$
z_1,\ldots,z_N\overset{\mathrm{i.i.d.}}{\sim}p_{\mathrm{data}}.
$$

因此需要区分两件事：

- 我们一般不能在任意位置 $z$ 精确计算 $p_{\mathrm{data}}(z)$；
- 但我们能够从数据集中抽取一个样本，近似执行 $z\sim p_{\mathrm{data}}$。


### 1.3 生成模型的基本目标

直接从复杂的 $p_{\mathrm{data}}$ 中采样很困难，但从标准高斯分布中采样很容易。因此，选择一个简单的初始分布 $p_{\mathrm{init}}$，通常令 $p_{\mathrm{init}}=\mathcal N(0,I_d)$，然后寻找一种变换，使得

$$
X_0\sim p_{\mathrm{init}}
\quad\longrightarrow\quad
X_1\sim p_{\mathrm{data}}.
$$

Flow Model 使用 ODE 完成这一从噪声到数据的连续变换。

---

## 2. ODE、向量场与 Flow

### 2.1 向量场

一个随时间变化的向量场记为 $u_t(x)$，其中 $x\in\mathbb R^d$ 是当前位置，$t\in[0,1]$ 是时间，$u_t(x)\in\mathbb R^d$ 是当前位置处的速度。

直观上，可以把向量场想象成一张随时间变化的风场地图：

- 空间中的每个位置都有一个箭头；
- 箭头方向表示运动方向；
- 箭头长度表示运动速度。

比喻：如果一片羽毛被放入风场，它就会沿着当地风向不断移动。


### 2.2 常微分方程

给定向量场 $u_t$ 和初始位置 $x_0$，粒子轨迹 $X_t$ 满足

$$
\frac{dX_t}{dt}=u_t(X_t),
\qquad
X_0=x_0.
$$

方程的含义是：轨迹在每一时刻的瞬时速度，等于向量场在当前位置给出的速度。


### 2.3 Flow map

对于每个初始位置 $x_0$，将 ODE 在时间 $t$ 的解记为 $\psi_t(x_0)$。则 flow map 满足

$$
\frac{d}{dt}\psi_t(x_0)
=
u_t\bigl(\psi_t(x_0)\bigr),
\qquad
\psi_0(x_0)=x_0.
$$

向量场、ODE 和 flow 是同一个动态系统的三种描述：

- 向量场 $u_t(x)$：每个位置此刻应该怎样移动；
- ODE：轨迹必须满足的微分关系；
- flow $\psi_t$：从任意初始点出发，经过时间 $t$ 后到达哪里。

可以把一条 ODE 轨迹看成“一个粒子的运动”，把 flow 看成“所有初始点同时运动，从而使整个空间发生形变”。


### 2.4 解的存在性与唯一性

如果向量场对空间变量满足 Lipschitz 条件，例如 $u_t(x)$ 连续可微且导数有界，那么 ODE 的解存在且唯一。

这意味着：从同一个初始点出发，不会同时产生两条不同的轨迹。在机器学习中，神经网络参数化的向量场通常满足实践所需的正则条件，因此一般可以认为 flow 存在。

### 2.5 一个简单的线性 ODE

考虑向量场 $u_t(x)=-\theta x$，其中 $\theta>0$。对应的 flow 为 $\psi_t(x_0)=e^{-\theta t}x_0$。

验证方法包括两步：

1. 初始条件成立：$\psi_0(x_0)=x_0$；
2. 对时间求导可得 $\frac{d}{dt}\psi_t(x_0)=-\theta\psi_t(x_0)=u_t(\psi_t(x_0))$。

因此所有初始点都会随时间指数衰减并趋近原点。

### 2.6 Euler 方法

实际神经网络产生的向量场通常非常复杂，无法得到解析 flow，因此需要数值求解 ODE。

Euler 方法以步长 $h$ 更新：

$$
X_{t+h}=X_t+h\,u_t(X_t).
$$

直观上，每一步都执行：保持当前位置，再沿向量场方向移动一小段距离。

步长越大，神经网络调用次数越少，但数值误差通常越大；步长越小，轨迹越精确，但计算成本越高。

---

## 3. Flow Model

### 3.1 神经网络参数化向量场

Flow Model 使用神经网络 $u_t^\theta(x)$ 表示向量场，其中 $\theta$ 是神经网络参数：

$$
X_0\sim p_{\mathrm{init}},
\qquad
\frac{dX_t}{dt}=u_t^\theta(X_t).
$$

需要注意：神经网络直接输出的是当前位置的速度 $u_t^\theta(x)$，而不是最终的 flow map。要得到 $X_1$，仍然需要通过 ODE solver 逐步模拟。



### 3.2 ODE 是确定性的，随机性来自初始条件

给定固定的初始点 $X_0=x_0$，ODE 轨迹是确定的。但在生成模型中，我们随机采样 $X_0\sim p_{\mathrm{init}}$，因此不同的初始噪声会产生不同的生成轨迹和最终样本。

训练目标是寻找参数 $\theta$，使得

$$
X_0\sim p_{\mathrm{init}},
\qquad
\frac{dX_t}{dt}=u_t^\theta(X_t)
\quad\Longrightarrow\quad
X_1\sim p_{\mathrm{data}}.
$$

也就是说，神经网络向量场需要把整个初始噪声分布运输成数据分布。

---

## 4. Flow Matching 的整体结构

| 层次 | Conditional：针对一个数据点 | Marginal：跨越整个数据分布 |
|---|---|---|
| Probability Path | $p_t(\cdot\mid z)$ | $p_t$ |
| Vector Field | $u_t^{\mathrm{target}}(x\mid z)$ | $u_t^{\mathrm{target}}(x)$ |
| Flow Matching Loss | $\mathcal L_{\mathrm{CFM}}$ | $\mathcal L_{\mathrm{FM}}$ |

三行分别回答三个问题：

1. **Probability Path：** 噪声分布应当怎样逐渐变化为数据分布？
2. **Vector Field：** 什么动态系统能够使分布沿这条路径演化？
3. **Flow Matching Loss：** 怎样训练神经网络学习这个向量场？

两列的关系则是：

- conditional 对象针对某个固定数据点 $z$，通常可以显式计算；
- marginal 对象考虑整个数据分布，是真正用于生成的对象，但通常不可直接计算。

Flow Matching 的核心，就是使用可计算的 conditional 对象，学习不可计算但真正需要的 marginal 对象。

---

## 5. Probability Path：规定分布如何从噪声变成数据

### 5.1 为什么需要 Probability Path？

我们只要求 $X_0\sim p_{\mathrm{init}}$ 且 $X_1\sim p_{\mathrm{data}}$，但这并没有规定中间的分布应该怎样变化。

从噪声到数据的中间过程存在大量可能选择。Probability Path 用来规定每个时刻 $t$ 的目标分布。

需要特别区分：

> Probability Path 只规定每个时刻的分布快照，并不规定某个具体粒子随时间如何移动。

换言之，$p_t$ 描述的是各时刻的 marginal distribution；只有引入向量场和 ODE 后，才会得到粒子的具体动态轨迹。

---

## 6. Conditional Probability Path

### 6.1 Dirac 分布

给定固定数据点 $z$，记 $\delta_z$ 为集中在 $z$ 上的 Dirac 分布。从 $\delta_z$ 中采样永远返回 $z$。

它虽然没有随机性，但可以形式化地作为一个概率分布使用。

---

### 6.2 定义

给定数据点 $z$，conditional probability path $p_t(\cdot\mid z)$ 满足

$$
p_0(\cdot\mid z)=p_{\mathrm{init}},
\qquad
p_1(\cdot\mid z)=\delta_z.
$$

它描述了一个分布如何从初始噪声逐渐收缩到单个数据点 $z$。

这里的 conditional 指“给定数据点 $z$”。不同数据点对应不同的 conditional path。

---

### 6.3 Gaussian Conditional Probability Path

实践中最重要的例子是 Gaussian probability path：

$$
p_t(\cdot\mid z)
=
\mathcal N\!\left(\alpha_t z,\beta_t^2I_d\right).
$$

其中 $\alpha_t$ 和 $\beta_t$ 是人为选择的 noise schedulers，并满足

- $\alpha_0=0$、$\alpha_1=1$；
- $\beta_0=1$、$\beta_1=0$。

因此：

- 当 $t=0$ 时，$p_0(\cdot\mid z)=\mathcal N(0,I_d)=p_{\mathrm{init}}$；
- 当 $t=1$ 时，均值为 $z$、方差为 $0$，所以 $p_1(\cdot\mid z)=\delta_z$。

从该路径采样可以写成

$$
X_t=\alpha_t z+\beta_t\varepsilon,
\qquad
\varepsilon\sim\mathcal N(0,I_d).
$$

直观上，$\alpha_t$ 控制数据成分逐渐增强，$\beta_t$ 控制噪声成分逐渐减弱。

最简单的调度器是 $\alpha_t=t$、$\beta_t=1-t$，此时

$$
X_t=t z+(1-t)\varepsilon.
$$

这就是噪声点 $\varepsilon$ 与数据点 $z$ 之间的直线插值。

---

## 7. Marginal Probability Path

### 7.1 从单个数据点扩展到整个数据分布

Conditional path 只把噪声变成某个已知数据点 $z$。如果希望描述整个数据分布，需要首先随机采样 $Z\sim p_{\mathrm{data}}$，再采样 $X_t\sim p_t(\cdot\mid Z)$。

由此定义 marginal probability path：

$$
p_t(x)
=
\int p_t(x\mid z)p_{\mathrm{data}}(z)\,dz.
$$

等价的采样过程是：

1. 采样 $Z\sim p_{\mathrm{data}}$；
2. 采样 $X_t\sim p_t(\cdot\mid Z)$。

由于 conditional path 的边界条件，有

$$
p_0=p_{\mathrm{init}},
\qquad
p_1=p_{\mathrm{data}}.
$$

因此 marginal probability path 才是真正连接初始噪声分布与完整数据分布的路径。

---

### 7.2 可以采样，但不能计算密度

虽然积分 $p_t(x)=\int p_t(x\mid z)p_{\mathrm{data}}(z)\,dz$ 通常不可计算，但可以很容易地从 $p_t$ 采样：

- 从数据集中取一个数据点 $z$；
- 根据 conditional path 给它加入对应程度的噪声。

这是 Flow Matching 中反复出现的重要思想：

> 不需要知道概率密度的解析表达式，只要能够从相应分布中采样即可。

---

## 8. Conditional Vector Field

### 8.1 定义

Conditional vector field $u_t^{\mathrm{target}}(x\mid z)$ 是一个依赖数据点 $z$ 的向量场，并满足：

$$
X_0\sim p_{\mathrm{init}},
\qquad
\frac{dX_t}{dt}
=
u_t^{\mathrm{target}}(X_t\mid z)
\quad\Longrightarrow\quad
X_t\sim p_t(\cdot\mid z).
$$

也就是说，如果使用该向量场模拟 ODE，那么粒子群在每个时刻的分布都会等于指定的 conditional probability path。

---

### 8.2 Gaussian path 的 conditional flow

对于 Gaussian path，可以直接选择 flow

$$
\psi_t(x_0\mid z)=\alpha_tz+\beta_tx_0.
$$

当 $X_0\sim\mathcal N(0,I_d)$ 时，

$$
X_t=\psi_t(X_0\mid z)
=
\alpha_tz+\beta_tX_0
\sim
\mathcal N(\alpha_tz,\beta_t^2I_d),
$$

正好符合 $p_t(\cdot\mid z)$。

对 flow 求导：

$$
\frac{d}{dt}\psi_t(x_0\mid z)
=
\dot\alpha_tz+\dot\beta_tx_0.
$$

又因为 $x=\alpha_tz+\beta_tx_0$，所以当 $\beta_t\neq0$ 时，

$$
x_0=\frac{x-\alpha_tz}{\beta_t}.
$$

代回上式可得 Gaussian conditional vector field：

$$
u_t^{\mathrm{target}}(x\mid z)
=
\left(
\dot\alpha_t-\frac{\dot\beta_t}{\beta_t}\alpha_t
\right)z
+
\frac{\dot\beta_t}{\beta_t}x.
$$

不必死记这个展开式。更直接的理解是：对于训练时采样的 $X_t=\alpha_tz+\beta_t\varepsilon$，其目标速度就是

$$
\frac{dX_t}{dt}
=
\dot\alpha_tz+\dot\beta_t\varepsilon.
$$

也就是说，目标速度就是“数据成分的变化速度”加上“噪声成分的变化速度”。

---

### 8.3 为什么 conditional vector field 本身还不能生成新数据？

固定 $z$ 后，该向量场最终会使所有轨迹收缩到 $z$。因此，它只能重新生成一个已经知道的数据点。

这看起来没有生成价值，但它是一个可解析计算的基础模块。字幕中将它比喻为一块 **乐高积木**：单独的一块积木用途有限，但将所有数据点对应的 conditional vector field 按正确方式组合后，就能构造出生成整个数据分布的 marginal vector field。

---

## 9. Marginal Vector Field

### 9.1 Marginalization Trick

定义 marginal vector field：

$$
u_t^{\mathrm{target}}(x)
=
\int
u_t^{\mathrm{target}}(x\mid z)
\frac{
p_t(x\mid z)p_{\mathrm{data}}(z)
}{
p_t(x)
}
\,dz.
$$

根据贝叶斯公式，

$$
\frac{
p_t(x\mid z)p_{\mathrm{data}}(z)
}{
p_t(x)
}
=
p_t(z\mid x).
$$

因此 marginal vector field 也可以写成条件期望：

$$
u_t^{\mathrm{target}}(x)
=
\mathbb E\!\left[
u_t^{\mathrm{target}}(x\mid Z)
\mid X_t=x
\right].
$$

这称为 marginalization trick。

---

### 9.2 后验加权平均的直观解释

假设当前粒子位于 $x$。由于 $x$ 是带噪数据，我们不知道它由哪个干净数据点 $z$ 产生。

对于每个可能的数据点 $z$：

- conditional vector field $u_t^{\mathrm{target}}(x\mid z)$ 给出“如果干净数据是 $z$，现在应当向哪里移动”；
- posterior $p_t(z\mid x)$ 表示“已知当前位置为 $x$ 时，干净数据是 $z$ 的可信程度”。

Marginal vector field 将所有可能方向按照 posterior 进行加权平均。

因此，它不是对所有数据点进行简单平均，而是：

> 已知当前位于 $x$，根据贝叶斯后验判断哪些数据点更可能产生了 $x$，再对相应速度进行加权平均。

对于 Gaussian path，还可以写成

$$
u_t^{\mathrm{target}}(x)
=
\left(
\dot\alpha_t-\frac{\dot\beta_t}{\beta_t}\alpha_t
\right)
\mathbb E[Z\mid X_t=x]
+
\frac{\dot\beta_t}{\beta_t}x.
$$

因此，marginal vector field 与“根据带噪输入估计其对应的干净数据”密切相关。

---

### 9.3 Marginalization Trick 的结论

如果每个 conditional vector field 都使 ODE 遵循相应的 conditional probability path，那么上述 posterior 加权平均得到的 marginal vector field 会使 ODE 遵循 marginal probability path：

$$
X_0\sim p_{\mathrm{init}},
\qquad
\frac{dX_t}{dt}
=
u_t^{\mathrm{target}}(X_t)
\quad\Longrightarrow\quad
X_t\sim p_t.
$$

特别地，当 $t=1$ 时有 $X_1\sim p_{\mathrm{data}}$。

这说明 marginal vector field 正是我们真正想让神经网络学习的向量场。

---

## 10. Continuity Equation

### 10.1 方程形式

概率密度 $p_t$ 在向量场 $u_t$ 下演化时，满足 continuity equation：

$$
\frac{\partial}{\partial t}p_t(x)
=
-\operatorname{div}\!\left(p_tu_t\right)(x).
$$

其中散度定义为

$$
\operatorname{div}(v)(x)
=
\sum_{i=1}^d
\frac{\partial v_i(x)}{\partial x_i}.
$$

---

### 10.2 直观含义

左侧 $\partial_t p_t(x)$ 表示位置 $x$ 处概率质量随时间的变化率。

右侧表示由向量场导致的概率质量净流动：

- 流入大于流出时，$x$ 附近的概率密度增加；
- 流出大于流入时，$x$ 附近的概率密度减少；
- 如果某处没有概率质量，即使向量场速度很大，也没有质量可以流出。

因此 continuity equation 本质上是概率质量守恒方程。

---

### 10.3 Marginalization Trick 的严格证明

Conditional vector field 遵循 conditional probability path，因此

$$
\partial_t p_t(x\mid z)
=
-\operatorname{div}
\left(
p_t(\cdot\mid z)
u_t^{\mathrm{target}}(\cdot\mid z)
\right)(x).
$$

对 marginal density 求时间导数：

$$
\begin{aligned}
\partial_t p_t(x)
&=
\partial_t
\int
p_t(x\mid z)p_{\mathrm{data}}(z)\,dz
\\
&=
\int
\partial_t p_t(x\mid z)p_{\mathrm{data}}(z)\,dz
\\
&=
-\int
\operatorname{div}
\left(
p_t(\cdot\mid z)
u_t^{\mathrm{target}}(\cdot\mid z)
\right)(x)
p_{\mathrm{data}}(z)\,dz
\\
&=
-\operatorname{div}
\left(
\int
p_t(x\mid z)
u_t^{\mathrm{target}}(x\mid z)
p_{\mathrm{data}}(z)\,dz
\right)
\\
&=
-\operatorname{div}
\left(
p_t(x)
\int
u_t^{\mathrm{target}}(x\mid z)
\frac{
p_t(x\mid z)p_{\mathrm{data}}(z)
}{
p_t(x)
}
\,dz
\right)
\\
&=
-\operatorname{div}
\left(
p_tu_t^{\mathrm{target}}
\right)(x).
\end{aligned}
$$

因此 marginal vector field 满足 marginal probability path 的 continuity equation，进而使 ODE 的 marginal distribution 等于 $p_t$。

---

## 11. 学习 Marginal Vector Field

### 11.1 理想的 Flow Matching Loss

使用神经网络向量场 $u_t^\theta(x)$ 逼近真正的 marginal vector field，最直接的方法是最小化均方误差：

$$
\mathcal L_{\mathrm{FM}}(\theta)
=
\mathbb E_{
t\sim\mathrm{Unif}[0,1],\,
X_t\sim p_t
}
\left[
\left\|
u_t^\theta(X_t)
-
u_t^{\mathrm{target}}(X_t)
\right\|^2
\right].
$$

如果神经网络表达能力足够强，该损失的最优解是 $u_t^\theta=u_t^{\mathrm{target}}$。

由于 $X_t\sim p_t$ 可以通过先采样 $Z\sim p_{\mathrm{data}}$、再采样 $X_t\sim p_t(\cdot\mid Z)$ 得到，也可写成

$$
\mathcal L_{\mathrm{FM}}(\theta)
=
\mathbb E_{
t,Z,X_t
}
\left[
\left\|
u_t^\theta(X_t)
-
u_t^{\mathrm{target}}(X_t)
\right\|^2
\right].
$$

---

### 11.2 为什么不能直接使用？

问题在于 marginal vector field 包含对整个数据分布的 posterior 积分：

$$
u_t^{\mathrm{target}}(x)
=
\int
u_t^{\mathrm{target}}(x\mid z)p_t(z\mid x)\,dz.
$$

真实数据分布未知，积分维度又极高，因此一般无法对给定的 $x$ 直接计算 $u_t^{\mathrm{target}}(x)$。

所以 $\mathcal L_{\mathrm{FM}}$ 是“理想但不可计算”的目标。

---

## 12. Conditional Flow Matching Loss

既然 conditional vector field 有解析表达式，就改为回归 conditional target：

$$
\mathcal L_{\mathrm{CFM}}(\theta)
=
\mathbb E_{
t\sim\mathrm{Unif}[0,1],\,
Z\sim p_{\mathrm{data}},\,
X_t\sim p_t(\cdot\mid Z)
}
\left[
\left\|
u_t^\theta(X_t)
-
u_t^{\mathrm{target}}(X_t\mid Z)
\right\|^2
\right].
$$

该损失完全可以计算：

1. 从数据集中抽取 $Z$；
2. 随机抽取时间 $t$；
3. 向 $Z$ 添加适量噪声，得到 $X_t$；
4. 解析计算 conditional target velocity；
5. 使用普通 MSE 训练网络。

但此时出现关键问题：

> 我们希望学习的是 marginal vector field，为什么回归 conditional vector field 会得到正确结果？

答案就是 Flow Matching 的核心定理。

---

## 13. Flow Matching 核心定理

### 13.1 两种损失只相差常数

Conditional Flow Matching Loss 可以分解为

$$
\mathcal L_{\mathrm{CFM}}(\theta)
=
\mathcal L_{\mathrm{FM}}(\theta)
+
\mathbb E
\left[
\left\|
u_t^{\mathrm{target}}(X_t\mid Z)
-
u_t^{\mathrm{target}}(X_t)
\right\|^2
\right].
$$

第二项不依赖神经网络参数 $\theta$，因此两种损失只相差一个与 $\theta$ 无关的常数。于是

$$
\nabla_\theta\mathcal L_{\mathrm{CFM}}(\theta)
=
\nabla_\theta\mathcal L_{\mathrm{FM}}(\theta).
$$

它们具有相同的梯度和相同的最小化器。

因此，最小化可计算的 $\mathcal L_{\mathrm{CFM}}$，等价于最小化不可计算的 $\mathcal L_{\mathrm{FM}}$。

---

### 13.2 条件期望证明

令

- $Y=u_t^{\mathrm{target}}(X_t\mid Z)$；
- $m(X_t)=\mathbb E[Y\mid X_t]=u_t^{\mathrm{target}}(X_t)$；
- $f(X_t)=u_t^\theta(X_t)$。

则

$$
\begin{aligned}
\|f-Y\|^2
&=
\|f-m+m-Y\|^2
\\
&=
\|f-m\|^2
+
\|m-Y\|^2
+
2\langle f-m,m-Y\rangle.
\end{aligned}
$$

对所有随机变量取期望。交叉项满足

$$
\mathbb E[
\langle f-m,m-Y\rangle
]
=
0,
$$

因为在给定 $X_t$ 后，$f-m$ 是确定的，而

$$
\mathbb E[m-Y\mid X_t]
=
m-\mathbb E[Y\mid X_t]
=
0.
$$

因此

$$
\mathbb E\|f-Y\|^2
=
\mathbb E\|f-m\|^2
+
\mathbb E\|m-Y\|^2.
$$

第一项就是 marginal flow matching loss，第二项与 $\theta$ 无关。

---

### 13.3 为什么网络最后学到的是平均方向？

训练时，同一个带噪位置 $x$ 可能由多个不同数据点 $z$ 产生，因此 conditional target 并不是唯一的。

但网络只接收 $x$ 和 $t$，并不知道对应的干净数据点 $z$。在 MSE 回归下，当同一个输入对应多个可能标签时，最优预测是这些标签的条件平均：

$$
u_t^\theta(x)
=
\mathbb E[
u_t^{\mathrm{target}}(x\mid Z)
\mid X_t=x
].
$$

这正是 marginal vector field。

所以“不把数据点 $z$ 告诉网络”不是缺陷，而是整个方法成立的关键：网络被迫在所有可能的 conditional directions 之间学习 posterior-weighted average。

---

## 14. Gaussian Conditional Flow Matching

### 14.1 一般调度器

采样过程为

$$
Z\sim p_{\mathrm{data}},
\qquad
\varepsilon\sim\mathcal N(0,I_d),
\qquad
t\sim\mathrm{Unif}[0,1],
$$

并构造

$$
X_t=\alpha_tZ+\beta_t\varepsilon.
$$

对应的 conditional target velocity 为

$$
V_t^{\mathrm{target}}
=
\dot\alpha_tZ+\dot\beta_t\varepsilon.
$$

因此 Gaussian Conditional Flow Matching Loss 为

$$
\mathcal L_{\mathrm{CFM}}(\theta)
=
\mathbb E_{t,Z,\varepsilon}
\left[
\left\|
u_t^\theta(
\alpha_tZ+\beta_t\varepsilon
)
-
\left(
\dot\alpha_tZ+\dot\beta_t\varepsilon
\right)
\right\|^2
\right].
$$

这已经是一个可以直接实现的训练目标。

---

### 14.2 线性路径

选择 $\alpha_t=t$、$\beta_t=1-t$，则

$$
X_t=tZ+(1-t)\varepsilon.
$$

因为 $\dot\alpha_t=1$、$\dot\beta_t=-1$，目标速度为

$$
V_t^{\mathrm{target}}=Z-\varepsilon.
$$

所以损失简化为

$$
\mathcal L_{\mathrm{CFM}}(\theta)
=
\mathbb E_{t,Z,\varepsilon}
\left[
\left\|
u_t^\theta(
tZ+(1-t)\varepsilon
)
-
(Z-\varepsilon)
\right\|^2
\right].
$$

这是 Flow Matching 最直观、最常见的形式：

1. 随机抽取一个数据点 $Z$；
2. 随机抽取一个高斯噪声点 $\varepsilon$；
3. 在两点的连线上随机取一点 $X_t$；
4. 让网络预测沿直线从噪声指向数据的速度 $Z-\varepsilon$。

由于

$$
Z-X_t
=
(1-t)(Z-\varepsilon),
$$

目标速度也可以写成

$$
V_t^{\mathrm{target}}
=
\frac{Z-X_t}{1-t}.
$$

前一种形式 $Z-\varepsilon$ 通常在采样实现中更加直接。

---

## 15. Flow Matching 训练算法

对于一个 mini-batch，训练过程如下：

```python
# z: 从数据集中取得的一批数据
z = sample_data_batch()

# t: 每个样本独立采样一个时间
t = Uniform(0, 1).sample(batch_size)

# eps: 标准高斯噪声
eps = Normal(0, 1).sample(z.shape)

# 构造 Gaussian probability path 上的带噪样本
x_t = alpha(t) * z + beta(t) * eps

# conditional target velocity
v_target = alpha_dot(t) * z + beta_dot(t) * eps

# 网络只接收 x_t 和 t
v_pred = model(x_t, t)

# Conditional Flow Matching loss
loss = mean_squared_error(v_pred, v_target)

loss.backward()
optimizer.step()
```

对于线性路径，代码进一步简化为：

```python
x_t = t * z + (1 - t) * eps
v_target = z - eps
loss = mse(model(x_t, t), v_target)
```

训练过程中，模型并不接收 $z$ 或 $\varepsilon$ 作为额外输入。它只看到 $X_t$ 和 $t$，因此学到的是给定当前位置后的平均速度，即 marginal vector field。

---

## 16. 为什么称为 Simulation-Free Training？

Flow Matching 的训练过程中：

- 不需要从 $t=0$ 一直模拟到 $t=1$；
- 不需要展开一条完整 ODE 轨迹；
- 不需要在每个训练样本上调用几十次或上百次神经网络；
- 每次训练只需随机选择一个时间 $t$，构造一个 $X_t$，进行一次速度回归。

因此它被称为 **simulation-free training**。

这是 Flow Matching 能扩展到大型图像和视频模型的重要原因：一个生成模型训练问题被转化为了标准监督回归问题。

不过，需要区分训练和推理：

- **训练时**不需要模拟 ODE；
- **生成时**仍然需要数值求解 ODE。

---

## 17. 训练后如何生成样本？

训练完成后，网络近似 marginal vector field。首先采样

$$
X_0\sim\mathcal N(0,I_d),
$$

然后求解

$$
\frac{dX_t}{dt}=u_t^\theta(X_t),
\qquad
t:0\rightarrow1.
$$

使用 Euler 方法时：

```python
x = sample_standard_gaussian()
h = 1 / num_steps

for k in range(num_steps):
    t = k / num_steps
    x = x + h * model(x, t)

return x
```

理想情况下，最终的 $X_1$ 服从 $p_{\mathrm{data}}$。

推理阶段的主要代价是需要多次调用神经网络。步数越多，ODE 近似通常越准确，但图像或视频生成所需计算也越多。

---

## 18. Conditional 与 Marginal 的完整关系

### 18.1 Probability Path

Conditional：

$$
p_0(\cdot\mid z)=p_{\mathrm{init}},
\qquad
p_1(\cdot\mid z)=\delta_z.
$$

Marginal：

$$
p_t(x)=\int p_t(x\mid z)p_{\mathrm{data}}(z)\,dz,
\qquad
p_0=p_{\mathrm{init}},
\qquad
p_1=p_{\mathrm{data}}.
$$

---

### 18.2 Vector Field

Conditional：

$$
X_t\sim p_t(\cdot\mid z).
$$

Marginal：

$$
u_t^{\mathrm{target}}(x)
=
\mathbb E[
u_t^{\mathrm{target}}(x\mid Z)
\mid X_t=x
],
$$

并且使用该向量场时 $X_t\sim p_t$。

---

### 18.3 Loss

不可计算但真正想优化的目标：

$$
\mathcal L_{\mathrm{FM}}
=
\mathbb E
\left[
\|u_t^\theta(X_t)-u_t^{\mathrm{target}}(X_t)\|^2
\right].
$$

可计算并在实践中使用的目标：

$$
\mathcal L_{\mathrm{CFM}}
=
\mathbb E
\left[
\|u_t^\theta(X_t)-u_t^{\mathrm{target}}(X_t\mid Z)\|^2
\right].
$$

二者梯度相同，因此训练 $\mathcal L_{\mathrm{CFM}}$ 就能够学习 marginal vector field。

---

## 19. 常见误区

### 19.1 Conditional 不是文本条件

本章中的 $p_t(x\mid z)$ 是给定一个具体数据点 $z$ 的 probability path，不是给定 prompt、类别或文本标签的条件生成。

---

### 19.2 Probability Path 不是粒子轨迹

$p_t$ 只描述每个时刻粒子总体的分布。它没有说明同一个粒子在两个时间点之间如何对应。向量场和 ODE 才定义具体运动。

---

### 19.3 Conditional vector field 不是最终生成模型

固定 $z$ 的 conditional vector field 最终只会生成 $z$。它是用来构造和训练 marginal vector field 的可计算基础模块。

---

### 19.4 Marginal vector field 不是简单平均

它是给定当前位置 $x$ 后，按照 posterior $p_t(z\mid x)$ 进行的加权平均。当前状态 $x$ 提供了关于潜在干净数据点的重要信息，不能忽略。

---

### 19.5 不知道 $p_{\mathrm{data}}$ 不代表无法训练

虽然不能计算 $p_{\mathrm{data}}(z)$，但可以通过数据集近似执行 $Z\sim p_{\mathrm{data}}$。Flow Matching 的训练只依赖数据采样，不依赖数据密度评估。

---

### 19.6 ODE 是确定性的，但模型仍能随机生成

随机性来自随机初始条件 $X_0\sim p_{\mathrm{init}}$。一旦 $X_0$ 固定，之后的 ODE 轨迹就是确定的。

---

### 19.7 Probability Path 是设计选择

只要满足端点条件，就可以选择不同的 $\alpha_t$、$\beta_t$ 或其他 probability path。不同路径可能对应不同训练难度、轨迹形状和数值求解效率。

---

### 19.8 满足同一 Probability Path 的向量场未必唯一

Continuity equation 约束的是概率密度整体的演化，并不总能唯一确定向量场。Flow Matching 显式构造并学习其中一个可行的 marginal vector field。

---

## 20. Flow Matching 的核心逻辑链

整个方法可以压缩为以下步骤：

1. 选择简单初始分布 $p_{\mathrm{init}}$；
2. 对每个数据点 $z$ 设计 conditional probability path $p_t(\cdot\mid z)$；
3. 推导可计算的 conditional vector field $u_t^{\mathrm{target}}(x\mid z)$；
4. 对数据点进行 marginalization，定义真正用于生成的 marginal probability path $p_t$；
5. 使用 posterior-weighted average 构造 marginal vector field $u_t^{\mathrm{target}}(x)$；
6. 证明该向量场的 ODE 遵循 $p_t$，最终得到 $X_1\sim p_{\mathrm{data}}$；
7. 由于 marginal vector field 不可直接计算，定义 conditional flow matching loss；
8. 证明 conditional 和 marginal flow matching loss 只相差与参数无关的常数；
9. 将生成建模转化为一个普通的速度回归问题；
10. 训练完成后，通过数值模拟 ODE 从噪声生成数据。

最终可以概括为：

$$
\boxed{
\text{可计算的 conditional target}
\;\Longrightarrow\;
\text{学习不可计算的 marginal vector field}
\;\Longrightarrow\;
\text{将噪声运输为数据}
}
$$

---

## 21. 最简记忆版本

Gaussian path：

$$
X_t=\alpha_tZ+\beta_t\varepsilon.
$$

Conditional target velocity：

$$
V_t=\dot\alpha_tZ+\dot\beta_t\varepsilon.
$$

训练目标：

$$
\min_\theta
\mathbb E
\left[
\|u_t^\theta(X_t)-V_t\|^2
\right].
$$

线性路径 $\alpha_t=t$、$\beta_t=1-t$：

$$
X_t=tZ+(1-t)\varepsilon,
\qquad
V_t=Z-\varepsilon.
$$

生成过程：

$$
X_0\sim\mathcal N(0,I_d),
\qquad
\frac{dX_t}{dt}=u_t^\theta(X_t),
\qquad
X_1\approx p_{\mathrm{data}}.
$$

一句话总结：

> Flow Matching 通过在随机时间点对“带噪数据应当具有的速度”进行监督回归，在不模拟完整 ODE 的情况下，训练出能够把噪声分布连续运输到数据分布的神经网络向量场。
