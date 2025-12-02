import random
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from .models import Score

# =============================================================
#  LISTA FIXA DE PERGUNTAS (SEM BANCO)
# =============================================================
QUESTIONS = {
    "easy": [
        {"id": 1, "text": "A ITIL é um conjunto de boas práticas.", "answer": True},
        {"id": 2, "text": "Problemas e incidentes são a mesma coisa.", "answer": False},
        {"id": 3, "text": "O objetivo principal do Gerenciamento de Incidentes é restaurar a operação normal do serviço o mais rápido possível.", "answer": True},
        {"id": 4, "text": "O Service Value System (SVS) representa o modelo de criação de valor da ITIL v4.", "answer": True},
        {"id": 5, "text": "KPIs são usados para medir eficiência e desempenho.", "answer": True},
    ],

    "medium": [
        {"id": 3, "text": "O Gerenciamento de Problemas busca causa raiz.", "answer": True},
        {"id": 4, "text": "O catálogo de serviços inclui apenas serviços externos.", "answer": False},
    ],

    "hard": [
        {"id": 5, "text": "O SLA não faz parte do Gerenciamento de Nível de Serviço.", "answer": False},
        {"id": 6, "text": "ITIL 4 é totalmente focado em processos lineares.", "answer": False},
    ]
}


# =============================================================
#  RANDOM QUESTION (NÃO REPETE)
# =============================================================
@require_GET
def random_question(request):
    difficulty = request.GET.get("difficulty", "easy")

    if difficulty not in QUESTIONS:
        difficulty = "easy"

    used = request.session.get(f"used_{difficulty}", [])

    available = [q for q in QUESTIONS[difficulty] if q["id"] not in used]

    if not available:
        request.session[f"used_{difficulty}"] = []
        used = []
        available = QUESTIONS[difficulty].copy()

    q = random.choice(available)

    used.append(q["id"])
    request.session[f"used_{difficulty}"] = used

    return JsonResponse(q)


# =============================================================
#  SCORE SYSTEM
# =============================================================
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
    data = [
        {
            'player_name': s.player_name,
            'points': s.points,
            'created_at': s.created_at.isoformat()
        }
        for s in scores
    ]
    return JsonResponse({'scores': data})
