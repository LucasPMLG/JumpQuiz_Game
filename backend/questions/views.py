import random
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from .models import Score

# =============================================================
#  LISTA FIXA DE PERGUNTAS (SEM BANCO)
# =============================================================
QUESTIONS = [
    {"id": 1, "text": "A ITIL é um conjunto de boas práticas para gerenciamento de serviços de TI, não um framework prescritivo.", "answer": True},
    {"id": 2, "text": "Problemas e incidentes têm significados diferentes no ITIL.", "answer": False},
    {"id": 3, "text": "O objetivo principal do Gerenciamento de Incidentes é restaurar a operação normal do serviço o mais rápido possível.", "answer": True},
    {"id": 4, "text": "O Gerenciamento de Problemas busca identificar causas raiz de incidentes e evitar recorrências.", "answer": True},
    {"id": 5, "text": "O catálogo de serviços inclui serviços internos e externos, não apenas externos.", "answer": False},
]

# =============================================================
#  RANDOM QUESTION (NÃO REPETE)
# =============================================================
@require_GET
def random_question(request):
    used = request.session.get("used_questions", [])

    # perguntas que ainda não foram usadas
    available = [q for q in QUESTIONS if q["id"] not in used]

    # se acabou, reseta
    if not available:
        request.session["used_questions"] = []
        used = []
        available = QUESTIONS.copy()

    # escolhe aleatória
    q = random.choice(available)

    # marca como usada
    used.append(q["id"])
    request.session["used_questions"] = used

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
