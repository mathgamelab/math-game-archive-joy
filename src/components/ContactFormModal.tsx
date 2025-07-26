// ContactFormModal.tsx

import React, { FormEvent, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose }) => {
  const contactFormRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOnSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!contactFormRef.current || isLoading) return;
    
    setIsLoading(true);
    
    const formData = new FormData(contactFormRef.current);
    const objData: { [key: string]: any } = {};
    formData.forEach((value, key) => (objData[key] = value));
    
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzFSCoUFuevj-z7ScK4rIXK07_96MyDoO-Yu7xUbygRaNxGXa_9iu1-zVFWbBq_U7VuNg/exec",
        {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(objData),
          redirect: "follow",
        }
      );

      const result = await response.text();

      if (result === "success") {
        (e.target as HTMLFormElement).reset();
        alert("문의가 전송되었습니다. 빠른 시일 내에 연락드리겠습니다.");
        onClose();
      } else {
        alert("문의 전송에 실패했습니다. 관리자에게 문의해주세요.");
      }
    } catch (error) {
      console.error('전송 오류:', error);
      alert("문의 전송에 실패했습니다. 잠시후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">문의 또는 제안사항</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            궁금한 점이나 제안 사항이 있으시면 언제든지 메시지를 남겨주세요.
          </DialogDescription>
        </DialogHeader>
        
        <form ref={contactFormRef} onSubmit={handleOnSubmit} className="space-y-4">
          <Input
            placeholder="이름 혹은 닉네임*"
            name="name"
            required
            disabled={isLoading}
          />

          <Input
            placeholder="회신 받을 이메일 *"
            type="email"
            name="email"
            required
            disabled={isLoading}
          />

          <Input
            placeholder="제목"
            name="subject"
            disabled={isLoading}
          />

          <Textarea
            placeholder="내용 *"
            rows={5}
            name="message"
            required
            disabled={isLoading}
          />

          <div className="flex gap-2 mt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-400 text-white"
              disabled={isLoading}
            >
              {isLoading ? '전송 중...' : '전송하기'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
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
