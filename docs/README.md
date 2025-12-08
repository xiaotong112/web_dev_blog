# 博客系统项目说明

## 📚 项目概述

这是一个基于 **Spring Boot + MyBatis Plus + MySQL + JWT** 的完整博客系统，采用前后端分离架构，支持用户注册登录、文章发布审核、评论互动、草稿保存等功能。

## 🎯 核心功能

### 1. 认证与用户模块
- ✅ 用户注册（用户名+密码）
- ✅ 用户登录（JWT Token认证）
- ✅ 个人资料编辑（头像、昵称、职位、公司、简介）
- ✅ 用户主页（展示成就：发文数、获赞数、阅读数）

### 2. 创作者中心
- ✅ Markdown 编辑器（支持图片上传）
- ✅ 草稿箱（自动/手动保存）
- ✅ 文章管理（草稿、审核中、已发布、已驳回）
- ✅ 发布申请（填写分类、标签、摘要）
- ✅ 文章修改/删除

### 3. 前台展示与交互
- ✅ 文章流（分页、按分类/标签筛选）
- ✅ 排序（最新、最热）
- ✅ 文章详情（Markdown渲染、作者卡片）
- ✅ 点赞系统（防重复点赞）
- ✅ 评论系统（支持回复楼层）
- ✅ 阅读计数（防刷新）

### 4. 管理员后台
- ✅ 内容审核（通过/驳回文章）
- ✅ 用户管理（封禁/解封）
- ✅ 分类/标签管理

## 🏗️ 技术架构

### 后端技术栈
- **Spring Boot 3.5.7** - 核心框架
- **MyBatis Plus 3.5.5** - ORM框架
- **Spring Security + JWT** - 认证授权
- **MySQL 8.0** - 数据库
- **Lombok** - 简化代码
- **Hutool** - 工具类库

### 项目结构
```
src/main/java/org/example/demo_spring/
├── common/              # 公共类
│   ├── ArticleStatus.java      # 文章状态枚举
│   ├── UserRole.java           # 用户角色枚举
│   ├── BaseEntity.java         # 基础实体类
│   └── Result.java             # 统一返回结果
├── config/              # 配置类
│   ├── MybatisPlusConfig.java      # MyBatis Plus配置
│   ├── SecurityConfig.java         # Security配置
│   └── MyMetaObjectHandler.java    # 自动填充配置
├── controller/          # 控制器层（需实现）
│   ├── AuthController.java
│   ├── UserController.java
│   ├── ArticleController.java
│   ├── CategoryController.java
│   ├── TagController.java
│   ├── CommentController.java
│   ├── DraftController.java
│   └── AdminController.java
├── dto/                 # 数据传输对象
│   ├── LoginDTO.java
│   ├── RegisterDTO.java
│   ├── UserProfileDTO.java
│   ├── ArticleDTO.java
│   ├── ArticleQueryDTO.java
│   ├── CommentDTO.java
│   ├── AuditDTO.java
│   └── DraftDTO.java
├── entity/              # 实体类
│   ├── User.java
│   ├── Article.java
│   ├── Category.java
│   ├── Tag.java
│   ├── ArticleTag.java
│   ├── ArticleLike.java
│   ├── Comment.java
│   ├── ArticleView.java
│   └── Draft.java
├── exception/           # 异常处理
│   ├── BusinessException.java
│   └── GlobalExceptionHandler.java
├── filter/              # 过滤器
│   └── JwtAuthenticationFilter.java
├── mapper/              # Mapper接口
│   ├── UserMapper.java
│   ├── ArticleMapper.java
│   ├── CategoryMapper.java
│   ├── TagMapper.java
│   ├── ArticleTagMapper.java
│   ├── ArticleLikeMapper.java
│   ├── CommentMapper.java
│   ├── ArticleViewMapper.java
│   └── DraftMapper.java
├── service/             # 服务层（需实现）
│   ├── AuthService.java + Impl
│   ├── UserService.java + Impl
│   ├── ArticleService.java + Impl
│   ├── CategoryService.java + Impl
│   ├── TagService.java + Impl
│   ├── CommentService.java + Impl
│   ├── DraftService.java + Impl
│   └── AdminService.java + Impl
├── util/                # 工具类
│   ├── JwtUtil.java
│   ├── IpUtil.java
│   └── UserContext.java
├── vo/                  # 视图对象
│   ├── LoginVO.java
│   ├── UserVO.java
│   ├── UserStatsVO.java
│   ├── ArticleListVO.java
│   ├── ArticleDetailVO.java
│   ├── MyArticleVO.java
│   ├── CategoryVO.java
│   ├── TagVO.java
│   └── CommentVO.java
└── DemoSpringApplication.java   # 启动类

src/main/resources/
├── application.properties       # 配置文件
└── mapper/                      # Mapper XML文件目录

docs/
├── database.sql                 # 数据库建表脚本
└── API文档.md                   # 接口文档
```

## 📊 数据库设计

### 核心表结构
1. **tb_user** - 用户表
2. **tb_category** - 分类表
3. **tb_tag** - 标签表
4. **tb_article** - 文章表
5. **tb_article_tag** - 文章标签关联表
6. **tb_article_like** - 文章点赞表
7. **tb_comment** - 评论表
8. **tb_article_view** - 文章阅读记录表
9. **tb_draft** - 草稿表

### 关系设计
- 用户 1:N 文章
- 用户 1:N 评论
- 文章 N:N 标签
- 文章 1:N 评论
- 文章 N:1 分类

## 🚀 快速开始

### 1. 环境要求
- JDK 17+
- MySQL 8.0+
- Maven 3.6+

### 2. 数据库初始化
```bash
# 1. 创建数据库
mysql -uroot -p123456

# 2. 执行建表脚本
source docs/database.sql
```

### 3. 修改配置
编辑 `src/main/resources/application.properties`：
```properties
spring.datasource.url=jdbc:mysql://localhost:3307/blog_dev
spring.datasource.username=root
spring.datasource.password=123456
```

### 4. 启动项目
```bash
mvn clean install
mvn spring-boot:run
```

### 5. 访问接口
- 接口地址：http://localhost:8080
- API文档：查看 `docs/API文档.md`

### 6. 默认管理员账号
- 用户名：`admin`
- 密码：`admin123`

## 📖 API 接口文档

详细接口文档请查看：[API文档.md](docs/API文档.md)

### 主要接口列表

#### 认证模块
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

#### 用户模块
- `GET /api/users/current` - 获取当前用户信息
- `PUT /api/users/profile` - 更新个人资料
- `GET /api/users/{id}/profile` - 获取用户主页信息

#### 文章模块
- `GET /api/articles` - 获取文章列表（分页）
- `GET /api/articles/{id}` - 获取文章详情
- `POST /api/articles` - 创建文章
- `PUT /api/articles/{id}` - 更新文章
- `DELETE /api/articles/{id}` - 删除文章
- `POST /api/articles/{id}/publish` - 发布文章（提交审核）
- `POST /api/articles/{id}/like` - 点赞文章
- `DELETE /api/articles/{id}/like` - 取消点赞
- `GET /api/articles/my` - 获取我的文章列表

#### 分类&标签模块
- `GET /api/categories` - 获取所有分类
- `GET /api/tags` - 获取所有标签
- `POST /api/admin/categories` - 创建分类（管理员）
- `POST /api/admin/tags` - 创建标签（管理员）

#### 评论模块
- `GET /api/articles/{id}/comments` - 获取文章评论
- `POST /api/comments` - 发表评论
- `DELETE /api/comments/{id}` - 删除评论

#### 草稿模块
- `POST /api/drafts` - 保存草稿
- `GET /api/drafts` - 获取我的草稿列表
- `GET /api/drafts/{id}` - 获取草稿详情
- `DELETE /api/drafts/{id}` - 删除草稿

#### 管理员模块
- `GET /api/admin/articles/pending` - 获取待审核文章
- `POST /api/admin/articles/{id}/audit` - 审核文章
- `GET /api/admin/users` - 获取用户列表
- `PUT /api/admin/users/{id}/status` - 禁用/启用用户

## 🔐 认证机制

系统使用 JWT (JSON Web Token) 进行无状态认证：

1. 用户登录成功后获取 Token
2. 后续请求需在 Header 中携带：`Authorization: Bearer {token}`
3. Token 有效期：7天
4. Token 包含用户ID、用户名、角色等信息

## 🎨 核心功能流程

### 文章发布流程
```
1. 用户创建文章（状态：DRAFT）
2. 用户点击发布，填写分类、标签、摘要
3. 文章状态变更为 PENDING_REVIEW
4. 管理员审核文章
5. 审核通过 -> PUBLISHED（前台可见）
   审核驳回 -> REJECTED（作者可见驳回原因）
```

### 点赞防刷机制
- 用户每篇文章只能点赞一次
- 通过 `tb_article_like` 表记录点赞关系
- 点赞时检查是否已存在记录
- 取消点赞时删除记录

### 阅读计数防刷
- 记录用户IP和UserAgent
- 同一IP短时间内多次访问只计一次
- 通过 `tb_article_view` 表记录访问日志

## 📝 开发规范

### 代码分层
- **Controller层**：接收请求、参数校验、调用Service、返回结果
- **Service层**：业务逻辑处理、事务管理
- **Mapper层**：数据访问
- **DTO**：接收前端参数
- **VO**：返回给前端的数据
- **Entity**：数据库实体映射

### 统一返回格式
```java
Result.success(data)      // 成功
Result.error(message)     // 失败
```

### 异常处理
- 业务异常抛出 `BusinessException`
- 全局异常处理器统一拦截处理

## ⚠️ 待实现内容

目前项目架构和基础配置已完成，**需要补充实现**：

### Service 实现类
- [ ] AuthServiceImpl
- [ ] UserServiceImpl
- [ ] ArticleServiceImpl
- [ ] CategoryServiceImpl
- [ ] TagServiceImpl
- [ ] CommentServiceImpl
- [ ] DraftServiceImpl
- [ ] AdminServiceImpl

### Controller 控制器
- [ ] AuthController
- [ ] UserController
- [ ] ArticleController
- [ ] CategoryController
- [ ] TagController
- [ ] CommentController
- [ ] DraftController
- [ ] AdminController

由于代码量较大（约5000+行），建议按照以下顺序实现：
1. **AuthService** + **AuthController**（认证功能）
2. **UserService** + **UserController**（用户功能）
3. **ArticleService** + **ArticleController**（文章核心功能）
4. 其他模块逐步完善

## 🔍 扩展建议

1. **缓存优化**：使用 Redis 缓存热门文章、分类标签等
2. **搜索功能**：集成 Elasticsearch 实现全文检索
3. **图片上传**：集成 OSS 对象存储服务
4. **邮件通知**：文章审核结果邮件通知
5. **数据统计**：文章阅读趋势、用户活跃度分析
6. **敏感词过滤**：评论和文章内容审核
7. **限流防刷**：接口限流保护

## 📄 License

MIT License

## 👥 联系方式

如有问题，请提交 Issue。

