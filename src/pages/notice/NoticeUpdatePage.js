// src/pages/notice/NoticeUpdate.js : 공지글 수정 페이지
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";

import styles from "./NoticeUpdatePage.module.css";

function NoticeUpdatePage() {
  // AuthProvider 에서 필요한 변수 또는 함수 가져오기
  const { secureApiRequest } = useContext(AuthContext);

  // 라우터 url 에서 no 파라미터를 추출함
  const { noticeNo } = useParams();

  // 폼 데이터 (첨부파일이 있기 때문임) 상태 변수 준비
  const [formData, setFormData] = useState({
    noticeNo: "",
    title: "",
    userid: "",
    noticeDate: new Date().toISOString().split("T")[0], //오늘 날짜 기본값 (yyyy-MM-dd)
    importance: "N",
    impEndDate: new Date().toISOString().split("T")[0], //오늘 날짜 기본값 (yyyy-MM-dd)
    content: "",
    originalFilePath: "",
    renameFilePath: "",
    readCount: 0,
  });

  //첨부한 파일은 formData 와 별도로 지정함 (따로 전송함)
  const [file, setFile] = useState(null);

  //에러 메시지 저장용
  const [error, setError] = useState(null);

  //글등록 성공시 'NoticeDetail' 페이지로 이동 처리할 것이므로
  const navigate = useNavigate();

  //페이지가 랜더링될 때 (로딩될 때) 작동하는 훅임 (window.onload or jQuery.document.ready 와 같은 역할을 함)
  useEffect(() => {
    //서버측에 요청해서 해당 공지글 가져오는 비동기 통신 처리 함수 작성
    const fetchNoticeDetail = async () => {
      console.log("no : ", noticeNo);

      try {
        // url path 와 ${변수명} 을 같이 사용시에는 반드시 빽틱(``)을 사용해야 함 (작은 따옴표 아님 : 주의할 것)
        const response = await apiClient.get(`/notice/detail/${noticeNo}`);
        console.log(response.data);

        //서버로 부터 받은 정보로 form 에 출력할 초기값 지정
        setFormData({
          noticeNo: response.data.noticeNo,
          title: response.data.title,
          userid: response.data.userid,
          noticeDate: response.data.noticeDate,
          importance: response.data.importance,
          impEndDate: response.data.impEndDate,
          content: response.data.content,
          originalFilePath: response.data.originalFilePath,
          renameFilePath: response.data.renameFilePath,
          readCount: response.data.readCount,
        });
      } catch (error) {
        setError("공지글 정보 불러오기 실패!");
        console.error(error);
      }
    }; //fetchNoticeDetail()

    //공지글 조회 요청 함수 실행
    fetchNoticeDetail();
  }, [noticeNo]);

  //전송 버튼 눌렀을 때 작동할 핸들러
  const handleSubmit = async (e) => {
    //기본 폼 전송 방지 (submit 이벤트 취소함)
    e.preventDefault();

    const data = new FormData();
    data.append("noticeNo", formData.noticeNo);
    data.append("title", formData.title);
    data.append("userid", formData.userid);
    data.append("noticeDate", formData.noticeDate);
    data.append("importance", formData.importance);
    data.append("impEndDate", formData.impEndDate);
    data.append("content", formData.content);
    data.append("originalFilePath", formData.originalFilePath);
    data.append("renameFilePath", formData.renameFilePath);
    data.append("readCount", formData.readCount);
    if (file) {
      data.append("upfile", file); //첨부파일 추가
    }

    //등록된 data 안의 정보 확인
    console.log("전송보낼 데이터 저장 확인 ----------");
    for (let pair of data.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      await secureApiRequest(`/admin/notice/${noticeNo}`, {
        method: "PUT",
        body: data,
      });

      alert("공지글 수정 성공");
      navigate(`/noticed/${noticeNo}`); //목록 페이지로 이동
    } catch (error) {
      console.error("공지글 수정 실패 : ", error);
      alert("공지글 수정 실패");
    }
  };

  //input 의 값이 변경되면(input 에 값이 기록되면) 작동할 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    //formData 상태를 업데이트함 => input 의 값이 보여짐
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));
  };

  //첨부파일 선택이 변경되었을 때 작동할 핸들러
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // input 에서 선택한 파일명을 file 변수에 저장
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{noticeNo} 공지글 수정 페이지</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <table className={styles.table}>
          <tbody>
            <tr>
              <th width="120">번호</th>
              <td>
                <input
                  type="text"
                  name="noticeNo"
                  size="50"
                  value={formData.noticeNo}
                  readOnly
                />
              </td>
            </tr>
            <tr>
              <th width="120">제목</th>
              <td>
                <input
                  type="text"
                  name="title"
                  size="50"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <th width="120">작성자</th>
              <td>
                <input
                  type="text"
                  name="userid"
                  value={formData.userid}
                  readOnly
                />
              </td>
            </tr>
            <tr>
              <th width="120">등록날짜</th>
              <td>
                <input
                  type="date"
                  name="noticeDate"
                  value={formData.noticeDate}
                  readOnly
                />
              </td>
            </tr>
            <tr>
              <th width="120">중요도</th>
              <td>
                <input
                  type="checkbox"
                  name="importance"
                  value="Y"
                  checked={formData.importance === "Y" ? true : false}
                  onChange={handleChange}
                />
                {"  "} 중요
              </td>
            </tr>
            <tr>
              <th width="120">중요도 지정 종료 날짜</th>
              <td>
                <input
                  type="date"
                  name="impEndDate"
                  value={formData.impEndDate}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <th width="120">조회수</th>
              <td>
                <input
                  type="text"
                  name="readCount"
                  value={formData.readCount}
                  readOnly
                />
              </td>
            </tr>
            <tr>
              <th width="120">첨부파일</th>
              <td>
                <input type="file" name="upfile" onChange={handleFileChange} />
                {formData.originalFilePath && (
                  <div>
                    <span>현재 파일 : {formData.originalFilePath}</span>
                  </div>
                )}
              </td>
            </tr>
            <tr>
              <th width="120">내용</th>
              <td>
                <textarea
                  rows="5"
                  cols="50"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                ></textarea>
              </td>
            </tr>
          </tbody>
        </table>
        <div className={styles.buttonGroup}>
          <input type="submit" value="수정하기" className={styles.button} />
          <input
            type="button"
            value="취소"
            className={styles.button}
            onClick={() => navigate(`/noticed/${noticeNo}`)}
          />
        </div>
      </form>
    </div>
  );
}

export default NoticeUpdatePage;
