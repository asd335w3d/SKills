---
name: refactor-code
description: 分析指定代码文件中的坏味道（Bad Smells），识别过长函数、重复代码、过深嵌套、魔法数字等问题，给出具体的重构方案和重构后的完整代码，适用于在不改变外部行为的前提下改善代码结构和可维护性的场景。
license: MIT
version: "1.0.0"
tags:
  - 重构
  - 代码质量
  - 可维护性
---

## 说明

本技能对指定代码文件进行坏味道分析，识别 Martin Fowler《重构》一书中定义的常见问题，针对每处问题给出对应的重构手法名称（如「提取函数」「引入参数对象」）、重构理由，以及重构后的完整代码实现，确保重构前后外部行为不变。

**适用场景**：

- 场景一：函数体过长（超过 50 行），逻辑层次混乱，难以理解和维护，需要拆分为职责单一的小函数
- 场景二：多处代码存在相似逻辑（复制粘贴代码），需要提取公共函数消除重复
- 场景三：函数参数过多（超过 4 个），调用时难以记忆参数顺序，需要引入参数对象或构建者模式
- 场景四：接手旧代码，需要在不改变功能的前提下提升代码可读性，以支撑后续功能迭代

**前提条件**：

- 需要提供具体的文件路径或代码片段
- 重构后的代码将保持原有语言和框架不变，不会引入新的依赖库

**不适用场景**：

- 不适用于需要修改外部接口或数据库 schema 的架构级重构（如拆分微服务、修改 API 接口）
- 不会自动修改文件，所有重构方案需用户确认后手动应用或告知应用

---

## 流程

1. **读取代码**：读取用户指定的文件路径（如 `src/services/orderService.ts`）的完整内容。若用户提供代码片段，直接使用该片段进行分析。

2. **扫描坏味道**：逐一检查以下常见代码坏味道，记录出现的位置（行号或函数名）和严重程度：

   | 坏味道 | 判断标准 | 对应重构手法 |
   |--------|---------|-------------|
   | 过长函数 | 函数体超过 40 行 | 提取函数（Extract Function） |
   | 重复代码 | 同一逻辑出现 2 次以上 | 提取函数 / 提取超类 |
   | 过长参数列表 | 函数参数超过 4 个 | 引入参数对象（Introduce Parameter Object） |
   | 过深嵌套 | if/for 嵌套超过 3 层 | 提前返回（Early Return）/ 提取函数 |
   | 魔法数字/字符串 | 直接使用字面量而非具名常量 | 以符号常量替换字面量（Replace Magic Number） |
   | 注释过多 | 大段注释用于解释逻辑（应由代码自说明） | 提取函数并用函数名替代注释 |
   | 数据泥团 | 多个变量总是一起出现 | 引入参数对象 / 提炼类（Extract Class） |
   | 条件复杂度过高 | 单个 if 条件包含 3 个以上 `&&`/`||` | 提炼条件（Decompose Conditional） |
   | 过大的类 | 类的方法超过 15 个或属性超过 10 个 | 提炼类 / 提炼子类 |

3. **优先级排序**：按以下优先级对发现的坏味道排序：
   - P1（立即重构）：影响正确性或性能的坏味道
   - P2（建议重构）：影响可读性和可维护性
   - P3（可选优化）：风格类改进

4. **生成重构方案**：为每处坏味道提供：
   - 问题描述和影响
   - 重构手法名称
   - 重构后的完整代码（不是局部片段，而是可以直接替换的完整函数/类）
   - 重构前后的行为等价说明（说明哪些测试用例可以验证行为未变）

5. **输出重构报告**：按以下格式输出：

   ```markdown
   ## 重构分析报告：`<文件路径>`

   ### 发现的坏味道（共 N 处）

   ---

   #### P1 · 过长函数：`processOrder()`（第 23～89 行，67 行）
   **问题**：函数包含订单验证、库存检查、价格计算、发送通知 4 个独立职责，难以单独测试和复用。
   **重构手法**：提取函数（Extract Function）× 4

   **重构后代码**：
   ```typescript
   // 原 processOrder 拆分为以下 5 个函数：
   function processOrder(order: Order): OrderResult {
     validateOrder(order);
     checkInventory(order.items);
     const price = calculateTotalPrice(order.items);
     sendConfirmationEmail(order.customer, price);
     return { success: true, totalPrice: price };
   }

   function validateOrder(order: Order): void { ... }
   function checkInventory(items: OrderItem[]): void { ... }
   function calculateTotalPrice(items: OrderItem[]): number { ... }
   function sendConfirmationEmail(customer: Customer, price: number): void { ... }
   ```
   **行为等价验证**：原有针对 `processOrder` 的测试用例应全部通过，无需修改。

   ---

   #### P2 · 魔法数字：第 45、67、78 行
   ...
   ```

6. **给出应用建议**：告知用户应用重构的顺序（从小函数到大函数，从独立模块到核心模块），并提醒在重构前确保有测试覆盖。

---

## 示例

### 示例一：重构过长的 JavaScript 函数

**触发提示词**：

```
请帮我重构 src/controllers/checkoutController.js，这个文件函数太长了
```

**执行前状态**：`checkoutController.js` 包含一个 80 行的 `handleCheckout` 函数，混合了参数验证、优惠券计算、库存扣减、订单创建、邮件通知逻辑。

**预期输出**：

```markdown
## 重构分析报告：`src/controllers/checkoutController.js`

### 发现的坏味道（共 3 处）

#### P1 · 过长函数：`handleCheckout()`（80 行）
**重构手法**：提取函数 × 4

**重构后代码**：
```javascript
async function handleCheckout(req, res) {
  const params = validateCheckoutParams(req.body);  // 提取：参数验证
  const discount = applyCoupon(params.couponCode, params.subtotal);  // 提取：优惠计算
  await deductInventory(params.items);  // 提取：库存扣减
  const order = await createOrder({ ...params, discount });  // 提取：订单创建
  await sendOrderConfirmation(order);  // 提取：邮件通知
  res.json({ success: true, orderId: order.id });
}
```
重构后主函数从 80 行缩减至 8 行，每个子函数可独立测试。
```

### 示例二：消除重复代码

**触发提示词**：

```
请分析 utils/validators.ts 中的重复代码并给出重构建议
```

**预期输出**：识别出 3 处相似的「非空且长度在范围内」校验逻辑，提取为通用的 `validateStringLength(value, min, max)` 函数，并给出所有调用点的改写方式。

---

## 注意事项

- 重构的核心原则是「**行为不变**」，应在有测试覆盖的情况下进行，建议先用 `generate-unit-tests` 技能补充测试，再应用重构
- 本技能输出的是重构建议和代码示例，需要用户手动应用；若需要直接修改文件，请在提示词中明确说明「请直接修改文件」
- 对于超过 200 行的大文件，建议按函数/类分段重构，避免一次性改动过多
- 重构后应重新运行测试套件，确认行为未变
