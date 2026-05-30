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
