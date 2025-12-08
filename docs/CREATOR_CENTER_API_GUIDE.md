# 创作者中心 API 使用指南

## 🎯 使用场景

创作者中心模块主要用于内容创作者管理自己的文章和草稿，包括：
- 📝 编写文章时自动保存草稿
- 📤 发布文章提交审核
- 📊 查看自己的文章列表（含各种状态）
- ✏️ 编辑已发布或被驳回的文章
- 🗑️ 删除不需要的文章

---

## 🔑 认证说明

所有创作者中心的接口都需要在请求头中携带JWT Token：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**获取Token**: 通过 `POST /api/auth/login` 登录后获得

---

## 📝 草稿管理

### 1. 保存草稿 (自动保存功能)

**接口**: `POST /api/draft/save`

**使用场景**: 
- 用户正在编写新文章时，每30秒自动调用一次
- 用户编辑已发布文章时，保存修改中的内容

**请求示例**:
```bash
curl -X POST "http://localhost:8080/api/draft/save" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Spring Boot 最佳实践",
    "content": "# 标题\n\n这是文章内容..."
  }'
```

**编辑已发布文章时的草稿**:
```bash
curl -X POST "http://localhost:8080/api/draft/save" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "articleId": 123,  // 关联的文章ID
    "title": "更新后的标题",
    "content": "更新后的内容..."
  }'
```

**响应**:
```json
{
  "code": 200,
  "message": "保存草稿成功",
  "data": 456  // 草稿ID
}
```

**前端实现建议**:
```javascript
// Vue 3 示例
let autoSaveTimer = null;

const startAutoSave = () => {
  autoSaveTimer = setInterval(() => {
    if (hasChanges.value) {
      saveDraft();
    }
  }, 30000); // 每30秒保存一次
};

const saveDraft = async () => {
  try {
    const response = await axios.post('/api/draft/save', {
      articleId: editingArticleId.value,  // 编辑文章时传入
      title: title.value,
      content: content.value
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    ElMessage.success('草稿已自动保存');
    hasChanges.value = false;
  } catch (error) {
    console.error('保存草稿失败', error);
  }
};
```

---

### 2. 获取草稿列表

**接口**: `GET /api/draft/list`

**使用场景**: 
- 用户打开"我的草稿"页面
- 想要继续编辑之前保存的草稿

**请求示例**:
```bash
curl -X GET "http://localhost:8080/api/draft/list?current=1&size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**查询参数**:
- `current`: 页码，默认1
- `size`: 每页数量，默认10

**响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total": 3,
    "pages": 1,
    "current": 1,
    "records": [
      {
        "id": 1,
        "userId": 10,
        "articleId": null,  // null表示是新文章的草稿
        "title": "待完成的文章",
        "content": "# 标题\n内容...",
        "createTime": "2024-12-08T10:00:00",
        "updateTime": "2024-12-08T15:30:00"
      },
      {
        "id": 2,
        "userId": 10,
        "articleId": 123,  // 关联文章ID，表示是编辑某篇文章的草稿
        "title": "正在修改的文章",
        "content": "修改后的内容...",
        "createTime": "2024-12-07T14:00:00",
        "updateTime": "2024-12-08T09:20:00"
      }
    ]
  }
}
```

---

### 3. 获取草稿详情

**接口**: `GET /api/draft/{draftId}`

**使用场景**: 
- 用户点击草稿列表中的某个草稿，加载内容到编辑器

**请求示例**:
```bash
curl -X GET "http://localhost:8080/api/draft/456" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 456,
    "userId": 10,
    "articleId": null,
    "title": "我的文章标题",
    "content": "# 一级标题\n\n文章内容...",
    "createTime": "2024-12-08T10:00:00",
    "updateTime": "2024-12-08T15:30:00"
  }
}
```

---

### 4. 删除草稿

**接口**: `DELETE /api/draft/{draftId}`

**使用场景**: 
- 用户觉得草稿不需要了，手动删除

**请求示例**:
```bash
curl -X DELETE "http://localhost:8080/api/draft/456" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应**:
```json
{
  "code": 200,
  "message": "删除草稿成功",
  "data": null
}
```

---

## 📤 文章发布与管理

### 1. 发布文章

**接口**: `POST /api/article/publish`

**使用场景**: 
- 用户完成文章编写，点击"发布"按钮

**请求示例**:
```bash
curl -X POST "http://localhost:8080/api/article/publish" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Spring Boot 性能优化实战",
    "summary": "本文介绍Spring Boot应用的性能优化技巧",
    "content": "# Spring Boot 性能优化实战\n\n## 1. 数据库优化\n...",
    "coverImage": "https://example.com/cover.jpg",
    "categoryId": 1,
    "tagIds": [1, 2, 3]
  }'
```

**请求参数说明**:
```typescript
{
  title: string;        // 必填，文章标题
  summary: string;      // 可选，文章摘要（用于列表展示）
  content: string;      // 必填，文章内容（Markdown格式）
  coverImage: string;   // 可选，封面图片URL
  categoryId: number;   // 必填，分类ID
  tagIds: number[];     // 可选，标签ID数组
}
```

**响应**:
```json
{
  "code": 200,
  "message": "文章已提交审核",
  "data": 789  // 文章ID
}
```

**注意事项**:
- 文章发布后状态为 `PENDING_REVIEW`（待审核）
- 需要管理员审核通过后才会在前台显示
- 标签必须是已存在的标签ID（从标签列表接口获取）
- 分类必须是已存在的分类ID（从分类列表接口获取）

**前端示例**:
```javascript
const publishArticle = async () => {
  try {
    // 表单验证
    if (!title.value || !content.value || !categoryId.value) {
      ElMessage.error('请填写完整信息');
      return;
    }
    
    const response = await axios.post('/api/article/publish', {
      title: title.value,
      summary: summary.value,
      content: content.value,
      coverImage: coverImage.value,
      categoryId: categoryId.value,
      tagIds: selectedTags.value
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    ElMessage.success('文章已提交审核');
    router.push('/creator/articles');  // 跳转到我的文章列表
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '发布失败');
  }
};
```

---

### 2. 我的文章列表

**接口**: `GET /api/article/my`

**使用场景**: 
- 查看自己所有文章及其状态
- 筛选特定状态的文章（如查看待审核、已驳回的文章）

**请求示例**:
```bash
# 查询所有文章
curl -X GET "http://localhost:8080/api/article/my?current=1&size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 只查询待审核的文章
curl -X GET "http://localhost:8080/api/article/my?status=PENDING_REVIEW" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 只查询已发布的文章
curl -X GET "http://localhost:8080/api/article/my?status=PUBLISHED" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 只查询被驳回的文章
curl -X GET "http://localhost:8080/api/article/my?status=REJECTED" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**查询参数**:
- `current`: 页码，默认1
- `size`: 每页数量，默认10
- `status`: 文章状态（可选）
  - `DRAFT` - 草稿
  - `PENDING_REVIEW` - 待审核
  - `PUBLISHED` - 已发布
  - `REJECTED` - 已驳回

**响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total": 15,
    "pages": 2,
    "current": 1,
    "records": [
      {
        "id": 1,
        "title": "Spring Boot 最佳实践",
        "status": "PUBLISHED",
        "rejectReason": null,
        "viewCount": 1250,
        "likeCount": 85,
        "commentCount": 23,
        "createTime": "2024-12-01T10:00:00",
        "updateTime": "2024-12-01T10:00:00",
        "publishTime": "2024-12-01T14:00:00"
      },
      {
        "id": 2,
        "title": "微服务架构设计",
        "status": "PENDING_REVIEW",
        "rejectReason": null,
        "viewCount": 0,
        "likeCount": 0,
        "commentCount": 0,
        "createTime": "2024-12-08T09:00:00",
        "updateTime": "2024-12-08T09:00:00",
        "publishTime": null
      },
      {
        "id": 3,
        "title": "Redis 缓存策略",
        "status": "REJECTED",
        "rejectReason": "内容质量不符合要求，请补充更多实战案例",
        "viewCount": 0,
        "likeCount": 0,
        "commentCount": 0,
        "createTime": "2024-12-07T15:00:00",
        "updateTime": "2024-12-07T18:00:00",
        "publishTime": null
      }
    ]
  }
}
```

**状态显示建议**:
```javascript
const statusConfig = {
  'DRAFT': { 
    text: '草稿', 
    color: '#909399',
    icon: 'Edit'
  },
  'PENDING_REVIEW': { 
    text: '待审核', 
    color: '#E6A23C',
    icon: 'Clock'
  },
  'PUBLISHED': { 
    text: '已发布', 
    color: '#67C23A',
    icon: 'CircleCheck'
  },
  'REJECTED': { 
    text: '已驳回', 
    color: '#F56C6C',
    icon: 'CircleClose'
  }
};
```

---

### 3. 编辑文章

**接口**: `PUT /api/article/{articleId}`

**使用场景**: 
- 修改已发布的文章
- 重新提交被驳回的文章

**请求示例**:
```bash
curl -X PUT "http://localhost:8080/api/article/789" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "更新后的标题",
    "summary": "更新后的摘要",
    "content": "更新后的内容...",
    "coverImage": "https://example.com/new-cover.jpg",
    "categoryId": 2,
    "tagIds": [2, 3, 4]
  }'
```

**响应**:
```json
{
  "code": 200,
  "message": "文章已更新",
  "data": null
}
```

**重要说明**:
- 如果文章状态是 `PUBLISHED`（已发布），编辑后会自动变为 `PENDING_REVIEW`（待审核）
- 如果文章状态是 `REJECTED`（已驳回），编辑后会重新提交审核
- 编辑会删除原有的标签关联，重新关联新标签

**前端编辑流程**:
```javascript
// 1. 加载文章详情
const loadArticle = async (articleId) => {
  const response = await axios.get(`/api/article/${articleId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // 填充表单
  title.value = response.data.data.title;
  content.value = response.data.data.content;
  // ...
};

// 2. 提交更新
const updateArticle = async () => {
  const response = await axios.put(`/api/article/${articleId}`, {
    title: title.value,
    summary: summary.value,
    content: content.value,
    coverImage: coverImage.value,
    categoryId: categoryId.value,
    tagIds: selectedTags.value
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  ElMessage.success('文章已更新，等待审核');
  router.push('/creator/articles');
};
```

---

### 4. 删除文章

**接口**: `DELETE /api/article/{articleId}`

**使用场景**: 
- 删除不需要的文章

**请求示例**:
```bash
curl -X DELETE "http://localhost:8080/api/article/789" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应**:
```json
{
  "code": 200,
  "message": "文章已删除",
  "data": null
}
```

**注意事项**:
- 使用逻辑删除（软删除），数据不会真正从数据库删除
- 删除后文章不会再出现在列表中
- 删除会同时删除文章的标签关联
- 已发布的文章删除后，前台将无法查看

**前端删除确认**:
```javascript
const deleteArticle = (articleId) => {
  ElMessageBox.confirm(
    '确定要删除这篇文章吗？删除后无法恢复',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await axios.delete(`/api/article/${articleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      ElMessage.success('文章已删除');
      loadArticleList();  // 重新加载列表
    } catch (error) {
      ElMessage.error('删除失败');
    }
  });
};
```

---

## 🎨 完整工作流程示例

### 场景1: 发布新文章

```
1. 用户打开写文章页面
   ↓
2. 开始编写，每30秒自动保存草稿（POST /api/draft/save）
   ↓
3. 用户编写完成，点击"发布"
   ↓
4. 填写分类、标签、摘要、封面图
   ↓
5. 提交发布（POST /api/article/publish）
   ↓
6. 文章状态变为 PENDING_REVIEW（待审核）
   ↓
7. 跳转到"我的文章"页面（GET /api/article/my）
   ↓
8. 看到文章显示"待审核"状态
```

### 场景2: 编辑已发布文章

```
1. 用户打开"我的文章"列表（GET /api/article/my）
   ↓
2. 点击某篇已发布文章的"编辑"按钮
   ↓
3. 加载文章内容到编辑器
   ↓
4. 修改内容，自动保存草稿（POST /api/draft/save，带 articleId）
   ↓
5. 修改完成，点击"更新"
   ↓
6. 提交更新（PUT /api/article/{articleId}）
   ↓
7. 文章状态从 PUBLISHED 变为 PENDING_REVIEW（重新审核）
   ↓
8. 返回列表，看到文章变为"待审核"状态
```

### 场景3: 处理被驳回的文章

```
1. 管理员驳回文章，填写驳回原因
   ↓
2. 用户打开"我的文章"，筛选 REJECTED 状态（GET /api/article/my?status=REJECTED）
   ↓
3. 看到文章显示"已驳回"，以及驳回原因
   ↓
4. 点击"重新编辑"
   ↓
5. 根据驳回原因修改内容
   ↓
6. 提交更新（PUT /api/article/{articleId}）
   ↓
7. 文章重新提交审核，状态变为 PENDING_REVIEW
```

---

## 🚨 错误处理

### 常见错误码

| 错误码 | 说明 | 处理建议 |
|-------|------|---------|
| 400 | 参数错误 | 检查请求参数是否完整 |
| 401 | 未登录 | Token过期或无效，重新登录 |
| 403 | 无权限 | 尝试操作他人的文章/草稿 |
| 404 | 资源不存在 | 文章/草稿已被删除 |
| 500 | 服务器错误 | 联系管理员 |

### 错误响应示例

```json
{
  "code": 400,
  "message": "分类不存在",
  "data": null
}
```

```json
{
  "code": 403,
  "message": "无权编辑该文章",
  "data": null
}
```

---

## 📱 前端页面建议

### 1. 写文章页面
- Markdown编辑器（支持实时预览）
- 自动保存草稿提示
- 发布弹窗（选择分类、标签、上传封面）
- 保存草稿按钮
- 发布按钮

### 2. 我的草稿页面
- 草稿列表（卡片或表格形式）
- 显示标题、更新时间
- 操作按钮：继续编辑、删除
- 分页器

### 3. 我的文章页面
- 状态筛选Tab（全部、待审核、已发布、已驳回）
- 文章列表
  - 显示标题、状态、浏览数、点赞数、评论数
  - 已驳回文章显示驳回原因
- 操作按钮：编辑、删除
- 分页器

---

**文档版本**: v1.0  
**最后更新**: 2024-12-08  
**适用版本**: demo_spring v0.0.1-SNAPSHOT

