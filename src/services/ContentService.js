import apiClient from '../utils/axios';

// 감정ID로 추천 유튜브 컨텐츠 리스트 조회
export const getRecommendedContentsByEmotionId = async (emotionId) => {
  try {
    const response = await apiClient.get(`/api/content-recommendations/${emotionId}`);
    return response.data;
  } catch (error) {
    console.error('추천 유튜브 컨텐츠 조회 에러:', error);
    throw error;
  }
};

// YouTube Data API로 영상 정보 가져오기
export const fetchYoutubeMeta = async (videoId, apiKey) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const snippet = data.items[0].snippet;
      return {
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url
      };
    }
    return null;
  } catch (error) {
    console.error('YouTube 메타데이터 조회 에러:', error);
    return null;
  }
}; 