
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.database import get_db
from app.db.models import Favorite, User
from app.utils.district_data import DISTRICT_NAMES

router = APIRouter()


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    district: str | None = Field(default=None, max_length=100)


class FavouriteCreate(BaseModel):
    item: str = Field(min_length=1, max_length=50)


def profile_response(user: User):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "district": user.district,
    }


# Get the logged-in user's profile
@router.get("")
def get_profile(
    current_user: User = Depends(get_current_user),
):
    return profile_response(current_user)


# Update the logged-in user's profile
@router.patch("")
def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    changes = data.model_dump(exclude_unset=True)

    if "name" in changes:
        name = (changes["name"] or "").strip()

        if not name:
            raise HTTPException(
                status_code=422,
                detail="Name cannot be empty.",
            )

        current_user.name = name

    if "district" in changes:
        district = changes["district"]

        if district is not None:
            district = district.strip()

            if district not in DISTRICT_NAMES:
                raise HTTPException(
                    status_code=422,
                    detail="Please select a supported Sri Lankan district.",
                )

        current_user.district = district

    db.commit()
    db.refresh(current_user)

    return profile_response(current_user)


# Get the logged-in user's favourites
@router.get("/favourites")
def get_favourites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    favourites = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .order_by(Favorite.item.asc())
        .all()
    )

    return {
        "favourites": [
            {"item": favourite.item}
            for favourite in favourites
        ]
    }


# Add a favourite
@router.post("/favourites", status_code=status.HTTP_201_CREATED)
def add_favourite(
    data: FavouriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = data.item.strip().title()

    supported_items = {
        "Apple", "Banana", "Cucumber", "Okra",
        "Orange", "Potato", "Tomato",
    }

    if item not in supported_items:
        raise HTTPException(
            status_code=422,
            detail="Unsupported produce item.",
        )

    existing = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.item == item,
        )
        .first()
    )

    if existing:
        return {"item": item, "favourite": True}

    favourite = Favorite(
        user_id=current_user.id,
        item=item,
    )

    db.add(favourite)
    db.commit()

    return {"item": item, "favourite": True}


# Remove a favourite
@router.delete("/favourites/{item}")
def remove_favourite(
    item: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = item.strip().title()

    favourite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.item == item,
        )
        .first()
    )

    if favourite:
        db.delete(favourite)
        db.commit()

    return {"item": item, "favourite": False}
