# React와 Spring Boot 연동 가이드

## 개요
이 프로젝트는 React 프론트엔드와 Spring Boot 백엔드를 연동하여 개발하는 프로젝트입니다.

## 프로젝트 구조
```
seems/
├── seems_react/          # React 프론트엔드
│   └── seems/
│       ├── src/
│       │   ├── utils/
│       │   │   └── axios.js          # API 호출 설정
│       │   ├── config/
│       │   │   └── config.js         # 환경 설정
│       │   └── components/
│       │       └── common/
│       │           └── ApiTest.js     # API 테스트 컴포넌트
│       └── package.json
└── seems_spring/         # Spring Boot 백엔드
    └── seems/
        ├── src/main/java/
        │   └── com/test/seems/
        │       └── config/
        │           └── CorsConfig.java # CORS 설정
        └── build.gradle
```

## 실행 방법

### 1. Spring Boot 서버 실행
```bash
cd seems_spring/seems
./gradlew bootRun
```
- 서버가 `http://localhost:8888/seems`에서 실행됩니다.

### 2. React 개발 서버 실행
```bash
cd seems_react/seems
npm start
```
- React 앱이 `http://localhost:3000`에서 실행됩니다.

## API 연동 설정

### 1. CORS 설정
Spring Boot에서 React의 요청을 허용하도록 CORS 설정이 되어 있습니다:
- 허용 Origin: `http://localhost:3000`
- 허용 메서드: GET, POST, PUT, DELETE, OPTIONS
- 허용 헤더: 모든 헤더
- Credentials: true

### 2. Axios 설정
React에서 Spring Boot API를 호출하기 위한 axios 설정:
- 기본 URL: `http://localhost:8888/seems`
- 자동 토큰 추가
- 토큰 만료 시 자동 갱신
- 에러 처리

### 3. JWT 인증
- Access Token: 30분 유효
- Refresh Token: 1일 유효
- 토큰은 localStorage에 저장
- 자동 토큰 갱신 기능

## API 사용 예시

### GET 요청
```javascript
import api from '../utils/axios';

const fetchData = async () => {
  try {
    const response = await api.get('/notice/ntop3');
    console.log(response.data);
  } catch (error) {
    console.error('에러:', error);
  }
};
```

### POST 요청 (로그인)
```javascript
const login = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    // 토큰이 자동으로 localStorage에 저장됩니다
    return response.data;
  } catch (error) {
    throw new Error('로그인 실패');
  }
};
```

### PUT 요청
```javascript
const updateData = async (id, data) => {
  try {
    const response = await api.put(`/notice/update/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error('업데이트 실패');
  }
};
```

### DELETE 요청
```javascript
const deleteData = async (id) => {
  try {
    const response = await api.delete(`/notice/delete/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('삭제 실패');
  }
};
```

## 환경 설정

### 개발 환경
- React: `http://localhost:3000`
- Spring Boot: `http://localhost:8888/seems`

### 프로덕션 환경
- `src/config/config.js`에서 프로덕션 URL 설정

## 주의사항

1. **포트 충돌**: Spring Boot가 8888 포트를 사용하므로 다른 서비스와 충돌하지 않도록 주의
2. **데이터베이스**: Oracle DB 연결이 필요합니다
3. **토큰 관리**: JWT 토큰은 자동으로 관리되지만, 수동으로 관리할 수도 있습니다
4. **CORS**: 개발 중에는 CORS 설정이 되어 있지만, 프로덕션에서는 적절한 도메인으로 설정해야 합니다

## 문제 해결

### CORS 에러
- Spring Boot 서버가 실행 중인지 확인
- `CorsConfig.java`에서 올바른 origin이 설정되어 있는지 확인

### 토큰 관련 에러
- localStorage에 토큰이 저장되어 있는지 확인
- 토큰이 만료되었는지 확인
- 네트워크 탭에서 요청/응답을 확인

### API 호출 실패
- Spring Boot 서버가 실행 중인지 확인
- API 엔드포인트가 올바른지 확인
- 네트워크 연결 상태 확인 