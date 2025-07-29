// 임시 더미 noticeService
export const getLatestNotice = async () => {
  // 임시 더미 데이터
  return {
    noticeNo: 1,
    title: "시스템 점검 안내",
    content: "정기 시스템 점검이 예정되어 있습니다.",
    noticeDate: new Date().toISOString(),
    important: false
  };
}; 