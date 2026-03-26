import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedback, setFeedback] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // 1. 첫 번째 시트(문항정보표) 읽기
      const sheet1 = workbook.Sheets[workbook.SheetNames[0]];
      setQuestions(XLSX.utils.sheet_to_json(sheet1));

      // 2. 두 번째 시트(학생평가) 읽기
      const sheet2 = workbook.Sheets[workbook.SheetNames[1]];
      setStudents(XLSX.utils.sheet_to_json(sheet2));
    };
    reader.readAsArrayBuffer(file);
  };

  const generateFeedback = (student) => {
    setSelectedStudent(student);
    
    const wrongNumbersStr = String(student['틀린 문항 번호'] || '');
    const wrongNumbers = wrongNumbersStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));

    const correctQuestions = questions.filter(q => !wrongNumbers.includes(parseInt(q['번호'])));
    const wrongQuestions = questions.filter(q => wrongNumbers.includes(parseInt(q['번호'])));

    const name = student['학생 이름'];
    let resultText = `[${name} 학생의 수학 단원평가 결과 안내]\n\n`;
    resultText += `안녕하세요! 이번 수학 단원평가를 치르느라 몹시 애쓴 ${name}에게 먼저 힘찬 박수를 보냅니다. 새로운 개념을 배우고 적용하느라 고민이 많았을 텐데, 끝까지 포기하지 않고 문제를 풀어낸 모습이 참 대견합니다.\n\n`;

    resultText += `🌟 ${name}이가 잘하고 있는 부분 (강점)\n`;
    if (correctQuestions.length > 0) {
      const strengths = [...new Set(correctQuestions.map(q => q['평가 내용']))].slice(0, 2).join(', ');
      resultText += `이번 평가 결과를 살펴보니, ${name}이는 '${strengths}' 원리를 아주 정확하게 이해하고 있습니다. 이 부분의 성취 기준을 훌륭하게 달성한 점을 크게 칭찬해 주고 싶습니다.\n\n`;
    } else {
      resultText += `끝까지 최선을 다해 문제를 풀어낸 끈기와 노력을 칭찬합니다.\n\n`;
    }

    resultText += `🌱 앞으로 조금 더 노력하면 좋을 부분 (보완점)\n`;
    if (wrongQuestions.length > 0) {
      const weaknesses = [...new Set(wrongQuestions.map(q => q['평가 내용']))].join(', ');
      resultText += `${name}이의 더 큰 성장을 위해 보완하면 좋을 점도 함께 안내해 드립니다. 현재 ${name}이는 '${weaknesses}' 부분에서 조금 헷갈리는 부분이 있는 것 같습니다. 이 원리에 대한 꼼꼼한 확인이 필요합니다.\n\n`;
      
      resultText += `📚 가정에서의 학습 조언\n`;
      resultText += `가정에서는 새로운 문제집을 풀기보다는, 틀렸던 문제의 개념을 교과서나 배움 공책을 통해 천천히 복습해 보는 것을 추천합니다. 하루에 2~3문제 정도만 꾸준히 연습하다 보면 수학적 역량이 훌쩍 자랄 것입니다.\n\n`;
    } else {
      resultText += `모든 문제를 완벽하게 이해하고 맞추었습니다! 정말 대단합니다. 지금처럼 꾸준히 학습한다면 앞으로도 훌륭한 수학 실력을 보여줄 것입니다.\n\n`;
    }

    resultText += `${name}이의 무한한 발전 가능성을 믿습니다. 학교에서도 ${name}이가 원리를 잘 적용하고 자신감을 가질 수 있도록 세심히 돕겠습니다. 감사합니다.`;

    setFeedback(resultText);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c3e50' }}>📊 우리 반 단원평가 피드백 생성기</h1>
      
      <div style={{ margin: '20px 0', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>1. 엑셀 파일 업로드</h3>
        <p style={{ fontSize: '14px', color: '#666' }}>'문항정보표'와 '학생평가' 시트가 작성된 엑셀 파일을 올려주세요.</p>
        <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
      </div>

      {students.length > 0 && (
        <div style={{ margin: '20px 0' }}>
          <h3>2. 학생 선택</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {students.map((student, idx) => (
              <button 
                key={idx} 
                onClick={() => generateFeedback(student)}
                style={{
                  padding: '10px 15px', 
                  backgroundColor: selectedStudent === student ? '#3498db' : '#ecf0f1',
                  color: selectedStudent === student ? 'white' : '#2c3e50',
                  border: 'none', borderRadius: '5px', cursor: 'pointer'
                }}
              >
                {student['학생 이름']}
              </button>
            ))}
          </div>
        </div>
      )}

      {feedback && (
        <div style={{ margin: '20px 0', padding: '20px', border: '2px solid #3498db', borderRadius: '8px' }}>
          <h3>📝 맞춤형 피드백 결과</h3>
          <textarea 
            readOnly 
            value={feedback} 
            style={{ width: '100%', height: '350px', padding: '15px', fontSize: '15px', lineHeight: '1.6', border: 'none', resize: 'none' }}
          />
          <button 
            onClick={() => navigator.clipboard.writeText(feedback)}
            style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            복사해서 알림장에 붙여넣기
          </button>
        </div>
      )}
    </div>
  );
}
