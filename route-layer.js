class RouteLayer {
    constructor(map) {
        this.map = map;
        this.routes = {};
        this.visible = true;
        
        this.initLayer();
    }
    
    initLayer() {
        // 等待地图加载完成
        this.map.on('load', () => {
            // 添加线路图层源
            this.map.addSource('routes', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });
            
            // 添加线路图层
            this.map.addLayer({
                id: 'routes-layer',
                type: 'line',
                source: 'routes',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#4dabf7',
                    'line-width': 3,
                    'line-opacity': 0.6
                }
            });
        });
    }
    
    addRoute(routeId, coordinates) {
        this.routes[routeId] = coordinates;
        this.updateLayer();
    }
    
    removeRoute(routeId) {
        delete this.routes[routeId];
        this.updateLayer();
    }
    
    updateLayer() {
        if (!this.map.getSource('routes')) return;
        
        const features = Object.entries(this.routes).map(([routeId, coords]) => ({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: coords
            },
            properties: {
                route_id: routeId
            }
        }));
        
        this.map.getSource('routes').setData({
            type: 'FeatureCollection',
            features: features
        });
    }
    
    setVisible(visible) {
        this.visible = visible;
        
        if (this.map.getLayer('routes-layer')) {
            this.map.setLayoutProperty(
                'routes-layer',
                'visibility',
                visible ? 'visible' : 'none'
            );
        }
    }
    
    clear() {
        this.routes = {};
        this.updateLayer();
    }
}
