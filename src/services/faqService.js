import apiClient from '../utils/axios';

// 실제 API 호출하는 faqService
export const getDashboardFaqs = async (userid) => {
  try {
    const response = await apiClient.get('/faq/my', {
      params: {
        userid: userid,
        limit: 3
      }
    });
    return response.data;
  } catch (error) {
    // 404 에러는 문의사항이 없는 것으로 처리
    if (error.response && error.response.status === 404) {
      return { list: [], total: 0 };
    }
    // console.error('대시보드 FAQ 조회 실패:', error);
    return { list: [], total: 0 };
  }
}; 