from app.extensions import db
from app.models.base import BaseModel


class MedicalCheckupPackage(BaseModel):
    __tablename__ = "checkup_packages"

    title = db.Column(db.String(150), nullable=False)
    title_ar = db.Column(db.String(150))
    category = db.Column(db.String(80))
    category_ar = db.Column(db.String(80))
    price = db.Column(db.Numeric(10, 2), nullable=False)
    original_price = db.Column(db.String(30))
    duration = db.Column(db.String(50))
    duration_ar = db.Column(db.String(50))
    icon_name = db.Column(db.String(80))
    color = db.Column(db.String(20))
    bg_color = db.Column(db.String(20))
    description = db.Column(db.Text)
    description_ar = db.Column(db.Text)
    included_tests = db.Column(db.JSON, default=list)
    included_tests_ar = db.Column(db.JSON, default=list)
    preparation = db.Column(db.Text)
    preparation_ar = db.Column(db.Text)
    tests_count = db.Column(db.Integer)
    features = db.Column(db.JSON, default=list)
    features_ar = db.Column(db.JSON, default=list)
    is_home_sample_available = db.Column(db.Boolean, default=False)

    def to_dict(self, currency_fmt="{} SDG", currency_fmt_ar="{} جنيه"):
        return {
            "id": self.id,
            "title": self.title,
            "titleAr": self.title_ar,
            "category": self.category,
            "categoryAr": self.category_ar,
            "price": float(self.price),
            "priceFormatted": currency_fmt.format(self.price),
            "priceFormattedAr": currency_fmt_ar.format(self.price),
            "originalPrice": self.original_price,
            "duration": self.duration,
            "durationAr": self.duration_ar,
            "iconName": self.icon_name,
            "color": self.color,
            "bgColor": self.bg_color,
            "description": self.description,
            "descriptionAr": self.description_ar,
            "includedTests": self.included_tests or [],
            "includedTestsAr": self.included_tests_ar or [],
            "preparation": self.preparation,
            "preparationAr": self.preparation_ar,
            "testsCount": self.tests_count,
            "features": self.features or [],
            "featuresAr": self.features_ar or [],
            "isHomeSampleAvailable": self.is_home_sample_available,
        }
