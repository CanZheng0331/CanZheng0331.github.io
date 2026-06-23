# Trustworthy Generative AI 学习笔记

<style>
  .note-toolbar {
    margin: 12px 0 20px 0;
  }
  .note-toolbar button {
    margin-right: 8px;
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--card);
    color: var(--fg);
    cursor: pointer;
    font-weight: 700;
  }
  .note-toolbar button:hover,
  .note-toolbar button.active {
    border-color: var(--accent);
    background: var(--accent);
    color: #fff;
  }
  .emph {
    color: #c62828;
    font-weight: 700;
  }
  .example {
    border-left: 4px solid var(--accent);
    background: color-mix(in srgb, var(--accent) 8%, var(--card));
    color: var(--fg);
    padding: 10px 12px;
    margin: 10px 0;
    border-radius: 6px;
  }
</style>

<div class="note-toolbar">
  <button type="button" class="active" data-note-lang="zh">中文</button>
  <button type="button" data-note-lang="en">English</button>
</div>


<div class="zh">

## 个人评价

完整刷完这门课主要是为了构建我的 skill，便于后续学习其他 coursera 课程时可以根据字幕内容自动整理课程内容记录为笔记。内容上，感觉落后了很多，也许是很久之前的课程了吧？感觉也不是我想学的 Trustworthy AI。

## 课程信息

- 课程名称：可信生成式 AI
- 英文名称：Trustworthy Generative AI
- 授课者/人物：Jules White
- 单位：Vanderbilt University
- 网站：https://www.coursera.org/learn/trustworthy-generative-ai

## 课程概览

本课程讨论如何以可信的方式使用生成式 AI。核心不是“能不能让模型回答”，而是判断什么问题适合让模型参与、什么答案能被检查、什么场景必须保留人的判断。

核心判断是：<span class="emph">可信使用不是让 AI 替代人，而是让 AI 帮助人更好地思考、检查、协调和创造。</span>

## 模块一：适合用生成式 AI 解决的问题类型

### 1. 引言

生成式 AI 可以生成文本、展示推理、产生创意，也可能生成看似真实但未经验证的内容。幻觉在创意任务中可能是能力来源，在事实任务中则可能成为风险。

<div class="example">
<strong>例子：woodchuck 绕口令</strong><br>
模型能识别绕口令并进行一定推理，但在关于 woodchuck 的事实和引用上，用户如果没有专业知识就难以判断真伪。
</div>

要点：
- <span class="emph">输出流畅不等于输出可信。</span>
- 提示词会影响模型把任务理解为事实说明还是创意生成。
- 使用前要先判断任务类型，以及答案是否容易检查。

### 2. 生成式 AI 不是事实来源

生成式 AI 不应该被当作搜索引擎或事实数据库。它可以处理文本、总结资料、帮助导航到事实，但不适合凭训练记忆直接生成事实。

<div class="example">
<strong>例子：介绍 Jules White</strong><br>
模型生成了听起来合理但实际错误的人物信息。这个例子说明：生成的是文本，不一定是事实。
</div>

要点：
- <span class="emph">生成事实</span> 和 <span class="emph">导航到事实</span> 是两回事。
- 更可靠的做法是给模型真实资料，让它基于资料总结。
- 如果关心事实和来源，不应让模型自由生成答案。

### 3. 确保答案容易检查

如果正确性很重要，就要选择那些答案容易验证的任务。生成答案可以便宜，但检查答案也必须便宜，否则使用模型未必划算。

<div class="example">
<strong>例子：Wordle</strong><br>
模型给出 “beset” 作为答案，但它包含被禁止的字母 S，因此很快就能判错。这个例子说明：即使模型答错，只要检查成本很低，尝试仍然有价值。
</div>

要点：
- 正确性重要时，必须能快速检查答案。
- 适合的任务像 Wordle 或填字游戏，规则清楚、验证简单。
- 如果检查答案很困难，就要谨慎使用。

### 4. 避免难以检查的答案

如果你不具备判断答案真伪的能力，并且验证成本接近重新找专家解决问题的成本，这通常是不合适的用法。

<div class="example">
<strong>例子：巴比伦楔形文字</strong><br>
让模型把 “computer science” 翻译成巴比伦楔形文字。因为使用者不是专家，几乎无法判断输出是否正确，最后可能还是要找真正的专家。
</div>

要点：
- <span class="emph">检查成本高于或接近求解成本时，不适合依赖生成式 AI。</span>
- 不懂领域时，模型输出越像真的，越需要警惕。
- 需要高正确性的任务，应优先找可靠来源或专家。

### 5. 寻找“部分答案也有价值”的问题

有些任务不要求答案完美，模型的价值在于帮助人启动思考、产生选项、形成初稿或拓展视野。这类任务很适合生成式 AI。

<div class="example">
<strong>例子：workshop 注册与 Zoom 链接分发</strong><br>
模型列出 Eventbrite、Google Forms、Mailchimp、JotForm 等方案，并按成本、工作量和自动化程度排序。即使排序不完美，也能帮助人开始比较和提问。
</div>

要点：
- 当目标是启发思考时，答案不必完美。
- 模型适合用来生成备选方案、初稿、流程图和探索路径。
- 输出应作为起点，而不是终点。

### 6. 思考风险

是否适合使用生成式 AI，还取决于错误会造成多大伤害。如果错误可能影响生命、健康、声誉或重大决策，就不能让模型直接替人做判断。

<div class="example">
<strong>例子：Tylenol 是否安全</strong><br>
直接问模型“我能不能吃 Tylenol”风险很高，因为模型不了解个人病史和用药情况。更合适的问法是：我应该向医生询问哪些问题？
</div>

要点：
- <span class="emph">高风险决策不应交给模型直接判断。</span>
- 可以把任务改写成帮助用户准备沟通、列问题、启动对话。
- 合适的用法应保留人在环路中，并降低下游伤害。

### 7. 这种用法是否让人受益

合适与否还取决于它是否真正帮助使用者成长。把模型答案直接复制到测验里，会损害学习，也可能构成作弊；把模型作为解释、类比和练习的起点，则可以帮助学习。

<div class="example">
<strong>例子：transformer 与 attention</strong><br>
直接复制模型答案交作业是不合适的；但让模型用简单步骤解释 attention，或用金融领域类比解释 transformer，可以帮助学习者建立理解。
</div>

要点：
- <span class="emph">把输出当草稿，而不是最终答案。</span>
- 重要的是学习、追问、核查、修改和改进。
- 如果只是复制粘贴，人就容易被流程自动化替代。

### 8. ACHIEVE 框架

课程最后提出 ACHIEVE 框架，强调生成式 AI 应被看作增强人的工具，而不是替代人的工具。它的目标是创造一种“思维外骨骼”：放大人的创造力、生产力和问题解决能力，同时让人始终留在判断、指导和改进的过程中。

ACHIEVE 可以概括为：
- <strong>Aid coordination</strong>：帮助人类协调，例如总结会议、发现计划中的模糊点。
- <strong>Cut tedious tasks</strong>：减少繁琐工作，例如整理调查回答、分组和重组信息。
- <strong>Help provide a safety net</strong>：帮助发现错误，例如检查演示文稿中未定义的术语，或发现两个团队计划中的冲突。
- <strong>Inspire better problem solving and creativity</strong>：激发更好的问题解决和创造力，例如让模型扮演怀疑者，提出困难问题。
- <strong>Enable great ideas to scale faster</strong>：让好想法更快扩展，例如为不同部门生成个性化提示词。

<div class="example">
<strong>例子：faculty workshop</strong><br>
课程用 workshop 组织过程串联 ACHIEVE：会议纪要、计划歧义、调查分组、术语检查、团队冲突、儿童活动设计、个性化邮件，都展示了 AI 如何增强人的工作。
</div>

要点：
- <span class="emph">生成式 AI 最好的定位是 augmented intelligence，而不是 artificial replacement。</span>
- 人必须参与判断、修改和创造。
- 工具的价值在于让人能做更大、更复杂、更有创造性的事。

## 模块二：面向可信使用的提示工程与问题表述

### 1. 过滤

过滤是很适合生成式 AI 的操作，但前提是：用户本来就应该访问这些信息。模型不应该决定用户能不能看某些敏感信息，它应该在已允许的信息范围内，帮助人更快找到相关内容。

<div class="example">
<strong>例子：筛选健康相关论文</strong><br>
如果把一组已有论文引用提供给模型，再问“哪些可能与 health care 有关”，模型可以从给定列表里筛出相关条目。这里不是让模型凭空生成引用，而是让它过滤已有材料。
</div>

要点：
- <span class="emph">过滤的安全性来自可追溯性。</span>
- 给原始材料加编号、行号、页码或 ID，可以让结果容易核查。
- 总结和解释也可以使用，但最好要求模型给出原文行号、引用或 ID。
- 参考资料中的常用模式包括 simple filter、semantic filter、summarize and cite。

### 2. 构思

构思是生成式 AI 的强项，因为目标不是得到完美答案，而是激发人的想法。模型可以快速给出许多方向，人再选择、丢弃、修改或继续追问。

<div class="example">
<strong>例子：腌香蕉、课程项目与育儿图表</strong><br>
课程展示了几个低风险构思任务：生成腌香蕉点子、为生成式 AI 软件工程课设计项目、用 Mermaid 图画育儿中的搞笑场景。有些想法不一定好，但能触发人的反应和新思路。
</div>

要点：
- 构思的目标是启发人，而不是替人完成最终作品。
- 生成大量想法很便宜，不合适的可以直接丢掉。
- 人要对输出有反应、有筛选、有改写，才是真正的 ideation。

### 3. 导航

导航是处理敏感信息时更安全的思路。不要让模型直接生成敏感答案，而是让它把用户带到已有系统中存放答案的位置。

<div class="example">
<strong>例子：医疗 App 中查找预约或化验结果</strong><br>
用户问“我的下次预约是什么时候”，更安全的做法不是让模型生成预约时间，而是告诉用户去 Appointment Scheduler 等页面查看。即使导航错了，通常也只是去了错误页面，而不是生成了错误医疗信息。
</div>

要点：
- <span class="emph">导航比直接生成敏感信息更安全。</span>
- 模型可以把自然语言问题翻译成系统中的位置。
- 参考资料中的常用模式包括 direct navigation 和 navigate instead。
- 仍然要注意访问控制：模型不应把用户带到他们不该访问的信息。

### 4. 专业能力

人的专业能力决定了许多用法是否安全。模型输出应被看成草稿；如果你有能力发现错误、修正错误、继续查证，它就可以成为很强的加速器。反过来，如果你无法判断输出是否正确，风险就会上升。

<div class="example">
<strong>例子：写 prompt patterns 段落、研究钢和铝、比较软件架构与陶艺</strong><br>
当教师提供自己的要点，让模型写 prompt patterns 段落时，他有能力判断表达是否准确。研究钢和铝时，模型更像是给出研究路线。比较软件架构和陶艺时，教师因为懂两个领域，所以能判断类比是否合理。
</div>

要点：
- <span class="emph">专业能力越强，越能把模型输出当作高效草稿。</span>
- 不懂领域时，不要把模型输出当最终答案。
- 让模型生成会执行的代码尤其要谨慎，例如删除 Downloads 文件夹中“未使用目录”的 Python 程序。
- 一个实用标准是：如果同样的草稿来自初级同事，你是否有能力审阅、修正并负责？

</div>

<div class="en" style="display: none;">

# Trustworthy Generative AI Learning Notes

## Course Information

- Course title: Trustworthy Generative AI
- Instructor/person: Jules White
- Institution: Vanderbilt University
- Website: https://www.coursera.org/learn/trustworthy-generative-ai

## Course Overview

This course is about using generative AI in a trustworthy way. The point is not simply whether a model can answer a question. The real issue is whether the problem is appropriate, whether the answer can be checked, and whether humans remain responsible for judgment.

Core idea: <span class="emph">trustworthy use means using AI to help humans think, check, coordinate, and create, not to replace humans.</span>

## Module 1: The Right Types of Problems to Solve with Generative AI

### 1. Introduction

Generative AI can generate text, show reasoning, and produce creative ideas. It can also produce content that looks factual but has not been verified. Hallucination can be useful in creative work and risky in factual work.

<div class="example">
<strong>Example: the woodchuck tongue twister</strong><br>
The model recognizes the tongue twister and performs some reasoning, but the user may not be able to verify its factual claims about woodchucks or its generated references.
</div>

Takeaways:
- <span class="emph">Fluent output is not the same as trustworthy output.</span>
- Prompt wording can shift the task between factual explanation and creative generation.
- Before using the model, decide what kind of task it is and whether the answer can be checked.

### 2. Generative AI Is Not a Source of Facts

Generative AI should not be treated like a search engine or a factual database. It can process text, summarize evidence, and help navigate to facts, but it should not be relied on to generate facts from memory.

<div class="example">
<strong>Example: describing Jules White</strong><br>
The model produces plausible but false biographical claims. The example shows that generated text is not necessarily factual.
</div>

Takeaways:
- <span class="emph">Generating facts</span> and <span class="emph">navigating to facts</span> are different.
- A safer pattern is to give the model real source material and ask it to summarize from that material.
- If facts and sources matter, do not ask the model to freely generate the answer.

### 3. Make Sure Checking If the Answer Is Correct Is Easy

If correctness matters, choose tasks where the answer is easy to verify. It may be cheap to generate an answer, but checking it also needs to be cheap.

<div class="example">
<strong>Example: Wordle</strong><br>
The model proposes “beset,” but the answer contains the prohibited letter S. The mistake is easy to catch, so trying the model does not cost much.
</div>

Takeaways:
- When correctness matters, verification must be quick.
- Good tasks have clear rules and simple consistency checks.
- If checking is hard, use generative AI cautiously.

### 4. Avoid Hard-to-Check Answers

If you cannot judge whether the answer is correct, and checking it would cost almost as much as solving the problem properly, the use case is probably inappropriate.

<div class="example">
<strong>Example: Babylonian cuneiform</strong><br>
The model translates “computer science” into Babylonian cuneiform, but the user cannot evaluate the result without an expert. At that point, going to the expert first would make more sense.
</div>

Takeaways:
- <span class="emph">If verification costs as much as solving the problem, do not rely on generated output.</span>
- In unfamiliar expert domains, plausible-looking answers are especially risky.
- High-correctness tasks should use reliable sources or real experts.

### 5. Look for Problems Where Partial Answers Provide Value

Some tasks do not require perfect answers. The model is useful when it helps people start thinking, generate options, create a first draft, or explore possible paths.

<div class="example">
<strong>Example: workshop registration and Zoom links</strong><br>
The model suggests tools such as Eventbrite, Google Forms, Mailchimp, and JotForm, then helps sort them by cost, effort, and automation. Even imperfect suggestions can help the human start comparing options.
</div>

Takeaways:
- If the goal is inspiration, the answer does not need to be perfect.
- The model is good for options, drafts, workflows, and exploration.
- Treat the output as a starting point, not the final answer.

### 6. Think About Risk

Appropriate use depends on the possible harm of being wrong. If a wrong answer could harm life, health, reputation, or important decisions, the model should not directly make the decision.

<div class="example">
<strong>Example: Tylenol safety</strong><br>
Asking “Is it safe for me to take Tylenol?” is risky because the model lacks personal medical context. A better use is asking what questions to bring to a healthcare provider.
</div>

Takeaways:
- <span class="emph">High-risk decisions should not be delegated directly to the model.</span>
- Reframe the task as preparing questions or supporting communication.
- Keep humans in the loop and reduce downstream harm.

### 7. Does the Use Benefit You as a Human?

Appropriateness also depends on whether the use helps the user grow. Copying an answer into a quiz harms learning and may be cheating; using the model as an explanation and analogy tool can support learning.

<div class="example">
<strong>Example: transformers and attention</strong><br>
Copying a model answer into a quiz is inappropriate. Asking for step-by-step explanations or financial-domain analogies can help the learner build understanding.
</div>

Takeaways:
- <span class="emph">Treat the output as draft, not as the final answer.</span>
- The user should learn, question, verify, revise, and improve.
- If all a person does is copy and paste, that step can be automated away.

### 8. ACHIEVE

The course ends with the ACHIEVE framework. It presents generative AI as augmented intelligence rather than human replacement: an “exoskeleton for the mind” that amplifies human creativity, productivity, coordination, and problem solving while keeping people in the loop.

ACHIEVE can be summarized as:
- <strong>Aid coordination</strong>: summarize meetings and identify ambiguities.
- <strong>Cut tedious tasks</strong>: group survey responses and reorganize data.
- <strong>Help provide a safety net</strong>: catch undefined terms or conflicting team decisions.
- <strong>Inspire better problem solving and creativity</strong>: ask skeptical questions and generate fresh approaches.
- <strong>Enable great ideas to scale faster</strong>: personalize ideas, prompts, or follow-ups across many people.

<div class="example">
<strong>Example: faculty workshop</strong><br>
The workshop planning example shows ACHIEVE in action: meeting notes, ambiguities, survey grouping, terminology checks, team conflicts, childcare activities, and personalized emails.
</div>

Takeaways:
- <span class="emph">The best role for generative AI is augmented intelligence, not artificial replacement.</span>
- Humans still need to judge, edit, and create.
- The value is helping people do larger, more complex, more creative work.

## Module 2: Prompt Engineering and Problem Formulation for Trust

### 1. Filter

Filtering is an appropriate use of generative AI when the user already has access to the information. The model should not decide what information a person is allowed to see. It should help people reason over information they are allowed to use.

<div class="example">
<strong>Example: filtering healthcare-related papers</strong><br>
If the model receives a list of existing paper citations and is asked which ones might relate to health care, it can filter the given list. It is not inventing citations. It is selecting from source material.
</div>

Takeaways:
- <span class="emph">Filtering is safer when outputs are traceable.</span>
- IDs, line numbers, page numbers, and quotations make results easier to verify.
- Summaries and explanations can work too, especially when the model cites source lines or IDs.
- Useful prompt patterns include simple filter, semantic filter, and summarize and cite.

### 2. Ideation

Ideation is one of the strongest uses of generative AI because the goal is not a perfect final answer. The goal is to spark human thinking. The model can produce many directions quickly, and the human can keep, reject, revise, or extend them.

<div class="example">
<strong>Example: pickled bananas, class projects, and parenting diagrams</strong><br>
The course uses low-risk ideation tasks: generating ideas for pickling bananas, proposing projects for a generative AI software engineering class, and creating Mermaid diagrams about parenting. Some ideas may be weak, but they can still trigger a useful reaction.
</div>

Takeaways:
- Ideation should inspire the human, not replace the human.
- Generating many ideas is cheap. Bad ideas can be discarded.
- The human should react to the output, filter it, and build on it.

### 3. Navigation

Navigation is a safer way to use AI with sensitive information. Instead of generating sensitive answers, the model helps the user find where the answer already exists in a trusted system.

<div class="example">
<strong>Example: finding appointments or lab results in a healthcare app</strong><br>
If a user asks for their next appointment, a safer response is to direct them to the Appointment Scheduler screen instead of generating the appointment time. If navigation is wrong, the user usually just lands on the wrong screen rather than receiving false medical information.
</div>

Takeaways:
- <span class="emph">Navigation is safer than directly generating sensitive information.</span>
- The model can translate natural language questions into locations in a system.
- Useful prompt patterns include direct navigation and navigate instead.
- Access control still matters. The model should not navigate users to information they should not see.

### 4. Expertise

Human expertise changes what is safe and useful. Model output should be treated as a draft. If the user can spot errors, fix them, and investigate further, the model can be a strong accelerator. If the user cannot judge the output, the risk increases.

<div class="example">
<strong>Example: prompt patterns, steel versus aluminum, and software architecture versus pottery</strong><br>
When the instructor gives bullet points and asks the model to write about prompt patterns, he can judge whether it expresses his ideas correctly. When he asks about steel versus aluminum, the model gives a research starting point. When he compares software architecture with pottery, he can evaluate the analogy because he knows both areas.
</div>

Takeaways:
- <span class="emph">The more expertise you have, the more safely you can use model output as a draft.</span>
- If you do not understand the domain, do not treat the output as final.
- Generated executable code is especially risky if you cannot read and evaluate it.
- A practical test: if the same draft came from a junior colleague, could you review, fix, and take responsibility for it?

</div>

