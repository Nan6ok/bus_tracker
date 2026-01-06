from flask import Flask, jsonify, request, render_template
from flask_caching import Cache
from datetime import datetime, timedelta
import threading
import time
import json
from config import Config, API_ENDPOINTS
from data_fetcher import DataFetcher
from position_calculator import PositionCalculator
from database import db, BusRoute, BusStop, VehiclePosition

# 初始化Flask应用
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
cache = Cache(app)

# 全局变量
data_fetcher = DataFetcher(API_ENDPOINTS)
position_calculator = PositionCalculator()
update_thread = None
stop_thread = False

# API路由
@app.route('/')
def index():
    """显示简单的地图页面"""
    return render_template('map.html')

@app.route('/api/routes')
@cache.cached(timeout=300)  # 缓存5分钟
def get_routes():
    """获取所有公交线路"""
    routes = BusRoute.query.all()
    return jsonify({
        'status': 'success',
        'count': len(routes),
        'data': [route.to_dict() for route in routes]
    })

@app.route('/api/vehicles')
def get_vehicles():
    """获取所有车辆的实时位置"""
    # 获取查询参数
    route = request.args.get('route')
    company = request.args.get('company')
    
    query = VehiclePosition.query.filter(
        VehiclePosition.timestamp > datetime.utcnow() - timedelta(seconds=120)
    )
    
    if route:
        query = query.filter(VehiclePosition.route_id == route)
    if company:
        query = query.filter(VehiclePosition.company == company)
    
    vehicles = query.all()
    
    return jsonify({
        'status': 'success',
        'timestamp': datetime.utcnow().isoformat(),
        'count': len(vehicles),
        'vehicles': [vehicle.to_dict() for vehicle in vehicles]
    })

@app.route('/api/eta/<route_id>/<direction>')
def get_route_eta(route_id, direction):
    """获取指定线路的ETA数据"""
    eta_data = data_fetcher.fetch_eta_for_route(route_id, direction)
    
    if eta_data:
        # 计算车辆位置
        vehicle_positions = position_calculator.calculate_positions(eta_data)
        
        # 保存到数据库
        for pos in vehicle_positions:
            vehicle = VehiclePosition(
                vehicle_id=pos['vehicle_id'],
                route_id=pos['route_id'],
                company=pos['company'],
                latitude=pos['lat'],
                longitude=pos['lng'],
                direction=pos['direction'],
                estimated_arrival=pos['eta'],
                speed=pos.get('speed', 0),
                occupancy=pos.get('occupancy', 'UNKNOWN')
            )
            db.session.merge(vehicle)  # 更新或插入
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'route': route_id,
            'direction': direction,
            'vehicles': vehicle_positions
        })
    
    return jsonify({'status': 'error', 'message': 'No ETA data available'}), 404

@app.route('/api/stats')
def get_stats():
    """获取系统统计信息"""
    stats = {
        'total_routes': BusRoute.query.count(),
        'total_stops': BusStop.query.count(),
        'active_vehicles': VehiclePosition.query.filter(
            VehiclePosition.timestamp > datetime.utcnow() - timedelta(seconds=120)
        ).count(),
        'last_update': cache.get('last_update_time'),
        'companies': ['KMB', 'CTB', 'NLB']
    }
    return jsonify(stats)

# 后台数据更新线程
def background_updater():
    """后台定时更新数据"""
    while not stop_thread:
        try:
            print(f"[{datetime.now()}] 开始更新数据...")
            
            # 1. 更新静态数据（每小时一次）
            if not cache.get('last_static_update') or \
               datetime.utcnow() - cache.get('last_static_update') > timedelta(hours=1):
                print("更新静态数据...")
                data_fetcher.update_static_data()
                cache.set('last_static_update', datetime.utcnow())
            
            # 2. 更新热门线路的ETA数据
            popular_routes = ['1', '2', '5', '6', '10', '101', '102', '104']
            for route in popular_routes:
                for direction in ['inbound', 'outbound']:
                    try:
                        data_fetcher.fetch_eta_for_route(route, direction)
                        time.sleep(1)  # 避免请求过快
                    except Exception as e:
                        print(f"更新线路 {route} 数据失败: {e}")
            
            cache.set('last_update_time', datetime.now().isoformat())
            print(f"[{datetime.now()}] 数据更新完成")
            
        except Exception as e:
            print(f"后台更新出错: {e}")
        
        # 等待下一次更新
        time.sleep(Config.UPDATE_INTERVAL)

# 启动和停止函数
def start_background_updater():
    """启动后台更新线程"""
    global update_thread, stop_thread
    stop_thread = False
    update_thread = threading.Thread(target=background_updater, daemon=True)
    update_thread.start()
    print("后台更新线程已启动")

def stop_background_updater():
    """停止后台更新线程"""
    global stop_thread
    stop_thread = True
    if update_thread:
        update_thread.join(timeout=5)
    print("后台更新线程已停止")

# 应用生命周期
@app.before_first_request
def initialize():
    """应用初始化"""
    # 创建数据库表
    with app.app_context():
        db.create_all()
    
    # 启动后台更新线程
    start_background_updater()
    print("系统初始化完成")

@app.teardown_appcontext
def shutdown(exception=None):
    """应用关闭时清理"""
    stop_background_updater()

if __name__ == '__main__':
    # 开发模式运行
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
