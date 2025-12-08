-- ====================================
-- 博客系统数据库设计
-- ====================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS blog_dev
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE blog_dev;

-- ====================================
-- 1. 用户表 (tb_user)
-- ====================================
CREATE TABLE tb_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名（登录账号）',
    password VARCHAR(100) NOT NULL COMMENT '密码（加密存储）',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(255) COMMENT '头像URL',
    email VARCHAR(100) COMMENT '邮箱',
    position VARCHAR(100) COMMENT '职位',
    company VARCHAR(100) COMMENT '公司',
    bio TEXT COMMENT '个人简介',
    role VARCHAR(20) DEFAULT 'USER' COMMENT '角色：USER-普通用户, ADMIN-管理员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-封禁, 1-正常',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除, 1-已删除',
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ====================================
-- 2. 分类表 (tb_category)
-- ====================================
CREATE TABLE tb_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '分类名称',
    description VARCHAR(200) COMMENT '分类描述',
    sort_order INT DEFAULT 0 COMMENT '排序号',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除, 1-已删除',
    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章分类表';

-- ====================================
-- 3. 标签表 (tb_tag)
-- ====================================
CREATE TABLE tb_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '标签ID',
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
    color VARCHAR(20) COMMENT '标签颜色',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除, 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章标签表';

-- ====================================
-- 4. 文章表 (tb_article)
-- ====================================
CREATE TABLE tb_article (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '文章ID',
    user_id BIGINT NOT NULL COMMENT '作者ID',
    category_id BIGINT COMMENT '分类ID',
    title VARCHAR(200) NOT NULL COMMENT '文章标题',
    summary TEXT COMMENT '文章摘要',
    content LONGTEXT NOT NULL COMMENT '文章内容（Markdown格式）',
    cover_image VARCHAR(255) COMMENT '封面图片URL',
    status VARCHAR(20) DEFAULT 'DRAFT' COMMENT '状态：DRAFT-草稿, PENDING_REVIEW-待审核, PUBLISHED-已发布, REJECTED-已驳回',
    reject_reason TEXT COMMENT '驳回原因',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    like_count INT DEFAULT 0 COMMENT '点赞次数',
    comment_count INT DEFAULT 0 COMMENT '评论次数',
    is_top TINYINT DEFAULT 0 COMMENT '是否置顶：0-否, 1-是',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    publish_time DATETIME COMMENT '发布时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除, 1-已删除',
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_publish_time (publish_time),
    INDEX idx_view_count (view_count),
    INDEX idx_like_count (like_count),
    FOREIGN KEY (user_id) REFERENCES tb_user(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES tb_category(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- ====================================
-- 5. 文章标签关联表 (tb_article_tag)
-- ====================================
CREATE TABLE tb_article_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    tag_id BIGINT NOT NULL COMMENT '标签ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_article_tag (article_id, tag_id),
    INDEX idx_article_id (article_id),
    INDEX idx_tag_id (tag_id),
    FOREIGN KEY (article_id) REFERENCES tb_article(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tb_tag(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章标签关联表';

-- ====================================
-- 6. 文章点赞表 (tb_article_like)
-- ====================================
CREATE TABLE tb_article_like (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_article_user (article_id, user_id),
    INDEX idx_article_id (article_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (article_id) REFERENCES tb_article(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES tb_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章点赞表';

-- ====================================
-- 7. 评论表 (tb_comment)
-- ====================================
CREATE TABLE tb_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    user_id BIGINT NOT NULL COMMENT '评论用户ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父评论ID（0表示顶级评论）',
    reply_to_user_id BIGINT COMMENT '回复的用户ID',
    content TEXT NOT NULL COMMENT '评论内容',
    like_count INT DEFAULT 0 COMMENT '点赞次数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除, 1-已删除',
    INDEX idx_article_id (article_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    FOREIGN KEY (article_id) REFERENCES tb_article(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES tb_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ====================================
-- 8. 文章阅读记录表 (tb_article_view)
-- ====================================
CREATE TABLE tb_article_view (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    user_id BIGINT COMMENT '用户ID（游客为NULL）',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT '用户代理',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
    INDEX idx_article_id (article_id),
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time),
    FOREIGN KEY (article_id) REFERENCES tb_article(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章阅读记录表';

-- ====================================
-- 9. 草稿自动保存表 (tb_draft)
-- ====================================
CREATE TABLE tb_draft (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '草稿ID',
    user_id BIGINT NOT NULL COMMENT '作者ID',
    article_id BIGINT COMMENT '关联文章ID（修改文章时）',
    title VARCHAR(200) COMMENT '文章标题',
    content LONGTEXT COMMENT '文章内容',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_article_id (article_id),
    FOREIGN KEY (user_id) REFERENCES tb_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='草稿自动保存表';

-- ====================================
-- 初始化数据
-- ====================================

-- 插入默认管理员（密码：admin123，需要加密）
INSERT INTO tb_user (username, password, nickname, role, status)
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', 'ADMIN', 1);

-- 插入默认分类
INSERT INTO tb_category (name, description, sort_order) VALUES
('后端开发', 'Java、Python、Go等后端技术', 1),
('前端开发', 'Vue、React、JavaScript等前端技术', 2),
('移动开发', 'Android、iOS、Flutter等移动端技术', 3),
('数据库', 'MySQL、Redis、MongoDB等数据库技术', 4),
('运维部署', 'Docker、K8s、Linux等运维技术', 5),
('架构设计', '系统架构、微服务、分布式等', 6);

-- 插入默认标签
INSERT INTO tb_tag (name, color) VALUES
('Java', '#E76F00'),
('Spring Boot', '#6DB33F'),
('Vue.js', '#42B883'),
('React', '#61DAFB'),
('MySQL', '#4479A1'),
('Redis', '#DC382D'),
('Docker', '#2496ED'),
('微服务', '#FF6B6B'),
('算法', '#9B59B6'),
('面试', '#E74C3C');

