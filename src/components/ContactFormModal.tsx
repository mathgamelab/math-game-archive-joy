// ContactFormModal.tsx

import React from 'react';
// DialogDescription을 추가했습니다.
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useForm } from 'react-hook-form';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRef, useState } from 'react';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 폼 필드 타입 정의
type FormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose }) => {
  // react-hook-form 훅 초기화
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();
  // reCAPTCHA 참조를 위한 useRef
  const recaptchaRef = useRef<any>(null);
  // 로딩 상태 관리를 위한 useState
  const [loading, setLoading] = useState(false);
  // 사용자에게 피드백 메시지를 보여주기 위한 상태
  const [formMessage, setFormMessage] = useState<string | null>(null);
  // 메시지가 오류인지 성공인지 구분하기 위한 상태
  const [isError, setIsError] = useState(false);

  // 실제로 발급받은 reCAPTCHA 사이트 키로 교체하세요 (이 키는 클라이언트 측에서만 사용됩니다)
  const RECAPTCHA_SITE_KEY = '6Ldv1I4rAAAAAHE4LJWrZ065u6QdjEoNeWQ22qTf';

  // 폼 제출 핸들러
  const onSubmit = async (data: FormValues) => {
    setLoading(true); // 로딩 시작
    setFormMessage(null); // 이전 메시지 초기화
    setIsError(false); // 오류 상태 초기화

    // reCAPTCHA 토큰 가져오기
    const recaptchaValue = recaptchaRef.current?.getValue();
    if (!recaptchaValue) {
      setFormMessage('reCAPTCHA 인증을 완료해 주세요.'); // reCAPTCHA 미완료 시 메시지 설정
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      // Google Apps Script 웹 앱 URL로 POST 요청 전송
      const response = await fetch('https://script.google.com/macros/s/AKfycbzO1AdUcIgxYb80uDictE8lZkiPiJfzkYV0uch93Q57E6EJKMXsWeb3xesYyMoSUAx1/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 폼 데이터와 reCAPTCHA 토큰을 JSON 형태로 전송
        body: JSON.stringify({ ...data, recaptcha: recaptchaValue })
      });

      const result = await response.json(); // 응답을 JSON으로 파싱

      if (result.result === 'success') {
        setFormMessage('메시지가 성공적으로 전송되었습니다!'); // 성공 메시지 설정
        setIsError(false);
        reset(); // 폼 필드 초기화
        recaptchaRef.current?.reset(); // reCAPTCHA 위젯 초기화
        // 성공 메시지를 사용자가 볼 수 있도록 잠시 기다린 후 모달 닫기
        setTimeout(() => onClose(), 2000);
      } else {
        // 백엔드에서 받은 상세 오류 메시지 표시
        const errorMessage = result.message || result.details || '메시지 전송에 실패했습니다.';
        setFormMessage(`오류: ${errorMessage}`);
        setIsError(true);
      }
    } catch (err: any) {
      // 네트워크 오류 등 예외 발생 시 처리
      setFormMessage(`오류가 발생했습니다: ${err.message || '다시 시도해 주세요.'}`);
      setIsError(true);
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return (
    // Dialog 컴포넌트: 모달의 열림/닫힘 상태를 제어
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">문의/요청</DialogTitle>
          {/* 모달 설명 추가 */}
          <DialogDescription className="text-sm text-gray-500">
            궁금한 점이나 제안 사항이 있으시면 언제든지 메시지를 남겨주세요.
          </DialogDescription>
        </DialogHeader>
        {/* 폼 제출 핸들러 연결 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 이름 입력 필드 */}
          <Input
            placeholder="이름 *"
            // react-hook-form의 register를 사용하여 필드 등록 및 유효성 검사 규칙 정의
            {...register('name', { required: '이름을 입력해주세요.' })}
            name="name"
          />
          {/* 이름 필드 오류 메시지 표시 */}
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

          {/* 이메일 입력 필드 */}
          <Input
            placeholder="이메일 *"
            type="email"
            {...register('email', {
              required: '이메일을 입력해주세요.',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: '유효한 이메일 주소를 입력해주세요.'
              }
            })}
            name="email"
          />
          {/* 이메일 필드 오류 메시지 표시 */}
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

          {/* 제목 입력 필드 (선택 사항) */}
          <Input
            placeholder="제목"
            {...register('subject')}
            name="subject"
          />

          {/* 내용 입력 필드 */}
          <Textarea
            placeholder="내용 *"
            rows={5}
            {...register('message', { required: '내용을 입력해주세요.' })}
            name="message"
          />
          {/* 내용 필드 오류 메시지 표시 */}
          {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}

          {/* reCAPTCHA 컴포넌트 */}
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY} // 구글 reCAPTCHA 사이트 키 사용
            className="my-2"
          />

          {/* 폼 제출 결과 메시지 표시 (성공 또는 오류) */}
          {formMessage && (
            <div className={`p-3 rounded-md text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {formMessage}
            </div>
          )}

          {/* 버튼 그룹 */}
          <div className="flex gap-2 mt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-400 text-white"
              disabled={loading} // 로딩 중일 때 버튼 비활성화
            >
              {loading ? '전송 중...' : '전송하기'} {/* 로딩 상태에 따라 텍스트 변경 */}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={loading} // 로딩 중일 때 버튼 비활성화
            >
              취소
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormModal;
