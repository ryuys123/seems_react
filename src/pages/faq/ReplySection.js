import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import { useParams } from "react-router-dom";

import styles from "./ReplySection.module.css";

function ReplySection({ faqNo }) {
  // 전역 상태 관리자에서 필요한 정보 가져오기
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);

  //   // url 에서 no 파라메터 값 추출함
  //   const { faqNo } = useParams();

  // 지역 상태 관리 변수와 함수 준비
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState("");
  const [error, setError] = useState(null); //에러 메세지 저장용 상태 변수임

  // 댓글 목록 불러오기
  const fetchReplies = async () => {
    console.log("faqNo : ", faqNo);

    try {
      const res = await apiClient.get(`/faq/detail/${faqNo}/replies`);
      setReplies(res.data);
      console.log(res.data);
    } catch (err) {
      setError("댓글 조회 실패!");
      console.error(err);
    }
  };

  // 댓글 등록
  const handleSubmitReply = async () => {
    if (!newReply.trim()) return;

    try {
      await secureApiRequest("post", `/faq/replies`, {
        faqNo,
        userid,
        content: newReply,
      });
      setNewReply("");
      fetchReplies();
    } catch (err) {
      console.error("댓글 작성 실패", err);
    }
  };

  // 컴포넌트 mount 시 댓글 조회
  useEffect(() => {
    fetchReplies();
  }, [faqNo]);

  return (
    <div className={styles.replySection}>
      <h3>답변 및 댓글</h3>

      <div className={styles.replyList}>
        {replies.length === 0 ? (
          <p className={styles.noReply}>아직 댓글이 없습니다.</p>
        ) : (
          replies.map((reply) => (
            <div key={reply.replyId} className={styles.replyItem}>
              <div className={styles.replyHeader}>
                <strong>
                  {reply.userid === "user001" ? "관리자" : reply.userid}
                </strong>
                <span className={styles.replyDate}>{reply.replyDate}</span>
              </div>
              <p className={styles.replyContent}>{reply.content}</p>
            </div>
          ))
        )}
      </div>

      {isLoggedIn && (
        <div className={styles.replyInput}>
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="댓글을 입력하세요"
          />
          <button onClick={handleSubmitReply}>등록</button>
        </div>
      )}
    </div>
  );
}

export default ReplySection;
