// 임시 더미 faqService
export const getDashboardFaqs = async (userid) => {
  // 임시 더미 데이터
  return {
    list: [
      {
        faqNo: 1,
        title: "서비스 이용 방법",
        status: "ANSWERED",
        createdAt: new Date().toISOString()
      },
      {
        faqNo: 2,
        title: "계정 관련 문의",
        status: "PENDING",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    total: 2
  };
}; 