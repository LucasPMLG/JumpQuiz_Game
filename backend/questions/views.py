import random
import json
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
        {"id": 4, "text": "Mudanças padrão são mudanças pré-autorizadas e de baixo risco.", "answer": True},
        {"id": 5, "text": "KPIs são usados para medir eficiência e desempenho.", "answer": True},
        {"id": 6, "text": "O Gerenciamento de Liberação e Implantação visa entregar mudanças em produção de forma segura.", "answer": True},
    ],

    "medium": [
        {"id": 7, "text": "O Gerenciamento de Problemas busca causa raiz.", "answer": True},
        {"id": 8, "text": "O catálogo de serviços inclui apenas serviços externos.", "answer": False},
        {"id": 9, "text": "O valor é co-criado entre provedor e consumidor na ITIL v4.", "answer": True},
        {"id": 10, "text": "Na ITIL v4, práticas substituem os processos formalmente definidos do ITIL v3.", "answer": True},
        {"id": 11, "text": "O Gerenciamento da Configuração mantém informações sobre ativos e itens de configuração.", "answer": True},
        {"id": 12, "text": "O Service Value System (SVS) representa o modelo de criação de valor da ITIL v4.", "answer": True},
    ],

    "hard": [
        {"id": 13, "text": "O SLA não faz parte do Gerenciamento de Nível de Serviço.", "answer": False},
        {"id": 14, "text": "ITIL 4 é totalmente focado em processos lineares.", "answer": False},
        {"id": 15, "text": "Na ITIL v4, o Service Desk é uma prática, não mais uma função.", "answer": False},
        {"id": 16, "text": "Solicitação de serviço não é incidente; são tratadas separadamente (via Service Request Management).", "answer": False},
        {"id": 17, "text": "O fluxo de incidentes é diferente do fluxo de problemas.", "answer": False},
    ]
}

# =============================================================
#  FILA EMBARALHADA (SEM REPETIÇÃO REAL)
# =============================================================
QUESTION_QUEUE = {
    "easy": [],
    "medium": [],
    "hard": []
}

def refill_queue(difficulty):
    QUESTION_QUEUE[difficulty] = QUESTIONS[difficulty].copy()
    random.shuffle(QUESTION_QUEUE[difficulty])

# =============================================================
#  RANDOM QUESTION (SEM REPETIÇÃO REAL)
# =============================================================
@require_GET
def random_question(request):
    difficulty = request.GET.get("difficulty", "easy")

    if difficulty not in QUESTIONS:
        difficulty = "easy"

    # Se a fila estiver vazia, reabastece e embaralha
    if not QUESTION_QUEUE[difficulty]:
        refill_queue(difficulty)

    # Retira sempre a próxima da fila
    question = QUESTION_QUEUE[difficulty].pop()

    return JsonResponse(question)


# =============================================================
#  SCORE SYSTEM
# =============================================================
@csrf_exempt
@require_POST
def submit_score(request):
    try:
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
