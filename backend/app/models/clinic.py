from app.extensions import db
from app.models.base import BaseModel


class ClinicLocation(BaseModel):
    __tablename__ = "clinic_locations"

    name = db.Column(db.String(150), nullable=False)
    name_ar = db.Column(db.String(150))
    type = db.Column(db.String(20))  # hospital | clinic | pharmacy | lab
    type_label = db.Column(db.String(50))
    type_label_ar = db.Column(db.String(50))
    address = db.Column(db.String(255))
    address_ar = db.Column(db.String(255))
    distance_km = db.Column(db.Numeric(5, 2))
    rating = db.Column(db.Numeric(2, 1), default=0)
    reviews_count = db.Column(db.Integer, default=0)
    open_status = db.Column(db.String(50))
    open_status_ar = db.Column(db.String(50))
    is_open = db.Column(db.Boolean, default=True)
    phone = db.Column(db.String(30))
    emergency_available = db.Column(db.Boolean, default=False)
    coordinates = db.Column(db.JSON)  # {"x": .., "y": ..} percentage on interactive map
    image = db.Column(db.String(255))
    services = db.Column(db.JSON, default=list)
    services_ar = db.Column(db.JSON, default=list)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "nameAr": self.name_ar,
            "type": self.type,
            "typeLabel": self.type_label,
            "typeLabelAr": self.type_label_ar,
            "address": self.address,
            "addressAr": self.address_ar,
            "distance": f"{self.distance_km} km" if self.distance_km is not None else None,
            "distanceKm": float(self.distance_km) if self.distance_km is not None else None,
            "rating": float(self.rating or 0),
            "reviewsCount": self.reviews_count,
            "openStatus": self.open_status,
            "openStatusAr": self.open_status_ar,
            "isOpen": self.is_open,
            "isOpenNow": self.is_open,
            "phone": self.phone,
            "emergencyAvailable": self.emergency_available,
            "isEmergency24": self.emergency_available,
            "coordinates": self.coordinates,
            "image": self.image,
            "services": self.services or [],
            "servicesAr": self.services_ar or [],
        }
