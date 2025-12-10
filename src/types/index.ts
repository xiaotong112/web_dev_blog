export interface User {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  position?: string;
  company?: string;
  bio?: string;
  articleCount?: number;
  likeCount?: number;
  viewCount?: number;
  role?: 'USER' | 'ADMIN'; 
  status?: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  sortOrder?: number;
  articleCount?: number;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  articleCount?: number;
}

export interface Article {
  id: number;
  title: string;
  summary?: string;
  content: string;
  coverImage?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishTime?: string;
  createTime: string;
  updateTime: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';
  rejectReason?: string;
  author: User;
  category: Category;
  tags: Tag[];
  isLiked?: boolean;
}

export interface Draft {
    id: number;
    userId: number;
    articleId?: number;
    title: string;
    content: string;
    createTime: string;
    updateTime: string;
}

export interface Comment {
  id: number;
  content: string;
  createTime: string;
  user: User;
  parentId?: number;
  children?: Comment[];
  replies?: Comment[]; // Backend returns 'replies'
}

export interface PageResult<T> {
  code: number;
  message: string;
  data: {
    total: number;
    pages: number;
    current: number;
    records: T[];
  };
}

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}
