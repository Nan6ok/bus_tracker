import requests
import json
from datetime import datetime
from database import db, BusRoute, BusStop
import time

class DataFetcher:
    def __init__(self, api_endpoints):
        self.api_endpoints = api_endpoints
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'HongKongBusTracker/1.0',
            'Accept': 'application/json'
        })
    
    def fetch_json(self, url, max_retries=3):
        """获取JSON数据，带重试机制"""
        for attempt in range(max_retries):
            try:
                response = self.session.get(url, timeout=10)
                response.raise_for_status()
                return response.json()
            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1:
                    print(f"获取数据失败: {url}, 错误: {e}")
                    return None
                time.sleep(2 ** attempt)  # 指数退避
        return None
    
    def update_static_data(self):
        """更新线路和站点静态数据（以九巴为例）"""
        print("开始更新九巴静态数据...")
        
        # 1. 获取线路列表
        routes_data = self.fetch_json(self.api_endpoints["kmb"]["route_list"])
        if routes_data and 'data' in routes_data:
            for route_info in routes_data['data']:
                route = BusRoute(
                    route_id=route_info.get('route'),
                    company='KMB',
                    route_number=route_info.get('route'),
                    orig_tc=route_info.get('orig_tc', ''),
                    orig_en=route_info.get('orig_en', ''),
                    dest_tc=route_info.get('dest_tc', ''),
                    dest_en=route_info.get('dest_en', ''),
                    service_type=route_info.get('service_type', '1')
                )
                db.session.merge(route)
            
            db.session.commit()
            print(f"已更新 {len(routes_data['data'])} 条线路")
        
        # 2. 获取站点列表（分批获取，避免数据量太大）
        print("开始更新站点数据...")
        stops_url = self.api_endpoints["kmb"]["stop_list"]
        stops_data = self.fetch_json(stops_url)
        
        if stops_data and 'data' in stops_data:
            batch_size = 100
            for i in range(0, len(stops_data['data']), batch_size):
                batch = stops_data['data'][i:i+batch_size]
                for stop_info in batch:
                    stop = BusStop(
                        stop_id=stop_info.get('stop'),
                        name_tc=stop_info.get('name_tc', ''),
                        name_en=stop_info.get('name_en', ''),
                        latitude=stop_info.get('lat', 0),
                        longitude=stop_info.get('long', 0)
                    )
                    db.session.merge(stop)
                
                db.session.commit()
                print(f"已处理站点: {i+len(batch)}/{len(stops_data['data'])}")
        
        print("静态数据更新完成")
    
    def fetch_eta_for_route(self, route_id, direction='outbound'):
        """获取指定线路的ETA数据"""
        # 九巴ETA API需要service_type，这里默认为1（常规服务）
        service_type = '1'
        
        # 构建ETA API URL
        url = self.api_endpoints["kmb"]["route_eta"].format(
            route=route_id,
            service_type=service_type
        )
        
        eta_data = self.fetch_json(url)
        
        if eta_data and 'data' in eta_data:
            # 过滤指定方向的ETA数据
            filtered_data = []
            for eta in eta_data['data']:
                if eta.get('dir') == direction:
                    filtered_data.append({
                        'route': route_id,
                        'direction': direction,
                        'stop_id': eta.get('stop'),
                        'eta': eta.get('eta'),
                        'eta_seq': eta.get('eta_seq'),
                        'rmk_tc': eta.get('rmk_tc', ''),
                        'rmk_en': eta.get('rmk_en', ''),
                        'timestamp': datetime.now().isoformat()
                    })
            
            return filtered_data
        
        return None
    
    def fetch_all_companies_eta(self, stop_id):
        """获取指定站点的所有公司ETA数据（用于聚合）"""
        all_eta = []
        
        # 获取城巴数据
        if 'ctb' in self.api_endpoints:
            ctb_url = self.api_endpoints['ctb']['stop_eta'].format(stop_id=stop_id)
            ctb_data = self.fetch_json(ctb_url)
            if ctb_data and 'data' in ctb_data:
                for eta in ctb_data['data']:
                    eta['company'] = 'CTB'
                    all_eta.append(eta)
        
        # 获取九巴数据
        kmb_url = self.api_endpoints["kmb"]["eta"] + f"?stop={stop_id}"
        kmb_data = self.fetch_json(kmb_url)
        if kmb_data and 'data' in kmb_data:
            for eta in kmb_data['data']:
                eta['company'] = 'KMB'
                all_eta.append(eta)
        
        return all_eta
