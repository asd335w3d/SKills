---
name: generate-unit-tests
description: 读取指定源代码文件，分析其中的函数和类，自动生成覆盖正常路径、边界条件和异常情况的单元测试代码，适用于新功能开发完成后需要快速补全测试覆盖率的场景。
license: MIT
version: "1.0.0"
tags:
  - 测试
  - 代码生成
  - 质量
---

## 说明

本技能分析指定源代码文件中的函数签名、参数类型、返回值和内部逻辑，为每个公开函数自动生成对应的单元测试代码，覆盖正常输入、边界值、空值/null 和异常触发等场景，并输出可直接运行的测试文件。

**适用场景**：

- 场景一：新功能开发完成后，需要快速为新增函数补充测试用例，确保代码逻辑正确性
- 场景二：接手遗留代码时，原有函数缺少测试覆盖，需要补充基础测试以支撑后续重构
- 场景三：TDD 实践中，已有函数实现，需要生成初始测试框架后再手动调整用例细节

**前提条件**：

- 需要提供具体的源代码文件路径
- 项目中已存在测试框架配置（如 `jest.config.js`、`pytest.ini`、`go.mod`），生成的测试代码将匹配已有框架
- 若项目无测试框架，生成的代码默认使用该语言最主流的测试框架（JS/TS → Jest，Python → pytest，Go → testing 标准库）

**不适用场景**：

- 不适用于私有方法（生成的测试仅针对公开导出的函数和方法）
- 不适用于依赖复杂外部状态（如数据库连接、文件系统）的函数，此类函数需手动添加 mock 逻辑
- 不保证测试通过，生成后需人工验证预期结果的正确性

---

## 流程

1. **读取源文件**：读取用户指定的源代码文件（如 `src/utils/calculator.ts`）的完整内容。若文件不存在，停止并提示用户确认路径。

2. **检测测试框架**：检查以下文件确认项目使用的测试框架：
   - JavaScript/TypeScript：查找 `jest.config.*`、`vitest.config.*`、`package.json` 中的 `devDependencies`
   - Python：查找 `pytest.ini`、`pyproject.toml`、`setup.cfg`
   - Go：查找 `go.mod`（使用标准库 `testing`）
   
   若未检测到配置，使用该语言默认框架并在输出中注明。

3. **解析函数列表**：扫描源文件，提取所有公开函数/方法，记录：
   - 函数名
   - 参数名称和类型
   - 返回值类型
   - 函数体中的条件分支（if/else/switch）和可能抛出的错误

4. **为每个函数生成测试用例**：按以下策略生成测试分组：

   - **正常路径**：使用合法的典型输入，验证返回值符合预期
   - **边界条件**：数字类型测试 0、负数、最大值；字符串测试空字符串、超长字符串；数组测试空数组、单元素数组
   - **异常/错误路径**：传入 `null`/`undefined`/错误类型，验证是否抛出预期异常或返回错误码
   - **条件分支**：针对函数中每个 if/else 分支，生成使分支分别触发的测试用例

5. **确定输出文件路径**：遵循项目现有测试文件命名约定：
   - Jest/Vitest：`<源文件所在目录>/__tests__/<文件名>.test.ts` 或 `<文件名>.spec.ts`
   - pytest：`tests/test_<文件名>.py`
   - Go：`<源文件所在目录>/<文件名>_test.go`
   
   若目录下已有对应测试文件，提示用户确认是否覆盖；若用户选择不覆盖，将新用例追加到现有文件末尾。

6. **写入测试文件**：创建（或更新）测试文件，格式示例（TypeScript + Jest）：

   ```typescript
   import { <函数名> } from '../<源文件名>';

   describe('<函数名>', () => {
     describe('正常路径', () => {
       it('应当在输入<典型值>时返回<预期结果>', () => {
         expect(<函数名>(<输入>)).toBe(<预期结果>);
       });
     });

     describe('边界条件', () => {
       it('应当处理空输入', () => {
         expect(<函数名>('')).toBe(<预期结果>);
       });
     });

     describe('异常路径', () => {
       it('应当在输入 null 时抛出 TypeError', () => {
         expect(() => <函数名>(null)).toThrow(TypeError);
       });
     });
   });
   ```

7. **输出摘要**：生成完毕后告知用户：
   - 测试文件路径
   - 生成的测试用例总数
   - 建议人工补充的用例（如：涉及随机数、时间戳、外部 API 调用的场景）

---

## 示例

### 示例一：为 TypeScript 工具函数生成 Jest 测试

**触发提示词**：

```
请为 src/utils/stringHelper.ts 生成单元测试
```

**执行前状态**：`src/utils/stringHelper.ts` 包含 `truncate(str: string, maxLen: number): string` 等 3 个函数，项目中有 `jest.config.js`。

**预期输出**：

创建文件 `src/utils/__tests__/stringHelper.test.ts`，内容如下：

```typescript
import { truncate, capitalize, slugify } from '../stringHelper';

describe('truncate', () => {
  describe('正常路径', () => {
    it('字符串长度超过 maxLen 时应截断并追加省略号', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
    });
    it('字符串长度未超过 maxLen 时应原样返回', () => {
      expect(truncate('Hi', 5)).toBe('Hi');
    });
  });

  describe('边界条件', () => {
    it('maxLen 为 0 时应返回省略号', () => {
      expect(truncate('Hello', 0)).toBe('...');
    });
    it('空字符串输入应返回空字符串', () => {
      expect(truncate('', 10)).toBe('');
    });
  });

  describe('异常路径', () => {
    it('str 为 null 时应抛出 TypeError', () => {
      expect(() => truncate(null as any, 5)).toThrow(TypeError);
    });
  });
});
// ... capitalize 和 slugify 的测试用例
```

**摘要**：已生成 12 个测试用例，覆盖 3 个函数。建议手动补充：日文/emoji 字符的边界测试。

### 示例二：为 Python 函数生成 pytest 测试

**触发提示词**：

```
请为 app/services/calculator.py 生成单元测试
```

**预期输出**：

创建文件 `tests/test_calculator.py`，包含对 `add`、`divide` 等函数的完整测试，其中 `divide` 包含除零异常测试：

```python
import pytest
from app.services.calculator import add, divide

class TestAdd:
    def test_两正数相加(self):
        assert add(2, 3) == 5

    def test_负数相加(self):
        assert add(-1, -2) == -3

    def test_零值(self):
        assert add(0, 5) == 5

class TestDivide:
    def test_正常除法(self):
        assert divide(10, 2) == 5.0

    def test_除以零应抛出异常(self):
        with pytest.raises(ZeroDivisionError):
            divide(10, 0)
```

---

## 注意事项

- 生成的测试中，预期值（如 `toBe(...)` 的参数）基于对函数逻辑的静态推断，**必须人工验证是否符合业务预期**，不可直接提交而不检查
- 若函数依赖外部服务（数据库、HTTP 请求），生成的测试会包含 `// TODO: 此处需要添加 mock` 注释，需要手动完善
- 可配合 `code-review` 技能使用：先用 `code-review` 发现边界条件遗漏，再用本技能生成对应测试
- Go 语言生成的测试文件与源文件在同一目录，请确认 Go module 路径正确
