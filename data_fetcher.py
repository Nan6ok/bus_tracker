/* 基础重置 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Noto Sans SC', sans-serif;
    background: #f5f5f5;
    color: #333;
    height: 100vh;
    overflow: hidden;
}

.app-container {
    display: flex;
    height: 100vh;
    width: 100vw;
}

/* 侧边栏样式 */
.sidebar {
    width: 350px;
    background: linear-gradient(180deg, #2c3e50 0%, #1a2530 100%);
    color: white;
    display: flex;
    flex-direction: column;
    box-shadow: 3px 0 15px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    overflow-y: auto;
}

.sidebar-header {
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h1 {
    font-size: 1.5rem;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.sidebar-header .subtitle {
    font-size: 0.9rem;
    opacity: 0.8;
    font-weight: 300;
}

/* 控制面板 */
.control-panel {
    padding: 20px;
    flex-grow: 1;
}

.filter-section, .stats-section, .search-section, .actions-section {
    margin-bottom: 25px;
    padding-bottom: 25px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-section h3, .stats-section h3, .search-section h3 {
    font-size: 1.1rem;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #4dabf7;
}

.filter-group {
    margin-bottom: 15px;
}

.filter-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
}

.company-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.company-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
}

.company-btn.active {
    background: #4dabf7 !important;
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(77, 171, 247, 0.5);
}

.company-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}

#route-filter {
    width: 100%;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1rem;
}

.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.checkbox-group label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-weight: normal;
}

/* 统计卡片 */
.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 15px;
}

.stat-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    transition: transform 0.3s;
}

.stat-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
}

.stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 0.9rem;
    opacity: 0.8;
}

.update-time {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    background: rgba(0, 0, 0, 0.2);
    padding: 10px;
    border-radius: 4px;
}

/* 搜索框 */
.search-box {
    display: flex;
    gap: 5px;
    margin-bottom: 15px;
}

.search-box input {
    flex-grow: 1;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

#search-btn {
    padding: 10px 15px;
    background: #4dabf7;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.search-results {
    max-height: 200px;
    overflow-y: auto;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
}

/* 操作按钮 */
.actions-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.action-btn {
    padding: 12px;
    border: none;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s;
}

.action-btn.primary {
    background: #4dabf7;
}

.action-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.action-btn.primary:hover {
    background: #339af0;
}

/* 页脚 */
.sidebar-footer {
    padding: 15px 20px;
    background: rgba(0, 0, 0, 0.3);
    font-size: 0.8rem;
    opacity: 0.7;
    text-align: center;
}

.version {
    margin-top: 5px;
    font-size: 0.7rem;
}

/* 地图容器 */
.map-container {
    flex-grow: 1;
    position: relative;
}

#map {
    width: 100%;
    height: 100%;
}

/* 地图控制按钮 */
.map-controls {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.map-control-btn {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: white;
    border: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #333;
    transition: all 0.2s;
}

.map-control-btn:hover {
    background: #f8f9fa;
    transform: scale(1.1);
}

/* 车辆详情面板 */
.vehicle-details-panel {
    position: absolute;
    bottom: 20px;
    left: 20px;
    width: 300px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    transform: translateY(100%);
    transition: transform 0.3s;
    max-height: 400px;
}

.vehicle-details-panel.active {
    transform: translateY(0);
}

.panel-header {
    padding: 15px;
    background: #2c3e50;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
}

.panel-content {
    padding: 15px;
    max-height: 350px;
    overflow-y: auto;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #666;
}

/* 地图图例 */
.map-legend {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    max-width: 200px;
}

.map-legend h4 {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.legend-color {
    width: 15px;
    height: 15px;
    border-radius: 50%;
}

/* Toast通知 */
.toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
}

.toast {
    background: #2c3e50;
    color: white;
    padding: 15px;
    border-radius: 4px;
    margin-top: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s;
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 300px;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .sidebar {
        width: 300px;
    }
}

@media (max-width: 768px) {
    .app-container {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        height: 40vh;
    }
    
    .map-container {
        height: 60vh;
    }
    
    .vehicle-details-panel {
        width: calc(100% - 40px);
    }
}
