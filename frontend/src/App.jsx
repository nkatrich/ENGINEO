import React, { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/InputField';

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // === 1. [READ] Загружаем историю чата при старте приложения ===
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/messages')
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("Ошибка загрузки истории:", err));
  }, []);

  // === 2. [CREATE] Отправка сообщения ===
  const handleSendMessage = async (text) => {
    // Сразу добавляем сообщение пользователя в интерфейс для мгновенного отклика
    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      });
      
      const aiMessage = await response.json();
      // Добавляем ответ ИИ в интерфейс
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Ошибка при отправке сообщения:", err);
    } finally {
      setLoading(false);
    }
  };

  // === 3. [DELETE] Очистка чата ===
  const handleClearChat = async () => {
    try {
      await fetch('http://127.0.0.1:5000/api/messages', { method: 'DELETE' });
      setMessages([]); // Сбрасываем стейт на фронтенде
    } catch (err) {
      console.error("Ошибка при очистке чата:", err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Мой первый ИИ Чат (CRUD)</h2>
        <button onClick={handleClearChat} style={styles.clearButton}>Очистить чат</button>
      </div>
      
      <ChatWindow messages={messages} />
      
      {loading && <p style={{ color: '#888', fontStyle: 'italic' }}>ИИ думает...</p>}
      
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '50px auto', display: 'flex', flexDirection: 'column', height: '80vh', fontFamily: 'Arial, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  clearButton: { backgroundColor: '#DC3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }
};

export default App;