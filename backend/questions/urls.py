from django.urls import path # type: ignore
from . import views

urlpatterns = [
    path('random-question/', views.random_question, name='random-question'),
    path('submit-score/', views.submit_score, name='submit-score'),
    path('top-scores/', views.top_scores, name='top-scores'),
    path('seed-itil/', views.random_question, name='seed-itil-placeholder'),  # placeholder
]
