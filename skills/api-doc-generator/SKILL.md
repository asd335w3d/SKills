---
name: api-doc-generator
description: 读取指定的路由/控制器代码文件或 OpenAPI 规范文件，自动生成结构清晰的 Markdown 格式 API 文档，包含接口描述、请求参数、响应格式和调用示例，适用于后端接口开发完成后需要快速输出接口文档供前端或第三方对接的场景。
license: MIT
version: "1.0.0"
tags:
  - 文档
  - API
  - 代码生成
---

## 说明

本技能读取后端路由/控制器源代码（支持 Express、Koa、FastAPI、Gin 等主流框架）或 OpenAPI/Swagger 规范文件，解析接口定义、参数类型和注释，自动生成标准化的 Markdown 格式 API 接口文档，包含完整的请求/响应结构描述和 curl 调用示例。

**适用场景**：

- 场景一：后端接口开发完成后，需要快速生成接口文档供前端开发者对接，减少人工编写文档的时间
- 场景二：已有 OpenAPI/Swagger YAML 或 JSON 规范文件，需要将其转换为可读性更强的 Markdown 文档，存入版本控制或发布到项目 Wiki
- 场景三：代码注释（JSDoc、Python docstring）已较完善，需要从注释中提取生成结构化 API 文档

**前提条件**：

- 需要提供具体的文件路径（路由/控制器文件或 OpenAPI 规范文件）
- 源代码中有基本的类型注解或 JSDoc/docstring 注释效果更佳；若无注释，工具将基于函数签名和参数名推断文档内容

**不适用场景**：

- 不适用于 GraphQL Schema（GraphQL 有专用文档工具）
- 不适用于 gRPC `.proto` 文件（建议使用 protoc 官方文档生成工具）
- 生成的文档不含业务逻辑说明，字段的业务含义需要开发者补充

---

## 流程

1. **读取源文件**：读取用户指定的文件路径内容。支持以下输入类型：
   - 路由/控制器代码文件（如 `src/routes/userRoutes.ts`、`app/api/users.py`）
   - OpenAPI 规范文件（`openapi.yaml`、`swagger.json`）
   
   若文件不存在，停止并提示用户确认路径。若用户未指定路径，询问：「请提供路由文件路径或 OpenAPI 规范文件路径。」

2. **识别框架和语言**：根据文件内容判断框架类型（用于选择解析策略）：
   - **Express/Koa**：识别 `router.get/post/put/delete(path, handler)` 模式
   - **FastAPI**：识别 `@app.get/@router.post` 装饰器模式
   - **Gin**：识别 `r.GET/r.POST(path, handler)` 模式
   - **OpenAPI YAML/JSON**：直接解析 `paths` 字段

3. **提取接口列表**：扫描文件，提取每个接口的以下信息：
   - HTTP 方法（GET/POST/PUT/DELETE/PATCH）
   - 路径（如 `/users/:id`）
   - 路径参数、查询参数、请求体参数（名称、类型、是否必填、说明）
   - 响应状态码和响应体结构（从返回语句或类型注解中推断）
   - 接口描述（从 JSDoc/docstring/注释中提取，若无则标记 `TODO`）
   - 认证要求（从中间件调用中推断，如是否有 `authMiddleware`）

4. **确定输出文件路径**：
   - 若用户未指定输出路径，默认为 `docs/api/<源文件名>.md`
   - 若 `docs/api/` 目录不存在，自动创建

5. **生成 Markdown 文档**：按以下格式为每个接口生成文档：

   ```markdown
   # <模块名> API 文档

   > 生成时间：<当前日期>
   > 源文件：`<源文件路径>`

   ---

   ## 接口列表

   | 方法 | 路径 | 描述 | 认证 |
   |------|------|------|------|
   | GET | `/users` | 获取用户列表 | 需要 |
   | POST | `/users` | 创建新用户 | 需要 |

   ---

   ## GET /users · 获取用户列表

   **描述**：分页获取用户列表，支持按用户名和状态筛选。

   **认证**：需要 Bearer Token（在 `Authorization` 请求头中传入）

   ### 请求参数

   **Query 参数**：

   | 参数名 | 类型 | 必填 | 默认值 | 说明 |
   |--------|------|------|--------|------|
   | `page` | number | 否 | 1 | 页码，从 1 开始 |
   | `pageSize` | number | 否 | 20 | 每页条数，最大 100 |
   | `username` | string | 否 | — | 用户名模糊搜索 |
   | `status` | string | 否 | — | 用户状态：`active` / `inactive` |

   ### 响应

   **成功（200 OK）**：

   ```json
   {
     "code": 0,
     "data": {
       "total": 100,
       "page": 1,
       "pageSize": 20,
       "list": [
         {
           "id": "u_123456",
           "username": "zhangsan",
           "email": "zhangsan@example.com",
           "status": "active",
           "createdAt": "2024-01-15T08:30:00Z"
         }
       ]
     }
   }
   ```

   **错误（401 Unauthorized）**：

   ```json
   { "code": 401, "message": "未提供有效的认证 Token" }
   ```

   ### 调用示例

   ```bash
   curl -X GET "https://api.example.com/users?page=1&pageSize=20" \
     -H "Authorization: Bearer <your_token>"
   ```
   ```

6. **写入文档文件**：将生成的 Markdown 内容写入目标文件。若文件已存在，询问用户是否覆盖。

7. **输出摘要**：告知用户：
   - 文档文件路径
   - 共文档化了多少个接口
   - 哪些接口因缺少注释被标记了 `TODO`，需要人工补充业务说明

---

## 示例

### 示例一：为 Express 路由文件生成文档

**触发提示词**：

```
请为 src/routes/productRoutes.ts 生成 API 文档
```

**执行前状态**：`src/routes/productRoutes.ts` 包含商品的增删改查接口，部分接口有 JSDoc 注释。

**预期输出**：

创建文件 `docs/api/productRoutes.md`，内容包含商品列表、商品详情、创建商品、更新商品、删除商品共 5 个接口的完整文档，格式如上述模板所示。

**摘要**：已文档化 5 个接口。2 个接口（`PUT /products/:id`、`DELETE /products/:id`）缺少注释，字段说明已标记 `TODO`，请人工补充。

### 示例二：将 OpenAPI 规范转换为 Markdown

**触发提示词**：

```
请将 openapi.yaml 转换为 Markdown 格式的 API 文档，输出到 docs/api/overview.md
```

**执行前状态**：项目根目录存在 `openapi.yaml`，包含 12 个接口定义。

**预期输出**：

创建文件 `docs/api/overview.md`，包含所有 12 个接口的完整文档，包含接口索引表、各接口的请求/响应结构和 curl 示例。

---

## 注意事项

- 生成的文档中，字段的「说明」列内容从代码注释中提取；**若代码无注释，该列会标记 `// TODO: 请补充字段说明`**，需要开发者手动填写业务含义
- 响应体结构从 TypeScript 类型定义或 Python 类型注解中推断；若使用 `any` 类型或无类型注解，响应体部分会标记为「结构待补充」
- 文档中的接口路径为代码中定义的相对路径（如 `/users`），不含域名和 API 版本前缀，使用时需根据实际部署地址补充
- 可配合 `code-review` 技能使用：先审查接口代码质量，再生成文档，确保文档与实现一致
