from django.contrib import admin
from .models import Question, Score

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'answer', 'difficulty')

@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ('player_name', 'points', 'created_at')
