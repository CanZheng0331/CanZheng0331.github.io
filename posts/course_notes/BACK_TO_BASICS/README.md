以后只需要改这个文件：

```text
posts/course_notes/back_to_basics/courses.json
```

### 新增科目

复制一门现有课程，把内容改成新的。例如：

```json
{
  "id": "linear-algebra",
  "title": "Linear Algebra",
  "tier": "Foundational Science",
  "state": "v1.0",
  "prerequisites": [],
  "insights": "A foundation for signal processing, communications, and machine learning.",
  "notes": [
    {
      "title": "Lecture Notes",
      "description": "My notes for this course.",
      "format": "PDF",
      "url": "notes/linear-algebra.pdf"
    }
  ],
  "recommendations": [
    {
      "title": "MIT 18.06 Linear Algebra",
      "provider": "MIT OpenCourseWare",
      "description": "A complete introductory linear algebra course.",
      "links": [
        {
          "label": "Course homepage",
          "url": "https://example.com"
        }
      ]
    }
  ]
}
```

把它放进 `courses` 数组里。注意上一门课程对象末尾需要有逗号：

```json
{
  "id": "calculus"
},
{
  "id": "linear-algebra"
}
```

`id` 必须唯一，建议只用小写英文和短横线：

```text
linear-algebra
information-theory
wireless-communications
```

### 设置先修课程

填写先修课程的 `id`：

```json
"prerequisites": [
  "calculus",
  "linear-algebra"
]
```

这样网页会自动从 Calculus 和 Linear Algebra 各画一条线到这门课。

没有先修课程就写：

```json
"prerequisites": []
```

### 修改科目

找到对应课程对象，直接修改字段。例如修改进度：

```json
"state": "v1.1"
```

可用状态：
```text
empty  枯叶
v1.0   绿叶
v1.1   开花
v1.2   结果
```

修改课程名称：

```json
"title": "Digital Communications"
```

修改心得：

```json
"insights": "Your new description here."
```

### 删除科目

直接删除该课程完整的 `{ ... }` 对象。

例如删除：

```json
{
  "id": "calculus",
  ...
}
```

删除后，还需要搜索其他课程的：

```json
"prerequisites": [
  "calculus"
]
```

把已经删除的 `calculus` 一并移除，否则会出现先修课程不存在的问题。

### 修改课程层级

修改 `tier`：

```json
"tier": "Graduate Major Courses"
```

目前使用这四种：

```text
Foundational Science
Undergraduate Major Courses
Graduate Major Courses
Advanced Topics
```

### 添加笔记链接

在 `notes` 中加入：

```json
{
  "title": "Lecture Notes",
  "description": "Complete notes for this course.",
  "format": "PDF",
  "url": "notes/my-notes.pdf"
}
```

然后把文件放到：

```text
posts/course_notes/back_to_basics/notes/my-notes.pdf
```

外部链接也可以：

```json
"url": "https://example.com/my-notes"
```

### 添加推荐课程

```json
{
  "title": "Course Name",
  "provider": "MIT OpenCourseWare",
  "description": "A short course introduction.",
  "links": [
    {
      "label": "Course homepage",
      "url": "https://example.com"
    },
    {
      "label": "Lecture videos",
      "url": "https://example.com/videos"
    }
  ]
}
```

最稳妥的方法是：**复制一门现有课程对象，再修改内容**，不要从零手写整个结构。修改完后检查逗号、双引号和括号是否完整。
