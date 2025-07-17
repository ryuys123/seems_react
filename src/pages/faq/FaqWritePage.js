// src/pages/faq/FaqWritePage.js : FAQ글 등록 페이지
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthProvider";

import styles from "./FaqWritePage.module.css";

const categoryOptions = [
  // { value: "", label: "선택" },
  { value: "계정 관리", label: "계정 관리" },
  { value: "서비스 이용", label: "서비스 이용" },
  { value: "기술 지원", label: "기술 지원" },
  { value: "기타", label: "기타" },
];

function FaqWritePage() {
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: "",
    userid: "",
    category: "",
    content: "",
    faqDate: new Date().toISOString().split("T")[0], //오늘 날짜 기본값 (yyyy-MM-dd)
    status: "PENDING",
  });

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
    data.append("category", formData.category);
    data.append("faqDate", formData.faqDate);
    data.append("content", formData.content);
    data.append("status", formData.status);

    //등록된 data 안의 정보 확인
    console.log("전송보낼 데이터 저장 확인 ----------");
    for (let pair of data.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      await secureApiRequest("/faq", {
        method: "POST",
        body: data,
      });

      alert("새 문의글 등록 성공");
      navigate("/faq"); //목록 페이지로 이동
    } catch (error) {
      console.error("문의글 등록 실패 : ", error);
      alert("새 문의글 등록 실패");
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

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <table className={styles.table}>
        <tr>
          <td colSpan={2}>
            <div>
              <div className={styles.pageTitle}>문의글 작성 페이지</div>
              <div className={styles.subText}>문의사항을 작성해 주세요.</div>
            </div>
          </td>
        </tr>

        <tbody>
          <tr>
            <th>카테고리</th>
            <td>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={styles.input}
              >
                <option value="" disabled hidden>
                  카테고리 선택
                </option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <th>제목</th>
            <td>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </td>
          </tr>
          <tr>
            <th>내용</th>
            <td>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                className={styles.textarea}
              />
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
  );
}

export default FaqWritePage;
