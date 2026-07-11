import React from 'react';
import { Link } from 'react-router-dom';
import { SiteFooter } from '@/components/SiteFooter';

const BLOG_URL = 'https://blog.naver.com/happy_yoonssam';
const CONTACT_EMAIL = 'whymath22@korea.kr';

const Privacy = () => {
  return (
    <div className="page-shell flex min-h-screen flex-col">
      <main className="flex-1 border-b border-border/70 bg-white">
        <div className="container mx-auto max-w-3xl px-6 py-12 sm:py-16">
          <p className="mb-2 text-sm text-muted-foreground">
            <Link to="/main" className="hover:text-foreground">
              메인
            </Link>
            <span className="mx-2">/</span>
            개인정보처리방침
          </p>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            개인정보처리방침
          </h1>
          <p className="mb-10 text-sm text-muted-foreground">시행일: 2026년 7월 11일</p>

          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              Math Game Archive(이하 &quot;본 서비스&quot;)는 「개인정보 보호법」 제30조에 따라
              정보주체의 개인정보를 보호하고 관련 고충을 원활히 처리할 수 있도록 다음과 같이
              개인정보처리방침을 수립·공개합니다.
            </p>
            <p>
              본 서비스는 현재{' '}
              <strong className="font-medium text-foreground">
                회원가입·로그인 등 개인 식별 정보를 수집하지 않습니다.
              </strong>{' '}
              방침은 서비스 운영 방식 변경 시 이 페이지를 통해 안내합니다.
            </p>
          </div>

          <nav className="mt-10 rounded-xl border border-border bg-secondary/40 p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">목차</p>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>
                <a href="#article1" className="hover:text-foreground">
                  제1조 개인정보의 처리 목적
                </a>
              </li>
              <li>
                <a href="#article2" className="hover:text-foreground">
                  제2조 처리하는 개인정보 항목
                </a>
              </li>
              <li>
                <a href="#article3" className="hover:text-foreground">
                  제3조 보유·이용 기간 및 파기
                </a>
              </li>
              <li>
                <a href="#article4" className="hover:text-foreground">
                  제4조 자동 생성·통계 정보
                </a>
              </li>
              <li>
                <a href="#article5" className="hover:text-foreground">
                  제5조 제3자 제공
                </a>
              </li>
              <li>
                <a href="#article6" className="hover:text-foreground">
                  제6조 처리위탁
                </a>
              </li>
              <li>
                <a href="#article7" className="hover:text-foreground">
                  제7조 쿠키 및 로컬 저장소
                </a>
              </li>
              <li>
                <a href="#article8" className="hover:text-foreground">
                  제8조 안전성 확보 조치
                </a>
              </li>
              <li>
                <a href="#article9" className="hover:text-foreground">
                  제9조 이용자의 권리
                </a>
              </li>
              <li>
                <a href="#article10" className="hover:text-foreground">
                  제10조 만 14세 미만 아동
                </a>
              </li>
              <li>
                <a href="#article11" className="hover:text-foreground">
                  제11조 개인정보 보호책임자
                </a>
              </li>
              <li>
                <a href="#article12" className="hover:text-foreground">
                  제12조 방침의 변경
                </a>
              </li>
            </ol>
          </nav>

          <div className="mt-12 space-y-10">
            <section id="article1" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제1조 (개인정보의 처리 목적)
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                본 서비스는 교육용 수학 게임·도구 제공을 목적으로 운영됩니다. 현재 회원제
                서비스나 개인 맞춤 프로필을 운영하지 않으며, 개인 식별을 위한 개인정보를
                수집·이용하지 않습니다. 이용자가 문의 과정에서 자발적으로 제공한 정보는
                문의 응대 목적으로만 처리합니다.
              </p>
            </section>

            <section id="article2" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제2조 (처리하는 개인정보 항목)
              </h2>
              <p className="mb-3 text-base leading-relaxed text-muted-foreground">
                본 서비스는 이름, 이메일, 전화번호, 비밀번호 등 개인을 식별할 수 있는 정보를
                회원가입·입력 형태로 수집하지 않습니다. 필요한 범위에서만 최소로 처리한다는
                원칙에 따라, 현재는 회원 개인정보를 수집하지 않습니다.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                문의 시 이용자가 자발적으로 제공한 연락처·내용만 문의 응대에 사용할 수
                있습니다.
              </p>
            </section>

            <section id="article3" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제3조 (개인정보의 보유·이용 기간 및 파기)
              </h2>
              <p className="mb-3 text-base leading-relaxed text-muted-foreground">
                회원가입 개인정보는 수집하지 않으므로 별도 보유 기간이 없습니다. 문의 과정에서
                자발적으로 제공된 정보는 문의 처리가 완료된 후 지체 없이 파기합니다.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                전자적 파일은 복구·재생되지 않도록 삭제하는 등 통상적인 방법으로 파기합니다.
              </p>
            </section>

            <section id="article4" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제4조 (자동 생성·통계 정보)
              </h2>
              <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">이용 통계:</span> 게임별 플레이
                  횟수 등 비식별 집계 정보를 서비스 개선·인기 콘텐츠 안내에 사용할 수 있습니다.
                  특정 개인을 식별할 목적으로 수집·저장하지 않습니다.
                </li>
                <li>
                  <span className="font-medium text-foreground">호스팅·접속 기록:</span> 웹사이트
                  운영을 위한 호스팅 환경에서 IP 주소, 접속 시각, 브라우저 정보 등이 자동으로
                  기록될 수 있습니다. 이는 서비스 안정성 확보 및 부정 이용 방지 등 통상적인
                  웹 운영 목적 범위에서 처리될 수 있습니다.
                </li>
              </ul>
            </section>

            <section id="article5" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제5조 (개인정보의 제3자 제공)
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                본 서비스는 이용자의 개인정보를 제3자에게 판매하거나 마케팅 목적으로 제공하지
                않습니다. 법령에 따른 요청이 있는 경우에 한해 관련 절차에 따라 제공할 수
                있습니다.
              </p>
            </section>

            <section id="article6" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제6조 (개인정보 처리위탁)
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                본 서비스는 회원 개인정보를 수집하지 않으므로, 개인정보 처리업무를 제3자에게
                위탁하지 않습니다. 비식별 이용 통계·웹 호스팅 등 서비스 운영을 위한 인프라는
                외부 사업자를 이용할 수 있으나, 이는 개인 식별 정보의 처리위탁에 해당하지
                않습니다.
              </p>
            </section>

            <section id="article7" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제7조 (쿠키 및 로컬 저장소)
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                본 서비스는 광고·추적 목적의 쿠키를 사용하지 않습니다. 브라우저 로컬 저장소
                등은 서비스 동작에 필요한 범위에서만 사용될 수 있으며, 개인을 식별하기 위한
                회원 정보는 저장하지 않습니다. 브라우저 설정에서 저장 데이터를 삭제할 수
                있습니다.
              </p>
            </section>

            <section id="article8" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제8조 (개인정보의 안전성 확보 조치)
              </h2>
              <p className="mb-3 text-base leading-relaxed text-muted-foreground">
                본 서비스는 회원 개인정보를 저장하지 않습니다. 문의 과정에서 전달된 정보가
                있는 경우 및 서비스 운영 과정에서 안전성을 위해 다음 조치를 취합니다.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground">
                <li>접속 구간의 HTTPS(SSL/TLS) 적용</li>
                <li>관리자·운영자 접근 권한의 최소화</li>
                <li>불필요한 개인정보 미수집 원칙 유지</li>
              </ul>
            </section>

            <section id="article9" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제9조 (이용자의 권리 행사 방법)
              </h2>
              <p className="mb-3 text-base leading-relaxed text-muted-foreground">
                정보주체는 개인정보 열람, 정정·삭제, 처리정지 등을 요청할 수 있습니다. 요청은
                제11조의 문의처(이메일 또는 블로그)로 하시면 되며, 접수 후 지체 없이
                확인·조치합니다.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                현재 회원 개인정보를 보유하지 않으므로, 보유 정보가 없는 경우에는 그 사실을
                안내드립니다.
              </p>
            </section>

            <section id="article10" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제10조 (만 14세 미만 아동의 개인정보 처리)
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                본 서비스는 회원가입 기능을 제공하지 않으며, 만 14세 미만 아동의 개인정보를
                수집하지 않습니다. 아동의 개인정보가 수집된 것으로 확인되는 경우 즉시
                삭제합니다. 법정대리인 동의가 필요한 회원 가입 절차는 운영하지 않습니다.
              </p>
            </section>

            <section id="article11" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제11조 (개인정보 보호책임자)
              </h2>
              <p className="mb-3 text-base leading-relaxed text-muted-foreground">
                개인정보 처리 관련 문의·불만·피해구제 요청을 위해 아래와 같이 개인정보
                보호책임자를 지정합니다.
              </p>
              <ul className="space-y-2 text-base text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">성명:</span> 행복한윤쌤
                </li>
                <li>
                  <span className="font-medium text-foreground">이메일:</span>{' '}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-foreground underline underline-offset-2 hover:text-accent"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </li>
                <li>
                  <span className="font-medium text-foreground">블로그:</span>{' '}
                  <a
                    href={BLOG_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline underline-offset-2 hover:text-accent"
                  >
                    blog.naver.com/happy_yoonssam
                  </a>
                </li>
              </ul>
            </section>

            <section id="article12" className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                제12조 (개인정보처리방침의 변경)
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                본 개인정보처리방침은 시행일부터 적용됩니다. 내용이 추가·삭제·변경되는 경우
                변경 사항을 이 페이지에 게시합니다.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Privacy;
