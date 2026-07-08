
2026/3/16 03:18

（为避免不必要的麻烦，本笔记将在相关工作投稿后更新）

最近在做无监督学习方面的东西，想知道除了 PCA，t-SNE 等方法，还有哪些更直观的指标可以表示模型更好地压缩隐变量。问了一下 ChatGPT-5.4，它给出了两个指标，是 RankMe 和 LiDAR。其中，前者有 Yann Lecun 挂名，且截至现在，有着 141 的引用数，不算低。再加上 Lecun 最近在推的 JEPA 也是无监督的稀疏表征世界模型，所以，我便以这种极为简单的方式定下了这两种指标。

这个笔记简单讲讲 RankMe 和 LiDAR。以下内容基于我的直觉理解，如有错误请发邮件联系指正，我会尽快修改，谢谢！

## 1. RankMe：用秩衡量我！

### 1.1 Why RankMe?

在当前的联合嵌入自监督学习（Joint Embedding Self-Supervised Learning, JE-SSL）中，模型通过让两张同一图片的增强版本（比如一张裁剪、一张翻转）在特征空间中尽可能靠近来学习。这种方法不需要像传统的自编码器那样去重建图像。但这带来了一个巨大的问题：缺乏明显的失败视觉反馈。如果是一个生成模型，你可以肉眼看它生成的图片糊不糊；但在 JE-SSL 中，损失函数的数值本身往往没有太多参考价值。

之前通常的做法是：在 ImageNet 上用带标签的数据训练一个线性分类器，通过看分类准确率来决定哪组超参数更好（Linear Probing）。这其实有点作弊:我们明明在做无监督学习，却严重依赖标签。

RankMe 的出现就是为了打破这种依赖。它让你只需要看特征本身，不需要任何标签，就能预测模型在下游任务上的表现。

---

### 1.3 What RankMe?

- RankMe 的核心思想：秩。由大一学过的线性代数知识中，或者按照直觉推断，秩是信息在空间中展开的有效维度。也就是说，秩更高，信息更加丰富；而秩低，则变成维度坍塌（Dimensional Collapse）。

- 文中提到，这个直觉来自 Cover's Theorem。简单来说，如果把一组数据点随机打上标签，只要数据的秩越高，它们能被线性分类器成功分开的概率就越大。这里的 Cover 是写了 *Elements of Information Theory* 这本书的大佬。也就是说，模型的输出特征的有效秩越高，它在下游任务（比如分类）中的表现就越好。

---

### 1.2 How RankMe? 

假设一个模型对 $N$ 个样本输出 latent 表示记为 $\mathbf{Z}\in\mathbb{R}^{N\times d}$，其中每行 $\mathbf{z}_i$ 是第 $i$ 个样本的隐变量特征。

对 $\mathbf{Z}$ 做奇异值分解，设其奇异值为 $\{\sigma_k\}_{k=1}^r$，其中 $r=\min(N,d)$。

然后，我们将奇异值转化为概率分布，即做归一化：
$$p_k = \frac{\sigma_k}{\Vert\mathbf{\sigma} \Vert_1} +\epsilon,$$
其中，$\epsilon$ 是一个小常数。

现在，$p_k$ 可看作一个离散概率分布。

接下来，使用这个概率分布计算熵：

$$H = -\sum_{k=1}^r p_k \log p_k.$$

- 如果隐变量特征坍塌，即：只在一个或几个维度上有值，比如 $p_1=1$，其他 $p_k=0$，则 $H=0$；
- 如果数据在所有维度上完美均匀分布，即：所有的 $p_k$ 都相等，此时熵最大。

接下来做一个非线性变换，使得其与秩在数值尺度对应，即可得到 RankMe。

$$\mathrm{RankMe}(\mathbf{Z}) = \exp \left( H\right).$$

---

## 2. LiDAR: 我不是激光雷达，我是线性判别分析!

### 2.1 RankMe 有什么问题？Why LidAR?
 
RankMe 的核心假设是：特征的有效秩越高，模型越好。但在 SSL 中会遇到一个的问题：为了防止模型学废，很多现代 SSL 方法会在损失函数里强行一种正则化，强制要求输出的特征之间互不相关，强行把方差最大化。

这就导致模型可能只为讨好损失函数，强行把一堆毫无意义的随机噪音撑到了高维空间。此时用 RankMe 去测，会发现它的特征分布极其均匀，有效秩非常高。但在下游的分类任务中，这些全是噪音的特征根本没法用，分类准确率极低。


---

### 2.2 What LiDAR?

LiDAR 在此处并非激光雷达，而是 **Li**near **D**iscriminant **A**nalysis **R**ank。它的核心直觉是：好的特征不仅要在空间中充分展开，而且展开的方向必须是有用的，即能够区分不同的样本。怎么解释？一个完美的特征空间应该长什么样？

- 类内要紧凑：同一张图片不管怎么翻转变形，它们在空间里的点应该紧紧挤在一起。这意味着模型学会了忽略视觉上的表面干扰，抓住了本质特征（也是很多 JE-SSL 的目标）；

- 类间要散开：不同图片（比如猫和狗）在空间里要离得越远越好。这意味着模型能有效区分不同的事物。

（这段解释有点像在做 clustering）

但是，SSL 哪来的类呢？我们虽然没有真实的人工标签，但我们有一个基于代理任务（Surrogate Task）的天然标签系统：

- 类：每一张独立的原始图片，就是一个独立的类；
- 样本：这张原图经过裁剪、翻转、变色等数据增强后产生的不同版本，就是归属于这个类里的样本。

也就是说，一张图片经过数据增强，仍能认出自己，这就是我们的目标。

---

### 2.3 How LiDAR?

首先，定义类内协方差（Within-class covariance） $S_W$ 和 类间协方差（Between-class covariance, $S_B$）：
- 假设我们有 $N$ 张不同的图，每张图做了 $M$ 次不同的数据增强。我们先计算同一张图这 $M$ 个增强版本在特征空间中的方差，然后把所有 $N$ 张图的方差加起来。这个矩阵 $S_W$ 越小，说明模型对数据增强越免疫，不变性越好；
- 我们算出每一张图的中心位置（也就是它所有增强版本在空间里的平均坐标），然后计算这 $N$ 个中心点在整个特征空间里的方差矩阵。矩阵 $S_B$ 越大，说明不同的图片在特征空间里被区分得越开。

接下来，构建 LDA 矩阵： 
$$\mathrm{LDA} = S_W^{-1} S_B. $$
这里，乘以 $S_W$ 的逆矩阵，就相当于对那些类内方差大的维度进行了惩罚和降权。

接下来，将 LDA 矩阵当作 RankMe 中的隐变量矩阵，做同样的操作，并取指数：

$$\mathrm{LiDAR} = \exp\left(-\sum_{k}p_k \log p_k\right).$$


## 直觉

下面附上一段 MATLAB 代码，直观可视化整个逻辑。

```code
% demo_heatmap_true_lidar.m
% Demo: LiDAR vs RankMe under noise (Identify true effective dimensions)
clear; clc; close all;

% 1. Params (C > D for full rank LDA)
D = 32; C = 50; V = 8; N = C * V; labels = repelem(1:C, V)';
g_D = 3; % Number of true effective dimensions (Good Dims)

% 2. Generate Data Scenarios (Vectorized)
Z_good = repelem(randn(C, g_D)*5, V, 1) + randn(N, g_D)*0.5; % 3D pure signal
Zs = { [Z_good, randn(N, D-g_D)*0.01], ...                   % S1: Low Rank
       [Z_good, randn(N, D-g_D)*10],   ...                   % S2: Fake Rank (RankMe blindspot)
       repelem(randn(C, D)*5, V, 1) + randn(N, D)*0.5 };     % S3: True High Rank

titles = {'1. Low Rank (3 cols signal)', ...
          sprintf('2. Fake Rank (3 signal + %d noise)', D-g_D), ...
          '3. True High Rank (All signal)'};

% 3. Calculate & Plot
figure('Position', [100, 100, 1400, 450], 'Color', 'w'); colormap('parula');
for k = 1:3
    rm = calc_rankme(Zs{k}); ld = calc_lidar(Zs{k}, labels);
    subplot(1, 3, k); imagesc(Zs{k}); colorbar;
    title(sprintf('%s\nRankMe: %.1f | LiDAR: %.1f', titles{k}, rm, ld), 'FontSize', 12);
    xlabel(sprintf('Features (D=%d)', D)); ylabel(sprintf('Samples (N=%d)', N));
end

% ================= Helper Functions =================
function r = calc_rankme(Z)
    p = svd(Z); p = p / (sum(p) + 1e-10); p = p(p > 1e-8);
    r = exp(-sum(p .* log(p)));
end

function lidar = calc_lidar(Z, labels)
    [N, D] = size(Z); C = max(labels); V = N / C;
    
    % Vectorized Within-class (S_W) and Between-class (S_B) scatter matrices
    c_mean = squeeze(mean(reshape(Z, V, C, D), 1)); % Fast class means
    Z_cent = Z - repelem(c_mean, V, 1);
    m_diff = c_mean - mean(Z, 1);
    
    S_W = (Z_cent' * Z_cent) / N;
    S_B = V * (m_diff' * m_diff) / N;
    
    % Eq.3: S_W^{-1/2} S_B S_W^{-1/2}
    S_W_inv_half = sqrtm(inv(S_W + 1e-5 * eye(D))); 
    p = abs(eig(S_W_inv_half * S_B * S_W_inv_half)); 
    
    p = p / (sum(p) + 1e-10); p = p(p > 1e-8);
    lidar = exp(-sum(p .* log(p)));
end

```