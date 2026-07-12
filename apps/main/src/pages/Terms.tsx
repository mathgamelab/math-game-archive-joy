import React from 'react';
import { Link } from 'react-router-dom';
import { SiteFooter } from '@/components/SiteFooter';

const Terms = () => {
  return (
    <div className="page-shell flex min-h-screen flex-col">
      <main className="flex-1 border-b border-border/70 bg-white">
        <div className="container mx-auto max-w-3xl px-6 py-12 sm:py-16">
          <p className="mb-2 text-sm text-muted-foreground">
            <Link to="/main" className="hover:text-foreground">
              메인
            </Link>
            <span className="mx-2">/</span>
            이용약관
          </p>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            이용약관
          </h1>
          <p className="mb-10 text-sm text-muted-foreground">시행일: 2026년 7월 4일</p>

          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              Math Game Archive(이하 &quot;본 서비스&quot;)의 이용 조건과 절차, 이용자와 운영자의
              권리·의무를 다음과 같이 규정합니다.
            </p>
          </div>

          <nav className="mt-10 rounded-xl border border-border bg-secondary/40 p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">목차</p>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>
                <a href="#article1" className="hover:text-foreground">
                  제1조 목적
                </a>
              </li>
              <li>
                <a href="#article2" className="hover:text-foreground">
                  제2조 이용 자격 및 이용 방법
                </a>
              </li>
              <li>
                <a href="#article3" className="hover:text-foreground">
                  제3조 이용자의 권한
                </a>
              </li>
              <li>
                <a href="#article4" className="hover:text-foreground">
                  제4조 이용자의 의무
                </a>
              </li>
              <li>
                <a href="#article5" className="hover:text-foreground">
                  제5조 콘텐츠 및 서비스의 관리
                </a>
              </li>
              <li>
                <a href="#article6" className="hover:text-foreground">
                  제6조 개인정보 보호
                </a>
              </li>
            </ol>
          </nav>

          <div className="mt-12 space-y-10">
            <section id="article1" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제1조 (목적)
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                본 약관은 Math Game Archive(이하 &quot;서비스&quot;)가 제공하는 교육용 수학 게임 및
                관련 도구 서비스의 이용 조건과 절차, 이용자와 운영자의 권리·의무를 규정함을
                목적으로 합니다.
              </p>
            </section>

            <section id="article2" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제2조 (이용 자격 및 이용 방법)
              </h2>
              <ol className="list-decimal space-y-2 pl-5 text-base leading-relaxed text-muted-foreground">
                <li>
                  본 서비스는 수학교육에 관심 있는 교원·학생·학부모 등 누구나 이용할 수
                  있습니다.
                </li>
                <li>
                  현재 본 서비스는 별도의 회원가입·로그인 절차 없이 웹사이트를 통해 이용할
                  수 있습니다.
                </li>
                <li>
                  운영자는 서비스 운영상 필요하다고 판단되는 경우 이용을 제한하거나, 향후
                  회원제 등 이용 방식을 변경할 수 있으며, 변경 시 이 약관 또는 공지를 통해
                  안내합니다.
                </li>
              </ol>
            </section>

            <section id="article3" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제3조 (이용자의 권한)
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                이용자는 본 서비스에 게시된 수학 게임·교육 도구를 열람하고 플레이할 수
                있습니다. 문의 기능을 통해 운영자에게 의견을 전달할 수 있습니다.
              </p>
            </section>

            <section id="article4" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제4조 (이용자의 의무)
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                이용자는 타인의 권리를 침해하거나 서비스를 부정한 목적으로 이용해서는 안
                됩니다. 문의·게시 등으로 전달한 내용에 대한 책임은 해당 이용자에게 있습니다.
              </p>
            </section>

            <section id="article5" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제5조 (콘텐츠 및 서비스의 관리)
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                운영자는 서비스 운영을 위해 게임·자료·문의 관련 콘텐츠를 사전 통지 없이
                수정·삭제·비공개 처리할 수 있으며, 서비스의 일부 또는 전부를 변경·중단할 수
                있습니다.
              </p>
            </section>

            <section id="article6" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제6조 (개인정보 보호)
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                개인정보의 처리에 관한 사항은{' '}
                <Link to="/privacy" className="font-medium text-primary hover:underline">
                  개인정보처리방침
                </Link>
                에 따릅니다.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Terms;
