# 休闲游戏网站设计文档

## 项目结构

project-root/
├── src/
│   ├── components/        
│   │   ├── GameCard/     # 游戏卡片组件
│   │   ├── MasonryGrid/  # 瀑布流组件
│   │   ├── Ads/          # 广告组件
│   │   └── LanguageSelector/ # 语言选择器
│   ├── games/            
│   │   ├── game1/        
│   │   │   ├── components/   
│   │   │   ├── scenes/      
│   │   │   └── assets/      
│   │   └── game2/        
│   ├── layouts/          
│   │   └── MainLayout/   # 主布局（包含语言切换）
│   ├── pages/            
│   │   ├── Home/         # 首页（瀑布流展示）
│   │   └── Game/         # 游戏页面
│   ├── assets/           
│   ├── utils/            
│   ├── i18n/            # 国际化文件
│   │   ├── en/          # 英文翻译
│   │   ├── zh/          # 中文翻译
│   │   └── index.ts     # i18n 配置
│   ├── config/          # 配置文件
│   │   └── ads.ts       # 广告配置
│   ├── routes/           
│   ├── types/           
│   ├── App.tsx          
│   └── main.tsx         

## 技术栈

### 核心技术
- **React 18+**
- **TypeScript**
- **Vite**
- **Phaser 3**
- **react-i18next**: 国际化解决方案
- **react-masonry-css**: 瀑布流布局

### 路由管理
- **React Router 6**

### 样式方案
- **CSS Modules**
- **Tailwind CSS**

## 功能模块

### 1. 首页模块（瀑布流）
- 游戏卡片展示
  - 游戏预览图
  - 游戏名称
  - 游戏简介
  - 支持响应式布局
- 多语言支持
  - 中文
  - 英文
  - (可扩展其他语言)
- 广告展示
  - 瀑布流间隔广告
  - 侧边栏广告
  - 顶部横幅广告

### 2. 游戏模块
- 游戏画面展示
- 游戏控制
- 返回首页按钮
- 多语言界面
- 游戏页面广告位

## 组件实现

### 1. 瀑布流组件
```typescript
typescript
import Masonry from 'react-masonry-css';
const breakpointColumns = {
default: 4,
1100: 3,
700: 2,
500: 1
};
export const MasonryGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
return (
<Masonry
breakpointCols={breakpointColumns}
className="masonry-grid"
columnClassName="masonry-grid_column"
>
{children}
</Masonry>
);
};
```
### 2. 国际化配置
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './en';
import zhTranslation from './zh';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      zh: {
        translation: zhTranslation
      }
    },
    lng: 'zh', // 默认语言
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### 3. 游戏卡片组件
```typescript
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface GameCardProps {
  id: string;
  coverImage: string;
  title: string;
  description: string;
}

export const GameCard: React.FC<GameCardProps> = ({ id, coverImage, title, description }) => {
  const { t } = useTranslation();
  
  return (
    <Link to={`/game/${id}`} className="game-card">
      <img src={coverImage} alt={title} className="game-card__image" />
      <div className="game-card__content">
        <h3>{t(`games.${id}.title`)}</h3>
        <p>{t(`games.${id}.description`)}</p>
      </div>
    </Link>
  );
};
```

## 广告系统设计

### 1. 广告位置规划
- 首页广告位
  - 瀑布流之间的横幅广告（每 8-12 个游戏卡片插入一个广告）
  - 页面顶部横幅
  - 页面右侧边栏（固定位置）
- 游戏页面广告位
  - 游戏加载时的广告
  - 游戏界面两侧
  - 返回按钮附近

### 2. 广告组件
```typescript
import { useEffect } from 'react';

interface AdBannerProps {
  adSlot: string;
  format?: 'auto' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
}

export const AdBanner: React.FC<AdBannerProps> = ({ adSlot, format = 'auto', style }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      data-ad-slot={adSlot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
};
```

### 3. 广告配置
```typescript
export const ADS_CONFIG = {
  slots: {
    homePageTop: 'XXXXXXXXXX',
    homePageSidebar: 'XXXXXXXXXX',
    inGameBanner: 'XXXXXXXXXX',
    betweenGames: 'XXXXXXXXXX'
  },
  
  rules: {
    gameCardInterval: 8,
    showSidebarOnMobile: false,
    showPreGameAd: true
  }
};
```

## 性能优化

### 1. 资源加载
- 路由懒加载
- 游戏资源按需加载
- 资源预加载策略
- 广告懒加载

### 2. 渲染优化
- React 组件优化
- 游戏帧率优化
- 动画性能优化
- 广告加载优化

### 3. 缓存策略
- 静态资源缓存
- 游戏状态本地存储
- 图片资源优化

## 开发规范

### 1. 代码规范
- ESLint 配置
- Prettier 代码格式化
- TypeScript 严格模式

### 2. 国际化规范
- 所有文案必须使用 i18n key
- 翻译文件按模块组织
- 支持 HTML 标签的翻译内容

### 3. 组件规范
- 统一的卡片样式
- 响应式布局适配
- 统一的动画效果

## 部署策略

### 1. 开发环境
- 本地开发服务器
- 热更新支持

### 2. 生产环境
- 静态资源优化
- CDN 部署
- 监控告警
- 广告展示监控