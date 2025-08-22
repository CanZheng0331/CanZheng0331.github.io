2025/08/22

## 写在前面
本人入学至研一这个阶段主要研究的方向就是 OTFS，且是较为认真推导过公式、写过代码的，现在整理一些我比较熟悉的部分作为分享。但是平心而论，我认为 OTFS 不值得作为一个博士研究生的长久研究方向（硕士研究生无所谓，当作科研训练也无妨，但依然不是很建议）。我通过与一些深耕多载波、信号处理等方向的学者们交流，以及我得到的一些信息，列出如下原因：

1. **商业原因**
   通信行业的开源精神远远不如计算机行业，很多技术被大公司掌握，所以 Open-RAN 等想要打破这个规则，想让一些小公司都分蛋糕吃的计划，现在也并非顺利。OTFS 的提出者 [Ronny Hanani](https://scholar.google.com/citations?user=V3CIqjQAAAAJ&hl=en) 在其共同创立的 Cohere Technologies 注册了大量 OTFS 相关的专利，这一点就跟以前的 OFDM 不同（据不可靠消息称，OFDM 是 60 年代提出，专利大概率失效了）[[1]](#ref1)。所以通信公司当然希望尽量绕开这些专利技术，使用一些自己能够掌握的方向。不仅如此，就我所知，IMT-2030 推进组、华为等组织和公司对 OTFS 这项技术并不看好。功利一点讲，这一点足够劝退大部分人了。
2. **双选信道（Doubly-selective/dispersive channel）真的存在吗？** 
   OTFS 的几乎大部分文章的 Introduction 必定会先致敬一波 OFDM 在 4G/5G 的重要地位，然后列出一些 6G 可能会出现的应用场景（如无人机通信、V2X、高铁、低轨卫星通信等），并说明这些场景的信道都是时变的，OFDM 对时变性非常敏感，所以需要一个新的波形，能够简单解决这个问题。但是，个人觉得没有“非 OTFS 不可”的情况。比如，可能是目前无线通信最极端的多普勒频移的情况，低轨卫星通信中，Starlink 的 Ku 波段下行链路（10.7 至 12.7 GHz）使用的是 OFDM [[2]](#ref2)。这说明通过一定的频率补偿，OFDM 还是可以应用的，并且已经落地。

综上，我并不推荐一般的研究生同学们将其作为研究方向。尽管如此，由于自己主观兴趣原因，抑或是客观原因，总有一些人是会研究这个方向的。为了能够让更多的后来者能够更加丝滑入门 OTFS，同时也是我这一年来工作的总结，这里，我将自己的一些心得、直觉、有用的资料等分享给大家。

## 值得一读的文章/书籍/资料

### 入门篇

我觉得入门 OTFS，最好是能够先观其大略，能够形成一个 big picture。我个人看来，最适合的入门论文是 [[3]](#ref3)。我觉得这篇文章的几张图画得都非常不错，比如 Fig. 1 是表示双选信道的；Fig. 2 是表示 time-delay, time-frequency, delay-Doppler domain 之间的转换关系及其特性，非常直观能看到 DD 域有着很好的稀疏性、紧凑性，这利于我们使用压缩感知技术，以小规模的字典就能恢复信道；Fig. 3 是神中神，应该说是非常直观展示出 OTFS 系统整个端到端的过程。

（可选）上面的论文中一共提到了四个特性，其中可分离性没什么可讲，稀疏性和紧凑性已经说过了，还剩下一个稳定性。关于稳定性的分析，我推荐 [[4]](#ref4) 配合视频 [[5]](#ref5) 理解。同时，Prof. Ronny 在这里分享了非常多具有 insight 的理念，但是恕我数学功底薄弱，真正理解的部分顶多二三成。我还是很推荐大家去看视频的，毕竟是发明人的观点，有着非常多的可取之处，文章可以放后面再看。

接下来，我将分享一些视频资料，都是比较适合入门的。

[[6]](#ref6)：是港科广的 Zijun Gong 教授主讲的，主要讲了很多 OFDM 及其变体的历史、讲了时频双选信道、多普勒效应的本质等。我感悟比较深的就是，多普勒频移只是一个近似的现象，后面自己翻了其他书也更加证实了这点。其实真正的多普勒效应是尺缩效应 (Scaling effect)，用户/散射体的速度与光速的比值越大，这种尺缩效应就越明显 [[7]](#ref7)。

[[8]](#ref8)：这 6 个小时的 tutorial，我记得一半是 Prof. Emanuele 主讲，另一半是 Prof. Yi Hong 主讲。他们讲得非常细致，而且他们前期做的一些研究几乎可以说是现在一些 OTFS 研究的奠基了。

我个人认为上面这些资料看完，如果理解了一半以上，算是入门 OTFS 了。

### 专精篇
#### 信道估计
信道估计是我比较熟悉的领域，而且我也不太喜欢对自己不太擅长的领域置喙，所以可能会着重讲这里。


---
<span id="ref1">[1]</span> [[Article] 知乎：如何看待OTFS技术的前景?](https://www.zhihu.com/question/442697816/answer/1715445968)

<span id="ref2">[2]</span>: [[Paper] T. E. Humphreys, P. A. Iannucci, Z. M. Komodromos and A. M. Graff, "Signal Structure of the Starlink Ku-Band Downlink,"](https://ieeexplore.ieee.org/document/10107477) in IEEE Trans. Aerosp. Electron. Syst., vol. 59, no. 5, pp. 6016-6030, Oct. 2023.

<span id="ref3">[3]</span>: [[Paper] Z. Wei et al., "Orthogonal Time-Frequency Space Modulation: A Promising Next-Generation Waveform,"](https://ieeexplore.ieee.org/abstract/document/9508932) in IEEE Wireless Commun., vol. 28, no. 4, pp. 136-144, August 2021.

<span id="ref4">[4]</span>: [[Paper] S. K. Mohammed, R. Hadani, A. Chockalingam and R. Calderbank, "OTFS—Predictability in the Delay-Doppler Domain and Its Value to Communication and Radar Sensing,"](https://ieeexplore.ieee.org/document/10265224) in IEEE BITS Inf. Theory Mag., vol. 3, no. 2, pp. 7-31, June 2023.

<span id="ref5">[5]</span>: [[Video] Ronny Hadani: Zak OTFS: a framework for communication and sensing in the delay-Doppler domain.](https://www.bilibili.com/video/BV14r421G71Z/?share_source=copy_web&vd_source=fcb7e402ec2fd101aa71bed20e4b1fb9)

<span id="ref6">[6]</span>: [[Video] Zijun Gong: OTFS Tutorial.](https://www.bilibili.com/video/BV1wN4y1X7a7/?share_source=copy_web&vd_source=fcb7e402ec2fd101aa71bed20e4b1fb9)

<span id="ref7">[7]</span>: [[Book] Matz G, Hlawatsch F., "Fundamentals of time-varying communication channels," Wireless communications over rapidly time-varying channels. Academic Press, 2011: 1-63.](https://booksite.elsevier.com/samplechapters/9780123744838/9780123744838.pdf)

<span id="ref8">[8]</span>: [[Video] Emanuele Viterbo: OTFS and delay-Doppler communications.](https://www.bilibili.com/video/BV1yi421Z7tc/?share_source=copy_web&vd_source=fcb7e402ec2fd101aa71bed20e4b1fb9)