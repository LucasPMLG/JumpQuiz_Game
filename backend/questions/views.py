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
        {"id": 6, "text": "O Gerenciamento de Problemas busca causa raiz.", "answer": True},
        {"id": 7, "text": "O catálogo de serviços inclui apenas serviços externos.", "answer": False},
        {"id": 8, "text": "O valor é co-criado entre provedor e consumidor na ITIL v4.", "answer": True},
        {"id": 9, "text": "Na ITIL v4, práticas substituem os processos formalmente definidos do ITIL v3.", "answer": True},
        {"id": 10, "text": "O Gerenciamento da Configuração mantém informações sobre ativos e itens de configuração.", "answer": True},
    ],

    "hard": [
        {"id": 11, "text": "O SLA não faz parte do Gerenciamento de Nível de Serviço.", "answer": False},
        {"id": 12, "text": "ITIL 4 é totalmente focado em processos lineares.", "answer": False},
        {"id": 13, "text": "Na ITIL v4, o Service Desk é uma prática, não mais uma função.", "answer": False},
        {"id": 14, "text": "Solicitação de serviço não é incidente; são tratadas separadamente (via Service Request Management).", "answer": False},
        {"id": 15, "text": "O fluxo de incidentes é diferente do fluxo de problemas.", "answer": False},
    ]
}

# =============================================================
#  CONTROLE GLOBAL (EVITA REPETIÇÃO)
# =============================================================
USED_QUESTIONS = {
    "easy": set(),
    "medium": set(),
    "hard": set(),
}

# =============================================================
#  RANDOM QUESTION (SEM REPETIÇÃO)
# =============================================================
@require_GET
def random_question(request):
    difficulty = request.GET.get("difficulty", "easy")

    if difficulty not in QUESTIONS:
        difficulty = "easy"

    available = [
        q for q in QUESTIONS[difficulty]
        if q["id"] not in USED_QUESTIONS[difficulty]
    ]

    # Se acabaram as perguntas, reseta automaticamente
    if not available:
        USED_QUESTIONS[difficulty].clear()
        available = QUESTIONS[difficulty].copy()

    q = random.choice(available)

    USED_QUESTIONS[difficulty].add(q["id"])

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

# =============================================================
#  TOP SCORES
# =============================================================
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
