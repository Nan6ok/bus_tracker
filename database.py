from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class BusRoute(db.Model):
    __tablename__ = 'bus_routes'
    
    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.String(20), nullable=False, index=True)
    company = db.Column(db.String(10), nullable=False)  # KMB, CTB, NLB
    route_number = db.Column(db.String(10))
    orig_tc = db.Column(db.String(100))
    orig_en = db.Column(db.String(100))
    dest_tc = db.Column(db.String(100))
    dest_en = db.Column(db.String(100))
    service_type = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'route_id': self.route_id,
            'company': self.company,
            'route_number': self.route_number,
            'origin': {'tc': self.orig_tc, 'en': self.orig_en},
            'destination': {'tc': self.dest_tc, 'en': self.dest_en},
            'service_type': self.service_type
        }

class BusStop(db.Model):
    __tablename__ = 'bus_stops'
    
    id = db.Column(db.Integer, primary_key=True)
    stop_id = db.Column(db.String(20), nullable=False, unique=True, index=True)
    name_tc = db.Column(db.String(100))
    name_en = db.Column(db.String(100))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    district = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'stop_id': self.stop_id,
            'name': {'tc': self.name_tc, 'en': self.name_en},
            'latitude': self.latitude,
            'longitude': self.longitude,
            'district': self.district
        }

class VehiclePosition(db.Model):
    __tablename__ = 'vehicle_positions'
    
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.String(50), nullable=False, index=True)
    route_id = db.Column(db.String(20), nullable=False, index=True)
    company = db.Column(db.String(10), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    direction = db.Column(db.String(20))
    estimated_arrival = db.Column(db.DateTime)
    speed = db.Column(db.Float)  # 公里/小时
    occupancy = db.Column(db.String(20))  # 载客情况
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'vehicle_id': self.vehicle_id,
            'route_id': self.route_id,
            'company': self.company,
            'position': {
                'lat': self.latitude,
                'lng': self.longitude
            },
            'direction': self.direction,
            'estimated_arrival': self.estimated_arrival.isoformat() if self.estimated_arrival else None,
            'speed': self.speed,
            'occupancy': self.occupancy,
            'timestamp': self.timestamp.isoformat()
        }
