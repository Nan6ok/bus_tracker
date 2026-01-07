# 香港公交实时追踪系统

这是一个展示香港公交车辆实时位置的Web应用，使用Mapbox GL JS构建。

## 功能特性

- 🚌 显示香港主要巴士公司的车辆位置（KMB、CTB、NLB、LWB）
- 🗺️ 基于Mapbox的交互式地图
- 🔍 按公司和线路筛选车辆
- 📊 实时统计信息
- 📱 响应式设计，适配移动设备
- 🎯 点击车辆查看详细信息
- 📍 用户位置定位功能

## 在线演示

访问: [https://nan6ok.github.io/bus_tracker/](https://nan6ok.github.io/bus_tracker/)

## 本地运行

1. 克隆或下载此仓库
2. 打开 `index.html` 在浏览器中运行
3. 无需服务器，直接运行

## 技术栈

- HTML5 / CSS3 / JavaScript
- Mapbox GL JS (地图渲染)
- Font Awesome (图标)

## 数据说明

当前版本使用模拟数据展示系统功能。数据每30秒自动更新，模拟车辆在港岛、九龙、新界和大屿山等区域的移动。

## 配置Mapbox Token

1. 访问 [Mapbox官网](https://www.mapbox.com/) 注册账号
2. 获取您的访问令牌 (Access Token)
3. 在 `index.html` 文件中替换 `MAPBOX_TOKEN` 变量

## 部署到GitHub Pages

1. 将文件推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择 `main` 分支和 `/` 根目录
4. 等待部署完成，访问您的页面

## 截图

![截图](https://via.placeholder.com/800x450/3498db/ffffff?text=香港公交实时追踪系统)

## 许可证

MIT License

## 作者

您的名字/组织

## 更新日志

### v1.0.0 (2024)
- 初始版本发布
- 基本车辆追踪功能
- 公司/线路筛选
- 响应式设计
