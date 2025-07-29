import apiClient from '../utils/axios';

// 실제 API 호출하는 noticeService
export const getLatestNotice = async () => {
  try {
    const response = await apiClient.get('/notice/latest');
    return response.data;
  } catch (error) {
    // 404 에러는 공지사항이 없는 것으로 처리
    if (error.response && error.response.status === 404) {
      return null;
    }
    // console.error('최신 공지사항 조회 실패:', error);
    return null;
  }
}; 