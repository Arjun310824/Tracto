from django.urls import path
from .views import (
    register,
    LoginAPIView,
    UserProfileView,
    ChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView,
    AdminUserListView,
    AdminToggleBlockUserView,
)
from .admin_views import AdminDashboardStatsView

urlpatterns = [
    path("register/", register, name="register"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("users/<int:user_id>/block/", AdminToggleBlockUserView.as_view(), name="admin-block-user"),
    path("dashboard-stats/", AdminDashboardStatsView.as_view(), name="admin-dashboard-stats"),
]

