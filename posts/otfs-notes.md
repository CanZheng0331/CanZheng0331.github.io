2025/08/22

## 写在前面
本人入学至研一这个阶段主要研究的方向就是 OTFS，且是较为认真推导过公式、写过代码的，现在整理一些我比较熟悉的部分作为分享。但是平心而论，我认为 OTFS 不值得作为一个博士研究生的长久研究方向（硕士研究生无所谓，当作科研训练也无妨，但依然不是很建议）。我通过与一些深耕多载波、信号处理等方向的学者们交流，以及我得到的一些信息，列出如下原因：

1. **商业原因**
   通信行业的开源精神远远不如计算机行业，很多技术被大公司掌握，所以 Open-RAN 等想要打破这个规则，想让一些小公司都分蛋糕吃的计划，现在也并非顺利。OTFS 的提出者 [Ronny Hanani](https://scholar.google.com/citations?user=V3CIqjQAAAAJ&hl=en) 在其共同创立的 Cohere Technologies 注册了大量 OTFS 相关的专利，这一点就跟以前的 OFDM 不同（据不可靠消息称，OFDM 是 60 年代提出，专利大概率失效了）[1]。所以通信公司当然希望尽量绕开这些专利技术，使用一些自己能够掌握的方向。不仅如此，就我所知，IMT-2030 推进组、华为等组织和公司对 OTFS 这项技术并不看好。功利一点讲，这一点足够劝退大部分人了。
2. **双选信道（Doubly-selective/dispersive channel）真的存在吗？** 
   OTFS 的几乎大部分文章的 Introduction 必定会先致敬一波 OFDM 在 4G/5G 的重要地位，然后列出一些 6G 可能会出现的应用场景（如无人机通信、V2X、高铁、低轨卫星通信等），并说明这些场景的信道都是时变的，OFDM 对时变性非常敏感，所以需要一个新的波形，能够简单解决这个问题。但是，个人觉得没有“非 OTFS 不可”的情况。比如，可能是目前无线通信最极端的多普勒频移的情况，低轨卫星通信中，Starlink 的 Ku 波段下行链路（10.7 至 12.7 GHz）使用的是 OFDM [2]。这说明通过一定的频率补偿，OFDM 还是可以应用的，并且已经落地。

综上，我并不推荐一般的研究生同学们将其作为研究方向。尽管如此，由于自己主观兴趣原因，抑或是客观原因，总有一些人是会研究这个方向的。这里，我将自己的一些心得、直觉等分享给大家。


[1] [知乎：如何看待OTFS技术的前景?](https://www.zhihu.com/question/442697816/answer/1715445968)
[2] [T. E. Humphreys, P. A. Iannucci, Z. M. Komodromos and A. M. Graff, "Signal Structure of the Starlink Ku-Band Downlink," in IEEE Trans. Aerosp. Electron. Syst., vol. 59, no. 5, pp. 6016-6030, Oct. 2023.](https://ieeexplore.ieee.org/document/10107477)