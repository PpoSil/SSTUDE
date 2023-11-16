import { useState, useEffect, useRef } from "react";

export const useWebSocket = (url: string, maxReconnectAttempts: number = 3) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const [messages, setMessages] = useState<string[]>([]);

  // 웹소켓 연결 함수
  const connect = () => {
    console.log("웹소켓 연결 시도 중...");

    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("웹소켓 연결됨.");
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      console.log("메시지 수신:", event.data);
    };

    ws.onerror = (error) => {
      console.error("웹소켓 오류:", error);
    };

    ws.onclose = () => {
      console.log("웹소켓 연결 종료됨.");
      if (reconnectAttempts.current < maxReconnectAttempts) {
        console.log(`재연결 시도 ${reconnectAttempts.current + 1}/${maxReconnectAttempts}`);
        setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, 3000);
      }
    };

    setSocket(ws);
  };

  // 웹소켓 연결 및 정리
  useEffect(() => {
    connect();

    return () => {
      if (socket) {
        console.log("웹소켓 연결 해제 중...");
        socket.close();
      }
    };
  }, []);

  // 재연결 핸들러
  const handleReconnect = () => {
    console.log("재연결 핸들러 호출됨.");
    reconnectAttempts.current = 0;
    connect();
  };

  // 메시지 보내기
  const sendMessage = (message: any) => {
    return new Promise((resolve, reject) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.error("웹소켓이 연결되지 않았습니다.");
        return reject(new Error("웹소켓이 연결되지 않았습니다."));
      }

      const messageListener = (event: any) => {
        console.log("응답 메시지 수신:", event.data);
        const responseData = JSON.parse(event.data);

        if (responseData && responseData.type === message.type) {
          resolve(responseData);
          socket.removeEventListener("message", messageListener);
        }
      };

      socket.addEventListener("message", messageListener);

      console.log("메시지 전송 중:", message);
      socket.send(JSON.stringify(message));
    });
  };

  return { messages, handleReconnect, sendMessage };
};
