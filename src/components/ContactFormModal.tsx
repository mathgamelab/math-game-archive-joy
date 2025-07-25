// ContactFormModal.tsx

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useForm } from 'react-hook-form';
// 1. emailjs-com import 하기
import emailjs from 'emailjs-com';

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

// 2. EmailJS 관련 ID들을 이곳으로 가져오기
const SERVICE_ID = 'service_sg0ge6f';
const TEMPLATE_ID = 'template_jbh9og5';
const PUBLIC_KEY = 'XLn8i2IeTwdv_TGvN';

export const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  // 3. onSubmit 함수를 emailjs.send를 사용하도록 수정
  const onSubmit = (data: FormValues) => {
    emailjs.send(SERVICE_ID, TEMPLATE_ID, data, PUBLIC_KEY)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        alert('문의가 성공적으로 전송되었습니다.');
        reset();
        onClose();
      })
      .catch((err) => {
        console.error('FAILED...', err);
        alert('오류가 발생했습니다. 다시 시도해주세요.');
      });
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
          <div className="flex gap-2 mt-4">
            <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-400 text-white">전송하기</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>취소</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormModal;