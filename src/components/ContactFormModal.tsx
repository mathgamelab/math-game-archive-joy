// ContactFormModal.tsx

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
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

type FormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();
  const recaptchaRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);

  // 실제로 발급받은 reCAPTCHA 사이트 키로 교체하세요
  const RECAPTCHA_SITE_KEY = '6Ldv1I4rAAAAAHE4LJWrZ065u6QdjEoNeWQ22qTf';

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const recaptchaValue = recaptchaRef.current?.getValue();
    if (!recaptchaValue) {
      alert('reCAPTCHA 인증을 완료해 주세요.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbx6CS1lRlqrjOPHnXNPDSsEj6f6i_IqwmnlMnDUS9nAM9cvyVVD-3CwiGLCTtPujh4P/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, recaptcha: recaptchaValue })
      });
      const result = await response.json();
      if (result.result === 'success') {
        alert('메일이 성공적으로 전송되었습니다!');
        reset();
        onClose();
      } else {
        alert('메일 전송에 실패했습니다.');
      }
    } catch (err) {
      alert('오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">문의/요청</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 템플릿 변수명과 일치시키기 위해 name 속성 추가 
            (react-hook-form의 register가 자동으로 처리하지만 명시적으로 확인)
          */}
          <Input placeholder="이름 *" {...register('name', { required: true })} name="name" />
          <Input placeholder="이메일 *" type="email" {...register('email', { required: true })} name="email" />
          <Input placeholder="제목" {...register('subject')} name="subject" />
          <Textarea placeholder="내용 *" rows={5} {...register('message', { required: true })} name="message" />
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY} // 구글 reCAPTCHA 사이트 키로 교체
            className="my-2"
          />
          <div className="flex gap-2 mt-4">
            <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-400 text-white" disabled={loading}>전송하기</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>취소</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormModal;