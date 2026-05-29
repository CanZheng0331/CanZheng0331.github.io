
2026.05.30 -

[课程链接](https://www.bilibili.com/video/BV1yjz5BLEoY?spm_id_from=333.788.player.switch&vd_source=14f65cfb1b4dff2d972e61e173f4e96e&p=10)

最近在学习 RAG 和 Agent 相关内容，这篇文章先记录从模型 API 调用到 LangChain 基础组件的实践过程。当前内容主要覆盖 OpenAI 风格接口调用、LangChain 基础用法，以及 RAG 的基本流程。

## 1. 前置准备

### 1.1 Qwen 代码调用

通过代码调用阿里云百炼平台的大模型，主要步骤如下：

1. 登录 [阿里云百炼](https://bailian.console.aliyun.com/#/home) 申请 API key；
2. 通过 `pip install openai` 安装 Python 版本的 OpenAI 库；
3. 编写简单脚本测试模型调用。

将 API key 直接暴露在代码中是不安全的，因此更推荐通过环境变量保存密钥，例如 `OPENAI_API_KEY` 和 `DASHSCOPE_API_KEY`。代码运行时可以自动读取这些环境变量，从而避免在源码中显式写入密钥。

---

## 2. OpenAI 库的基础使用

### 2.1 基础使用

使用 OpenAI 风格接口调用大模型时，基本流程如下：

1. 创建客户端对象：需要提供 `api_key`（模型服务商提供的 API key）和 `base_url`（模型服务商的 API 接入地址，例如 OpenAI 或阿里云百炼）；
2. 调用模型：创建 `ChatCompletion` 对象，核心参数包括：
    - model
    - messages
        - `messages` 是一个 list，可包含多条字典形式的消息；
        - 每条消息通常包含两个 key：`role` 和 `content`；
        - `system` 角色：设定助手的整体行为、角色和规则；
        - `assistant` 角色：代表 AI 助手的回答；
        - `user` 角色：代表用户发送的 prompt。

3. 处理结果：`response` 变量就是返回的 `ChatCompletion` 对象。可以通过 `print(response.choices[0].message.content)` 输出模型给出的回答。

一个最基础的调用示例如下。这里没有显式传入 `api_key`，默认从环境变量中读取：

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

response = client.chat.completions.create(
    model="qwen-max",
    messages=[
        {"role": "system", "content": "你是一个无线通信领域的专家，并且不说废话简单回答。"},
        {"role": "assistant", "content": "好的，我是无线通信专家，并且回答简洁，你要问什么？"},
        {"role": "user", "content": "给我解释香农信息熵。"},
    ],
)

print(response.choices[0].message.content)
```

### 2.2 流式输出

如果希望模型像聊天窗口一样逐步返回内容，可以使用流式输出：

1. 在 `client.chat.completions.create()` 调用模型时设置参数 `stream=True`；
2. 使用 `for` 循环遍历 `response` 对象，并在循环中持续输出内容。

```python
response = client.chat.completions.create(
    model="qwen-max",
    messages=[
        {"role": "system", "content": "你是一个无线通信领域的专家，并且回答很详细。"},
        {"role": "user", "content": "给我解释香农信息熵。"},
    ],
    stream=True,
)

for chunk in response:
    print(chunk.choices[0].delta.content, end="", flush=True)
```

### 2.3 附带历史消息调用模型

`messages` 是 list 对象，因此可以放入多轮历史消息。我们可以将历史对话填入 `messages` 中，让模型获取当前对话的上下文，从而给出更连贯的回答。

不过，这种方式本质上仍然是一次性地把历史消息传给模型。后续在学习 LangChain 时，还会进一步接触短期记忆和长期记忆的管理方式。

```python
response = client.chat.completions.create(
    model="qwen-max",
    messages=[
        {"role": "system", "content": "你是一个 AI 助理，回答很简洁。"},
        {"role": "user", "content": "小明有两条宠物狗。"},
        {"role": "assistant", "content": "好的。"},
        {"role": "user", "content": "小明有三条宠物猫。"},
        {"role": "assistant", "content": "好的。"},
        {"role": "user", "content": "小明共有几个宠物？"},
    ],
)

print(response.choices[0].message.content)
```

## 3. RAG 开发

### 3.1 LangChain 简介

LangChain 是由 Harrison Chase 于 2022 年 10 月创建的一个围绕 LLMs 构建的开发框架。

LangChain 的核心理念是 **为各种 LLMs 实现通用接口**，并将 LLMs 相关组件连接在一起，从而简化应用开发流程。

它主要包含以下几个部分：

- Prompts：优化提示词
- Models：调用各类模型
- History：管理会话历史记录
- Indexes：管理和分析各类文档
- Chains：构建功能执行链条
- Agent：构建智能体

### 3.2 LangChain 环境部署

`pip install langchain langchain-community langchain-ollama dashscope chromadb`

- `langchain`：核心包
- `langchain-community`：社区支持包
- `langchain-ollama`：Ollama 支持包
- `dashscope`：阿里云通义千问的 Python SDK
- `chromadb`：轻量向量数据库

### 3.3 RAG 介绍

通用基础大模型通常存在以下问题：

- LLM 的知识不是实时的；
- LLM 缺乏领域知识；
- 幻觉；
- 数据安全性。

RAG（Retrieval Augmented Generation，检索增强生成）通过引入外部文档来提升生成结果的质量。它会从特定数据源中检索相关信息，并将这些信息提供给大模型，用于修正、补充和约束最终生成的答案。

$$\text{RAG}=检索技术+\text{LLM } 提示$$

#### RAG 的工作原理：离线准备线、在线服务线

RAG 可以拆成两条线来看：

- **离线准备线**：文档/私有知识加载 -> 文本分割 -> 向量化 -> 写入向量数据库
- **在线服务线**：用户提问 -> 检索相关文本 -> Prompt 融合 -> 大模型生成回答

其中，离线阶段构建好的向量数据库会在在线阶段被检索模块调用。也就是说，用户每次提问时，系统会先从知识库中找出与问题最相关的内容，再把这些内容和原始问题一起交给大模型生成答案。

#### RAG 标准流程

RAG 的标准流程通常由索引（Indexing）、检索（Retriever）和生成（Generation）三个核心阶段组成。

- **索引阶段**，通过处理多种来源多种格式的文档提取其中文本，将其切分为标准长度的文本块（chunk），并进行嵌入向量化（embedding），向量存储在向量数据库（vector database）中。
  - 加载文件
  - 内容提取
  - 文本分割，形成 chunk
  - 文本向量化
  - 存向量数据库

- **检索阶段**，用户输入的查询（query）被转化为向量表示，通过相似度匹配从向量数据库中检索出最相关的文本块。
  - query 向量化
  - 在文本向量中匹配出与问句向量相似的 top K 个

- **生成阶段**，检索到的相关文本与原始查询共同构成 prompt，输入 LLM，生成精确且具备上下文关联的回答。
  - 匹配出的文本作为上下文和问题一起添加到 prompt 中
  - 提交给 LLM 生成答案


### 3.4 LangChain 调用大语言模型

LangChain 目前支持三种类型的模型：LLMs、Chat Models 和 Embedding Models。

- LLMs：基于大参数量、海量文本预训练的 Transformer 架构模型；
- Chat Models：专为对话场景优化的 LLMs；
- Embedding Models：接收文本作为输入，并得到对应的文本向量。

本次实践中使用的阿里通义千问模型来自 `langchain-community` 包。

```python
from langchain_community.llms.tongyi import Tongyi

model = Tongyi(model="qwen-max")
res = model.invoke(input="你是谁？")
print(res)
```

### 3.5 流式输出

- `invoke` 方法：一次性返回完整结果；
- `stream` 方法：逐段返回结果，实现流式输出。

```python
for chunk in model.stream(input="你是谁？"):
    print(chunk, end="", flush=True)
```

### 3.6 LangChain 调用聊天模型

聊天消息包含以下几种类型：

- `AIMessage`：类似于 OpenAI 库中的 assistant 角色
- `HumanMessage`：类似于 OpenAI 库中的 user 角色
- `SystemMessage`：类似于 OpenAI 库中的 system 角色

```python
messages = [
    SystemMessage(content = "..."),
    HumanMessage(content = "..."),
    AIMessage(content = "..."),
]
```
这种写法是静态的，会直接得到对应的 Message 类对象。

也可以使用简写形式：

```python
messages = [
    ("system", "..."),
    ("human", "..."),
    ("ai", "..."),
]
```
这种写法是动态的，需要在运行时由 LangChain 内部机制转换为 Message 类对象。它的好处是支持在模板中填充 `{变量}` 占位符。

完整的聊天模型调用示例：

```python
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

chat = ChatTongyi(model="qwen3-max")

messages = [
    SystemMessage(content="你是无线通信领域的专家"),
    HumanMessage(content="给我解释 MIMO 和 OFDM 这两个技术为什么适配？"),
    AIMessage(content="OFDM 解决频率维度的问题，MIMO 解决空间维度的问题。"),
    HumanMessage(content="如何学习 MIMO-OFDM 这个技术？简短些回答。"),
]

for chunk in chat.stream(input=messages):
    print(chunk.content, end="", flush=True)
```

### 3.7 LangChain 嵌入模型的使用

Embedding Models 将字符串作为输入，返回一个浮点数列表，也就是文本对应的向量表示。

需要注意的是：`langchain-community` 正在逐步 sunset，不再被积极维护。后续实际开发时，应关注 LangChain 官方推荐的新包和迁移方式。

```python
from langchain_community.embeddings import DashScopeEmbeddings

embed = DashScopeEmbeddings()

query_vector = embed.embed_query("我喜欢你")
doc_vectors = embed.embed_documents(["我喜欢你", "我稀饭你", "晚上吃啥"])
```

### 3.8 LangChain 通用提示词模板（zero-shot）

LangChain 提供了 `PromptTemplate` 类，用于协助构建和管理提示词。`PromptTemplate` 表示一个提示词模板，可以构建自定义的基础提示词，并支持变量注入。

在较大的工程中，使用提示词模板更容易实现提示词的标准化和复用。同时，这些模板类也支持 LangChain 框架中的链式调用（Runnable 接口），常见类型包括：

- `PromptTemplate`
- `FewShotPromptTemplate`
- `ChatPromptTemplate`

标准写法：

```python
from langchain_core.prompts import PromptTemplate
from langchain_community.llms.tongyi import Tongyi

prompt_template = PromptTemplate.from_template(
    "我的邻居姓{lastname}，刚生了{gender}，你帮我取个名字，简单回答。"
)

prompt_text = prompt_template.format(lastname="张", gender="女儿")

model = Tongyi(model="qwen-max")
res = model.invoke(input=prompt_text)
print(res)
```

也可以使用 LangChain 的链式写法：

```python
chain = prompt_template | model
res = chain.invoke(input={"lastname": "张", "gender": "女儿"})
print(res)
```

### 3.9 Few-shot 提示词模板

待补充。

### 3.10 模板类的 format 和 invoke 方法

待补充。
