import React from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CONTACT_EMAIL = 'whymath22@korea.kr';
const SITE_URL = 'https://mathgame.kr';

const ATTACHMENTS = [
  {
    title: '개인정보 처리방침',
    format: 'PDF',
    href: `/sorce/${encodeURIComponent('개인정보 처리방침(mathgamearchive_윤현준)_260711.pdf')}`,
    filename: '개인정보 처리방침(mathgamearchive_윤현준)_260711.pdf',
  },
  {
    title: '필수기준 체크리스트',
    format: 'PDF',
    href: `/sorce/${encodeURIComponent('체크리스트(수학게임아카이브_윤현준)_260711.pdf')}`,
    filename: '체크리스트(수학게임아카이브_윤현준)_260711.pdf',
  },
] as const;

type ChecklistItem = {
  id: string;
  question: string;
  links: { label: string; href: string }[];
};

type ChecklistGroup = {
  number: number;
  title: string;
  items: ChecklistItem[];
};

const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    number: 1,
    title: '최소처리 원칙 준수',
    items: [
      {
        id: '1-1',
        question: '개인정보가 최소한으로 수집되는가?',
        links: [{ label: '제2조', href: '/privacy#article2' }],
      },
      {
        id: '1-2',
        question: '개인정보 수집·이용 목적이 기재되어 있는가?',
        links: [{ label: '제1조', href: '/privacy#article1' }],
      },
      {
        id: '1-3',
        question: '개인정보 수집항목, 보유기간 등이 기재되어 있는가?',
        links: [
          { label: '제2조', href: '/privacy#article2' },
          { label: '제3조', href: '/privacy#article3' },
          { label: '제4조', href: '/privacy#article4' },
        ],
      },
    ],
  },
  {
    number: 2,
    title: '개인정보 안전조치 의무',
    items: [
      {
        id: '2-1',
        question: '개인정보 안전성 확보에 필요한 조치 사항이 기재되어 있는가?',
        links: [{ label: '제8조', href: '/privacy#article8' }],
      },
    ],
  },
  {
    number: 3,
    title: '열람/정정/삭제/처리정지 절차',
    items: [
      {
        id: '3-1',
        question:
          '이용자에게 언제든지 자신의 정보를 열람·정정·삭제·처리정지를 요구할 수 있는 절차가 안내되어 있는가?',
        links: [{ label: '제9조', href: '/privacy#article9' }],
      },
    ],
  },
  {
    number: 4,
    title: '만14세 미만 아동의 개인정보 보호',
    items: [
      {
        id: '4-1',
        question:
          '만 14세 미만 아동의 경우 법정대리인 동의 등 아동의 개인정보 보호를 위한 절차가 마련되어 있는가?',
        links: [{ label: '제10조', href: '/privacy#article10' }],
      },
    ],
  },
  {
    number: 5,
    title: '보호책임자/제3자제공/위탁 등',
    items: [
      {
        id: '5-1',
        question: '개인정보 보호책임자 관련 정보가 안내되어 있는가?',
        links: [{ label: '제11조', href: '/privacy#article11' }],
      },
      {
        id: '5-2',
        question: '개인정보 제3자 제공에 관한 정보가 기재되어 있는가? (필요시)',
        links: [{ label: '제6조', href: '/privacy#article6' }],
      },
      {
        id: '5-3',
        question: '개인정보 위·수탁관계에 관한 정보가 기재되어 있는가? (필요시)',
        links: [{ label: '제7조', href: '/privacy#article7' }],
      },
    ],
  },
];

const OverviewRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="grid gap-1 border-b border-border/70 py-4 sm:grid-cols-[140px_1fr] sm:gap-6">
    <dt className="text-sm font-medium text-foreground">{label}</dt>
    <dd className="text-sm leading-relaxed text-muted-foreground sm:text-base">{children}</dd>
  </div>
);

const LearningSW = () => {
  return (
    <div className="page-shell flex min-h-screen flex-col">
      <main className="flex-1 border-b border-border/70 bg-white">
        <div className="container mx-auto max-w-3xl px-6 py-12 sm:py-16">
          <p className="mb-2 text-sm text-muted-foreground">
            <Link to="/main" className="hover:text-foreground">
              메인
            </Link>
            <span className="mx-2">/</span>
            학습지원 SW 안내
          </p>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-foreground">
              &apos;26.3.1. 시행
            </span>
            <span className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-foreground">
              초·중등교육법 제29조의2
            </span>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              전체 기준 충족
            </span>
          </div>

          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            학습지원 소프트웨어
            <br />
            필수기준 충족 안내
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">학교운영위원회 심의용 자료</p>

          <div className="mb-10 rounded-xl border border-border bg-secondary/40 p-5">
            <p className="text-sm font-semibold text-foreground">안내</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              &apos;26.3.1. 시행 초·중등교육법 제29조의2 시행일을 고려하여 학교운영위원회를
              개최하여 학습지원 소프트웨어를 선정·사용하여야 합니다.
            </p>
          </div>

          <Tabs defaultValue="guide" className="w-full">
            <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1 p-1">
              <TabsTrigger value="guide" className="py-2.5">
                필수기준 안내
              </TabsTrigger>
              <TabsTrigger value="downloads" className="py-2.5">
                첨부파일 다운로드
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guide" className="mt-0 space-y-10">
              <section>
                <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">
                  제품/서비스 개요
                </h2>
                <dl>
                  <OverviewRow label="제품명">
                    <span className="font-medium text-foreground">Math Game Archive</span>
                    <span className="mt-0.5 block">수학게임아카이브</span>
                  </OverviewRow>
                  <OverviewRow label="공급자">행복한윤쌤</OverviewRow>
                  <OverviewRow label="접속경로">
                    <a
                      href={SITE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline underline-offset-2 hover:text-accent"
                    >
                      {SITE_URL}
                    </a>
                  </OverviewRow>
                  <OverviewRow label="주요 기능·특장점">
                    <ul className="list-disc space-y-1.5 pl-5">
                      <li>교육과정·성취기준에 맞춘 교육용 수학 게임 제공</li>
                      <li>학년·교과별 분류로 수업 자료 탐색</li>
                      <li>브라우저에서 바로 플레이 가능한 웹 기반 도구</li>
                    </ul>
                  </OverviewRow>
                </dl>
              </section>

              <section>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    개인정보보호 기준 충족여부
                  </h2>
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    전체 충족
                  </span>
                </div>

                <div className="space-y-6">
                  {CHECKLIST_GROUPS.map((group) => (
                    <div
                      key={group.number}
                      className="rounded-xl border border-border bg-card p-5"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                          {group.number}
                        </span>
                        <h3 className="text-base font-semibold text-foreground">{group.title}</h3>
                      </div>
                      <ul className="space-y-3">
                        {group.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex flex-col gap-2 border-t border-border/60 pt-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-start sm:justify-between"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-muted-foreground">{item.id}</p>
                              <p className="mt-0.5 text-sm leading-relaxed text-foreground">
                                {item.question}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                충족
                              </span>
                              {item.links.map((link, index) => (
                                <React.Fragment key={link.href}>
                                  {index > 0 && (
                                    <span className="text-xs text-muted-foreground">,</span>
                                  )}
                                  <Link
                                    to={link.href}
                                    className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                                  >
                                    {link.label}
                                  </Link>
                                </React.Fragment>
                              ))}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Link
                    to="/privacy"
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    개인정보처리방침 전문 보기
                  </Link>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="downloads" className="mt-0">
              <section>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                      첨부파일 다운로드
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">2026.07.11.</p>
                  </div>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>

                <div className="mb-6 rounded-xl border border-border bg-secondary/40 p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    학교운영위원회 심의 시 아래 자료를 활용하세요.
                  </p>
                </div>

                <ul className="space-y-3">
                  {ATTACHMENTS.map((file) => (
                    <li key={file.filename}>
                      <a
                        href={file.href}
                        download={file.filename}
                        className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/30 hover:bg-secondary/30"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                            <FileText className="h-5 w-5 text-foreground" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {file.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{file.format}</p>
                          </div>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary">
                          <Download className="h-4 w-4" />
                          다운로드
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default LearningSW;
