from rest_framework import serializers
from .models import Question, Score

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'text', 'answer', 'difficulty')

class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = ('id', 'player_name', 'points', 'created_at')
