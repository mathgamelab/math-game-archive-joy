
import React, { useState, useEffect, useMemo } from 'react';
import { FormData } from '../../types';
import { CURRICULUM_DATA, Standard, SCHOOL_LEVELS, SchoolLevel } from '../../curriculum';
import { GAME_EXAMPLES, Icons } from '../../constants';
import AICoach from '../AICoach';

interface Step2Props {
  formData: FormData;
  updateField: (field: string, value: any) => void;
}

type StandardWithMeta = Standard & { schoolLevel: string; grade: string; subject: string };

// Step1에 있는 교과 목록 (메인 화면에 표시되는 교과)
const MAIN_SUBJECTS: Set<string> = new Set([
  '국어', '수학', '사회', '과학', '영어', '체육', '음악', '미술', 
  '기술가정', '정보', '제2외국어', '기타'
]);

const Step2: React.FC<Step2Props> = ({ formData, updateField }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStandard, setSelectedStandard] = useState<StandardWithMeta | null>(null);
  const [selectedGrades, setSelectedGrades] = useState<Set<string>>(new Set());
  const example = (formData.subject && GAME_EXAMPLES[formData.subject]) || GAME_EXAMPLES['기타'];
  
  // "기타" 선택 시 메인 화면에 없는 교과들의 데이터도 포함
  const subjectData = useMemo(() => {
    if (!formData.subject) return null;
    
    if (formData.subject === '기타') {
      // "기타" 선택 시: 메인 화면에 없는 모든 교과의 데이터를 합침
      const otherSubjectsData: Record<string, Standard[]> = {};
      
      for (const [subject, grades] of Object.entries(CURRICULUM_DATA)) {
        if (!MAIN_SUBJECTS.has(subject)) {
          // 메인 화면에 없는 교과의 데이터를 합침
          for (const [grade, standards] of Object.entries(grades)) {
            if (!otherSubjectsData[grade]) {
              otherSubjectsData[grade] = [];
            }
            otherSubjectsData[grade].push(...standards);
          }
        }
      }
      
      // 기존 "기타" 데이터도 포함
      if (CURRICULUM_DATA['기타']) {
        for (const [grade, standards] of Object.entries(CURRICULUM_DATA['기타'])) {
          if (!otherSubjectsData[grade]) {
            otherSubjectsData[grade] = [];
          }
          otherSubjectsData[grade].push(...standards);
        }
      }
      
      return Object.keys(otherSubjectsData).length > 0 ? otherSubjectsData : null;
    }
    
    return CURRICULUM_DATA[formData.subject] || null;
  }, [formData.subject]);
  
  // 모든 성취기준을 평탄화하고 메타데이터 추가
  const allStandardsWithMeta = useMemo(() => {
    if (!formData.subject || !subjectData) return [];
    
    const standards: (Standard & { schoolLevel: string; grade: string; subject: string })[] = [];
    
    // "기타" 선택 시: 여러 교과의 데이터가 섞여있으므로 각 표준의 원래 교과를 유지
    if (formData.subject === '기타') {
      // 모든 학교급과 학년군을 순회
      for (const [schoolLevel, gradeGroups] of Object.entries(SCHOOL_LEVELS)) {
        for (const grade of gradeGroups) {
          if (subjectData[grade]) {
            subjectData[grade].forEach(standard => {
              // standard.subject가 이미 설정되어 있음 (curriculum.tsx에서)
              standards.push({
                ...standard,
                schoolLevel: standard.schoolLevel || schoolLevel,
                grade,
                subject: standard.subject || '기타'
              } as StandardWithMeta);
            });
          }
        }
      }
    } else {
      // 일반 교과 선택 시: 기존 로직
      for (const [schoolLevel, gradeGroups] of Object.entries(SCHOOL_LEVELS)) {
        for (const grade of gradeGroups) {
          if (subjectData[grade]) {
            subjectData[grade].forEach(standard => {
              standards.push({
                ...standard,
                schoolLevel,
                grade,
                subject: formData.subject
              } as StandardWithMeta);
            });
          }
        }
      }
    }
    
    return standards;
  }, [formData.subject, subjectData]);

  // 사용 가능한 학년 목록 추출
  const availableGrades = useMemo(() => {
    const grades = new Set<string>();
    allStandardsWithMeta.forEach(s => grades.add(s.grade));
    return Array.from(grades).sort();
  }, [allStandardsWithMeta]);

  // 필터링 및 검색 적용
  const filteredStandards = useMemo(() => {
    let filtered = allStandardsWithMeta;

    // 검색어 필터링
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.text.toLowerCase().includes(lowerSearch) || 
        s.id.toLowerCase().includes(lowerSearch) ||
        s.domain.toLowerCase().includes(lowerSearch) ||
        (s.majorUnit && s.majorUnit.toLowerCase().includes(lowerSearch))
      );
    }

    // 학년 필터링
    if (selectedGrades.size > 0) {
      filtered = filtered.filter(s => selectedGrades.has(s.grade));
    }

    // 코드순 정렬
    const sorted = [...filtered].sort((a, b) => {
      return a.id.localeCompare(b.id);
    });

    return sorted;
  }, [allStandardsWithMeta, searchTerm, selectedGrades]);

  // 필터 초기화 (교과 변경 시)
  useEffect(() => {
    setSelectedGrades(new Set());
    setSearchTerm('');
    setSelectedStandard(null);
  }, [formData.subject]);

  const toggleGrade = (grade: string) => {
    const newSet = new Set(selectedGrades);
    if (newSet.has(grade)) {
      newSet.delete(grade);
    } else {
      newSet.add(grade);
    }
    setSelectedGrades(newSet);
  };

  const selectedList = useMemo(() => 
    formData.curriculumStandard ? formData.curriculumStandard.split('\n').filter(Boolean) : [],
    [formData.curriculumStandard]
  );

  const toggleStandard = (standard: StandardWithMeta) => {
    const isSelected = selectedList.includes(standard.text);
    let newList;
    if (isSelected) {
      newList = selectedList.filter(item => item !== standard.text);
    } else {
      newList = [...selectedList, standard.text];
    }
    updateField('curriculumStandard', newList.join('\n'));
    setSelectedStandard(standard);
  };

  // 경로 생성 함수
  const getPath = (standard: StandardWithMeta): string => {
    const parts = [standard.schoolLevel, standard.subject];
    if (standard.majorUnit) {
      parts.push(standard.majorUnit);
    }
    parts.push(standard.domain);
    return parts.join('>');
  };

  return (
    <div className="space-y-8 animate-in pb-12">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">학습 설계 <span className="text-orange-600">(Curriculum)</span></h2>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">전체 교육과정 성취기준 중 게임에 녹여낼 핵심 요소들을 선택하세요.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* 검색 리스트 */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Icons.Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">성취기준 통합 검색</h3>
                  <p className="text-xs text-slate-400">교과: {formData.subject || '미선택'} | 전체: {allStandardsWithMeta.length}개 | 표시: {filteredStandards.length}개</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {['초등 1-2학년', '초등 3-4학년', '초등 5-6학년', '중학교', '고등학교'].map(grade => {
                  // availableGrades에 있는 학년만 표시
                  if (!availableGrades.includes(grade)) return null;
                  return (
                    <button
                      key={grade}
                      onClick={() => toggleGrade(grade)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedGrades.has(grade)
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
                      }`}
                    >
                      {grade}
                    </button>
                  );
                })}
                {selectedGrades.size > 0 && (
                  <button
                    onClick={() => setSelectedGrades(new Set())}
                    className="px-2 py-1.5 text-[10px] text-orange-600 hover:underline font-medium"
                    title="모두 해제"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="relative mb-4">
              <input 
                type="text"
                placeholder="키워드로 검색 (예: 함수, 분수, 인공지능)..."
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-orange-500 transition-all text-sm shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white" style={{ maxHeight: 'calc(5 * 100px)' }}>
            {filteredStandards.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {filteredStandards.map((s) => {
                  const isChecked = selectedList.includes(s.text);
                  return (
                    <div 
                      key={`${s.id}-${s.grade}`}
                      onClick={() => toggleStandard(s)}
                      className={`group flex items-start gap-4 p-4 cursor-pointer transition-all border-l-4 ${
                        selectedStandard?.id === s.id && selectedStandard?.grade === s.grade
                          ? 'bg-orange-50 border-orange-500' 
                          : isChecked 
                          ? 'bg-orange-50/40 border-orange-300' 
                          : 'hover:bg-slate-50 border-transparent'
                      }`}
                    >
                      <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        isChecked 
                          ? 'bg-orange-500 border-orange-500 text-white' 
                          : 'border-slate-200 bg-white group-hover:border-orange-300'
                      }`}>
                        {isChecked && <Icons.Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded">{s.id}</span>
                          <span className="text-[10px] font-medium text-slate-500">{getPath(s)}</span>
                        </div>
                        <p className="text-slate-700 text-sm font-medium leading-relaxed line-clamp-2">{s.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                <Icons.Bot className="w-12 h-12 opacity-20" />
                <p className="text-sm">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>

          {selectedList.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">선택됨 ({selectedList.length})</span>
                <button 
                  onClick={() => updateField('curriculumStandard', '')}
                  className="text-[10px] text-red-500 hover:underline font-bold"
                >
                  모두 지우기
                </button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {selectedList.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 shadow-sm">
                    <span className="truncate max-w-[200px]">{item}</span>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        const standard = allStandardsWithMeta.find(s => s.text === item);
                        if (standard) {
                          toggleStandard(standard);
                        }
                      }} 
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 학습 목표 섹션 */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-xl relative">
        <label className="block text-xl font-bold text-slate-800 mb-2">구체적인 학습 목표</label>
        <p className="text-sm text-slate-400 mb-6">선택한 성취기준들을 아우르는 이번 게임의 핵심 학습 목표는 무엇인가요?</p>
        <div className="relative">
          <textarea 
            className="w-full min-h-[180px] p-6 rounded-2xl bg-slate-50 border border-slate-100 text-lg focus:outline-none focus:bg-white transition-all resize-none leading-relaxed"
            placeholder={example.learningGoal}
            value={formData.learningGoal}
            onChange={(e) => updateField('learningGoal', e.target.value)}
          />
          <AICoach 
            type="learningGoal" 
            toolType={formData.subject} 
            currentValue={formData.learningGoal} 
            onApply={(v) => updateField('learningGoal', v)}
            curriculumStandard={formData.curriculumStandard}
          />
        </div>
      </div>
    </div>
  );
};

export default Step2;
