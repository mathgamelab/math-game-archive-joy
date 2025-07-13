import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Users, 
  Gamepad2, 
  Brain, 
  Target, 
  Sparkles,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Gamepad2 className="h-8 w-8" />,
      title: "게임형 학습",
      description: "재미있는 게임을 통해 수학 개념을 자연스럽게 익힐 수 있습니다."
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "개념 이해",
      description: "시각적이고 인터랙티브한 방식으로 추상적인 수학 개념을 구체화합니다."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "단계별 학습",
      description: "초급부터 고급까지 난이도별로 체계적인 학습이 가능합니다."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "교사 제작",
      description: "현직 교사들이 실제 수업 경험을 바탕으로 제작한 콘텐츠입니다."
    }
  ];

  const stats = [
    { label: "총 게임 수", value: "20+", description: "다양한 수학 게임" },
    { label: "교육 과정", value: "10", description: "중학교~고등학교" },
    { label: "제작 교사", value: "5+", description: "현직 수학 교사" },
    { label: "학습 시간", value: "500+", description: "시간의 콘텐츠" }
  ];

  const curriculum = [
    {
      title: "중학교 수학",
      description: "정수, 유리수, 문자와 식, 방정식, 함수, 확률과 통계",
      color: "bg-blue-500"
    },
    {
      title: "고등학교 수학",
      description: "다항식, 미적분, 확률과 통계, 기하, 인공지능 수학",
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="text-6xl">📐🎮</div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Play Math Archive
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              현직 교사들이 만든 <span className="font-semibold">디지털 수학 콘텐츠 아카이브</span>
            </p>
            <p className="text-lg mb-12 text-blue-200 max-w-3xl mx-auto">
              게임을 통해 수학을 재미있게 배우고, 개념을 확실히 이해할 수 있는 
              인터랙티브한 학습 플랫폼입니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                게임 시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                더 알아보기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 Play Math Archive인가요?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              기존의 단조로운 수학 학습을 넘어서, 게임과 기술을 결합한 
              새로운 학습 경험을 제공합니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-gray-600">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              체계적인 교육 과정
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              중학교부터 고등학교까지 단계별로 구성된 수학 학습 과정을 제공합니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {curriculum.map((item, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${item.color}`}></div>
                <CardHeader>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {item.description}
                  </CardDescription>
                  <div className="mt-4">
                    <Badge variant="secondary" className="mr-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      체계적 학습
                    </Badge>
                    <Badge variant="secondary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      게임형 콘텐츠
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            지금 바로 시작해보세요!
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            재미있는 게임을 통해 수학의 즐거움을 발견하고, 
            실력을 키워보세요.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
            게임 둘러보기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About; 