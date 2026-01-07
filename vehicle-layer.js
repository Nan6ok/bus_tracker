class VehicleLayer {
    constructor(map) {
        this.map = map;
        this.markers = {};
        this.popup = null;
        this.highlightedRoute = null;
        
        this.initLayer();
    }
    
    initLayer() {
        // 等待地图加载完成
        this.map.on('load', () => {
            // 添加车辆图层源
            this.map.addSource('vehicles', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });
            
            // 添加车辆图层
            this.map.addLayer({
                id: 'vehicles-layer',
                type: 'circle',
                source: 'vehicles',
                paint: {
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        10, 4,
                        15, 8,
                        18, 12
                    ],
                    'circle-color': [
                        'match',
                        ['get', 'company'],
                        'KMB', COMPANY_COLORS.KMB,
                        'CTB', COMPANY_COLORS.CTB,
                        'NLB', COMPANY_COLORS.NLB,
                        'LWB', COMPANY_COLORS.LWB,
                        COMPANY_COLORS.default
                    ],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff',
                    'circle-opacity': 0.9
                }
            });
            
            // 添加鼠标悬停效果
            this.map.on('mouseenter', 'vehicles-layer', () => {
                this.map.getCanvas().style.cursor = 'pointer';
            });
            
            this.map.on('mouseleave', 'vehicles-layer', () => {
                this.map.getCanvas().style.cursor = '';
            });
            
            // 点击车辆事件
            this.map.on('click', 'vehicles-layer', (e) => {
                if (e.features && e.features.length > 0) {
                    const vehicle = e.features[0].properties;
                    if (app && app.onVehicleClick) {
                        app.onVehicleClick(vehicle);
                    }
                }
            });
        });
    }
    
    updateVehicles(vehicles) {
        if (!this.map.getSource('vehicles')) return;
        
        // 转换为GeoJSON格式
        const features = vehicles.map(vehicle => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [vehicle.position.lng, vehicle.position.lat]
            },
            properties: {
                vehicle_id: vehicle.vehicle_id,
                route_id: vehicle.route_id,
                company: vehicle.company,
                direction: vehicle.direction,
                speed: vehicle.speed,
                estimated_arrival: vehicle.estimated_arrival,
                occupancy: vehicle.occupancy,
                timestamp: vehicle.timestamp
            }
        }));
        
        // 更新数据源
        this.map.getSource('vehicles').setData({
            type: 'FeatureCollection',
            features: features
        });
        
        // 如果需要高亮特定线路
        if (this.highlightedRoute) {
            this.highlightRoute(this.highlightedRoute);
        }
    }
    
    highlightRoute(routeId) {
        this.highlightedRoute = routeId;
        
        // 设置过滤条件，只显示指定线路的车辆
        if (routeId) {
            this.map.setFilter('vehicles-layer', ['==', ['get', 'route_id'], routeId]);
            
            // 高亮显示
            this.map.setPaintProperty('vehicles-layer', 'circle-color', [
                'case',
                ['==', ['get', 'route_id'], routeId],
                '#FFD700', // 金黄色高亮
                [
                    'match',
                    ['get', 'company'],
                    'KMB', COMPANY_COLORS.KMB,
                    'CTB', COMPANY_COLORS.CTB,
                    'NLB', COMPANY_COLORS.NLB,
                    'LWB', COMPANY_COLORS.LWB,
                    COMPANY_COLORS.default
                ]
            ]);
        } else {
            // 清除高亮
            this.map.setFilter('vehicles-layer', null);
            this.map.setPaintProperty('vehicles-layer', 'circle-color', [
                'match',
                ['get', 'company'],
                'KMB', COMPANY_COLORS.KMB,
                'CTB', COMPANY_COLORS.CTB,
                'NLB', COMPANY_COLORS.NLB,
                'LWB', COMPANY_COLORS.LWB,
                COMPANY_COLORS.default
            ]);
        }
    }
    
    setVisible(visible) {
        if (this.map.getLayer('vehicles-layer')) {
            this.map.setLayoutProperty(
                'vehicles-layer',
                'visibility',
                visible ? 'visible' : 'none'
            );
        }
    }
    
    clear() {
        if (this.map.getSource('vehicles')) {
            this.map.getSource('vehicles').setData({
                type: 'FeatureCollection',
                features: []
            });
        }
    }
}
