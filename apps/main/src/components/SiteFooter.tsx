import React from 'react';
import { useNavigate } from 'react-router-dom';

const BLOG_URL = 'https://blog.naver.com/happy_yoonssam';
const CONTACT_EMAIL = 'whymath22@korea.kr';

export const SiteFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="mt-auto border-t border-border bg-white py-12">
      <div className="container mx-auto grid gap-8 px-6 md:grid-cols-3">
        <div>
          <h3 className="mb-2 text-base font-semibold text-foreground">Math Game Archive</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            현직 교사가 만든 디지털 수학 게임·교육 도구 아카이브
          </p>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">바로가기</h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <button
                type="button"
                onClick={() => navigate('/main')}
                className="hover:text-foreground"
              >
                메인
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigate('/games')}
                className="hover:text-foreground"
              >
                게임하기
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigate('/privacy')}
                className="hover:text-foreground"
              >
                개인정보처리방침
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">제작·문의</h4>
          <p className="text-sm text-muted-foreground">행복한윤쌤</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-1 block text-sm text-primary hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          <a
            href={BLOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-sm text-primary hover:underline"
          >
            블로그 바로가기
          </a>
        </div>
      </div>
      <div className="container mx-auto mt-10 border-t border-border/70 px-6 pt-6 text-center text-xs text-muted-foreground">
        <p>© 행복한윤쌤 · 행복한 수학, 함께 만들어요</p>
        <button
          type="button"
          onClick={() => navigate('/privacy')}
          className="mt-2 hover:text-foreground hover:underline"
        >
          개인정보처리방침
        </button>
      </div>
    </footer>
  );
};
