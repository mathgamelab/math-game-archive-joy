import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useForm } from 'react-hook-form';

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

  const onSubmit = (data: FormValues) => {
    alert('문의가 전송되었습니다!\n' + JSON.stringify(data, null, 2));
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">문의/요청</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input placeholder="이름 *" {...register('name', { required: true })} />
          <Input placeholder="이메일 *" type="email" {...register('email', { required: true })} />
          <Input placeholder="제목" {...register('subject')} />
          <Textarea placeholder="내용 *" rows={5} {...register('message', { required: true })} />
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