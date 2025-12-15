import os

from fastapi import FastAPI
from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.middleware.sessions import SessionMiddleware
from starlette.requests import Request

from database import Paste, SiteStats, engine


ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY")


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")

        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            request.session.update({"authenticated": True})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return request.session.get("authenticated", False)


class PasteAdmin(ModelView, model=Paste):
    name = "Paste"
    name_plural = "Pastes"
    icon = "fa-solid fa-clipboard"

    column_list = [
        Paste.id,
        Paste.title,
        Paste.language,
        Paste.created_at,
        Paste.views,
        Paste.expires_at,
    ]
    column_searchable_list = [Paste.id, Paste.title, Paste.content]
    column_sortable_list = [Paste.created_at, Paste.views, Paste.expires_at]
    column_default_sort = [(Paste.created_at, True)]

    can_create = False
    can_edit = True
    can_delete = True
    can_view_details = True


class SiteStatsAdmin(ModelView, model=SiteStats):
    name = "Site Stats"
    name_plural = "Site Stats"
    icon = "fa-solid fa-chart-line"
    column_list = [SiteStats.id, SiteStats.visit_count]
    column_sortable_list = [SiteStats.visit_count]
    column_default_sort = [(SiteStats.visit_count, True)]

def setup_admin(app: FastAPI) -> Admin:
    """Configure and attach the admin panel to the FastAPI app."""
    app.add_middleware(SessionMiddleware, secret_key=ADMIN_SECRET_KEY)

    auth_backend = AdminAuth(secret_key=ADMIN_SECRET_KEY)
    admin = Admin(app, engine, authentication_backend=auth_backend)
    admin.add_view(PasteAdmin)
    admin.add_view(SiteStatsAdmin)

    return admin

