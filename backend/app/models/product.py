from app.extensions import db
from app.models.base import BaseModel


class Product(BaseModel):
    __tablename__ = "products"

    name = db.Column(db.String(150), nullable=False)
    name_ar = db.Column(db.String(150))
    brand = db.Column(db.String(100))
    type = db.Column(db.String(80))
    type_ar = db.Column(db.String(80))
    category = db.Column(db.String(80))
    category_ar = db.Column(db.String(80))
    image = db.Column(db.String(255))
    price = db.Column(db.Numeric(10, 2), nullable=False)
    packaging = db.Column(db.String(80))
    rating = db.Column(db.Numeric(2, 1), default=0)
    reviews_count = db.Column(db.Integer, default=0)

    short_desc = db.Column(db.String(255))
    short_desc_ar = db.Column(db.String(255))
    about = db.Column(db.Text)
    about_ar = db.Column(db.Text)
    description = db.Column(db.Text)
    description_ar = db.Column(db.Text)

    general_use = db.Column(db.JSON, default=list)
    general_use_ar = db.Column(db.JSON, default=list)
    composition = db.Column(db.Text)
    composition_ar = db.Column(db.Text)
    dosage = db.Column(db.Text)
    dosage_ar = db.Column(db.Text)
    warnings = db.Column(db.Text)
    warnings_ar = db.Column(db.Text)
    manufacturer = db.Column(db.String(150))
    manufacturer_ar = db.Column(db.String(150))
    in_stock = db.Column(db.Boolean, default=True)

    def to_dict(self, currency_fmt="{} SDG", currency_fmt_ar="{} جنيه"):
        return {
            "id": self.id,
            "name": self.name,
            "nameAr": self.name_ar,
            "brand": self.brand,
            "type": self.type,
            "typeAr": self.type_ar,
            "category": self.category,
            "categoryAr": self.category_ar,
            "image": self.image,
            "price": float(self.price),
            "priceFormatted": currency_fmt.format(self.price),
            "priceFormattedAr": currency_fmt_ar.format(self.price),
            "packaging": self.packaging,
            "rating": float(self.rating or 0),
            "reviewsCount": self.reviews_count,
            "shortDesc": self.short_desc,
            "shortDescAr": self.short_desc_ar,
            "about": self.about,
            "aboutAr": self.about_ar,
            "description": self.description,
            "descriptionAr": self.description_ar,
            "generalUse": self.general_use or [],
            "generalUseAr": self.general_use_ar or [],
            "composition": self.composition,
            "compositionAr": self.composition_ar,
            "dosage": self.dosage,
            "dosageAr": self.dosage_ar,
            "warnings": self.warnings,
            "warningsAr": self.warnings_ar,
            "manufacturer": self.manufacturer,
            "manufacturerAr": self.manufacturer_ar,
            "inStock": self.in_stock,
        }


class CartItem(BaseModel):
    __tablename__ = "cart_items"

    patient_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, default=1)

    product = db.relationship("Product")

    def to_dict(self):
        return {"product": self.product.to_dict(), "quantity": self.quantity}
