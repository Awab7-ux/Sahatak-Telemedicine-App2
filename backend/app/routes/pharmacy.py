from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Product, CartItem, MedicalCheckupPackage

pharmacy_bp = Blueprint("pharmacy", __name__, url_prefix="/api")


@pharmacy_bp.get("/products")
def list_products():
    query = Product.query
    category = request.args.get("category")
    search = request.args.get("search")
    if category:
        query = query.filter(Product.category == category)
    if search:
        like = f"%{search}%"
        query = query.filter(Product.name.ilike(like) | Product.name_ar.ilike(like))
    return jsonify([p.to_dict() for p in query.all()])


@pharmacy_bp.get("/products/<product_id>")
def get_product(product_id):
    return jsonify(Product.query.get_or_404(product_id).to_dict())


@pharmacy_bp.get("/checkup-packages")
def list_checkup_packages():
    return jsonify([p.to_dict() for p in MedicalCheckupPackage.query.all()])


@pharmacy_bp.get("/cart")
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    items = CartItem.query.filter_by(patient_id=user_id).all()
    return jsonify([i.to_dict() for i in items])


@pharmacy_bp.post("/cart")
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    product_id = data.get("productId")
    quantity = data.get("quantity", 1)

    Product.query.get_or_404(product_id)
    item = CartItem.query.filter_by(patient_id=user_id, product_id=product_id).first()
    if item:
        item.quantity += quantity
    else:
        item = CartItem(patient_id=user_id, product_id=product_id, quantity=quantity)
        db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201


@pharmacy_bp.patch("/cart/<product_id>")
@jwt_required()
def update_cart_item(product_id):
    user_id = get_jwt_identity()
    item = CartItem.query.filter_by(patient_id=user_id, product_id=product_id).first_or_404()
    data = request.get_json() or {}
    item.quantity = data.get("quantity", item.quantity)
    db.session.commit()
    return jsonify(item.to_dict())


@pharmacy_bp.delete("/cart/<product_id>")
@jwt_required()
def remove_cart_item(product_id):
    user_id = get_jwt_identity()
    item = CartItem.query.filter_by(patient_id=user_id, product_id=product_id).first_or_404()
    db.session.delete(item)
    db.session.commit()
    return "", 204
