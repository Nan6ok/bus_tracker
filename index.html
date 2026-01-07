<!DOCTYPE html>
<html lang="zh-HK">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>香港公交实时追踪系统 | Hong Kong Bus Tracker</title>
    
    <!-- Mapbox GL JS -->
    <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
    <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
    
    <!-- Mapbox Directions -->
    <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.1/mapbox-gl-directions.js"></script>
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.1/mapbox-gl-directions.css" />
    
    <!-- 字体和图标 -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- 自定义样式 -->
    <link rel="stylesheet" href="styles.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚌</text></svg>">
</head>
<body>
    <!-- 主容器 -->
    <div class="app-container">
        <!-- 侧边栏 -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <h1><i class="fas fa-bus"></i> 香港公交实时追踪</h1>
                <p class="subtitle">Hong Kong Real-time Bus Tracker</p>
            </div>
            
            <!-- 控制面板 -->
            <div class="control-panel">
                <!-- 筛选器 -->
                <div class="filter-section">
                    <h3><i class="fas fa-filter"></i> 筛选设置</h3>
                    
                    <div class="filter-group">
                        <label for="company-filter"><i class="fas fa-building"></i> 巴士公司</label>
                        <div class="company-buttons">
                            <button class="company-btn active" data-company="">全部</button>
                            <button class="company-btn" data-company="KMB" style="background-color: #E21836;">九巴</button>
                            <button class="company-btn" data-company="CTB" style="background-color: #1E5AA8;">城巴</button>
                            <button class="company-btn" data-company="NLB" style="background-color: #00A651;">屿巴</button>
                        </div>
                    </div>
                    
                    <div class="filter-group">
                        <label for="route-filter"><i class="fas fa-route"></i> 线路筛选</label>
                        <input type="text" id="route-filter" placeholder="输入线路编号 (如: 101, 968)">
                    </div>
                    
                    <div class="filter-group">
                        <label><i class="fas fa-sliders-h"></i> 显示选项</label>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="show-route-lines" checked>
                                <span>显示线路路径</span>
                            </label>
                            <label>
                                <input type="checkbox" id="show-stops" checked>
                                <span>显示巴士站</span>
                            </label>
                            <label>
                                <input type="checkbox" id="show-vehicle-info" checked>
                                <span>车辆信息弹窗</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- 统计信息 -->
                <div class="stats-section">
                    <h3><i class="fas fa-chart-bar"></i> 实时统计</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value" id="total-vehicles">0</div>
                            <div class="stat-label">活跃车辆</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="total-routes">0</div>
                            <div class="stat-label">线路数量</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="kmb-count">0</div>
                            <div class="stat-label">九巴</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="ctb-count">0</div>
                            <div class="stat-label">城巴</div>
                        </div>
                    </div>
                    <div class="update-time">
                        <i class="fas fa-sync-alt"></i> 最后更新: <span id="last-update">--:--:--</span>
                    </div>
                </div>
                
                <!-- 线路搜索 -->
                <div class="search-section">
                    <h3><i class="fas fa-search"></i> 线路搜索</h3>
                    <div class="search-box">
                        <input type="text" id="route-search" placeholder="搜索线路或目的地">
                        <button id="search-btn"><i class="fas fa-search"></i></button>
                    </div>
                    <div class="search-results" id="search-results">
                        <!-- 搜索结果将在这里显示 -->
                    </div>
                </div>
                
                <!-- 快捷操作 -->
                <div class="actions-section">
                    <button id="refresh-btn" class="action-btn primary">
                        <i class="fas fa-sync-alt"></i> 立即刷新
                    </button>
                    <button id="locate-btn" class="action-btn">
                        <i class="fas fa-location-arrow"></i> 定位到我
                    </button>
                    <button id="fullscreen-btn" class="action-btn">
                        <i class="fas fa-expand"></i> 全屏地图
                    </button>
                </div>
            </div>
            
            <!-- 页脚 -->
            <footer class="sidebar-footer">
                <p>数据来源: 运输署公开数据</p>
                <p>更新时间: <span id="data-update-time">--:--:--</span></p>
                <div class="version">v1.0.0</div>
            </footer>
        </aside>
        
        <!-- 地图容器 -->
        <main class="map-container">
            <div id="map"></div>
            
            <!-- 地图控制按钮 -->
            <div class="map-controls">
                <button class="map-control-btn" id="zoom-in">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="map-control-btn" id="zoom-out">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="map-control-btn" id="reset-view">
                    <i class="fas fa-home"></i>
                </button>
                <button class="map-control-btn" id="toggle-traffic">
                    <i class="fas fa-car"></i>
                </button>
            </div>
            
            <!-- 车辆详情面板（浮动） -->
            <div class="vehicle-details-panel" id="vehicle-details">
                <div class="panel-header">
                    <h3>车辆详情</h3>
                    <button class="close-btn" id="close-details">&times;</button>
                </div>
                <div class="panel-content">
                    <div class="loading">选择一辆巴士查看详情...</div>
                </div>
            </div>
            
            <!-- 地图图例 -->
            <div class="map-legend">
                <h4><i class="fas fa-key"></i> 图例</h4>
                <div class="legend-item">
                    <span class="legend-color" style="background-color: #E21836;"></span>
                    <span>九巴 KMB</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background-color: #1E5AA8;"></span>
                    <span>城巴 CTB</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background-color: #00A651;"></span>
                    <span>新大屿山 NLB</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background-color: #6A1B9A;"></span>
                    <span>其他 Others</span>
                </div>
            </div>
        </main>
        
        <!-- 通知Toast -->
        <div class="toast-container" id="toast-container"></div>
    </div>
    
    <!-- JavaScript文件 -->
    <script src="config.js"></script>
    <script src="app.js"></script>
    <script src="vehicle-layer.js"></script>
    <script src="route-layer.js"></script>
    
    <script>
        // 初始化检查
        document.addEventListener('DOMContentLoaded', function() {
            if (!MAPBOX_CONFIG.accessToken || MAPBOX_CONFIG.accessToken === 'YOUR_MAPBOX_TOKEN_HERE') {
                alert('请先在config.js中设置您的Mapbox访问令牌！');
            }
        });
    </script>
</body>
</html>
