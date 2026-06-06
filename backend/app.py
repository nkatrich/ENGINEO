import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from database import get_db_connection, init_db

# Загружаем переменные из файла .env
load_dotenv()

app = Flask(__name__)
# CORS нужен, чтобы React (который будет работать на порту 5173) 
# мог легально делать запросы к Flask (который будет на порту 5000)
CORS(app)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def ask_ENGINEO(chat_history):
    """Функция отправки истории чата в OpenRouter ИИ"""
    try:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Формируем данные для ИИ. Передаем только role и content, как просит API
        formatted_history = [{"role": msg["role"], "content": msg["content"]} for msg in chat_history]
        
        data = {
            "model": "openai/gpt-oss-120b:free",
            "messages": formatted_history
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            return f"Ошибка ИИ: {response.text}"
            
    except Exception as e:
        return f"Не удалось связаться с ИИ: {str(e)}"


# === 1. [READ] Получить все сообщения ===
@app.route('/api/messages', methods=['GET'])
def get_messages():
    conn = get_db_connection()
    # Выбираем сообщения, сортируя по id, чтобы они шли по порядку времени
    messages = conn.execute('SELECT id, role, content FROM messages ORDER BY id ASC').fetchall()
    conn.close()
    
    # Превращаем результат SQLite в обычный список словарей (JSON)
    return jsonify([dict(msg) for msg in messages])


# === 2. [CREATE] Отправить новое сообщение ===
@app.route('/api/messages', methods=['POST'])
def create_message():
    data = request.json
    user_content = data.get('content')
    
    if not user_content:
        return jsonify({"error": "Сообщение не может быть пустым"}), 400
        
    conn = get_db_connection()
    
    # 1. Сохраняем сообщение пользователя в базу данных
    conn.execute('INSERT INTO messages (role, content) VALUES (?, ?)', ('user', user_content))
    conn.commit()
    
    # 2. Достаем всю историю чата (включая только что добавленное сообщение),
    # чтобы ИИ помнил контекст разговора
    history = conn.execute('SELECT role, content FROM messages ORDER BY id ASC').fetchall()
    
    # 3. Отправляем историю в ИИ и получаем ответ
    ai_response = ask_ENGINEO(history)
    
    # 4. Сохраняем ответ ИИ в базу данных
    conn.execute('INSERT INTO messages (role, content) VALUES (?, ?)', ('assistant', ai_response))
    conn.commit()
    
    conn.close()
    
    # Возвращаем фронтенду ответ от ИИ, чтобы сразу отобразить его на экране
    return jsonify({"role": "assistant", "content": ai_response})


# === 3. [DELETE] Очистить чат ===
@app.route('/api/messages', methods=['DELETE'])
def clear_messages():
    conn = get_db_connection()
    conn.execute('DELETE FROM messages')
    conn.commit()
    conn.close()
    return jsonify({"status": "История чата очищена"})


if __name__ == '__main__':
    # При запуске сервера проверяем, создана ли БД (на всякий случай)
    init_db()
    # Запускаем Flask на 5000 порту
    app.run(debug=True, port=5000)