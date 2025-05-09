const http = require('http');
const WebSocket = require('ws');
const fs = require('fs').promises;

// HTTP 서버 생성
const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/') {
      const html = await fs.readFile('index.html', 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  } catch (error) {
    console.error('파일 읽기 오류:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  }
});

// WebSocket 서버 생성 (HTTP 서버에 연결)
const wss = new WebSocket.Server({ server });

// 클라이언트 연결 처리
wss.on('connection', ws => {
  console.log('클라이언트가 연결되었습니다.');

  // 메시지 수신 처리 (chat 기능)
  ws.on('message', message => {
    console.log('수신된 메시지:', message.toString());

    // 연결된 모든 클라이언트에게 메시지 전송 (chat 기능)
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(`[다른 사용자]: ${message.toString()}`);
      }
    });
  });

  // 연결 종료 처리
  ws.on('close', () => {
    console.log('클라이언트 연결이 끊어졌습니다.');
  });

  // 에러 처리
  ws.on('error', error => {
    console.error('WebSocket 에러:', error);
  });

  // 연결 시 환영 메시지 전송
  ws.send('서버에 연결되었습니다!');
});

// listen 기능 구현 (특정 메시지 감지 및 응답)
const listenForKeywords = (ws, message) => {
  const lowerCaseMessage = message.toString().toLowerCase();

  if (lowerCaseMessage.includes('안녕하세요')) {
    ws.send('안녕하세요! 무엇을 도와드릴까요?');
  } else if (lowerCaseMessage.includes('오늘 날씨')) {
    // 실제 날씨 정보를 가져오는 API 호출 또는 다른 로직 필요
    ws.send('현재 날씨 정보는 준비 중입니다.');
  } else if (lowerCaseMessage.includes('시간 알려줘')) {
    const now = new Date();
    ws.send(`현재 시간은 ${now.toLocaleTimeString()}입니다.`);
  }
  // 다른 listen 키워드 및 응답 추가 가능
};

// 모든 클라이언트의 'message' 이벤트에 listenForKeywords 함수 연결
wss.on('connection', ws => {
  ws.on('message', message => {
    listenForKeywords(ws, message);
  });
});

// HTTP 서버 리스닝 시작
const port = 3005;
server.listen(port, 'localhost', () => {
  console.log(`서버가 http://localhost:${3005} 에서 실행 중입니다.`);
});
