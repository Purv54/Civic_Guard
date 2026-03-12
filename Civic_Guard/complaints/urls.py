from django.urls import path
from . import views, advanced_views

# ──────────────────────────────────────────────
# Complaints App URL Patterns
# ──────────────────────────────────────────────

urlpatterns = [

    # ── Authentication ──────────────────────────
    path('auth/register/',        views.RegisterView.as_view(),        name='auth-register'),
    path('auth/login/',           views.LoginView.as_view(),           name='auth-login'),
    path('auth/logout/',          views.LogoutView.as_view(),          name='auth-logout'),
    path('auth/me/',              views.MeView.as_view(),              name='auth-me'),
    path('auth/change-password/', views.ChangePasswordView.as_view(),  name='auth-change-password'),

    # ── Citizen APIs ────────────────────────────
    path('dashboard/',            views.CitizenDashboardView.as_view(), name='citizen-dashboard'),

    path('complaints/',           views.MyComplaintsView.as_view(),     name='my-complaints'),
    path('complaints/<int:pk>/',  views.MyComplaintDetailView.as_view(), name='my-complaint-detail'),
    path('complaints/<int:pk>/engage/', views.ComplaintEngageView.as_view(), name='complaint-engage'),
    path('complaints/track/',     views.TrackComplaintView.as_view(),   name='track-complaint'),

    # ── Public ──────────────────────────────────
    path('departments/',          views.DepartmentListView.as_view(),   name='department-list'),
    path('public-complaints/',    views.PublicComplaintListView.as_view(), name='public-complaint-list'),
    path('public-complaints/<int:pk>/', views.PublicComplaintDetailView.as_view(), name='public-complaint-detail'),

    path('public-complaints/',    views.PublicComplaintListView.as_view(), name='public-complaint-list'),
    path('public-complaints/<int:pk>/', views.PublicComplaintDetailView.as_view(), name='public-complaint-detail'),

    # ── Advanced Features ───────────────────────
    path('public/heatmap/',       advanced_views.HeatmapView.as_view(),   name='heatmap'),
    path('public/route-risk/',    advanced_views.RouteRiskView.as_view(),  name='route-risk'),
    
    path('notifications/',        advanced_views.NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:pk>/read/', advanced_views.NotificationReadView.as_view(), name='notification-read'),
    
    path('admin/trends/',         advanced_views.TrendsView.as_view(),    name='admin-trends'),
    path('admin/emergency/',      advanced_views.EmergencyModeView.as_view(), name='admin-emergency'),
]
