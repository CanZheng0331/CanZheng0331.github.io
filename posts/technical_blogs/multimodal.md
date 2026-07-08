2026/06/15- 


## 1 CLIP (Contrastive Language-Image Pre-Training, OpenAI, 2021/02)

### 1.0 参考资料

[论文链接](https://arxiv.org/pdf/2103.00020)
[参考帖1](https://zhuanlan.zhihu.com/p/593661212)
[视频讲解1](https://www.bilibili.com/video/BV1w9MczyEaM/?spm_id_from=333.337.search-card.all.click&vd_source=14f65cfb1b4dff2d972e61e173f4e96e)
[视频讲解2](https://www.bilibili.com/video/BV1SL4y1s7LQ?spm_id_from=333.788.videopod.sections&vd_source=14f65cfb1b4dff2d972e61e173f4e96e)
[视频讲解3](https://www.bilibili.com/video/BV1WASsBwEU7/?spm_id_from=333.337.search-card.all.click&vd_source=14f65cfb1b4dff2d972e61e173f4e96e)


### 1.1 简介
CLIP 是一个<font color='red'>零样本多模态预训练模型</font>，它的核心思想是让模型在大规模的“图像-文本”对进行<font color='red'>对比学习</font>，从而学会姜图像特征和文本特征映射到<font color='red'>统一的语义空间</font>中，进而建立图像与文本之间的联系。

<p align="center">
  <img src="/posts/technical_blogs/blog_fig/multimodal/CLIP.png" alt="CLIP 模型" width="500">
</p>
<p align="center">
  <em>图 1.1：CLIP 模型</em>
</p>


### 1.2 原理解释

在一个 Batch 中，输入为 $N$ 幅图片和 $N$ 个文本，图片和文本是按顺序一一对应的关系。$N$ 个图片经过 image encoder 被编码成 $N$ 个向量 $I$；$N$ 个文本经过 text encoder 被编码成 $N$ 个向量 $T$。所有向量进行点乘运算，得到一个 $N \times N$ 的相似度矩阵。矩阵 $(i,j)$ 位置的值是第 $i$ 幅图的向量 $I_i$ 和第 $j$ 个文本的向量 $T_j$ 的点积结果，代表着两个编码向量之间的相似性。

已知第 $i$ 幅图和第 $i$ 个文本是对应的，所以第 $i$ 行的任务目标就是让 $I_i$ 和 $T_i$ 的相似度最高，也就是尽量接近 $1$，而同一行其他位置的值尽量接近 $0$。由于这样近似变成了一个分类任务（即，第 $i$ 幅图的类别为 $i$）可以用 Cross-Entropy 作为损失函数。对于每一列也同理。

```python
loss_I = nn.CrossEntropyLoss(logits, labels,axis=0)
loss_T = nn.CrossEntropyLoss(logits, labels,axis=1)

loss = (loss_I + loss_T) / 2
```

模型不再学习具体标签，而是学习一个共享的多模态语义空间。在这个空间里，语义相近的事物会聚在一起。

### 1.3 


### 1.4 局限性


#### 一、 性能表现与局限

* **整体分类性能并非顶尖：** 与 ImageNet 上最强的模型（已达 90% 准确率）相比，CLIP 的准确率仅为 76.2%。若想通过单纯增加数据和模型规模来填补这一差距，预计需要增加 1000 倍的数据量。
* **细分类与异常检测能力不足：** 在细分类数据集上，CLIP 的表现不及 ResNet-50。此外，由于模型缺乏对“异常”概念的认知，在图片异常检测任务中的表现同样逊于 ResNet-50，在许多特定领域的表现甚至接近随机猜测。
* **少样本学习能力违背常理：** 模型的表现与人类的学习规律截然不同。在从零样本向少样本过渡时，性能反而会出现下降。如何实现“Zero-shot 表现好，而 One-shot 表现更好”仍是一个难题。

#### 二、 数据质量与泛化问题

* **分布外数据（OOD）泛化变差：** 当面对完全脱离训练集分布的数据时，模型表现不佳。例如，由于训练集中严重缺乏类似数据，CLIP 在 MNIST 手写数字数据集上的准确率仅为 80% 左右。
* **评测基准存在局限：** 实验过程中反复使用所有数据集进行测试，无形中将 ImageNet 视为了验证集。同时，现有的 27 个测试数据集不一定具有广泛的代表性，目前仍缺乏专门用来评估 Zero-shot 迁移能力的基准数据集。
* **数据未清洗带来的偏见：** 训练数据全部直接从网络爬取且未经清洗，这导致模型可能会学习到有害信息并隐含有社会偏见。

#### 三、 未来研究与优化方向

* **分类机制的灵活性（对比与生成的结合）：** 目前 CLIP 做分类仍需依赖文本提供固定的类别，本质上是计算图片与有限类别的匹配度。理想状态下，模型应当能直接生成类别的文字标题。因此，未来可以尝试将<font color='red'>**对比学习的高效性**</font>与<font color='red'>**生成学习的灵活性**</font>结合起来（融合两者的 Loss）。
* **提高数据利用效率：** CLIP 当前对数据的利用效率并不高。未来可以通过<font color='red'>**数据增强**</font>、<font color='red'>**自监督学习**</font>或伪标签（Pseudo-labeling）等技术，进一步提升模型的数据使用效率。

### 1.5 总结


## 2 ViLT (Vision-and-Language Transformer, NAVER & Kakao, 2021/06)

### 2.0 参考资料
[论文链接](https://arxiv.org/pdf/2102.03334)
[参考帖1](https://zhuanlan.zhihu.com/p/626163710)
[视频讲解1](https://www.bilibili.com/video/BV14r4y1j74y?spm_id_from=333.788.videopod.sections&vd_source=14f65cfb1b4dff2d972e61e173f4e96e)


### 2.1 简介
ViLT 可以看作是一种极简多模态学习框架，它的特点是把每个模态的特征抽取部分做到了最小化，把主要的计算量都使用 Transformer 放在了特征融合部分，在很大程度上推动了当年多模态学习的进展。

### 2.2 原理解释


###


### 2.4 局限性


### 2.5 总结
