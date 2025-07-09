// src/components/common/PagingView.js
import React from "react";
import styles from "./PagingView.module.css";

// function PaginView({currentPage, totalPage, onPageChange}) {} 작성해도 됨
// 컴포넌트 함수의 매개변수는 사용시, 태그의 속성(attribute)처럼 사용함
// <컴포넌트명 매개변수={전달값} 이벤트매개변수={값변경상태함수} />
const PagingView = ({
  currentPage,
  totalPage,
  startPage,
  endPage,
  onPageChange,
}) => {
  // const groupSize = 10; // 한 그룹에 페이지 숫자 10개
  // const currentGroup = Math.ceil(currentPage / groupSize); // 현재 페이지가 속한 페이지그룹
  //만약, 페이지그룹의 시작과 끝숫자를 서버에서 받지 않는다면 (현재페이지, 총페이지수만 받은 경우) 직접 계산함
  // const startPage = (currentGroup - 1) * groupSize + 1; // 현재 그룹의 시작 페이지 숫자
  // const endPage = Math.min(currentGroup * groupSize, totalPage); // 현재 그룹의 끝페이지 숫자

  //현재 페이지 그룹의 페이지 번호 리스트 생성 (배열만들기)
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className={styles.pagingContainer}>
      {/* 1페이지로 이동 버튼 */}
      <button disabled={currentPage === 1} onClick={() => onPageChange(1)}>
        ◁
      </button>
      {/* 이전 페이지그룹으로 이동 버튼 */}
      <button
        disabled={startPage === 1}
        onClick={() => onPageChange(startPage - 1)}
      >
        ◁◁
      </button>
      {/* 현재 페이지가 속한 페이지 그룹 숫자들 출력 처리 */}
      {pages.map((page) => (
        <button
          key={page}
          className={currentPage === page ? styles.activePage : ""}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      {/* 다음 페이지그룹으로 이동 버튼 */}
      <button
        disabled={endPage === totalPage}
        onClick={() => onPageChange(endPage + 1)}
      >
        ▷▷
      </button>
      {/* 마지막페이지로 이동 버튼 */}
      <button
        disabled={currentPage === totalPage}
        onClick={() => onPageChange(totalPage)}
      >
        ▷
      </button>
    </div>
  );
};

export default PagingView;
