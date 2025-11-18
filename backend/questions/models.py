from django.db import models # type: ignore

class Question(models.Model):
    text = models.TextField()
    answer = models.BooleanField(help_text='True for Yes, False for No')
    difficulty = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.text[:50]}..."

class Score(models.Model):
    player_name = models.CharField(max_length=100, blank=True)
    points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player_name} - {self.points}"