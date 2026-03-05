from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import db_models
from schemas.product import CategoryList

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("", response_model=CategoryList)
async def get_categories(db: Session = Depends(get_db)):
    """
    Get all categories
    """
    categories = db.query(db_models.Category).limit(100).all()
    return {"categories": categories}
