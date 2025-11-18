import random
from django.http import JsonResponse # type: ignore
from django.views.decorators.http import require_GET, require_POST # type: ignore
from django.views.decorators.csrf import csrf_exempt # type: ignore
from .models import Question, Score

@require_GET
def random_question(request):
    qs = Question.objects.all()
    if not qs.exists():
        return JsonResponse({'error': 'No questions seeded.'}, status=404)
    q = random.choice(qs)
    return JsonResponse({'id': q.id, 'text': q.text, 'answer': q.answer})

@csrf_exempt
@require_POST
def submit_score(request):
    try:
        import json
        data = json.loads(request.body)
        name = data.get('name', 'Player')
        points = int(data.get('points', 0))
        s = Score.objects.create(player_name=name, points=points)
        return JsonResponse({'status': 'ok', 'id': s.id})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@require_GET
def top_scores(request):
    scores = Score.objects.order_by('-points')[:20]
    data = [{'player_name': s.player_name, 'points': s.points, 'created_at': s.created_at.isoformat()} for s in scores]
    return JsonResponse({'scores': data})

# Lista fixa de perguntas
QUESTIONS = [
    {"id": 1, "text": "O sol é uma estrela?", "answer": True},
    {"id": 2, "text": "2 + 2 é igual a 5?", "answer": False},
    {"id": 3, "text": "Python é uma linguagem de programação?", "answer": True},
    {"id": 4, "text": "HTML é uma linguagem de programação?", "answer": False},
]

@require_GET
def random_question(request):
    used = request.session.get("used_questions", [])

    # pega perguntas ainda não usadas
    available = [q for q in QUESTIONS if q["id"] not in used]

    # se acabou, reinicia
    if not available:
        request.session["used_questions"] = []
        available = QUESTIONS.copy()
        used = []

    # escolhe aleatória
    q = random.choice(available)

    # salva pergunta usada
    used.append(q["id"])
    request.session["used_questions"] = used

    return JsonResponse(q)
