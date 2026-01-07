// Mapbox 配置
const MAPBOX_CONFIG = {
    accessToken: 'YOUR_MAPBOX_TOKEN_HERE', // 替换为您的token
    style: 'mapbox://styles/mapbox/streets-v12', // 地图样式
    center: [114.1694, 22.3193], // 香港中心坐标 [lng, lat]
    zoom: 12,
    minZoom: 10,
    maxZoom: 18
};

// 后端API配置
const API_CONFIG = {
    baseUrl: 'http://localhost:5000/api', // 您的后端地址
    endpoints: {
        vehicles: '/vehicles',
        routes: '/routes',
        eta: '/eta',
        stats: '/stats'
    },
    updateInterval: 15000, // 15秒更新一次
    maxRetries: 3
};

// 公司颜色配置
const COMPANY_COLORS = {
    'KMB': '#E21836', // 九巴红
    'CTB': '#1E5AA8', // 城巴蓝
    'NLB': '#00A651', // 新大屿山绿
    'LWB': '#FF6600', // 龙运橙
    'GMB': '#6A1B9A'  // 小巴紫
};

// 车辆图标配置
const VEHICLE_ICONS = {
    moving: '🚌',
    stopped: '⏸️',
    delayed: '⚠️',
    default: '📍'
};
