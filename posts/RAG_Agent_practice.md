2026.05.30 -

[课程链接](https://www.bilibili.com/video/BV1yjz5BLEoY?spm_id_from=333.788.player.switch&vd_source=14f65cfb1b4dff2d972e61e173f4e96e&p=10)


## 1. 前置准备

### 1.1 Qwen 代码调用

本次实践主要通过阿里云百炼平台调用通义千问模型。基本步骤如下：

1. 登录 [阿里云百炼](https://bailian.console.aliyun.com/#/home) 申请 API key；
2. 安装 Python 版本的 OpenAI SDK：`pip install openai`；
3. 使用 OpenAI 兼容接口调用 Qwen 模型。

API key 不建议直接写在代码里，更推荐通过环境变量保存，例如 `OPENAI_API_KEY` 或 `DASHSCOPE_API_KEY`。这样代码中只需要指定 `base_url`，SDK 会自动从环境变量中读取密钥，避免密钥泄露。

---

## 2. OpenAI 库的基础使用

### 2.1 基础使用

使用 OpenAI 风格接口调用大模型时，核心流程是：

1. 创建 `OpenAI` client；
2. 指定模型名称、消息列表和调用参数；
3. 从 `response.choices[0].message.content` 中读取模型回答。

其中 <font color='red'>**messages**</font> 是最重要的输入结构。它是一个 list，每条消息通常包含两个 key：

- `role`：消息角色，例如 `system`、`user`、`assistant`；
- `content`：消息内容。

`system` 用来设定模型整体行为，`user` 是用户输入，`assistant` 是历史中的模型回复。

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

运行结果：

```text
香农信息熵是......。
```

### 2.2 流式输出

如果希望模型像聊天窗口一样逐步返回内容，可以设置 <font color='red'>**stream=True**</font>。这时返回值不再是一次性完整结果，而是一个可以迭代的流式对象。

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

这里需要注意：非流式输出读取的是 `message.content`，而流式输出读取的是 `delta.content`。因为流式模式下，每个 chunk 只是增量片段，不是一条完整消息。

### 2.3 附带历史消息调用模型

大模型本身不会真的“记住”上一次 API 调用。所谓多轮对话，本质是我们把历史消息重新放进 `messages`，每次一起发送给模型。

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

运行结果：

```text
小明共有5个宠物。
```

这个例子说明：模型能回答“5 个”，不是因为它跨请求存储了记忆，而是因为我们把前面的猫和狗数量作为上下文传给了它。

## 3. RAG 开发

### 3.1 LangChain 简介

LangChain 是围绕 LLM 应用构建的开发框架。它的核心目标是为模型、提示词、检索器、记忆、工具和执行链提供统一接口，从而简化复杂 LLM 应用开发。

常见模块包括：

- Prompts：提示词模板；
- Models：LLM、Chat Model、Embedding Model；
- History / Memory：会话历史；
- Indexes / Retrievers：索引与检索；
- Chains：执行链；
- Agents：智能体。

### 3.2 LangChain 环境部署

```python
pip install langchain langchain-community ollama dashscope chromadb
```

其中：

- `langchain` 是核心框架；
- `langchain-community` 提供社区集成；
- `dashscope` 用于调用阿里云通义千问；
- `chromadb` 是轻量级向量数据库；
- `ollama` 可用于本地模型调用。

### 3.3 RAG 介绍

通用大模型常见问题包括：知识不实时、领域知识不足、可能产生幻觉、私有数据不能直接进入模型训练等。

<font color='red'>**RAG**</font>，即 Retrieval Augmented Generation，检索增强生成。它的思路是：先从外部知识库中检索与问题相关的内容，再把检索结果和问题一起交给 LLM 生成答案。

可以粗略理解为：

$$
\text{RAG} = \text{Retrieval} + \text{LLM Prompting}
$$

**RAG 的工作原理：离线准备线、在线服务线**

RAG 通常分为两条线：

- 离线准备线：文档加载 -> 文本切分 -> 向量化 -> 写入向量数据库；
- 在线服务线：用户提问 -> 检索相关文本 -> 拼接 Prompt -> LLM 生成回答。

**RAG 标准流程**

标准流程包括：

1. Indexing：把文档切成 chunk，并转换成 embedding；
2. Retriever：把 query 向量化，并从向量数据库中找 top-k 相关片段；
3. Generation：把检索片段和原始问题一起输入模型，生成最终回答。

### 3.4 LangChain 调用大语言模型

LangChain 中可以使用 `Tongyi` 调用 Qwen 模型：

```python
from langchain_community.llms.tongyi import Tongyi

model = Tongyi(model="qwen-max")
res = model.invoke(input="你是谁？")
print(res)
```

运行结果节选：

```text
我是Qwen，由阿里云开发的......有什么我可以帮到你的吗？
```

### 3.5 流式输出

```python
model = Tongyi(model="qwen-max")
res = model.stream(input="你是谁？")

for chunk in res:
    print(chunk, end=" ", flush=True)
```

运行结果节选：

```text
我是 Qwen， 由阿里云 开发的超 大规模语言模型......有什么 我可以帮助你的吗？
```

`invoke` 是一次性返回完整结果，`stream` 是逐段返回结果。

### 3.6 LangChain 调用聊天模型

Chat Model 使用消息列表作为输入。LangChain 提供了结构化消息类型：

- `SystemMessage`：对应 OpenAI 中的 `system`；
- `HumanMessage`：对应 `user`；
- `AIMessage`：对应 `assistant`。

```python
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

chat = ChatTongyi(model="qwen3-max")

messages = [
    SystemMessage(content="你是无线通信领域的专家"),
    HumanMessage(content="给我解释 MIMO 和 OFDM 这两个技术为什么适配？"),
    AIMessage(content="OFDM 解决了频率维度的问题，MIMO 解决了空间维度的问题，二者结合实现了“时-频-空”三维资源的高效利用。"),
    HumanMessage(content="如何学习MIMO-OFDM这个技术？简短些回答。"),
]

for chunk in chat.stream(input=messages):
    print(chunk.content, end="", flush=True)
```

运行结果节选：

```text
按以下路径高效学习 MIMO-OFDM：
......
推荐资源：Tse & Viswanath、MIT OpenCourseWare、相关标准文档。
```

也可以使用简写形式：

```python
messages = [
    ("system", "你是无线通信领域的专家，废话不多。"),
    ("human", "给我解释 MIMO 和 OFDM 这两个技术为什么适配？"),
    ("ai", "OFDM 解决了频率维度的问题，MIMO 解决了空间维度的问题。"),
    ("human", "如何学习MIMO-OFDM这个技术？简短些回答。"),
]
```

结构化消息适合明确表达角色；元组写法更简洁，也更适合配合模板动态生成。

### 3.7 LangChain 嵌入模型的使用

Embedding Model 把文本映射成浮点数向量，用于相似度计算和 RAG 检索。

```python
from langchain_community.embeddings import DashScopeEmbeddings

embed = DashScopeEmbeddings()

query_vector = embed.embed_query("我喜欢你")
doc_vectors = embed.embed_documents(["我喜欢你", "我稀饭你", "晚上吃啥"])

print(query_vector)
print(doc_vectors)
```

运行结果节选：

```text
[-3.02587890625, 3.3109374046325684, 4.410546779632568, 0.4593261778354645, ......]
[
  [-3.02587890625, 3.3109374046325684, ......],
  [...],
  [...]
]
```

这里输出不是自然语言，而是向量。语义越接近的文本，在向量空间中距离通常越近。

### 3.8 LangChain 通用提示词模板（zero-shot）

`PromptTemplate` 用来构造带变量的提示词，适合把固定指令和动态输入分离。

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

运行结果：

```text
张婉儿
```

LangChain 更常用的写法是把 Prompt 和 Model 串起来：

```python
chain = prompt_template | model
res = chain.invoke(input={"lastname": "张", "gender": "女儿"})
print(res)
```

运行结果：

```text
张悦媱
```

这里的 <font color='red'>**|**</font> 不是普通的位或运算，而是 LangChain 重写后的链式组合操作。

### 3.9 LangChain Few-shot 提示词模板

Few-shot 的核心思想是给模型一些示例，让模型模仿示例格式回答。

```python
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate
from langchain_community.llms.tongyi import Tongyi

example_template = PromptTemplate.from_template("单词：{word}，反义词：{antonym}")
example_data = [
    {"word": "大", "antonym": "小"},
    {"word": "上", "antonym": "下"},
]

few_shot_prompt = FewShotPromptTemplate(
    example_prompt=example_template,
    examples=example_data,
    prefix="给出给定词的反义词，有如下示例：",
    suffix="基于示例告诉我，{input_word} 的反义词是？",
    input_variables=["input_word"],
)

prompt_text = few_shot_prompt.invoke(input={"input_word": "左"}).to_string()
print(prompt_text)

model = Tongyi(model="qwen-max")
res = model.invoke(input=prompt_text)
print(res)
```

运行结果：

```text
给出给定词的反义词，有如下示例：

单词：大，反义词：小

单词：上，反义词：下

基于示例告诉我，左 的反义词是？
基于示例，“左”的反义词是“右”。
```

### 3.10 模板类的 format 和 invoke 方法

模板类通常同时支持 `format` 和 `invoke`。它们都能填充变量，但返回值不同。

| 区别 | `format` | `invoke` |
| :--- | :--- | :--- |
| 功能 | 直接做字符串替换 | 调用 Runnable 标准接口 |
| 返回值 | `str` | `PromptValue` |
| 传参方式 | `.format(k=v)` | `.invoke({"k": v})` |
| 适用场景 | 单纯生成字符串 | 放入 LangChain Chain 中 |

```python
from langchain_core.prompts import PromptTemplate

template = PromptTemplate.from_template("我的邻居是：{lastname}，最喜欢:{hobby}")

res1 = template.format(lastname="张三", hobby="游泳")
res2 = template.invoke({"lastname": "李四", "hobby": "跑步"})

print(res1, type(res1))
print(res2, type(res2))
```

运行结果：

```text
我的邻居是：张三，最喜欢:游泳 <class 'str'>
text='我的邻居是：李四，最喜欢:跑步' <class 'langchain_core.prompt_values.StringPromptValue'>
```

课堂中容易问到的问题是：既然二者都能填变量，为什么还要 `invoke`？答案是：`invoke` 是 LangChain 的统一执行接口，返回 `PromptValue`，可以自然进入后续模型、解析器、Runnable 链中；而 `format` 更像是普通 Python 字符串工具。

### 3.11 ChatPromptTemplate 的使用

`ChatPromptTemplate` 用于构造多轮聊天模板。它可以通过 `MessagesPlaceholder` 动态注入历史消息。

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.chat_models.tongyi import ChatTongyi

chat_prompt_template = ChatPromptTemplate.from_messages([
    ("system", "你是一个边塞诗人。"),
    MessagesPlaceholder(variable_name="history"),
    ("human", "请再来一首诗。"),
])

history_data = [
    ("human", "请你写一首七言律诗。"),
    ("ai", "碧空如洗月华明，清风徐来夜色清。独坐亭亭思绪远，江山如画入梦中。"),
]

prompt = chat_prompt_template.invoke(input={"history": history_data})
model = ChatTongyi(model="qwen3-max")
res = model.invoke(input=prompt)
print(res.content)
```

运行结果节选：

```text
黄沙百里接天穹，
铁马嘶风卷战蓬。
......
但使龙城烽火红。
```

这里 `MessagesPlaceholder` 很关键。普通 `{history}` 只是字符串占位，而 `MessagesPlaceholder` 表示这里要插入一组结构化消息。

### 3.12 Chain 的基础使用

Chain 的核心是：上一个组件的输出，作为下一个组件的输入。

```python
chat_prompt_template = ChatPromptTemplate.from_messages([
    ("system", "你是一个边塞诗人。"),
    MessagesPlaceholder(variable_name="history"),
    ("human", "请再来一首诗。"),
])

model = ChatTongyi(model="qwen3-max")
chain = chat_prompt_template | model

print(type(chain))
res = chain.invoke(input={"history": history_data})
print(res.content)
print(type(res))
```

运行结果节选：

```text
<class 'langchain_core.runnables.base.RunnableSequence'>
《塞上闻笛》
朔风卷地裂寒旌，
......
<class 'langchain_core.messages.ai.AIMessage'>
```

### 3.13 或运算符的重写

Python 中 `a | b` 本质上会调用 `a.__or__(b)`。LangChain 的 Runnable 基类重写了 `__or__`，所以 `prompt | model` 会生成一个 <font color='red'>**RunnableSequence**</font>。

一个简化版示例：

```python
class Test:
    def __init__(self, name):
        self.name = name

    def __str__(self):
        return f"Test object with name: {self.name}"

    def __or__(self, other):
        return MySequence(self, other)

class MySequence:
    def __init__(self, *args):
        self.sequence = list(args)

    def __or__(self, other):
        self.sequence.append(other)
        return self

A = Test("A")
B = Test("B")
C = Test("C")

seq = A | B | C
for item in seq.sequence:
    print(item)
print(type(seq))
```

运行结果：

```text
Test object with name: A
Test object with name: B
Test object with name: C
<class '__main__.MySequence'>
```

### 3.14 Runnable 接口

LangChain 中大多数核心组件都继承或实现了 Runnable 接口，例如 Prompt、Model、Parser、部分自定义函数。只有 Runnable 或能被自动包装成 Runnable 的对象，才适合进入链。

```python
from langchain_core.prompts import PromptTemplate
from langchain_community.llms.tongyi import Tongyi

prompt = PromptTemplate.from_template("你是一个 AI 模型")
model = Tongyi(model="qwen-max")

chain = prompt | model
print(type(chain))
```

运行结果：

```text
<class 'langchain_core.runnables.base.RunnableSequence'>
```

### 3.15 StrOutputParser 字符串输出解析器

Chat Model 的输出通常是 `AIMessage`。如果下一步需要字符串，就要用 `StrOutputParser` 把 `AIMessage` 转成普通 `str`。

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_community.chat_models.tongyi import ChatTongyi

parser = StrOutputParser()
model = ChatTongyi(model="qwen3-max")
prompt = PromptTemplate.from_template(
    "我邻居姓{lastname}，刚生了{gender}，请帮我取个名字，简单回答。"
)

chain = prompt | model | parser | model | parser

res = chain.invoke(input={"lastname": "张", "gender": "女孩"})
print(res)
```

运行结果节选：

```text
张悦然是一位中国当代作家，1982年出生于山东济南。她以细腻、敏感的文风......致力于推广青年写作与纯文学阅读。
```

这里的结果很有意思：第一次模型生成名字，经过 `StrOutputParser` 变成字符串后，又进入第二次模型调用，于是模型把这个名字当作一个输入继续展开解释。

课堂中有个容易混淆的问题：`chain = prompt | model | model` 为什么可能出错？

原因是组件之间的输入输出类型不匹配。`prompt` 输出 `PromptValue`，模型可以接；但 Chat Model 输出的是 `AIMessage`，下一个模型未必接受这个类型。加入 `StrOutputParser` 后，链路变成：

```text
PromptValue -> AIMessage -> str -> AIMessage -> str
```

类型就顺了。

### 3.16 JsonOutputParser 和多模型执行链

如果希望模型先生成结构化数据，再把其中字段注入下一个 prompt，可以用 `JsonOutputParser`。

```python
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.prompts import PromptTemplate

str_parser = StrOutputParser()
json_parser = JsonOutputParser()
model = ChatTongyi(model="qwen3-max")

first_prompt = PromptTemplate.from_template(
    "我邻居姓{lastname}，刚生了{gender}，请帮我取个名字，"
    "并封装为 JSON 格式返回给我。要求 key 是 name，value 是名字，请严格遵守格式要求。"
)

second_prompt = PromptTemplate.from_template(
    "姓名：{name}，请帮我解析含义。"
)

chain = first_prompt | model | json_parser | second_prompt | model | str_parser
res = chain.invoke(input={"lastname": "张", "gender": "女孩"})
print(res)
```

运行结果节选：

```text
“张婉清”是一个富有诗意和文化内涵的中文姓名，我们可以从姓氏和名字两个部分来解析其含义：
......
“婉清”二字组合，意境优美，传达出一种温婉娴静又清雅高洁的气质。
```

更标准的多模型链应当是：

```text
输入 -> Prompt -> Model -> 数据处理 -> Prompt -> Model -> Parser -> 输出
```

因此构建 Chain 时要始终检查：

- Prompt 输入通常是 `dict`；
- Prompt 输出通常是 `PromptValue`；
- Chat Model 输出通常是 `AIMessage`；
- `StrOutputParser`：`AIMessage -> str`；
- `JsonOutputParser`：`AIMessage -> dict`。

### 3.17 RunnableLambda & 函数加入链

如果内置 Parser 不够用，可以写自定义函数，并用 `RunnableLambda` 放入链中。普通函数也可以直接进入链，LangChain 会自动把它包装成 RunnableLambda。

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda

model = ChatTongyi(model="qwen3-max")
str_parser = StrOutputParser()

first_prompt = PromptTemplate.from_template(
    "我邻居姓{lastname}，刚生了{gender}，请帮我取个名字，仅输出一个名字，不要额外信息。"
)

second_prompt = PromptTemplate.from_template(
    "姓名：{name}，请帮我解析含义。"
)

def to_name_dict(name: str):
    return {"name": name}

chain = first_prompt | model | str_parser | RunnableLambda(to_name_dict) | second_prompt | model | str_parser
res = chain.invoke(input={"lastname": "张", "gender": "女孩"})
print(res)
```

运行结果节选：

```text
“张若曦”是一个富有诗意和文化内涵的中文姓名......“曦”指清晨的阳光，即晨光、朝霞，象征光明、希望、温暖与新生。
```


### 3.18 Memory 临时会话记忆

如果每次都手动维护历史消息，会很麻烦。LangChain 可以用 `RunnableWithMessageHistory` 给已有 Chain 增加历史记录能力。

```python
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableWithMessageHistory
from langchain_core.chat_history import InMemoryChatMessageHistory

model = ChatTongyi(model="qwen3-max")
parser = StrOutputParser()

prompt = ChatPromptTemplate.from_messages([
    ("system", "你需要根据历史对话内容回答用户问题。"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "请根据会话历史回应用户问题：{question}。"),
])

chain = prompt | model | parser

store = {}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

chain_with_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="question",
    history_messages_key="chat_history",
)

res1 = chain_with_history.invoke(
    {"question": "小明有 2 只猫。"},
    config={"configurable": {"session_id": "test"}},
)

res2 = chain_with_history.invoke(
    {"question": "小刚有 1 只狗。"},
    config={"configurable": {"session_id": "test"}},
)

print("第一次执行：", res1)
print("第二次执行：", res2)
```

运行结果节选：

```text
第一次执行：好的，小明有 2 只猫。请问你想了解什么？

第二次执行：好的，小刚有 1 只狗。
现在我们知道：小明有 2 只猫，小刚有 1 只狗。
```

这里的 <font color='red'>**session_id**</font> 很重要。不同 session 会对应不同历史记录；相同 session 才会共享同一段对话记忆。


### 3.19 Memory <font color='red'>**长期会话记忆**</font>

上一节使用的 `InMemoryChatMessageHistory` 只能在 Python 进程内保存历史消息。程序一旦重启，`store = {}` 会重新变成空字典，历史对话也就丢失了。

如果希望会话历史跨程序运行长期保留，可以自己实现一个基于文件的历史记录类。核心思路是：每个 `session_id` 对应一个 JSON 文件，读取历史时从文件反序列化为 LangChain 的 Message 对象，写入历史时再把 Message 对象序列化回 JSON。

```python
import os
import json
from typing import List, Sequence

from langchain_core.messages import BaseMessage, messages_from_dict, messages_to_dict
from langchain_core.chat_history import BaseChatMessageHistory


class FileChatMessageHistory(BaseChatMessageHistory):
    def __init__(self, session_id: str, storage_path: str):
        self.session_id = session_id
        self.storage_path = storage_path
        self.file_path = os.path.join(self.storage_path, f"{self.session_id}.json")
        os.makedirs(self.storage_path, exist_ok=True)

        if not os.path.exists(self.file_path):
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump([], f, ensure_ascii=False, indent=4)

    @property
    def messages(self) -> List[BaseMessage]:
        with open(self.file_path, "r", encoding="utf-8") as f:
            messages_data = json.load(f)
        return messages_from_dict(messages_data)

    def add_messages(self, messages: Sequence[BaseMessage]) -> None:
        all_messages = self.messages
        all_messages.extend(messages)
        messages_data = messages_to_dict(all_messages)
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(messages_data, f, ensure_ascii=False, indent=4)

    def clear(self) -> None:
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=4)
```

接入 `RunnableWithMessageHistory` 的方式与上一节类似，只是 `get_history()` 返回的不再是内存对象，而是文件历史对象：

```python
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableWithMessageHistory

model = ChatTongyi(model="qwen3-max")

prompt = ChatPromptTemplate.from_messages([
    ("system", "你需要根据历史对话内容回答用户问题。"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "请根据会话历史回应用户问题：{question}。")
])

def print_prompt(full_prompt):
    print("=" * 20, full_prompt.to_string(), "=" * 20)
    return full_prompt

base_chain = prompt | print_prompt | model | StrOutputParser()

def get_history(session_id):
    return FileChatMessageHistory(session_id, "./chat_history")

conversation_chain = RunnableWithMessageHistory(
    base_chain,
    get_history,
    input_messages_key="question",
    history_messages_key="chat_history"
)

session_config = {"configurable": {"session_id": "user_001"}}

# 前两次执行用于写入 user_001.json
# conversation_chain.invoke({"question": "小明有 2 只猫。"}, session_config)
# conversation_chain.invoke({"question": "小刚有 1 只狗。"}, session_config)

# 后续可以只执行第三次
res = conversation_chain.invoke({"question": "总共有几只宠物？"}, session_config)
print("第三次执行：", res)
```

运行结果节选：

```text
System: 你需要根据历史对话内容回答用户问题。
Human: 小明有 2 只猫。
AI: 好的，小明有 2 只猫。......
Human: 小刚有 1 只狗。
AI: 明白了，小明有 2 只猫，小刚有 1 只狗。......
Human: 请根据会话历史回应用户问题：总共有几只宠物？
====================
第三次执行：根据会话历史：小明有 2 只猫，小刚有 1 只狗，所以总共有 3 只宠物。
```

这里的疑惑是：为什么把第一、二次执行注释掉，只执行第三次，模型还能知道历史？

答案是：历史不是模型自己记住的，也不是 notebook 变量记住的，而是 `user_001.json` 文件记住的。第一次、第二次执行时，`RunnableWithMessageHistory` 会在调用结束后自动把本轮 HumanMessage 和 AIMessage 写进 `./chat_history/user_001.json`。之后即使重启程序，只要第三次仍然使用同一个 `session_id="user_001"`，`get_history("user_001")` 就会重新打开同一个 JSON 文件，并通过 `messages_from_dict` 把文件中的历史内容恢复成 Message 对象，然后注入到 <font color='red'>**MessagesPlaceholder**</font> 所在位置。

内部流程可以概括为：

```text
invoke 输入 question
-> 根据 config 里的 session_id 调用 get_history
-> FileChatMessageHistory.messages 从 user_001.json 读历史
-> 把历史填入 MessagesPlaceholder
-> 调用原始 chain 得到回答
-> 把本轮 user 问题和 AI 回答 append 回 user_001.json
```

如果想清空长期记忆，可以调用：

```python
get_history("user_001").clear()
```

或者直接删除 `./chat_history/user_001.json`。

### 3.20 文档加载器

Document loaders 用于把不同来源的数据统一加载成 LangChain 的 <font color='red'>**Document**</font> 对象。`Document` 主要包含两部分：

- `page_content`：真正参与后续切分、向量化、检索的文本内容；
- `metadata`：来源、行号、页码等元信息，方便追踪和过滤。

常见加载方式有：

- `load()`：一次性把所有文档读入内存；
- `lazy_load()`：懒加载，边遍历边读取，更适合大文件。

**CSVLoader**

```python
from langchain_community.document_loaders import CSVLoader

loader = CSVLoader(
    file_path="./data/stu.csv",
    csv_args={"delimiter": ","},
    encoding="utf-8"
)

for document in loader.lazy_load():
    print(document)
```

运行结果节选：

```text
page_content='name: 张伟
age: 28
gender: 男' metadata={'source': './data/stu.csv', 'row': 0}
page_content='name: 李娜
age: 24
gender: 女' metadata={'source': './data/stu.csv', 'row': 1}
......
```

CSVLoader 默认会把每一行转成一个 `Document`，列名和值会一起进入 `page_content`，`row` 记录该条来自第几行。

**JSONLoader**

`JSONLoader` 需要额外安装 `jq`：

```python
pip install jq
```

`jq_schema` 用来指定从 JSON 中抽取哪一部分内容。

```python
from langchain_community.document_loaders import JSONLoader

loader = JSONLoader(
    file_path="./data/stu.json",
    jq_schema=".name"
)

document = loader.load()
print(document)
```

运行结果：

```text
[Document(metadata={'source': '.../data/stu.json', 'seq_num': 1}, page_content='周杰轮')]
```

如果 JSON 顶层是数组，可以用 `.[].name`：

```python
loader = JSONLoader(
    file_path="./data/stus.json",
    jq_schema=".[].name",
    text_content=False
)

document = loader.load()
print(document)
```

运行结果节选：

```text
[Document(... page_content='周杰轮'), Document(... page_content='李华'), Document(... page_content='王强')]
```

如果是 JSON Lines，也就是每一行都是一个独立 JSON 对象，需要加 `json_lines=True`：

```python
loader = JSONLoader(
    file_path="./data/stu_json_lines.jsonl",
    jq_schema=".name",
    text_content=False,
    json_lines=True
)

document = loader.load()
print(document)
```

运行结果节选：

```text
[Document(... page_content='周杰轮'), Document(... page_content='李华'), Document(... page_content='王强')]
```

**TextLoader 与文本切分**

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("./data/text.txt", encoding="utf-8")
docs = loader.load()
print(docs)
print(len(docs))
```

运行结果节选：

```text
[Document(metadata={'source': './data/text.txt'}, page_content='“金庸作品集”新序\n　　小说是写给人看的......')]
1
```

遗留问题：如果一个文档很大，全部加载到一个 `Document` 是否不合适？

答案是：加载成一个 `Document` 本身不是最终问题，真正用于 RAG 前通常还要做 <font color='red'>**文本切分**</font>。大文档如果不切分，直接向量化会有几个问题：文本超过 embedding 模型长度限制；一个向量承载太多主题，检索粒度太粗；后续塞进 prompt 也容易超过上下文窗口。

所以常见流程是：先用 Loader 读成原始 Document，再用 Splitter 切成多个 <font color='red'>**chunk**</font>。

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", "。", "，", "！", "？", ".", ",", "!", "?", " ", ""],
    length_function=len
)

split_docs = splitter.split_documents(docs)
print(len(split_docs))
for doc in split_docs:
    print("=" * 20)
    print(doc)
```

运行结果节选：

```text
81
====================
page_content='“金庸作品集”新序
　　小说是写给人看的。小说的内容是人。......' metadata={'source': './data/text.txt'}
====================
page_content='小说是艺术的一种，艺术的基本内容是人的感情和生命......' metadata={'source': './data/text.txt'}
......
```

`RecursiveCharacterTextSplitter` 会按照 `separators` 的优先级递归切分，尽量优先按段落、换行、句号等自然边界切开。`chunk_overlap=50` 表示相邻 chunk 之间保留 50 个字符重叠，用来减少语义断裂。

**PyPDFLoader**

```python
pip install pypdf
```

```python
from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader(
    "./data/0_Preface.pdf",
    mode="page"
)

i = 0
for doc in loader.lazy_load():
    i += 1
    print(doc)
    print("=" * 20, i)
```

运行结果节选：

```text
page_content='Wireless Communications
Andrea J. Goldsmith
Second Edition' metadata={'source': './data/0_Preface.pdf', 'total_pages': 9, 'page': 0, 'page_label': '1'}
==================== 1
page_content='Contents
1 Overview of Wireless Communications 1
1.1 History of Wireless Communications ......'
==================== 2
```

`mode="page"` 表示每页生成一个 `Document`，metadata 中会包含页码信息，适合 RAG 追踪引用来源。`mode="single"` 会把整个 PDF 合成一个 Document，适合较短 PDF 或全文摘要。

### 3.21 Vector stores 向量存储

Vector store 用来保存文本 embedding，并支持相似度检索。RAG 中它承担的是“知识库检索”的角色。

**InMemoryVectorStore**

```python
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_community.document_loaders import CSVLoader

vector_store = InMemoryVectorStore(
    embedding=DashScopeEmbeddings()
)

loader = CSVLoader(
    file_path="./data/info.csv",
    encoding="utf-8",
    source_column="source"
)

documents = loader.load()

vector_store.add_documents(
    documents=documents,
    ids=["id" + str(i) for i in range(len(documents))]
)

vector_store.delete(["id1", "id2"])

result = vector_store.similarity_search(
    query="什么时候道路维修？",
    k=3
)
print(result)
```

运行结果节选：

```text
[Document(id='id6', metadata={'source': '政府通知', 'row': 6}, page_content='source: 政府通知
info: 社区将于本周末进行道路维修'),
 Document(id='id0', metadata={'source': '新闻网站', 'row': 0}, page_content='source: 新闻网站
info: 今日发布了一篇关于城市交通改善的报道'),
 ......]
```

`InMemoryVectorStore` 只存在于内存中，程序结束后数据会丢失，适合学习、测试和小 demo。

**Chroma 持久化向量库**

```python
pip install langchain_chroma
```

```python
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_community.document_loaders import CSVLoader
from langchain_chroma import Chroma

vector_store = Chroma(
    collection_name="test",
    embedding_function=DashScopeEmbeddings(),
    persist_directory="./data/Chroma"
)

loader = CSVLoader(
    file_path="./data/info.csv",
    encoding="utf-8",
    source_column="source"
)

documents = loader.load()

vector_store.add_documents(
    documents=documents,
    ids=["id" + str(i) for i in range(len(documents))]
)

vector_store.delete(["id1", "id2"])

result = vector_store.similarity_search(
    query="什么时候道路维修？",
    k=3
)
print(result)
```

运行结果节选：

```text
[Document(id='id6', metadata={'source': '政府通知', 'row': 6}, page_content='source: 政府通知
info: 社区将于本周末进行道路维修'),
 Document(id='id0', metadata={'source': '新闻网站', 'row': 0}, page_content='source: 新闻网站
info: 今日发布了一篇关于城市交通改善的报道'),
 Document(id='id9', metadata={'source': '行业报告', 'row': 9}, page_content='source: 行业报告
info: 报告指出新能源产业增长速度较快')]
```

Chroma 会把向量数据保存到 `persist_directory`，因此可以跨程序运行保留。它适合本地 RAG、小型知识库和原型系统。

还可以按 metadata 做过滤：

```python
result = vector_store.similarity_search(
    query="什么时候道路维修？",
    k=3,
    filter={"source": "政府通知"}
)
print(result)
```

运行结果：

```text
[Document(id='id6', metadata={'source': '政府通知', 'row': 6}, page_content='source: 政府通知
info: 社区将于本周末进行道路维修')]
```

这里要注意：<font color='red'>**向量检索**</font> 是语义相似度检索，不是精确关键词搜索。因此 top-k 中可能混入一些“语义上相关但不是答案”的内容。实际 RAG 中通常会结合 metadata filter、rerank、阈值过滤或更好的 chunk 设计来提升质量。

### 3.22 基于向量检索构建提示词

这一节开始把前面的组件串起来，形成最小 RAG 流程：

```text
用户问题 -> 向量检索 -> 得到参考资料 -> 填入 Prompt -> 调用 LLM -> 输出答案
```

先用手动方式完成检索和 prompt 拼接：

```python
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

model = ChatTongyi(model="qwen3-max")
prompt = ChatPromptTemplate.from_messages([
    ("system", "以我提供的已知参考资料为主，简洁和专业地回答用户问题。参考资料：{context}。"),
    ("user", "用户提问：{input}？")
])

vector_store = InMemoryVectorStore(
    embedding=DashScopeEmbeddings(model="text-embedding-v4")
)

vector_store.add_texts(["先理解概念，再动手练习", "多做小案例，逐步加难度", "养成调试习惯"])

input_text = "怎么练习编程？"

result = vector_store.similarity_search(input_text, k=2)
reference_text = "["
for doc in result:
    reference_text += doc.page_content
reference_text += "]"

def print_prompt(prompt):
    print(prompt.to_string())
    print("==" * 20)
    return prompt

chain = prompt | print_prompt | model | StrOutputParser()

chain.invoke({"input": input_text, "context": reference_text})
```

运行结果节选：

```text
System: 以我提供的已知参考资料为主，简洁和专业地回答用户问题。参考资料：[多做小案例，逐步加难度先理解概念，再动手练习]。
Human: 用户提问：怎么练习编程？？
========================================

按照参考资料的建议，练习编程可以遵循以下步骤：
1. 多做小案例......
4. 通过实际编写代码巩固所学，遇到问题及时调试和查阅资料。
```

这个版本的缺点是：检索步骤在 chain 外面手动完成了，`chain.invoke()` 需要同时传入 `input` 和 `context`。更理想的形式是只传入用户问题，让检索也自动进入链。

### 3.23 RunnablePassthrough 的使用

<font color='red'>**RunnablePassthrough**</font> 的作用是把输入原样传递给后续组件。它在 RAG 链里很常用，因为同一个用户问题往往要走两条路：

- 一路原样保留，作为 prompt 中的 `{input}`；
- 另一路送入 retriever，检索出文档后格式化为 `{context}`。

```python
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document

model = ChatTongyi(model="qwen3-max")
prompt = ChatPromptTemplate.from_messages([
    ("system", "以我提供的已知参考资料为主，简洁和专业地回答用户问题。参考资料：{context}。"),
    ("user", "用户提问：{input}？")
])

def print_prompt(prompt):
    print(prompt.to_string())
    print("==" * 20)
    return prompt

vector_store = InMemoryVectorStore(
    embedding=DashScopeEmbeddings(model="text-embedding-v4")
)

vector_store.add_texts(["先理解概念，再动手练习", "多做小案例，逐步加难度", "养成调试习惯"])

input_text = "怎么练习编程？"

retriever = vector_store.as_retriever(search_kwargs={"k": 2})

def format_func(docs: list[Document]):
    if not docs:
        return "没有相关资料"

    formatted_str = "["
    for doc in docs:
        formatted_str += doc.page_content
    formatted_str += "]"
    return formatted_str

chain = (
    {
        "input": RunnablePassthrough(),
        "context": retriever | format_func,
    }
    | prompt
    | print_prompt
    | model
    | StrOutputParser()
)

res = chain.invoke(input_text)
print(res)
```

运行结果节选：

```text
System: 以我提供的已知参考资料为主，简洁和专业地回答用户问题。参考资料：[多做小案例，逐步加难度先理解概念，再动手练习]。
Human: 用户提问：怎么练习编程？？
========================================
按照参考资料的建议，练习编程可以遵循以下步骤：
1. 先理解概念......
4. 边学边练：理论结合实践，每学一个新知识点就立即写代码验证。
```

关键在这一行：

```python
{"input": RunnablePassthrough(), "context": retriever | format_func}
```

它表示把同一个输入 `input_text` 分发到两个分支：

```text
input_text
├── RunnablePassthrough() -> 原样输出 -> 填入 {input}
└── retriever -> List[Document] -> format_func -> 字符串 -> 填入 {context}
```

所以整个链的输入输出类型是：

```text
str
-> {"input": str, "context": str}
-> ChatPromptValue
-> AIMessage
-> str
```

这就解决了上一节的遗留问题：不需要在链外手动检索，也不需要手动构造 `{"input": ..., "context": ...}`。只要调用 `chain.invoke("怎么练习编程？")`，链内部会自动完成检索、上下文格式化、prompt 构造和模型回答。

至此，一个最小 RAG 链就完整了：

```text
问题 -> retriever -> context
问题 -> passthrough -> input
context + input -> prompt -> model -> parser -> answer
```
