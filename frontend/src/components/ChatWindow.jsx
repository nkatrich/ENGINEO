import React from 'react';

function ChatWindow({ messages }) {
  return (
    <div style={styles.window}>
      {messages.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>История чата пуста. Начните общение!</p>
      ) : (
        messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              style={{
                ...styles.messageRow,
                justifyContent: isUser ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  backgroundColor: isUser ? '#007BFF' : '#E9ECEF',
                  color: isUser ? 'white' : 'black',
                }}
              >
                <strong>{isUser ? 'Вы: ' : 'ИИ: '}</strong>
                {msg.content}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

const styles = {
  window: { flex: 1, border: '1px solid #ccc', borderRadius: '5px', padding: '15px', overflowY: 'auto', backgroundColor: '#f9f9f9', minHeight: '300px', maxHeight: '400px' },
  messageRow: { display: 'flex', margin: '10px 0' },
  bubble: { padding: '10px 15px', borderRadius: '15px', maxWidth: '70%' }
};

export default ChatWindow;