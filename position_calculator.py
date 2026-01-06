from datetime import datetime, timedelta
import math
from database import db, BusRoute, BusStop
import json

class PositionCalculator:
    def __init__(self):
        self.earth_radius_km = 6371.0
    
    def haversine_distance(self, lat1, lon1, lat2, lon2):
        """计算两个坐标点之间的距离（公里）"""
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return self.earth_radius_km * c
    
    def interpolate_position(self, start_lat, start_lng, end_lat, end_lng, ratio):
        """在两个坐标点之间线性插值"""
        lat = start_lat + (end_lat - start_lat) * ratio
        lng = start_lng + (end_lng - start_lng) * ratio
        return lat, lng
    
    def calculate_speed(self, distance_km, time_diff_seconds):
        """计算速度（公里/小时）"""
        if time_diff_seconds <= 0:
            return 0
        return (distance_km / time_diff_seconds) * 3600
    
    def calculate_positions(self, eta_data):
        """核心算法：将ETA数据转换为车辆位置"""
        if not eta_data:
            return []
        
        vehicle_positions = []
        current_time = datetime.utcnow()
        
        # 按路线分组处理
        route_groups = {}
        for eta in eta_data:
            route = eta.get('route')
            if route not in route_groups:
                route_groups[route] = []
            route_groups[route].append(eta)
        
        # 对每个路线的数据进行处理
        for route_id, eta_list in route_groups.items():
            # 获取该路线的站点顺序
            route_stops = self.get_route_stops(route_id, eta_list[0].get('direction', 'outbound'))
            if not route_stops or len(route_stops) < 2:
                continue
            
            # 按ETA时间排序
            sorted_eta = sorted(eta_list, key=lambda x: x.get('eta_seq', 0))
            
            # 为每对相邻的ETA估算车辆位置
            for i in range(len(sorted_eta) - 1):
                current_eta = sorted_eta[i]
                next_eta = sorted_eta[i + 1]
                
                # 解析ETA时间
                try:
                    current_eta_time = datetime.fromisoformat(current_eta['eta'].replace('Z', '+00:00'))
                    next_eta_time = datetime.fromisoformat(next_eta['eta'].replace('Z', '+00:00'))
                except (ValueError, KeyError):
                    continue
                
                # 如果ETA时间不合理，跳过
                if current_eta_time < current_time or next_eta_time < current_time:
                    continue
                
                # 计算时间比例
                total_time = (next_eta_time - current_eta_time).total_seconds()
                elapsed_time = (current_time - current_eta_time).total_seconds()
                
                if total_time <= 0 or elapsed_time <= 0:
                    continue
                
                progress_ratio = min(max(elapsed_time / total_time, 0), 1)
                
                # 获取站点坐标
                current_stop = self.get_stop_coordinates(current_eta.get('stop_id'))
                next_stop = self.get_stop_coordinates(next_eta.get('stop_id'))
                
                if not current_stop or not next_stop:
                    continue
                
                # 计算插值位置
                lat, lng = self.interpolate_position(
                    current_stop['lat'], current_stop['lng'],
                    next_stop['lat'], next_stop['lng'],
                    progress_ratio
                )
                
                # 计算距离和速度
                distance = self.haversine_distance(
                    current_stop['lat'], current_stop['lng'],
                    next_stop['lat'], next_stop['lng']
                )
                
                speed = self.calculate_speed(distance * progress_ratio, elapsed_time)
                
                # 创建车辆位置对象
                vehicle_id = f"{route_id}_{current_eta.get('stop_id')}_{next_eta.get('stop_id')}"
                
                vehicle_positions.append({
                    'vehicle_id': vehicle_id,
                    'route_id': route_id,
                    'company': 'KMB',  # 根据实际数据调整
                    'lat': lat,
                    'lng': lng,
                    'direction': current_eta.get('direction', 'outbound'),
                    'eta': current_eta_time.isoformat(),
                    'speed': round(speed, 1),
                    'progress': round(progress_ratio * 100, 1),
                    'timestamp': current_time.isoformat()
                })
        
        return vehicle_positions
    
    def get_route_stops(self, route_id, direction):
        """从数据库获取路线站点序列"""
        # 这里简化处理，实际应从数据库查询
        # 您可以使用data_fetcher中的方法获取完整路线-站点数据
        return []  # 返回站点ID列表
    
    def get_stop_coordinates(self, stop_id):
        """获取站点坐标"""
        # 从数据库查询站点坐标
        stop = db.session.query(BusStop).filter_by(stop_id=stop_id).first()
        if stop:
            return {'lat': stop.latitude, 'lng': stop.longitude}
        return None
