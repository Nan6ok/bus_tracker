// 香港公交追踪应用
class HongKongBusTracker {
    constructor() {
        this.map = null;
        this.markers = [];
        this.vehicles = [];
        this.filteredVehicles = [];
        this.currentFilters = {
            company: '',
            route: ''
        };
        
        this.init();
    }
    
    async init() {
        try {
            // 初始化地图
            this.initMap();
            
            // 绑定事件
            this.bindEvents();
            
            // 加载初始数据
            await this.loadInitialData();
            
            // 开始模拟实时更新
            this.startSimulation();
            
            console.log('香港公交追踪系统已启动');
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.showMessage('系统初始化失败，请刷新页面重试', 'error');
        }
    }
    
    initMap() {
        // 设置Mapbox token
        mapboxgl.accessToken = MAPBOX_TOKEN;
        
        // 初始化地图
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [114.1694, 22.3193], // 香港中心
            zoom: 12,
            minZoom: 10,
            maxZoom: 18
        });
        
        // 添加导航控件
        this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // 地图加载完成后
        this.map.on('load', () => {
            console.log('地图加载完成');
            this.showMessage('地图加载完成，正在获取公交数据...', 'success');
        });
    }
    
    bindEvents() {
        // 公司筛选按钮
        document.querySelectorAll('.company-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 更新按钮状态
                document.querySelectorAll('.company-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // 更新筛选条件
                this.currentFilters.company = e.target.dataset.company || '';
                this.applyFilters();
            });
        });
        
        // 线路筛选输入
        document.getElementById('route-filter').addEventListener('input', (e) => {
            this.currentFilters.route = e.target.value.trim();
            this.applyFilters();
        });
        
        // 刷新按钮
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refreshData();
        });
        
        // 定位按钮
        document.getElementById('locate-btn').addEventListener('click', () => {
            this.locateUser();
        });
        
        // 全屏按钮
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // 地图控制按钮
        document.getElementById('zoom-in').addEventListener('click', () => {
            this.map.zoomIn();
        });
        
        document.getElementById('zoom-out').addEventListener('click', () => {
            this.map.zoomOut();
        });
        
        document.getElementById('reset-view').addEventListener('click', () => {
            this.map.flyTo({
                center: [114.1694, 22.3193],
                zoom: 12,
                duration: 1000
            });
        });
        
        // 关闭车辆详情卡片
        document.querySelector('.close-btn').addEventListener('click', () => {
            document.getElementById('vehicle-details').classList.add('hidden');
        });
        
        // 点击地图其他地方关闭详情卡片
        this.map.on('click', () => {
            document.getElementById('vehicle-details').classList.add('hidden');
        });
    }
    
    async loadInitialData() {
        try {
            // 生成模拟车辆数据
            this.generateMockVehicles();
            
            // 更新统计信息
            this.updateStats();
            
            // 在地图上显示车辆
            this.displayVehicles();
            
            this.showMessage(`已加载 ${this.vehicles.length} 辆巴士数据`, 'success');
            
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showMessage('加载公交数据失败', 'error');
        }
    }
    
    generateMockVehicles() {
        // 香港主要巴士线路和坐标范围
        const routes = [
            { id: '101', company: 'KMB', name: '堅尼地城 ↔ 觀塘' },
            { id: '104', company: 'KMB', name: '堅尼地城 ↔ 白田' },
            { id: '112', company: 'KMB', name: '北角 ↔ 蘇屋' },
            { id: '968', company: 'KMB', name: '元朗 ↔ 銅鑼灣' },
            { id: 'A11', company: 'CTB', name: '北角碼頭 ↔ 機場' },
            { id: 'B3', company: 'CTB', name: '屯門 ↔ 深圳灣' },
            { id: '1', company: 'NLB', name: '梅窩 ↔ 大澳' },
            { id: '2', company: 'NLB', name: '梅窩 ↔ 昂坪' },
            { id: 'E21', company: 'CTB', name: '大角咀 ↔ 航天城' },
            { id: 'E22', company: 'CTB', name: '藍田 ↔ 航天城' }
        ];
        
        // 香港主要区域坐标范围
        const areas = {
            '香港岛': { center: [114.1586, 22.2855], range: 0.03 },
            '九龙': { center: [114.1717, 22.3193], range: 0.04 },
            '新界东': { center: [114.2036, 22.3824], range: 0.05 },
            '新界西': { center: [114.1269, 22.3746], range: 0.06 },
            '大屿山': { center: [113.9414, 22.2670], range: 0.04 }
        };
        
        this.vehicles = [];
        const areaKeys = Object.keys(areas);
        
        // 生成50辆模拟车辆
        for (let i = 1; i <= 50; i++) {
            const route = routes[Math.floor(Math.random() * routes.length)];
            const areaKey = areaKeys[Math.floor(Math.random() * areaKeys.length)];
            const area = areas[areaKey];
            
            // 在区域内随机生成坐标
            const lng = area.center[0] + (Math.random() - 0.5) * area.range;
            const lat = area.center[1] + (Math.random() - 0.5) * area.range;
            
            // 随机速度 0-50 km/h
            const speed = Math.floor(Math.random() * 50);
            
            // 随机方向
            const directions = ['往東', '往西', '往南', '往北', '往觀塘', '往中環', '往機場'];
            const direction = directions[Math.floor(Math.random() * directions.length)];
            
            // 随机载客率
            const occupancies = ['低', '中', '高', '滿座'];
            const occupancy = occupancies[Math.floor(Math.random() * occupancies.length)];
            
            this.vehicles.push({
                id: `vehicle_${i}`,
                route_id: route.id,
                company: route.company,
                route_name: route.name,
                position: {
                    lat: lat,
                    lng: lng
                },
                speed: speed,
                direction: direction,
                occupancy: occupancy,
                last_update: new Date().toISOString()
            });
        }
        
        this.filteredVehicles = [...this.vehicles];
    }
    
    displayVehicles() {
        // 清除现有的标记
        this.clearMarkers();
        
        // 为每辆车创建标记
        this.filteredVehicles.forEach(vehicle => {
            // 创建自定义标记元素
            const el = document.createElement('div');
            el.className = 'marker';
            el.innerHTML = this.getVehicleIcon(vehicle.company);
            
            // 创建标记
            const marker = new mapboxgl.Marker({
                element: el,
                anchor: 'center'
            })
            .setLngLat([vehicle.position.lng, vehicle.position.lat])
            .addTo(this.map);
            
            // 添加点击事件
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showVehicleDetails(vehicle);
            });
            
            // 添加弹出窗口
            const popup = new mapboxgl.Popup({
                offset: 25,
                closeButton: false
            }).setHTML(`
                <div class="popup-content">
                    <h3>${vehicle.route_id} 路</h3>
                    <p><strong>公司:</strong> ${vehicle.company}</p>
                    <p><strong>方向:</strong> ${vehicle.direction}</p>
                    <p><strong>速度:</strong> ${vehicle.speed} km/h</p>
                    <p><strong>载客:</strong> ${vehicle.occupancy}</p>
                </div>
            `);
            
            marker.setPopup(popup);
            
            // 保存标记引用
            this.markers.push({
                marker: marker,
                vehicle: vehicle
            });
        });
    }
    
    getVehicleIcon(company) {
        const colors = {
            'KMB': '#E21836',
            'CTB': '#1E5AA8',
            'NLB': '#00A651',
            'LWB': '#FF6600'
        };
        
        const color = colors[company] || '#666666';
        
        return `
            <svg width="30" height="30" viewBox="0 0 30 30">
                <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="2"/>
                <path d="M8,15 L22,15 M15,8 L15,22" stroke="white" stroke-width="2"/>
            </svg>
        `;
    }
    
    clearMarkers() {
        this.markers.forEach(item => {
            item.marker.remove();
        });
        this.markers = [];
    }
    
    applyFilters() {
        this.filteredVehicles = this.vehicles.filter(vehicle => {
            let passes = true;
            
            // 公司筛选
            if (this.currentFilters.company) {
                passes = passes && vehicle.company === this.currentFilters.company;
            }
            
            // 线路筛选
            if (this.currentFilters.route) {
                passes = passes && vehicle.route_id.includes(this.currentFilters.route);
            }
            
            return passes;
        });
        
        // 重新显示车辆
        this.displayVehicles();
        
        // 更新统计信息
        this.updateStats();
    }
    
    updateStats() {
        // 更新车辆数量
        document.getElementById('vehicle-count').textContent = this.filteredVehicles.length;
        
        // 计算显示的不同线路数量
        const routeSet = new Set(this.filteredVehicles.map(v => v.route_id));
        document.getElementById('route-count').textContent = routeSet.size;
        
        // 更新时间
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-HK', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('update-time').textContent = timeStr;
    }
    
    showVehicleDetails(vehicle) {
        const card = document.getElementById('vehicle-details');
        const body = card.querySelector('.card-body');
        
        // 计算ETA（模拟）
        const etaMinutes = Math.floor(Math.random() * 30) + 1;
        
        body.innerHTML = `
            <div class="vehicle-info">
                <div class="info-header">
                    <span class="company-badge" style="background: ${this.getCompanyColor(vehicle.company)}">
                        ${vehicle.company}
                    </span>
                    <h2>${vehicle.route_id} 路</h2>
                </div>
                
                <div class="info-details">
                    <p><i class="fas fa-route"></i> <strong>线路:</strong> ${vehicle.route_name}</p>
                    <p><i class="fas fa-compass"></i> <strong>方向:</strong> ${vehicle.direction}</p>
                    
                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fas fa-tachometer-alt"></i>
                            <div>
                                <div class="label">速度</div>
                                <div class="value">${vehicle.speed} km/h</div>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <div class="label">预计到达</div>
                                <div class="value">${etaMinutes} 分钟</div>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-users"></i>
                            <div>
                                <div class="label">载客率</div>
                                <div class="value">${vehicle.occupancy}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="coordinates">
                        <p><i class="fas fa-map-marker-alt"></i> <strong>位置:</strong></p>
                        <p>纬度: ${vehicle.position.lat.toFixed(6)}</p>
                        <p>经度: ${vehicle.position.lng.toFixed(6)}</p>
                    </div>
                    
                    <div class="update-info">
                        <i class="fas fa-sync-alt"></i> 
                        更新时间: ${new Date(vehicle.last_update).toLocaleTimeString('zh-HK')}
                    </div>
                </div>
                
                <div class="actions">
                    <button class="btn small" onclick="busTracker.centerOnVehicle('${vehicle.id}')">
                        <i class="fas fa-search-location"></i> 定位车辆
                    </button>
                </div>
            </div>
        `;
        
        card.classList.remove('hidden');
    }
    
    getCompanyColor(company) {
        const colors = {
            'KMB': '#E21836',
            'CTB': '#1E5AA8',
            'NLB': '#00A651',
            'LWB': '#FF6600'
        };
        return colors[company] || '#666666';
    }
    
    centerOnVehicle(vehicleId) {
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            this.map.flyTo({
                center: [vehicle.position.lng, vehicle.position.lat],
                zoom: 16,
                duration: 1000
            });
            
            this.showMessage(`已定位到车辆 ${vehicle.route_id}`, 'info');
        }
    }
    
    refreshData() {
        // 轻微更新车辆位置（模拟移动）
        this.vehicles.forEach(vehicle => {
            // 随机移动一小段距离
            const moveLng = (Math.random() - 0.5) * 0.002;
            const moveLat = (Math.random() - 0.5) * 0.002;
            
            vehicle.position.lng += moveLng;
            vehicle.position.lat += moveLat;
            
            // 更新速度
            vehicle.speed = Math.floor(Math.random() * 50);
            vehicle.last_update = new Date().toISOString();
        });
        
        // 重新应用筛选并显示
        this.applyFilters();
        
        this.showMessage('数据已更新', 'success');
    }
    
    locateUser() {
        if (!navigator.geolocation) {
            this.showMessage('您的浏览器不支持地理定位', 'warning');
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
                    color: '#3498db',
                    scale: 1.2
                })
                .setLngLat([longitude, latitude])
                .setPopup(new mapboxgl.Popup().setHTML('<h3>您的位置</h3>'))
                .addTo(this.map);
                
                this.showMessage('已定位到您的位置', 'success');
            },
            (error) => {
                this.showMessage(`定位失败: ${error.message}`, 'error');
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
    
    startSimulation() {
        // 每30秒模拟更新一次数据
        setInterval(() => {
            this.refreshData();
        }, 30000);
        
        console.log('模拟更新已启动 (30秒间隔)');
    }
    
    showMessage(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // 在实际应用中，这里可以显示一个toast通知
        // 这里我们简单地在控制台显示
    }
}

// 创建全局实例
let busTracker;

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    busTracker = new HongKongBusTracker();
});

// 导出到全局作用域（用于按钮点击事件）
window.busTracker = busTracker;
