import React from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import emailjs from 'emailjs-com';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailClick: () => void;
}

const KAKAO_URL = 'https://open.kakao.com/o/gVSDtSIh';

const SERVICE_ID = 'service_sg0ge6f';
const TEMPLATE_ID = 'template_jbh9og5';
const PUBLIC_KEY = 'XLn8i2IeTwdv_TGvN';

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onEmailClick }) => (
  <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="max-w-xs p-6 text-center">
      <div className="mb-6 text-lg font-semibold text-gray-800">
        웹 페이지 기능 개선<br/>
        게임 버그 신고 등<br/>
        의견을 남겨주세요!<br/>
        오픈채팅 코드: vibe<br/>
      </div>
      <Button
        className="w-full mb-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold border border-yellow-400 shadow-lg text-lg rounded-full py-3"
        onClick={() => window.open(KAKAO_URL, '_blank')}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        카톡 오픈채팅으로 문의
      </Button>
      <Button
        className="w-full mb-3 bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-lg rounded-full py-3 shadow-lg"
        onClick={onEmailClick}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        직접 문의
      </Button>
      <button
        className="mt-2 text-gray-400 text-sm hover:text-gray-600"
        onClick={onClose}
      >
        닫기
      </button>
    </DialogContent>
  </Dialog>
);

export default ContactModal; 