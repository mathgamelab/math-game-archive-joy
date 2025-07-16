import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Users, 
  Target, 
  Sparkles,
  Heart,
  Award,
  Lightbulb,
  Globe,
  Play,
  Star,
  Clock,
  TrendingUp
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: "교육과정 기반",
      description: "2022개정 교육과정의 성취기준에 기반한 체계적인 수학 학습을 제공합니다."
    },
    {
      icon: <Target className="h-8 w-8 text-purple-600" />,
      title: "단계별 난이도",
      description: "초급부터 고급까지 성취수준별로 구분된 난이도를 제공합니다."
    },
    {
      icon: <Sparkles className="h-8 w-8 text-green-600" />,
      title: "게이미피케이션",
      description: "게임의 동기를 학습의 동기로 만들어 재미있게 수학을 학습합니다."
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "교사 제작",
      description: "현직 교사들이 직접 제작한 신뢰할 수 있는 콘텐츠입니다."
    }
  ];

  const stats = [
    { number: "50+", label: "게임 콘텐츠", icon: <Play className="h-6 w-6" /> },
    { number: "1000+", label: "플레이 횟수", icon: <Users className="h-6 w-6" /> },
    { number: "10", label: "플레이 시간", icon: <Clock className="h-6 w-6" /> }
    { number: "10+", label: "참여 교사", icon: <Heart className="h-6 w-6" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - EBSMath 스타일 */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="container mx-auto px-6 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="text-8xl animate-bounce">🎮</div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Math Game Archive
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
              현직 교사들이 만든 <span className="font-semibold text-yellow-300">수학 콘텐츠</span>를 
              게임으로 즐겨보세요
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <Button 
                onClick={() => navigate('/games')}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-medium shadow-lg"
              >
                게임 시작하기
              </Button>
              <Button 
                variant="outline"
                className="border-white text-blue-600 hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full text-lg font-medium"
              >
                더 알아보기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 간단한 소개글 섹션 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              수학을 즐기면서, 친근하게, 체계적으로
            </h2>
            <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
              <p className="text-xl mb-6">
                Math Game Archive는 현직 수학 교사들이 직접 제작한 수학 콘텐츠를 
                게임 형태로 제공하는 플랫폼입니다.
              </p>
              <p className="text-lg mb-6">
                2022개정 교육과정의 성취기준에 맞추어 개발된
                <span className="font-semibold text-blue-600"> 게임을 플레이하며 수학을 학습</span>할 수 있습니다.
              </p>
              <p className="text-lg">
                교육과정에 기반한 수학 게임을 단원과 성취기준에 맞춰
                모든 학생들이 자신의 수준에 맞는 학습을 할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-blue-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Math Game Archive는 어떤 차별점을 가졌나요?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              지루한 수학 문제 풀이에서 벗어나, 게임으로 수학 실력을 키워보세요.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  현직 교사들이 직접 만드는<br />
                  <span className="text-blue-600">교육과정 기반 게임 콘텐츠</span>
                </h2>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Heart className="h-5 w-5" />
                    <span className="font-medium">교사 제작</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-600">
                    <Award className="h-5 w-5" />
                    <span className="font-medium">품질 보증</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-600">
                    <Lightbulb className="h-5 w-5" />
                    <span className="font-medium">창의적 학습</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    우리의 목표
                  </h3>
                  <ul className="text-left space-y-3 text-gray-600">
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>게이미피케이션을 통한 수학 학습 동기 함양</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span>핵심 개념의 적용 방법 숙달</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>재미있는 연산 연습 경험 제공</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      <span>게임을 할수록 수학 실력이 상승!</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 바로 시작해보세요!
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            무료로 제공되는 다양한 수학 게임을 통해 
            재미있는 수학 학습을 경험해보세요.
          </p>
          <Button 
            onClick={() => navigate('/games')}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-medium shadow-lg"
          >
            게임 둘러보기
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="text-3xl">🎮</div>
            <h3 className="text-2xl font-bold">Math Game Archive</h3>
          </div>
          <p className="text-gray-300 mb-6 text-lg">
            행복한 수학, 함께 만들어요 😊
          </p>
          <p className="text-sm text-gray-400">
            © 행복한윤쌤 |{' '}
            <a 
              href="https://blog.naver.com/happy_yoonssam" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              https://blog.naver.com/happy_yoonssam
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About; 