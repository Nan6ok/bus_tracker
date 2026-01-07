class BusTrackerApp {
    constructor() {
        this.map = null;
        this.vehicleLayer = null;
        this.routeLayer = null;
        this.vehicles = [];
        this.filteredVehicles = [];
        this.routes = [];
        this.activeFilters = {
            company: '',
            route: ''
        };
        this.isInitialized = false;
        this.updateInterval = null;
        
        this.init();
    }
    
    async init() {
        try {
            // 检查Mapbox token
            if (!MAPBOX_CONFIG.accessToken || MAPBOX_CONFIG.accessToken === 'YOUR_MAPBOX_TOKEN_HERE') {
                this.showToast('请设置Mapbox访问令牌', 'error');
                return;
            }
            
            // 设置Mapbox token
            mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;
            
            // 初始化地图
            this.initMap();
            
            // 初始化图层管理器
            this.vehicleLayer = new VehicleLayer(this.map);
            this.routeLayer = new RouteLayer(this.map);
            
            // 绑定事件
            this.bindEvents();
            
            // 加载初始数据
            await this.loadInitialData();
            
            // 开始定时更新
            this.startAutoUpdate();
            
            this.isInitialized = true;
            this.showToast('系统初始化完成', 'success');
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.showToast(`初始化失败: ${error.message}`, 'error');
        }
    }
    
    initMap() {
        this.map = new mapboxgl.Map({
            container: 'map',
            style: MAPBOX_CONFIG.style,
            center: MAPBOX_CONFIG.center,
            zoom: MAPBOX_CONFIG.zoom,
            minZoom: MAPBOX_CONFIG.minZoom,
            maxZoom: MAPBOX_CONFIG.maxZoom,
            attributionControl: false
        });
        
        // 添加导航控件
        this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // 添加全屏控件
        this.map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
        
        // 添加比例尺
        this.map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
        
        // 地图加载完成后
        this.map.on('load', () => {
            console.log('地图加载完成');
            
            // 添加交通流量图层（可选）
            this.map.addLayer({
                id: 'traffic-layer',
                type: 'line',
                source: {
                    type: 'vector',
                    url: 'mapbox://mapbox.mapbox-traffic-v1'
                },
                'source-layer': 'traffic',
                paint: {
                    'line-width': 2,
                    'line-color': [
                        'case',
                        ['==', ['get', 'congestion'], 'low'],
                        '#4CAF50',
                        ['==', ['get', 'congestion'], 'moderate'],
                        '#FFC107',
                        ['==', ['get', 'congestion'], 'heavy'],
                        '#F44336',
                        ['==', ['get', 'congestion'], 'severe'],
                        '#9C27B0',
                        '#CCCCCC'
                    ],
                    'line-opacity': 0.6
                }
            });
            
            // 默认隐藏交通图层
            this.map.setLayoutProperty('traffic-layer', 'visibility', 'none');
        });
    }
    
    bindEvents() {
        // 公司筛选按钮
        document.querySelectorAll('.company-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.company-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const company = e.target.dataset.company || '';
                this.activeFilters.company = company;
                this.applyFilters();
            });
        });
        
        // 线路筛选输入
        document.getElementById('route-filter').addEventListener('input', (e) => {
            this.activeFilters.route = e.target.value.trim();
            this.applyFilters();
        });
        
        // 显示选项
        document.getElementById('show-route-lines').addEventListener('change', (e) => {
            this.routeLayer.setVisible(e.target.checked);
        });
        
        document.getElementById('show-stops').addEventListener('change', (e) => {
            // 控制巴士站显示
            this.showToast('巴士站显示功能开发中', 'info');
        });
        
        // 搜索功能
        document.getElementById('search-btn').addEventListener('click', () => this.searchRoutes());
        document.getElementById('route-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchRoutes();
        });
        
        // 操作按钮
        document.getElementById('refresh-btn').addEventListener('click', () => this.loadVehicleData());
        document.getElementById('locate-btn').addEventListener('click', () => this.locateUser());
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        
        // 地图控制按钮
        document.getElementById('zoom-in').addEventListener('click', () => this.map.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.map.zoomOut());
        document.getElementById('reset-view').addEventListener('click', () => {
            this.map.flyTo({
                center: MAPBOX_CONFIG.center,
                zoom: MAPBOX_CONFIG.zoom,
                duration: 1000
            });
        });
        
        document.getElementById('toggle-traffic').addEventListener('click', () => {
            const isVisible = this.map.getLayoutProperty('traffic-layer', 'visibility') === 'visible';
            this.map.setLayoutProperty('traffic-layer', 'visibility', isVisible ? 'none' : 'visible');
            
            const icon = document.querySelector('#toggle-traffic i');
            icon.className = isVisible ? 'fas fa-car' : 'fas fa-car active';
            this.showToast(isVisible ? '隐藏交通流量' : '显示交通流量', 'info');
        });
        
        // 车辆详情面板关闭按钮
        document.getElementById('close-details').addEventListener('click', () => {
            document.getElementById('vehicle-details').classList.remove('active');
        });
        
        // 点击地图其他地方关闭详情面板
        this.map.on('click', () => {
            document.getElementById('vehicle-details').classList.remove('active');
        });
    }
    
    async loadInitialData() {
        try {
            // 加载线路数据
            const routesResponse = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.routes}`);
            const routesData = await routesResponse.json();
            
            if (routesData.status === 'success') {
                this.routes = routesData.data;
                this.updateStats();
            }
            
            // 加载车辆数据
            await this.loadVehicleData();
            
        } catch (error) {
            console.error('加载初始数据失败:', error);
            this.showToast('加载数据失败，请检查后端连接', 'error');
        }
    }
    
    async loadVehicleData() {
        try {
            // 构建查询参数
            const params = new URLSearchParams();
            if (this.activeFilters.company) params.append('company', this.activeFilters.company);
            if (this.activeFilters.route) params.append('route', this.activeFilters.route);
            
            const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.vehicles}?${params.toString()}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === 'success') {
                this.vehicles = data.vehicles;
                this.filteredVehicles = this.vehicles;
                
                // 更新车辆图层
                this.vehicleLayer.updateVehicles(this.vehicles);
                
                // 更新统计信息
                this.updateStats();
                
                // 更新最后更新时间
                this.updateLastUpdateTime();
                
                // 显示成功消息
                this.showToast(`已更新 ${this.vehicles.length} 辆巴士位置`, 'success');
            }
            
        } catch (error) {
            console.error('加载车辆数据失败:', error);
            this.showToast('更新车辆数据失败', 'error');
        }
    }
    
    applyFilters() {
        this.filteredVehicles = this.vehicles.filter(vehicle => {
            let passes = true;
            
            if (this.activeFilters.company) {
                passes = passes && vehicle.company === this.activeFilters.company;
            }
            
            if (this.activeFilters.route) {
                passes = passes && vehicle.route_id.includes(this.activeFilters.route);
            }
            
            return passes;
        });
        
        // 更新车辆图层
        this.vehicleLayer.updateVehicles(this.filteredVehicles);
        
        // 更新显示数量
        document.getElementById('display-count').textContent = this.filteredVehicles.length;
    }
    
    updateStats() {
        // 更新统计信息
        document.getElementById('total-vehicles').textContent = this.vehicles.length;
        document.getElementById('total-routes').textContent = this.routes.length;
        
        // 按公司统计
        const kmbCount = this.vehicles.filter(v => v.company === 'KMB').length;
        const ctbCount = this.vehicles.filter(v => v.company === 'CTB').length;
        const nlbCount = this.vehicles.filter(v => v.company === 'NLB').length;
        
        document.getElementById('kmb-count').textContent = kmbCount;
        document.getElementById('ctb-count').textContent = ctbCount;
        document.getElementById('nlb-count').textContent = nlbCount;
        
        // 更新显示车辆数量
        document.getElementById('display-count').textContent = this.filteredVehicles.length;
    }
    
    updateLastUpdateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-HK');
        document.getElementById('last-update').textContent = timeStr;
        
        // 同时更新数据更新时间
        document.getElementById('data-update-time').textContent = timeStr;
    }
    
    async searchRoutes() {
        const query = document.getElementById('route-search').value.trim();
        if (!query) return;
        
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '<div class="loading">搜索中...</div>';
        
        try {
            // 这里可以调用后端的搜索API，暂时使用前端过滤
            const filteredRoutes = this.routes.filter(route => {
                const routeNum = route.route_number || route.route_id;
                const origin = route.origin?.tc || '';
                const dest = route.destination?.tc || '';
                
                return routeNum.includes(query) || 
                       origin.includes(query) || 
                       dest.includes(query);
            });
            
            if (filteredRoutes.length === 0) {
                resultsContainer.innerHTML = '<div class="no-results">未找到相关线路</div>';
                return;
            }
            
            // 显示搜索结果
            let html = '<div class="search-results-list">';
            filteredRoutes.slice(0, 10).forEach(route => {
                html += `
                    <div class="search-result-item" data-route="${route.route_id}">
                        <div class="route-number">${route.route_number || route.route_id}</div>
                        <div class="route-info">
                            <div>${route.origin?.tc || ''} → ${route.destination?.tc || ''}</div>
                            <div class="company-tag">${route.company}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            resultsContainer.innerHTML = html;
            
            // 绑定点击事件
            document.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const routeId = item.dataset.route;
                    this.zoomToRoute(routeId);
                });
            });
            
        } catch (error) {
            console.error('搜索失败:', error);
            resultsContainer.innerHTML = '<div class="error">搜索出错</div>';
        }
    }
    
    zoomToRoute(routeId) {
        // 找到该线路的车辆
        const routeVehicles = this.vehicles.filter(v => v.route_id === routeId);
        
        if (routeVehicles.length > 0) {
            // 计算所有车辆的中心点
            const lngs = routeVehicles.map(v => v.position.lng);
            const lats = routeVehicles.map(v => v.position.lat);
            
            const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
            const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
            
            this.map.flyTo({
                center: [centerLng, centerLat],
                zoom: 14,
                duration: 1000
            });
            
            // 高亮显示该线路的车辆
            this.vehicleLayer.highlightRoute(routeId);
            
            this.showToast(`已定位到线路 ${routeId}`, 'info');
        } else {
            this.showToast(`线路 ${routeId} 当前没有活跃车辆`, 'warning');
        }
    }
    
    locateUser() {
        if (!navigator.geolocation) {
            this.showToast('您的浏览器不支持地理定位', 'warning');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { longitude, latitude } = position.coords;
                
                this.map.flyTo({
                    center: [longitude, latitude],
                    zoom: 15,
                    duration: 1000
                });
                
                // 添加用户位置标记
                new mapboxgl.Marker({
                    color: '#4dabf7',
                    scale: 1.2
                })
                .setLngLat([longitude, latitude])
                .setPopup(new mapboxgl.Popup().setHTML('<h3>您的位置</h3>'))
                .addTo(this.map);
                
                this.showToast('已定位到您的位置', 'success');
            },
            (error) => {
                this.showToast(`定位失败: ${error.message}`, 'error');
            }
        );
    }
    
    toggleFullscreen() {
        const elem = document.documentElement;
        
        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    startAutoUpdate() {
        // 清除现有的定时器
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // 设置新的定时器
        this.updateInterval = setInterval(() => {
            this.loadVehicleData();
        }, API_CONFIG.updateInterval);
        
        console.log(`已启动自动更新，间隔: ${API_CONFIG.updateInterval/1000}秒`);
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // 图标映射
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // 3秒后自动移除
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // 车辆点击事件处理
    onVehicleClick(vehicle) {
        const panel = document.getElementById('vehicle-details');
        const content = document.querySelector('.panel-content');
        
        // 计算ETA时间
        let etaText = '未知';
        if (vehicle.estimated_arrival) {
            const etaTime = new Date(vehicle.estimated_arrival);
            const now = new Date();
            const diffMinutes = Math.round((etaTime - now) / 60000);
            
            if (diffMinutes > 0) {
                etaText = `${diffMinutes}分钟后`;
            } else if (diffMinutes === 0) {
                etaText = '即将到达';
            } else {
                etaText = '已过时';
            }
        }
        
        // 更新面板内容
        content.innerHTML = `
            <div class="vehicle-detail-header">
                <div class="vehicle-id">
                    <span class="company-badge" style="background-color: ${COMPANY_COLORS[vehicle.company] || '#666'}">
                        ${vehicle.company}
                    </span>
                    <h2>${vehicle.route_id} 路</h2>
                </div>
                <div class="vehicle-status">
                    <span class="status-indicator ${vehicle.speed > 5 ? 'moving' : 'stopped'}">
                        ${vehicle.speed > 5 ? '行驶中' : '停靠中'}
                    </span>
                </div>
            </div>
            
            <div class="vehicle-info-grid">
                <div class="info-item">
                    <label><i class="fas fa-tachometer-alt"></i> 速度</label>
                    <div class="info-value">${vehicle.speed || 0} km/h</div>
                </div>
                <div class="info-item">
                    <label><i class="fas fa-clock"></i> 预计到达</label>
                    <div class="info-value">${etaText}</div>
                </div>
                <div class="info-item">
                    <label><i class="fas fa-compass"></i> 方向</label>
                    <div class="info-value">${vehicle.direction || '未知'}</div>
                </div>
                <div class="info-item">
                    <label><i class="fas fa-users"></i> 载客率</label>
                    <div class="info-value">${vehicle.occupancy || '未知'}</div>
                </div>
            </div>
            
            <div class="vehicle-position">
                <h4><i class="fas fa-map-marker-alt"></i> 位置信息</h4>
                <div class="coordinates">
                    纬度: ${vehicle.position.lat.toFixed(6)}<br>
                    经度: ${vehicle.position.lng.toFixed(6)}
                </div>
            </div>
            
            <div class="vehicle-timestamp">
                <i class="fas fa-sync-alt"></i> 更新时间: ${new Date(vehicle.timestamp).toLocaleTimeString('zh-HK')}
            </div>
            
            <div class="vehicle-actions">
                <button class="action-btn small" onclick="app.zoomToVehicle('${vehicle.vehicle_id}')">
                    <i class="fas fa-search-location"></i> 定位车辆
                </button>
                <button class="action-btn small" onclick="app.trackVehicle('${vehicle.vehicle_id}')">
                    <i class="fas fa-satellite"></i> 开始追踪
                </button>
            </div>
        `;
        
        // 显示面板
        panel.classList.add('active');
    }
    
    zoomToVehicle(vehicleId) {
        const vehicle = this.vehicles.find(v => v.vehicle_id === vehicleId);
        if (vehicle) {
            this.map.flyTo({
                center: [vehicle.position.lng, vehicle.position.lat],
                zoom: 16,
                duration: 1000
            });
            
            this.showToast(`已定位到车辆 ${vehicle.route_id}`, 'info');
        }
    }
    
    trackVehicle(vehicleId) {
        // 这里可以实现车辆追踪功能
        this.showToast('车辆追踪功能开发中', 'info');
    }
}

// 全局应用实例
let app;

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    app = new BusTrackerApp();
});
