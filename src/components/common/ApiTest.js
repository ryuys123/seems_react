import React, { useState } from 'react';
import apiClient from '../../utils/axios';

const ApiTest = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      // Spring Boot 서버가 실행 중인지 확인하는 간단한 테스트
      const response = await apiClient.get('/test');
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // POST 요청 예시 (로그인)
  const login = async (credentials) => {
    try {
      const response = await apiClient.post('/login', credentials);
      
      // 토큰 저장
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || '로그인에 실패했습니다.');
    }
  };

  // PUT 요청 예시
  const updateData = async (id, updateData) => {
    try {
      const response = await apiClient.put(`/notice/update/${id}`, updateData);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || '업데이트에 실패했습니다.');
    }
  };

  // DELETE 요청 예시
  const deleteData = async (id) => {
    try {
      const response = await apiClient.delete(`/notice/delete/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '2px solid #4b94d0', 
      borderRadius: '10px',
      backgroundColor: '#f8f9fa'
    }}>
      <h2 style={{ color: '#4b94d0' }}>🔗 React ↔ Spring Boot 연동 테스트</h2>
      
      <button 
        onClick={testApi} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4b94d0',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? '🔄 API 호출 중...' : '🚀 Spring Boot API 테스트'}
      </button>
      
      {error && (
        <div style={{ 
          color: 'red', 
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#ffe6e6',
          borderRadius: '5px'
        }}>
          ❌ 에러: {error}
        </div>
      )}
      
      {data && (
        <div style={{ marginTop: '10px' }}>
          <h4 style={{ color: '#28a745' }}>✅ API 응답 성공!</h4>
          <pre style={{ 
            background: '#f4f4f4', 
            padding: '10px',
            borderRadius: '5px',
            overflow: 'auto',
            maxHeight: '300px'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
        <p>💡 <strong>테스트 방법:</strong></p>
        <ul>
          <li>Spring Boot 서버가 실행 중인지 확인 (8888 포트)</li>
          <li>위 버튼을 클릭하여 API 호출 테스트</li>
          <li>성공하면 JSON 데이터가 표시됩니다</li>
          <li>실패하면 에러 메시지가 표시됩니다</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTest; 