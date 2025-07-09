// src/pages/notice/NoticeWrite.js : 공지글 등록 페이지
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthProvider";

import styles from "./NoticeWritePage.module.css";

function NoticeWritePage() {
  // AuthProvider 에서 필요한 변수 또는 함수 가져오기
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);

  // 서버로 전송할 폼 데이터 (첨부파일이 있기 때문임) 상태 변수 준비
  const [formData, setFormData] = useState({
    title: "",
    userid: "",
    importance: "N",
    impEndDate: new Date().toISOString().split("T")[0], //오늘 날짜 기본값 (yyyy-MM-dd)
    content: "",
  });

  //첨부한 파일은 formData 와 별도로 지정함 (따로 전송함)
  const [file, setFile] = useState(null);

  //글등록 성공시 'NoticeList' 페이지로 이동 처리할 것이므로
  const navigate = useNavigate();

  //페이지가 랜더링될 때 (로딩될 때) 작동하는 훅임 (window.onload or jQuery.document.ready 와 같은 역할을 함)
  useEffect(() => {
    if (isLoggedIn && userid) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        userid: userid, //AuthProvider 에서 가져온 userid
      }));
    }
  }, [isLoggedIn, userid]);

  //전송 버튼 눌렀을 때 작동할 핸들러
  const handleSubmit = async (e) => {
    //기본 폼 전송 방지 (submit 이벤트 취소함)
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("userid", formData.userid);
    data.append("importance", formData.importance);
    data.append("impEndDate", formData.impEndDate);
    data.append("content", formData.content);
    if (file) {
      data.append("ofile", file); //첨부파일 추가
    }

    //등록된 data 안의 정보 확인
    console.log("전송보낼 데이터 저장 확인 ----------");
    for (let pair of data.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      await secureApiRequest("/admin/notice", {
        method: "POST",
        body: data,
      });

      alert("새 공지글 등록 성공");
      navigate("/notice"); //목록 페이지로 이동
    } catch (error) {
      console.error("공지글 등록 실패 : ", error);
      alert("새 공지글 등록 실패");
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
    <div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <table
          id="outer"
          align="center"
          width="700"
          cellSpacing="5"
          cellPadding="5"
        >
          <tbody>
            <tr>
              <td colSpan={2} className={styles.header}>
                새 공지글 등록 페이지
              </td>
            </tr>
            <tr className={styles.header}></tr>
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
              <th width="120">첨부파일</th>
              <td>
                <input type="file" name="ofile" onChange={handleFileChange} />
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
        <div className={styles.buttons}>
          <input type="submit" value="등록하기" /> &nbsp;
          <input
            type="reset"
            value="작성취소"
            onClick={() => setFormData({ ...formData, content: "" })}
          />{" "}
          &nbsp;
          <input
            type="button"
            value="목록"
            onClick={() => {
              navigate(-1);
            }}
          />
        </div>
      </form>
    </div>
  );
}

export default NoticeWritePage;
