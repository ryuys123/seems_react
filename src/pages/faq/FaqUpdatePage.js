// src/pages/faq/FaqUpdate.js : 공지글 수정 페이지
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";

import styles from "./FaqUpdatePage.module.css";

const categoryOptions = [
  // { value: "", label: "선택" },
  { value: "계정 관리", label: "계정 관리" },
  { value: "서비스 이용", label: "서비스 이용" },
  { value: "기술 지원", label: "기술 지원" },
  { value: "기타", label: "기타" },
];

function FaqUpdatePage() {
  // AuthProvider 에서 필요한 변수 또는 함수 가져오기
  const { secureApiRequest } = useContext(AuthContext);

  // 라우터 url 에서 no 파라미터를 추출함
  const { faqNo } = useParams();

  // 폼 데이터 상태 변수 준비
  const [formData, setFormData] = useState({
    faqNo: "",
    title: "",
    userid: "",
    category: "",
    content: "",
    status: "",
    faqDate: new Date().toISOString().split("T")[0], //오늘 날짜 기본값 (yyyy-MM-dd)
  });

  //에러 메시지 저장용
  const [error, setError] = useState(null);

  //글등록 성공시 'faqDetail' 페이지로 이동 처리할 것이므로
  const navigate = useNavigate();

  //페이지가 랜더링될 때 (로딩될 때) 작동하는 훅임 (window.onload or jQuery.document.ready 와 같은 역할을 함)
  useEffect(() => {
    const fetchFaqDetail = async () => {
      console.log("no : ", faqNo);

      try {
        const response = await apiClient.get(`/faq/detail/${faqNo}`);
        console.log(response.data);

        //서버로 부터 받은 정보로 form 에 출력할 초기값 지정
        setFormData({
          faqNo: response.data.faqNo,
          title: response.data.title,
          userid: response.data.userid,
          category: response.data.category,
          content: response.data.content,
          status: response.data.status,
          faqDate: response.data.faqDate,
        });
      } catch (error) {
        setError("문의글 정보 불러오기 실패!");
        console.error(error);
      }
    };
    // 문의글 조회 요청 함수 실행
    fetchFaqDetail();
  }, [faqNo]);

  //전송 버튼 눌렀을 때 작동할 핸들러
  const handleSubmit = async (e) => {
    //기본 폼 전송 방지 (submit 이벤트 취소함)
    e.preventDefault();

    const data = new FormData();
    data.append("faqNo", formData.faqNo);
    data.append("title", formData.title);
    data.append("userid", formData.userid);
    data.append("category", formData.category);
    data.append("content", formData.content);
    data.append("status", formData.status);
    data.append("faqDate", formData.faqDate);

    //등록된 data 안의 정보 확인
    console.log("전송보낼 데이터 저장 확인 ----------");
    for (let pair of data.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      await secureApiRequest(`/faq/${faqNo}`, {
        method: "PUT",
        body: data,
      });

      alert("문의글 수정 성공");
      navigate(`/faqd/${faqNo}`); //목록 페이지로 이동
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

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <table className={styles.table}>
        <tr>
          <td colSpan={2}>
            <div>
              <div className={styles.pageTitle}>문의글 수정 페이지</div>
            </div>
          </td>
        </tr>

        <tbody>
          <tr>
            <th>등록날짜</th>
            <td>
              <input
                type="text"
                name="faqDate"
                value={formData.faqDate}
                readOnly
                className={styles.input}
              />
            </td>
          </tr>
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
        <input type="submit" value="수정하기" /> &nbsp;
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
export default FaqUpdatePage;
