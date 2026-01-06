# 香港公交API端点配置
API_ENDPOINTS = {
    # 九巴/龙运 API (来自 data.gov.hk)
    "kmb": {
        "route_list": "https://data.etabus.gov.hk/v1/transport/kmb/route/",
        "route_stop": "https://data.etabus.gov.hk/v1/transport/kmb/route-stop/",
        "stop_list": "https://data.etabus.gov.hk/v1/transport/kmb/stop/",
        "eta": "https://data.etabus.gov.hk/v1/transport/kmb/eta/",
        "route_eta": "https://data.etabus.gov.hk/v1/transport/kmb/eta/route/{route}/{service_type}"
    },
    
    # 城巴 API
    "ctb": {
        "stop_eta": "https://rt.data.gov.hk/v2/transport/citybus/eta/stop/{stop_id}"
    },
    
    # 新大屿山 API
    "nlb": {
        "route_list": "https://rt.data.gov.hk/v2/transport/nlb/route.php?action=list",
        "route_stop": "https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=list&routeId={route_id}",
        "eta": "https://rt.data.gov.hk/v2/transport/nlb/eta.php?action=estimate&routeId={route_id}"
    }
}

# 应用配置
class Config:
    SECRET_KEY = 'your-secret-key-here'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///bus_tracker.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CACHE_TYPE = 'simple'
    UPDATE_INTERVAL = 30  # 数据更新间隔(秒)
    MAX_ETA_AGE = 300     # ETA最大有效期(秒)
