# 소셜 로그인 설정 가이드

이 프로젝트는 Google, Kakao, Naver 소셜 로그인을 지원합니다. 각 플랫폼별 설정 방법을 안내합니다.

## 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=88204759456-ogqhdcosk7496df7ms7a128ushm6eak5.apps.googleusercontent.com

# Kakao OAuth
REACT_APP_KAKAO_APP_KEY=your_kakao_app_key_here
REACT_APP_KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback

# Naver OAuth
REACT_APP_NAVER_CLIENT_ID=your_naver_client_id_here
REACT_APP_NAVER_CLIENT_SECRET=your_naver_client_secret_here
REACT_APP_NAVER_REDIRECT_URI=http://localhost:3000/auth/naver/callback

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8888/seems
```

## 2. Google OAuth 설정

### 2.1 Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보" 메뉴로 이동
4. "사용자 인증 정보 만들기" > "OAuth 2.0 클라이언트 ID" 선택
5. 애플리케이션 유형을 "웹 애플리케이션"으로 설정
6. 승인된 리디렉션 URI에 `http://localhost:3000/auth/callback?provider=google` 추가
7. 클라이언트 ID를 복사하여 `.env` 파일의 `REACT_APP_GOOGLE_CLIENT_ID`에 설정

### 2.2 Google+ API 활성화
1. "API 및 서비스" > "라이브러리" 메뉴로 이동
2. "Google+ API" 검색 후 활성화

## 3. Kakao OAuth 설정

### 3.1 Kakao Developers 설정
1. [Kakao Developers](https://developers.kakao.com/)에 접속
2. 애플리케이션 생성
3. "플랫폼" > "Web" 플랫폼 추가
4. 사이트 도메인에 `http://localhost:3000` 추가
5. "카카오 로그인" > "활성화" 설정
6. "Redirect URI"에 `http://localhost:3000/auth/callback?provider=kakao` 추가
7. JavaScript 키를 복사하여 `.env` 파일의 `REACT_APP_KAKAO_APP_KEY`에 설정

### 3.2 동의항목 설정
1. "카카오 로그인" > "동의항목" 메뉴로 이동
2. 필수 동의항목 설정:
   - 닉네임 (profile_nickname)
   - 프로필 사진 (profile_image)
   - 이메일 (account_email)

## 4. Naver OAuth 설정

### 4.1 Naver Developers 설정
1. [Naver Developers](https://developers.naver.com/)에 접속
2. 애플리케이션 등록
3. "서비스 URL"에 `http://localhost:3000` 설정
4. "Callback URL"에 `http://localhost:3000/auth/callback?provider=naver` 설정
5. 클라이언트 ID와 클라이언트 시크릿을 복사하여 `.env` 파일에 설정

### 4.2 API 권한 설정
1. "API 권한" 메뉴로 이동
2. "로그인 오픈 API 서비스 환경" 설정
3. 필수 권한 설정:
   - 이름 (name)
   - 이메일 (email)
   - 프로필 사진 (profile_image)

## 5. 백엔드 API 설정

소셜 로그인이 정상적으로 작동하려면 백엔드에서 다음 API 엔드포인트들을 구현해야 합니다:

### 5.1 Google 로그인
```
POST /auth/google/login
Content-Type: application/json

{
  "idToken": "google_id_token"
}
```

### 5.2 Kakao 로그인
```
POST /auth/kakao/login
Content-Type: application/json

{
  "accessToken": "kakao_access_token"
}
```

### 5.3 Naver 로그인
```
POST /auth/naver/login
Content-Type: application/json

{
  "accessToken": "naver_access_token"
}
```

### 5.4 응답 형식
모든 소셜 로그인 API는 다음과 같은 형식으로 응답해야 합니다:

```json
{
  "success": true,
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "userInfo": {
    "userId": "user_id",
    "userName": "user_name",
    "email": "user_email",
    "role": "USER"
  }
}
```

## 6. 사용 방법

### 6.1 로그인 페이지에서 소셜 로그인
메인 로그인 페이지(`/login`)에서 각 소셜 로그인 버튼을 클릭하면 해당 소셜 로그인 페이지로 이동합니다.

### 6.2 직접 소셜 로그인 페이지 접근
- Google 로그인: `/auth/google`
- Kakao 로그인: `/auth/kakao`
- Naver 로그인: `/auth/naver`

### 6.3 콜백 처리
소셜 로그인 완료 후 `/auth/callback` 페이지에서 자동으로 처리됩니다.

## 7. 주의사항

1. **환경 변수**: `.env` 파일은 `.gitignore`에 포함되어 있어야 합니다.
2. **HTTPS**: 프로덕션 환경에서는 반드시 HTTPS를 사용해야 합니다.
3. **도메인 설정**: 각 플랫폼의 개발자 콘솔에서 올바른 도메인을 설정해야 합니다.
4. **CORS**: 백엔드에서 프론트엔드 도메인에 대한 CORS 설정이 필요합니다.

## 8. 문제 해결

### 8.1 일반적인 문제들
- **"SDK가 로드되지 않았습니다"**: 환경 변수가 올바르게 설정되었는지 확인
- **"리디렉션 URI가 일치하지 않습니다"**: 각 플랫폼의 개발자 콘솔에서 URI 설정 확인
- **"API 키가 유효하지 않습니다"**: API 키가 올바르게 복사되었는지 확인

### 8.2 디버깅
브라우저 개발자 도구의 콘솔에서 에러 메시지를 확인하세요. 소셜 로그인 관련 모든 로그가 출력됩니다.

## 9. 추가 리소스

- [Google OAuth 2.0 가이드](https://developers.google.com/identity/protocols/oauth2)
- [Kakao 로그인 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Naver 로그인 가이드](https://developers.naver.com/docs/login/api/) 