# Hello, World

This is a demo post written in **Markdown** with inline LaTeX like $\alpha^2 + \beta^2 = \gamma^2$ and display math:

$$
\mathbf{y} = \mathbf{H}\mathbf{x} + \mathbf{n}, \quad \text{SNR} = 10\log_{10}\frac{\|\mathbf{H}\mathbf{x}\|^2}{\|\mathbf{n}\|^2}.
$$

- Markdown features: lists, *emphasis*, code, links.
- LaTeX via MathJax works out of the box on GitHub Pages.

```python
import numpy as np
H = np.eye(4)
x = np.ones(4)
y = H @ x
print(y)
```

> Tip: Add new posts by creating a `.md` file in `/posts` and updating `/posts/posts.json`.