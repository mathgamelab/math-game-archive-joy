import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 교과명 매핑 (PDF 파일명 -> 교과명)
const SUBJECT_MAP = {
  '[별책5] 국어과 교육과정.pdf': '국어',
  '[별책6] 도덕과 교육과정.pdf': '도덕',
  '[별책7] 사회과 교육과정.pdf': '사회',
  '[별책8] 수학과 교육과정.pdf': '수학',
  '[별책9] 과학과 교육과정.pdf': '과학',
  '[별책10] 실과(기술가정)정보과 교육과정.pdf': '정보',
  '[별책11] 체육과 교육과정.pdf': '체육',
  '[별책12] 음악과 교육과정.pdf': '음악',
  '[별책13] 미술과 교육과정.pdf': '미술',
  '[별책14] 영어과 교육과정.pdf': '영어',
  '[별책16] 제2외국어과 교육과정.pdf': '제2외국어',
  '[별책17] 한문과 교육과정.pdf': '한문'
};

// 학교급 판단 함수
function detectSchoolLevel(code) {
  if (code.startsWith('고') || code.match(/^[가-힣]+고/)) {
    return '고등학교';
  }
  if (code.match(/^[1-9]/) && parseInt(code[0]) >= 7) {
    return '중학교';
  }
  if (code.match(/^[1-6]/)) {
    const grade = parseInt(code[0]);
    if (grade <= 4) return '초등 3-4학년';
    if (grade <= 6) return '초등 5-6학년';
  }
  return null;
}

// 성취기준 코드 패턴 (예: 4수01-01, 고국01-01 등)
const STANDARD_CODE_PATTERN = /([가-힣]*\d+[가-힣]+[\d-]+)/g;

// 성취기준 텍스트 추출 함수
function extractStandards(text, subject) {
  const standards = [];
  const lines = text.split('\n');
  
  let currentCode = null;
  let currentText = '';
  let currentDomain = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // 성취기준 코드 찾기
    const codeMatch = line.match(STANDARD_CODE_PATTERN);
    if (codeMatch) {
      // 이전 성취기준 저장
      if (currentCode && currentText) {
        const schoolLevel = detectSchoolLevel(currentCode);
        if (schoolLevel) {
          standards.push({
            id: currentCode,
            text: currentText.trim(),
            domain: currentDomain || '기타'
          });
        }
      }
      
      // 새 성취기준 시작
      currentCode = codeMatch[0];
      currentText = line.replace(STANDARD_CODE_PATTERN, '').trim();
      currentDomain = '';
    } else if (currentCode) {
      // 영역/내용 찾기 (예: "수와 연산", "듣기·말하기" 등)
      const domainKeywords = ['수와 연산', '도형', '변화와 관계', '데이터와 가능성', 
                            '듣기·말하기', '읽기', '쓰기', '문법', '문학',
                            '생물의 세계', '물질과 에너지', '지구와 우주', '과학과 생활',
                            '정치', '경제', '사회', '지리', '역사'];
      
      for (const keyword of domainKeywords) {
        if (line.includes(keyword)) {
          currentDomain = keyword;
          break;
        }
      }
      
      // 성취기준 텍스트 계속 추가
      if (line && !line.match(/^[가-힣\s]+과/) && !line.match(/^\d+\./)) {
        currentText += ' ' + line;
      }
    }
  }
  
  // 마지막 성취기준 저장
  if (currentCode && currentText) {
    const schoolLevel = detectSchoolLevel(currentCode);
    if (schoolLevel) {
      standards.push({
        id: currentCode,
        text: currentText.trim(),
        domain: currentDomain || '기타'
      });
    }
  }
  
  return standards;
}

// 학교급별로 그룹화
function groupBySchoolLevel(standards) {
  const grouped = {
    '초등 3-4학년': [],
    '초등 5-6학년': [],
    '중학교': [],
    '고등학교': []
  };
  
  standards.forEach(standard => {
    const level = detectSchoolLevel(standard.id);
    if (level && grouped[level]) {
      grouped[level].push(standard);
    }
  });
  
  // 빈 배열 제거
  Object.keys(grouped).forEach(key => {
    if (grouped[key].length === 0) {
      delete grouped[key];
    }
  });
  
  return grouped;
}

// PDF 파일 파싱
async function parsePDF(filePath, subject) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    
    console.log(`\n📄 파싱 중: ${path.basename(filePath)}`);
    console.log(`   총 페이지: ${data.numpages}`);
    console.log(`   텍스트 길이: ${text.length}자`);
    
    const standards = extractStandards(text, subject);
    const grouped = groupBySchoolLevel(standards);
    
    console.log(`   추출된 성취기준: ${standards.length}개`);
    Object.keys(grouped).forEach(level => {
      console.log(`   - ${level}: ${grouped[level].length}개`);
    });
    
    return grouped;
  } catch (error) {
    console.error(`❌ 오류 발생 (${path.basename(filePath)}):`, error.message);
    return {};
  }
}

// 메인 함수
async function main() {
  const curriculumDir = path.join(__dirname, '../apps/edugame_builder/curriculum');
  const files = fs.readdirSync(curriculumDir).filter(f => f.endsWith('.pdf'));
  
  console.log('🚀 PDF 파싱 시작...\n');
  console.log(`📁 디렉토리: ${curriculumDir}`);
  console.log(`📄 PDF 파일 수: ${files.length}\n`);
  
  const allData = {};
  
  for (const file of files) {
    const subject = SUBJECT_MAP[file];
    if (!subject) {
      console.warn(`⚠️  매핑되지 않은 파일: ${file}`);
      continue;
    }
    
    const filePath = path.join(curriculumDir, file);
    const grouped = await parsePDF(filePath, subject);
    
    if (Object.keys(grouped).length > 0) {
      allData[subject] = grouped;
    }
  }
  
  // JSON 파일로 저장
  const outputPath = path.join(__dirname, '../apps/edugame_builder/curriculum-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2), 'utf-8');
  
  console.log(`\n✅ 완료! JSON 파일 저장: ${outputPath}`);
  console.log(`\n📊 총 교과 수: ${Object.keys(allData).length}`);
  
  // TypeScript 형식으로 출력
  console.log('\n📝 curriculum.tsx에 추가할 코드:\n');
  console.log('export const CURRICULUM_DATA: Record<string, Record<string, Standard[]>> = {');
  Object.keys(allData).forEach(subject => {
    console.log(`  '${subject}': {`);
    Object.keys(allData[subject]).forEach(level => {
      console.log(`    '${level}': [`);
      allData[subject][level].forEach(std => {
        console.log(`      { id: '${std.id}', text: '${std.text}', domain: '${std.domain}' },`);
      });
      console.log(`    ],`);
    });
    console.log(`  },`);
  });
  console.log('};');
}

main().catch(console.error);

