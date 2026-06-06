import React, { useState } from 'react';

function ChatInput({ onSendMessage }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Напишите сообщение ИИ..."
        style={styles.input}
      />
      <button type="submit" style={styles.button}>Отправить</button>
    </form>
  );
}

const styles = {
  form: { display: 'flex', gap: '10px', marginTop: '10px' },
  input: { flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  button: { padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#007BFF', color: 'white', cursor: 'pointer' }
};

export default ChatInput;