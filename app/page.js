'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

const API_BASE = 'https://wmediator.trinos.group'
const AGENT_ID = 'agent_1201km3k1xa0ee0bc2j2zdpp5rr6'

// ─── Allowed Emails (whitelist) ───
// 이 배열에 포함된 이메일만 등록/사용 가능합니다.
// 추가/삭제 후 재배포하면 즉시 반영됩니다.
const ALLOWED_EMAILS = [
  'dkkim@swonlaw.com',
  'dk@trinos.group',
  // ─── KCAB 조정 강의 수강생 이메일을 아래에 추가하세요 ───
  // 'student1@example.com',
  // 'student2@example.com',
]

// 1시간 = 60분 총 사용 가능 시간
const MAX_MINUTES = 60

// ─── Scenarios ───
const SCENARIOS = [
  {
    id: 'construction',
    icon: '🏗️',
    level: 'intermediate',
    ko: {
      title: '건설 분쟁',
      desc: '아파트 신축 공사 중 공기 지연 및 추가 공사비 청구',
      brief: '시공사와 시행사 간 공기 연장, 추가 비용, 하자 보수 책임 공방',
      applicant: '시공사 대표',
      respondent: '시행사 담당이사',
      keywords: '공기지연, 추가공사비, 하자보수',
    },
    en: {
      title: 'Construction Dispute',
      desc: 'Project delay and additional cost claims in apartment construction',
      brief: 'Dispute between contractor and developer over timeline extension, extra costs, and defect liability',
      applicant: 'Contractor CEO',
      respondent: 'Developer Director',
      keywords: 'delay, extra costs, defect liability',
    },
  },
  {
    id: 'financial',
    icon: '💰',
    level: 'advanced',
    ko: {
      title: '금융 분쟁',
      desc: '투자자문사의 부적합 투자 권유로 인한 고객 손실',
      brief: '적합성 원칙 위반, 설명의무, 손해액 산정 및 과실상계',
      applicant: '개인투자자',
      respondent: '투자자문사 준법감시인',
      keywords: '적합성원칙, 설명의무, 손해배상',
    },
    en: {
      title: 'Financial Dispute',
      desc: 'Client losses from unsuitable investment advisory recommendations',
      brief: 'Suitability principle violation, duty of explanation, damages calculation',
      applicant: 'Individual Investor',
      respondent: 'Compliance Officer',
      keywords: 'suitability, duty of care, damages',
    },
  },
  {
    id: 'employment',
    icon: '👔',
    level: 'beginner',
    ko: {
      title: '노동 분쟁',
      desc: '부당해고 주장 직원과 경영상 해고를 주장하는 회사',
      brief: '해고 사유 정당성, 절차적 요건, 복직 vs 금전 보상',
      applicant: '해고 직원',
      respondent: '인사담당 임원',
      keywords: '부당해고, 복직, 금전보상',
    },
    en: {
      title: 'Employment Dispute',
      desc: 'Unfair dismissal claim vs. legitimate business restructuring',
      brief: 'Dismissal justification, procedural requirements, reinstatement vs. compensation',
      applicant: 'Dismissed Employee',
      respondent: 'HR Executive',
      keywords: 'unfair dismissal, reinstatement, compensation',
    },
  },
  {
    id: 'ip',
    icon: '🧠',
    level: 'advanced',
    ko: {
      title: '지식재산 분쟁',
      desc: 'AI 알고리즘 특허 침해 vs 독자 개발 주장',
      brief: '특허 청구범위 해석, 기술적 동일성, 라이선스 협상',
      applicant: '대기업 IP팀장',
      respondent: '스타트업 CTO',
      keywords: '특허침해, 라이선스, 기술분쟁',
    },
    en: {
      title: 'IP Dispute',
      desc: 'AI algorithm patent infringement vs. independent development claim',
      brief: 'Patent claim interpretation, technical equivalence, licensing negotiation',
      applicant: 'Corporate IP Director',
      respondent: 'Startup CTO',
      keywords: 'patent infringement, licensing, tech dispute',
    },
  },
  {
    id: 'international',
    icon: '🌏',
    level: 'advanced',
    ko: {
      title: '국제상사 분쟁',
      desc: '한국 수출업체와 동남아 바이어 간 물품 하자·대금 분쟁',
      brief: '물품 검수 기준, 하자 통지 시기, CISG 적용, 통화 환산',
      applicant: '한국 수출업체 대표',
      respondent: '동남아 바이어 구매담당',
      keywords: 'CISG, 국제거래, 통화환산',
    },
    en: {
      title: 'International Commercial',
      desc: 'Product defects and payment dispute between Korean exporter and SE Asian buyer',
      brief: 'Inspection standards, defect notification, CISG application, currency conversion',
      applicant: 'Korean Exporter CEO',
      respondent: 'SE Asian Buyer Manager',
      keywords: 'CISG, cross-border, currency',
    },
  },
  {
    id: 'realestate',
    icon: '🏢',
    level: 'beginner',
    ko: {
      title: '부동산·임대차 분쟁',
      desc: '상가 재건축 통보와 임차인의 영업보상 요구 충돌',
      brief: '계약 갱신 요구권, 권리금 회수, 영업손실 보상, 원상복구',
      applicant: '상가 임차인',
      respondent: '건물주',
      keywords: '권리금, 갱신요구권, 영업보상',
    },
    en: {
      title: 'Real Estate / Lease',
      desc: 'Commercial lease termination for redevelopment vs. tenant compensation',
      brief: 'Lease renewal rights, key money recovery, business loss compensation',
      applicant: 'Commercial Tenant',
      respondent: 'Building Owner',
      keywords: 'key money, renewal rights, compensation',
    },
  },
  {
    id: 'medical',
    icon: '🏥',
    level: 'intermediate',
    ko: {
      title: '의료 분쟁',
      desc: '수술 후 합병증 — 의료과실 vs 불가피한 합병증',
      brief: '의료 과실 여부, 설명 동의, 인과관계, 위자료 산정',
      applicant: '환자 보호자',
      respondent: '병원 의료분쟁담당',
      keywords: '의료과실, 설명동의, 위자료',
    },
    en: {
      title: 'Medical Dispute',
      desc: 'Post-surgery complications — medical malpractice vs. unavoidable risk',
      brief: 'Medical negligence, informed consent, causation, emotional distress damages',
      applicant: 'Patient Family',
      respondent: 'Hospital Dispute Manager',
      keywords: 'malpractice, informed consent, damages',
    },
  },
  {
    id: 'consumer',
    icon: '🛒',
    level: 'beginner',
    ko: {
      title: '소비자 분쟁',
      desc: '전자제품 반복 결함과 교환·환불 거부',
      brief: '제조물 책임, 하자 담보, 소비자기본법, 보상 범위',
      applicant: '소비자',
      respondent: '제조사 고객서비스팀장',
      keywords: '제조물책임, 환불, 소비자보호',
    },
    en: {
      title: 'Consumer Dispute',
      desc: 'Repeated product defects and refusal of exchange/refund',
      brief: 'Product liability, warranty, consumer protection law, compensation scope',
      applicant: 'Consumer',
      respondent: 'Manufacturer CS Director',
      keywords: 'product liability, refund, consumer protection',
    },
  },
  {
    id: 'ma',
    icon: '🤝',
    level: 'advanced',
    ko: {
      title: 'M&A·주주 분쟁',
      desc: '스타트업 인수 후 진술·보증 위반 발견',
      brief: '진술보증 위반 범위, 에스크로 해제, 손해배상, Earn-out 조건',
      applicant: '인수기업 M&A담당',
      respondent: '스타트업 창업자',
      keywords: '진술보증, 에스크로, Earn-out',
    },
    en: {
      title: 'M&A / Shareholder',
      desc: 'Post-acquisition rep & warranty breach discovery',
      brief: 'Rep & warranty breach scope, escrow release, indemnification, earn-out terms',
      applicant: 'Acquirer M&A Lead',
      respondent: 'Startup Founder',
      keywords: 'rep & warranty, escrow, earn-out',
    },
  },
  {
    id: 'tech',
    icon: '💻',
    level: 'intermediate',
    ko: {
      title: 'IT·플랫폼 분쟁',
      desc: 'SaaS 개발 외주 — 요구사항 변경으로 비용 초과·납기 지연',
      brief: '요구사항 범위(scope creep), 변경 관리, 마일스톤 검수, 잔금 지급',
      applicant: '발주사 PM',
      respondent: '개발사 대표',
      keywords: 'scope creep, 마일스톤, 잔금',
    },
    en: {
      title: 'Tech Platform',
      desc: 'SaaS outsourcing — scope creep causing cost overrun and delay',
      brief: 'Scope creep, change management, milestone acceptance, final payment',
      applicant: 'Client PM',
      respondent: 'Dev Agency CEO',
      keywords: 'scope creep, milestone, payment',
    },
  },
]

// ─── Scenario ID → Image file mapping ───
const SCENARIO_IMAGES = {
  construction: '/images/scenarios/scenario-construction.png',
  financial: '/images/scenarios/scenario-financial.png',
  employment: '/images/scenarios/scenario-employment.png',
  ip: '/images/scenarios/scenario-ip.png',
  international: '/images/scenarios/scenario-intl-trade.png',
  realestate: '/images/scenarios/scenario-real-estate.png',
  medical: '/images/scenarios/scenario-medical.png',
  consumer: '/images/scenarios/scenario-consumer.png',
  ma: '/images/scenarios/scenario-ai-privacy.png',
  tech: '/images/scenarios/scenario-it-tech.png',
}

// ─── Per-scenario soft gradient backgrounds ───
const SCENARIO_BG = {
  construction: 'bg-amber-50',
  financial: 'bg-emerald-50',
  employment: 'bg-blue-50',
  ip: 'bg-violet-50',
  international: 'bg-sky-50',
  realestate: 'bg-orange-50',
  medical: 'bg-rose-50',
  consumer: 'bg-lime-50',
  ma: 'bg-purple-50',
  tech: 'bg-cyan-50',
}

// ─── Feature icon mapping (index-based) ───
const FEATURE_IMAGES = [
  '/images/icons/icon-voice-mic-v2.png',      // 실시간 음성 대화
  '/images/icons/icon-users-group.png',        // 4가지 AI 페르소나
  '/images/icons/icon-radar-assessment.png',   // AI 역량 분석
  '/images/icons/icon-bilingual-ko-en.png',    // 한국어·영어 지원
]

const FEATURE_BG = ['bg-brand-50', 'bg-teal-50', 'bg-amber-50', 'bg-violet-50']

const LEVEL_CONFIG = {
  beginner: {
    ko: { label: '초급', color: 'bg-green-100 text-green-700 border-green-200' },
    en: { label: 'Beginner', color: 'bg-green-100 text-green-700 border-green-200' },
  },
  intermediate: {
    ko: { label: '중급', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    en: { label: 'Intermediate', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  },
  advanced: {
    ko: { label: '고급', color: 'bg-red-100 text-red-700 border-red-200' },
    en: { label: 'Advanced', color: 'bg-red-100 text-red-700 border-red-200' },
  },
}

// ─── i18n ───
const T = {
  ko: {
    brand: 'Wing Mediator',
    subtitle: 'AI 기반 실전 조정 역량 훈련',
    partner: 'Powered by Trinos',
    tabs: { home: '홈', dashboard: '대시보드', train: '훈련', feedback: '피드백' },
    hero: {
      badge: 'AI-Powered Mediation Training',
      headline1: '조정의 미래,',
      headline2: 'AI와 함께 시작하세요',
      desc: 'Trinos가 개발한 차세대 AI 조정 훈련 시스템. 10가지 실전 시나리오로 조정 역량을 비약적으로 향상시키세요.',
      cta: '무료로 시작하기',
      ctaSub: '사전 등록된 이메일로 로그인하세요',
      stats: [
        { value: '10', label: '시나리오' },
        { value: '4', label: 'AI 페르소나' },
        { value: '실시간', label: '음성 대화' },
        { value: 'AI', label: '즉시 피드백' },
      ],
    },
    features: {
      title: '핵심 기능',
      subtitle: '실전 조정 역량을 끌어올리는 AI 훈련',
      items: [
        { icon: '🎙️', title: '실시간 음성 대화', desc: 'ElevenLabs AI 음성 기술로 실제 조정 상황과 동일한 대화 경험을 제공합니다.' },
        { icon: '🎭', title: '4가지 AI 페르소나', desc: '진행자, 신청인, 피신청인, 코치 — 각기 다른 성격과 전략으로 실전 시뮬레이션을 구현합니다.' },
        { icon: '📊', title: 'AI 역량 분석', desc: '경청, 질문, 공감, 이해관계 파악, 해결능력까지 5개 핵심 역량을 정밀하게 분석합니다.' },
        { icon: '🌐', title: '한국어 · 영어 지원', desc: '다국어 대응으로 국제 조정 역량까지 훈련할 수 있습니다.' },
      ],
    },
    scenarioSection: {
      title: '훈련 시나리오',
      subtitle: '10가지 실전 분쟁 유형',
      desc: '초급부터 고급까지, 다양한 분쟁 유형을 실전처럼 훈련하세요',
      levelFilter: { all: '전체', beginner: '초급', intermediate: '중급', advanced: '고급' },
    },
    howItWorks: {
      title: '이용 방법',
      steps: [
        { step: '01', title: '등록', desc: '이름과 이메일로 간편하게 시작' },
        { step: '02', title: '시나리오 선택', desc: '10개 분쟁 유형 중 선택' },
        { step: '03', title: '실전 조정', desc: '음성으로 실시간 조정 진행' },
        { step: '04', title: 'AI 피드백', desc: '역량 분석 및 개선점 제공' },
      ],
    },
    login: {
      welcome: (name) => `환영합니다, ${name}님`,
      startPrompt: 'AI 조정 훈련을 시작하세요',
      startBtn: '훈련 시작하기',
      nameLabel: '이름',
      namePlaceholder: '홍길동',
      emailLabel: '이메일',
      emailPlaceholder: 'hong@example.com',
      submit: '시작하기',
      submitting: '등록 중...',
      loginFirst: '먼저 로그인해주세요.',
      registerFail: '등록 실패',
      serverError: '서버 연결 오류',
      formTitle: '훈련 시작',
      formDesc: '사전 등록된 이메일로 로그인하세요.',
      notAllowed: '등록되지 않은 이메일입니다. 관리자에게 문의하세요.',
      timeExpired: '사용 시간(1시간)이 모두 소진되었습니다.',
      timeRemaining: (min) => `잔여 시간: ${min}분`,
    },
    dash: {
      title: '대시보드',
      remaining: '잔여 시간',
      used: '사용 시간',
      total: '총 배정',
      monthUsage: '이번 달 사용량',
      recentSessions: '최근 세션',
      noSessions: '아직 세션이 없습니다. 훈련을 시작해보세요!',
      training: '조정 훈련',
      completed: '완료',
      inProgress: '진행중',
      min: '분',
      loading: '로딩 중...',
    },
    train: {
      title: '조정 훈련',
      endBtn: '훈련 종료',
      startBtn: '세션 시작',
      connecting: '연결 중...',
      ready: 'AI 조정 훈련 준비 완료',
      readyDesc: '시나리오를 선택하고 "세션 시작"을 누르면 AI 조정 상대방과 실전 시뮬레이션이 시작됩니다.',
      selectScenario: '시나리오 선택',
      selectPrompt: '훈련할 분쟁 유형을 선택하세요',
      selectedScenario: '선택된 시나리오',
      change: '변경',
      applicantLabel: '신청인',
      respondentLabel: '피신청인',
      keyIssues: '핵심 쟁점',
      transcriptWait: '대화가 시작되면 여기에 트랜스크립트가 표시됩니다.',
      micCheck: '마이크가 켜져 있는지 확인해주세요.',
      micError: '연결 오류가 발생했습니다. 마이크 접근을 허용했는지 확인해주세요.',
      micAlert: '연결 오류: 마이크 접근을 허용해주세요.',
      noTime: '이번 달 사용 시간이 소진되었습니다.',
      sessionFail: '세션 시작 실패',
      me: '나 (조정인)',
      system: '시스템',
      status: { idle: '대기', connecting: '연결 중...', connected: '연결됨', speaking: 'AI 발화 중', listening: '듣는 중...' },
      speak: '말씀하세요...',
      aiSpeaking: 'AI가 말하는 중...',
      preparing: '음성 대화 준비 중...',
    },
    feedback: {
      title: 'AI 코칭 피드백',
      sessionId: '세션 ID',
      generate: '피드백 생성',
      generating: '분석 중...',
      enterSession: '세션 ID를 입력해주세요.',
      fail: '피드백 생성 실패',
      scores: '역량 평가 (10점 만점)',
      listening: '경청',
      questioning: '질문',
      empathy: '공감',
      interests: '이해관계',
      resolution: '해결',
      strengths: '강점',
      improvements: '개선점',
      techniques: '추천 조정 기법',
      overall: '종합 평가',
    },
    personas: {
      facilitator: '[진행]',
      applicant: '[신청인]',
      respondent: '[피신청인]',
      coach: '[코치]',
    },
  },
  en: {
    brand: 'Wing Mediator',
    subtitle: 'AI-Powered Negotiation & Mediation Training',
    partner: 'Powered by Trinos',
    tabs: { home: 'Home', dashboard: 'Dashboard', train: 'Training', feedback: 'Feedback' },
    hero: {
      badge: 'AI-Powered Mediation Training',
      headline1: 'The Future of',
      headline2: 'Mediation Training',
      desc: 'Built by Trinos, Wing Mediator delivers next-generation AI-powered simulation across 10 real-world dispute scenarios.',
      cta: 'Get Started Free',
      ctaSub: 'Sign in with your pre-registered email',
      stats: [
        { value: '10', label: 'Scenarios' },
        { value: '4', label: 'AI Personas' },
        { value: 'Live', label: 'Voice Chat' },
        { value: 'AI', label: 'Feedback' },
      ],
    },
    features: {
      title: 'Key Features',
      subtitle: 'AI training that elevates your mediation skills',
      items: [
        { icon: '🎙️', title: 'Real-Time Voice', desc: 'ElevenLabs AI voice technology delivers authentic mediation dialogue experiences.' },
        { icon: '🎭', title: '4 AI Personas', desc: 'Facilitator, Claimant, Respondent, Coach — each with distinct personality and strategy.' },
        { icon: '📊', title: 'AI Analysis', desc: 'Precise assessment across 5 core competencies: listening, questioning, empathy, interests, resolution.' },
        { icon: '🌐', title: 'Bilingual', desc: 'Korean & English support for developing international mediation capabilities.' },
      ],
    },
    scenarioSection: {
      title: 'Training Scenarios',
      subtitle: '10 Real-World Dispute Types',
      desc: 'From beginner to advanced, practice across diverse dispute categories',
      levelFilter: { all: 'All', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
    },
    howItWorks: {
      title: 'How It Works',
      steps: [
        { step: '01', title: 'Register', desc: 'Quick start with name and email' },
        { step: '02', title: 'Choose Scenario', desc: 'Select from 10 dispute types' },
        { step: '03', title: 'Live Mediation', desc: 'Voice-based real-time session' },
        { step: '04', title: 'AI Feedback', desc: 'Competency analysis and coaching' },
      ],
    },
    login: {
      welcome: (name) => `Welcome, ${name}`,
      startPrompt: 'Start your AI negotiation training',
      startBtn: 'Start Training',
      nameLabel: 'Name',
      namePlaceholder: 'John Doe',
      emailLabel: 'Email',
      emailPlaceholder: 'john@example.com',
      submit: 'Get Started',
      submitting: 'Registering...',
      loginFirst: 'Please log in first.',
      registerFail: 'Registration failed',
      serverError: 'Server connection error',
      formTitle: 'Start Training',
      formDesc: 'Sign in with your pre-registered email.',
      notAllowed: 'This email is not registered. Please contact the administrator.',
      timeExpired: 'Your usage time (1 hour) has been fully consumed.',
      timeRemaining: (min) => `Time remaining: ${min} min`,
    },
    dash: {
      title: 'Dashboard',
      remaining: 'Remaining',
      used: 'Used',
      total: 'Allocated',
      monthUsage: 'Monthly Usage',
      recentSessions: 'Recent Sessions',
      noSessions: 'No sessions yet. Start your first training!',
      training: 'Negotiation Training',
      completed: 'Done',
      inProgress: 'Active',
      min: 'min',
      loading: 'Loading...',
    },
    train: {
      title: 'Negotiation Training',
      endBtn: 'End Session',
      startBtn: 'Start Session',
      connecting: 'Connecting...',
      ready: 'AI Training Ready',
      readyDesc: 'Select a scenario and press "Start Session" to begin a real-time simulation with an AI counterpart.',
      selectScenario: 'Select Scenario',
      selectPrompt: 'Choose a dispute type to practice',
      selectedScenario: 'Selected Scenario',
      change: 'Change',
      applicantLabel: 'Claimant',
      respondentLabel: 'Respondent',
      keyIssues: 'Key Issues',
      transcriptWait: 'Transcript will appear here once the conversation starts.',
      micCheck: 'Please make sure your microphone is enabled.',
      micError: 'Connection error. Please allow microphone access.',
      micAlert: 'Connection error: Please allow microphone access.',
      noTime: 'Your monthly usage limit has been reached.',
      sessionFail: 'Failed to start session',
      me: 'Me (Mediator)',
      system: 'System',
      status: { idle: 'Idle', connecting: 'Connecting...', connected: 'Connected', speaking: 'AI Speaking', listening: 'Listening...' },
      speak: 'Speak now...',
      aiSpeaking: 'AI is speaking...',
      preparing: 'Preparing voice session...',
    },
    feedback: {
      title: 'AI Coaching Feedback',
      sessionId: 'Session ID',
      generate: 'Generate Feedback',
      generating: 'Analyzing...',
      enterSession: 'Please enter a session ID.',
      fail: 'Failed to generate feedback',
      scores: 'Competency Scores (out of 10)',
      listening: 'Listening',
      questioning: 'Questioning',
      empathy: 'Empathy',
      interests: 'Interests',
      resolution: 'Resolution',
      strengths: 'Strengths',
      improvements: 'Areas for Improvement',
      techniques: 'Recommended Techniques',
      overall: 'Overall Assessment',
    },
    personas: {
      facilitator: '[Facilitator]',
      applicant: '[Claimant]',
      respondent: '[Respondent]',
      coach: '[Coach]',
    },
  },
}

// ─── API helpers ───
async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  return res.json()
}

// ─── Icons ───
function WingLogo({ size = 32, className = '' }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold" style={{ fontSize: size * 0.45 }}>W</span>
      </div>
    </div>
  )
}

// ─── Language Switcher ───
function LangSwitch({ lang, setLang }) {
  return (
    <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full p-0.5 border border-white/10">
      <button onClick={() => setLang('ko')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${lang === 'ko' ? 'bg-white text-brand-700 shadow-sm' : 'text-white/70 hover:text-white'}`}>한국어</button>
      <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${lang === 'en' ? 'bg-white text-brand-700 shadow-sm' : 'text-white/70 hover:text-white'}`}>EN</button>
    </div>
  )
}

function LangSwitchLight({ lang, setLang }) {
  return (
    <div className="flex items-center bg-gray-100 rounded-full p-0.5">
      <button onClick={() => setLang('ko')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${lang === 'ko' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>한국어</button>
      <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${lang === 'en' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>EN</button>
    </div>
  )
}

// ─── Tab icons for mobile bottom nav ───
const TAB_ICONS = {
  home: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  ),
  dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  ),
  train: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
  ),
  feedback: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  ),
}

// ─── Nav ───
function Nav({ tab, setTab, user, lang, setLang, isLanding }) {
  const t = T[lang]
  const tabs = [
    { id: 'home', label: t.tabs.home },
    { id: 'dashboard', label: t.tabs.dashboard },
    { id: 'train', label: t.tabs.train },
    { id: 'feedback', label: t.tabs.feedback },
  ]

  if (isLanding) {
    return (
      <header className="fixed top-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <WingLogo size={32} />
            <span className="font-bold text-base sm:text-lg text-white tracking-tight">{t.brand}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <LangSwitch lang={lang} setLang={setLang} />
            {user && (
              <button onClick={() => setTab('dashboard')} className="hidden sm:block px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20 hover:bg-white/20 transition-all">
                {t.tabs.dashboard}
              </button>
            )}
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      {/* Desktop top nav */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => setTab('home')}>
            <WingLogo size={28} />
            <span className="font-bold text-base sm:text-lg text-gray-900 tracking-tight">{t.brand}</span>
          </div>
          {/* Desktop tabs */}
          <nav className="hidden md:flex gap-1">
            {tabs.map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${tab === tb.id ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
                {tb.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <LangSwitchLight lang={lang} setLang={setLang} />
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                  <span className="text-brand-700 text-xs font-bold">{user.name?.charAt(0)}</span>
                </div>
                <span className="text-sm text-gray-600 font-medium">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 safe-bottom">
        <div className="flex justify-around items-center h-14">
          {tabs.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)} className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${tab === tb.id ? 'text-brand-600' : 'text-gray-400'}`}>
              {TAB_ICONS[tb.id]}
              <span className="text-[10px] font-medium">{tb.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}

// ─── Scenario Picker (used in TrainTab) ───
function ScenarioPicker({ lang, selected, onSelect }) {
  const t = T[lang].train
  const [filter, setFilter] = useState('all')
  const filterLabels = T[lang].scenarioSection.levelFilter

  const filtered = filter === 'all' ? SCENARIOS : SCENARIOS.filter(s => s.level === filter)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{t.selectScenario}</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{t.selectPrompt}</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(filterLabels).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all ${filter === key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {filtered.map(scenario => {
          const s = scenario[lang]
          const lv = LEVEL_CONFIG[scenario.level][lang]
          const isSelected = selected?.id === scenario.id
          return (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              className={`text-left p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 group ${
                isSelected
                  ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-500/10'
                  : 'border-gray-100 bg-white hover:border-brand-200 hover:shadow-sm'
              }`}
            >
              {SCENARIO_IMAGES[scenario.id] && (
                <div className={`w-full aspect-square rounded-lg sm:rounded-xl ${SCENARIO_BG[scenario.id] || 'bg-gray-50'} flex items-center justify-center mb-2 sm:mb-3 overflow-hidden`}>
                  <img src={SCENARIO_IMAGES[scenario.id]} alt={s.title} className="w-3/4 h-3/4 object-contain drop-shadow-sm" />
                </div>
              )}
              <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                <h4 className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-brand-700' : 'text-gray-900 group-hover:text-brand-700'} transition-colors`}>{s.title}</h4>
                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full border font-medium shrink-0 ml-1 ${lv.color}`}>{lv.label}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed line-clamp-2">{s.desc}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Scenario Detail Card ───
function ScenarioDetail({ scenario, lang, onClear }) {
  const t = T[lang].train
  const s = scenario[lang]
  const lv = LEVEL_CONFIG[scenario.level][lang]

  return (
    <div className="bg-gradient-to-r from-brand-50 to-white rounded-xl sm:rounded-2xl border border-brand-100 p-4 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
        {SCENARIO_IMAGES[scenario.id] && (
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl ${SCENARIO_BG[scenario.id] || 'bg-gray-50'} flex items-center justify-center shrink-0 overflow-hidden`}>
            <img src={SCENARIO_IMAGES[scenario.id]} alt={s.title} className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-sm" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-gray-900">{s.title}</h3>
                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full border font-medium ${lv.color}`}>{lv.label}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-2">{s.brief}</p>
            </div>
            <button onClick={onClear} className="text-xs sm:text-sm text-brand-600 hover:text-brand-700 font-medium shrink-0 ml-2">{t.change}</button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-4">
        <div className="bg-white/80 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
          <span className="text-[10px] sm:text-xs font-medium text-blue-600">{t.applicantLabel}</span>
          <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-0.5">{s.applicant}</p>
        </div>
        <div className="bg-white/80 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
          <span className="text-[10px] sm:text-xs font-medium text-orange-600">{t.respondentLabel}</span>
          <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-0.5">{s.respondent}</p>
        </div>
      </div>
      <div className="mt-2 sm:mt-3">
        <span className="text-[10px] sm:text-xs font-medium text-gray-500">{t.keyIssues}</span>
        <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">{s.keywords}</p>
      </div>
    </div>
  )
}

// ─── Home / Landing ───
function HomeTab({ user, setUser, setTab, lang }) {
  const t = T[lang].login
  const tb = T[lang]
  const h = T[lang].hero
  const f = T[lang].features
  const ss = T[lang].scenarioSection
  const hw = T[lang].howItWorks
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [scenarioFilter, setScenarioFilter] = useState('all')

  const [authError, setAuthError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setAuthError('')

    // Whitelist check (case-insensitive)
    const normalizedEmail = email.trim().toLowerCase()
    if (!ALLOWED_EMAILS.some(allowed => allowed.toLowerCase() === normalizedEmail)) {
      setAuthError(t.notAllowed)
      return
    }

    setLoading(true)
    try {
      const data = await api('/api/user/register', {
        method: 'POST',
        body: JSON.stringify({ name, email: normalizedEmail, role: 'student', institution: 'Wing Mediator MVP' }),
      })
      if (data.success) {
        setUser({ id: data.user_id, name: data.name, email: data.email })
        setTab('dashboard')
      } else {
        setAuthError(data.error || t.registerFail)
      }
    } catch (err) {
      setAuthError(t.serverError)
    }
    setLoading(false)
  }

  const filteredScenarios = scenarioFilter === 'all' ? SCENARIOS : SCENARIOS.filter(s => s.level === scenarioFilter)

  if (user) {
    return (
      <section className="bg-hero-gradient relative overflow-hidden noise-overlay">
        <div className="orb orb-1 animate-float" />
        <div className="orb orb-2 animate-float-slow" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-20 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">{t.welcome(user.name)}</h1>
          <p className="text-sm sm:text-lg text-white/60 mb-6 sm:mb-10">{t.startPrompt}</p>
          <button onClick={() => setTab('train')} className="px-8 sm:px-10 py-3 sm:py-4 bg-white text-brand-700 rounded-full font-bold text-base sm:text-lg hover:shadow-xl hover:shadow-brand-500/20 transition-all duration-300 hover:-translate-y-0.5">
            {t.startBtn}
          </button>
        </div>
      </section>
    )
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-gradient relative overflow-hidden noise-overlay min-h-screen flex items-center">
        <div className="orb orb-1 animate-float" />
        <div className="orb orb-2 animate-float-slow" />
        <div className="orb orb-3 animate-float" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 sm:pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 mb-5 sm:mb-8">
                <span className="w-2 h-2 bg-accent-teal rounded-full animate-pulse-soft" />
                <span className="text-xs sm:text-sm text-white/80 font-medium">{h.badge}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 sm:mb-6 tracking-tight">
                {h.headline1}<br />
                <span className="text-gradient">{h.headline2}</span>
              </h1>
              <p className="text-sm sm:text-lg text-white/50 leading-relaxed max-w-xl mb-6 sm:mb-10">{h.desc}</p>
              <div className="hidden lg:flex justify-start mb-6">
                <img src="/images/branding/hero-ai-mediator.png" alt="AI Mediator" className="w-48 h-48 xl:w-56 xl:h-56 object-contain drop-shadow-2xl animate-float-slow opacity-90" />
              </div>
              <div className="grid grid-cols-4 gap-3 sm:gap-4 mt-2 sm:mt-4">
                {h.stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs text-white/40 font-medium uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-fade-in">
              <div className="bg-glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 glow-brand">
                <div className="text-center mb-8">
                  <WingLogo size={48} className="mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">{t.formTitle}</h2>
                  <p className="text-white/50 text-sm">{t.formDesc}</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-5">
                  {authError && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 flex items-start gap-2">
                      <span className="text-red-300 shrink-0 mt-0.5">⚠</span>
                      <p className="text-sm text-red-200">{authError}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">{t.nameLabel}</label>
                    <input type="text" value={name} onChange={e => { setName(e.target.value); setAuthError('') }} required placeholder={t.namePlaceholder}
                      className="w-full px-5 py-3.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400/50 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">{t.emailLabel}</label>
                    <input type="email" value={email} onChange={e => { setEmail(e.target.value); setAuthError('') }} required placeholder={t.emailPlaceholder}
                      className="w-full px-5 py-3.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400/50 outline-none transition-all" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-xl font-bold text-base hover:shadow-lg hover:shadow-brand-500/30 disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5">
                    {loading ? t.submitting : t.submit}
                  </button>
                </form>
                <p className="text-center text-white/30 text-xs mt-6">{h.ctaSub}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-16">
            <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 text-sm font-semibold rounded-full mb-3 sm:mb-4">{f.title}</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{f.subtitle}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {f.items.map((item, i) => (
              <div key={i} className="card-hover bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-7 group">
                {FEATURE_IMAGES[i] && (
                  <div className={`w-full aspect-[4/3] rounded-lg sm:rounded-xl ${FEATURE_BG[i] || 'bg-gray-50'} flex items-center justify-center mb-3 sm:mb-5 overflow-hidden`}>
                    <img src={FEATURE_IMAGES[i]} alt={item.title} className="w-1/2 h-1/2 object-contain drop-shadow-sm" />
                  </div>
                )}
                <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-3 group-hover:text-brand-700 transition-colors">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 Scenarios Showcase */}
      <section className="py-12 sm:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 text-sm font-semibold rounded-full mb-3 sm:mb-4">{ss.title}</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2 sm:mb-3">{ss.subtitle}</h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">{ss.desc}</p>
          </div>

          <div className="flex justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-10 flex-wrap">
            {Object.entries(ss.levelFilter).map(([key, label]) => (
              <button key={key} onClick={() => setScenarioFilter(key)} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${scenarioFilter === key ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {filteredScenarios.map(scenario => {
              const s = scenario[lang]
              const lv = LEVEL_CONFIG[scenario.level][lang]
              return (
                <div key={scenario.id} className="card-hover bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden group">
                  {SCENARIO_IMAGES[scenario.id] && (
                    <div className={`w-full aspect-[3/2] ${SCENARIO_BG[scenario.id] || 'bg-gray-50'} flex items-center justify-center overflow-hidden`}>
                      <img src={SCENARIO_IMAGES[scenario.id]} alt={s.title} className="w-2/3 h-2/3 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{s.title}</h3>
                      <span className={`text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border font-medium shrink-0 ml-2 ${lv.color}`}>{lv.label}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-3 sm:mb-4">{s.desc}</p>
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                      <span className="text-[10px] sm:text-xs bg-blue-50 text-blue-600 px-2 py-0.5 sm:py-1 rounded-full">{s.applicant}</span>
                      <span className="text-[10px] sm:text-xs bg-orange-50 text-orange-600 px-2 py-0.5 sm:py-1 rounded-full">{s.respondent}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{hw.title}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {hw.steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-brand-600 text-white rounded-xl sm:rounded-2xl text-base sm:text-xl font-bold mb-3 sm:mb-5 shadow-lg shadow-brand-500/20">{step.step}</div>
                {i < hw.steps.length - 1 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-brand-300 to-transparent" />}
                <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 bg-hero-gradient relative overflow-hidden noise-overlay">
        <div className="orb orb-1 animate-float" style={{ opacity: 0.2 }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 tracking-tight">{h.headline1} {h.headline2}</h2>
          <p className="text-sm sm:text-base text-white/50 mb-6 sm:mb-10 max-w-xl mx-auto">{h.desc}</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-8 sm:px-10 py-3 sm:py-4 bg-white text-brand-700 rounded-full font-bold text-base sm:text-lg hover:shadow-xl hover:shadow-brand-500/20 transition-all duration-300 hover:-translate-y-0.5">
            {h.cta}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 bg-navy-950 text-center pb-20 sm:pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <WingLogo size={28} />
            <span className="font-bold text-white/80">{tb.brand}</span>
          </div>
          <p className="text-white/30 text-sm">{tb.partner}</p>
          <p className="text-white/20 text-xs mt-4">© 2026 Trinos. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}

// ─── Dashboard ───
function DashboardTab({ user, lang }) {
  const t = T[lang].dash
  const tl = T[lang].login
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    api(`/api/usage/${user.id}`).then(data => { setUsage(data); setLoading(false) }).catch(() => setLoading(false))
  }, [user])

  if (!user) return <p className="text-center mt-20 text-gray-500">{tl.loginFirst}</p>
  if (loading) return <p className="text-center mt-20 text-gray-400">{t.loading}</p>

  const pct = usage ? Math.round((usage.minutes_used / usage.minutes_allocated) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto mt-6 sm:mt-10 space-y-4 sm:space-y-6 px-4 sm:px-6 pb-16 sm:pb-0">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t.title}</h2>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: t.remaining, value: usage?.minutes_remaining ?? '-', accent: true },
          { label: t.used, value: usage?.minutes_used ?? 0 },
          { label: t.total, value: usage?.minutes_allocated ?? 60 },
        ].map((item, i) => (
          <div key={i} className="card-hover bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">{item.label}</p>
            <p className={`text-xl sm:text-3xl font-bold ${item.accent ? 'text-brand-600' : 'text-gray-900'}`}>{item.value}<span className="text-xs sm:text-base font-medium text-gray-400 ml-0.5 sm:ml-1">{t.min}</span></p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-500">{t.monthUsage}</span>
          <span className="font-semibold text-brand-600">{pct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">{t.recentSessions}</h3>
        {usage?.sessions?.length > 0 ? (
          <div className="space-y-3">
            {usage.sessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{s.scenario_title || t.training}</p>
                  <p className="text-sm text-gray-400">{s.started_at ? new Date(s.started_at).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US') : '-'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-700">{s.duration_minutes ?? '-'}{t.min}</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${s.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                    {s.status === 'completed' ? t.completed : t.inProgress}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">{t.noSessions}</p>
        )}
      </div>
    </div>
  )
}

// ─── Persona config ───
function getPersonas(lang) {
  const p = T[lang].personas
  return {
    facilitator: { label: p.facilitator, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-600' },
    applicant:   { label: p.applicant, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-600' },
    respondent:  { label: p.respondent, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-600' },
    coach:       { label: p.coach, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-600' },
    unknown:     { label: 'AI', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-200 text-gray-600' },
  }
}

function detectPersona(text) {
  if (/<facilitator>|<진행>/i.test(text) || /\[진행\]|\[Facilitator\]/i.test(text)) return 'facilitator'
  if (/<applicant>|<신청인>|<claimant>/i.test(text) || /\[신청인\]|\[Claimant\]|\[Applicant\]/i.test(text)) return 'applicant'
  if (/<respondent>|<피신청인>/i.test(text) || /\[피신청인\]|\[Respondent\]/i.test(text)) return 'respondent'
  if (/<coach>|<코치>/i.test(text) || /\[코치\]|\[Coach\]/i.test(text)) return 'coach'
  return 'unknown'
}

function cleanText(text) {
  return text
    .replace(/\[(excited|sad|angry|happy|neutral|curious|surprised|worried|calm|frustrated|hopeful|disappointed|empathetic|assertive|confused|relieved|tense|anxious)\]/gi, '')
    .replace(/<\/?(Applicant|Facilitator|Respondent|Coach|Claimant|신청인|피신청인|진행|코치)>/gi, '')
    .replace(/\[(진행|신청인|피신청인|코치|Facilitator|Claimant|Applicant|Respondent|Coach)\]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// ─── Training ───
function TrainTab({ user, setTab, onSessionEnd, lang }) {
  const t = T[lang].train
  const tl = T[lang].login
  const PERSONAS = getPersonas(lang)
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [active, setActive] = useState(false)
  const [starting, setStarting] = useState(false)
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle')
  const [remainingMin, setRemainingMin] = useState(null)
  const conversationRef = useRef(null)
  const scrollRef = useRef(null)
  const pendingRef = useRef([])
  const speakingRef = useRef(false)

  // Fetch remaining time on mount
  useEffect(() => {
    if (!user) return
    api(`/api/usage/${user.id}`).then(data => {
      if (data) setRemainingMin(data.minutes_remaining ?? MAX_MINUTES)
    }).catch(() => {})
  }, [user])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const addMessage = useCallback((role, text, persona = 'unknown') => {
    const cleaned = cleanText(text)
    if (!cleaned) return
    setMessages(prev => [...prev, {
      role, text: cleaned, persona,
      time: new Date().toLocaleTimeString(lang === 'ko' ? 'ko-KR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    }])
  }, [lang])

  const startSession = async () => {
    if (!user) return alert(tl.loginFirst)
    if (!selectedScenario) return
    setStarting(true)
    try {
      const data = await api('/api/session/start', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          scenario_id: selectedScenario.id,
          scenario_title: selectedScenario[lang].title,
        }),
      })
      if (!data.success) { alert(data.error || t.sessionFail); setStarting(false); return }
      if (data.remaining_minutes <= 0) { setRemainingMin(0); alert(t.noTime); setStarting(false); return }
      setRemainingMin(data.remaining_minutes)
      setSessionId(data.session_id)
      setMessages([])
      setStatus('connecting')
      pendingRef.current = []
      speakingRef.current = false

      // Build scenario context string for ElevenLabs dynamic variables
      const sc = selectedScenario[lang]
      const scenarioContext = `[SCENARIO: ${sc.title}] ${sc.brief}. Applicant: ${sc.applicant}. Respondent: ${sc.respondent}. Key issues: ${sc.keywords}.`

      const { Conversation } = await import('@11labs/client')
      const conversation = await Conversation.startSession({
        agentId: AGENT_ID,
        dynamicVariables: {
          scenario: scenarioContext,
          scenario_id: selectedScenario.id,
        },
        onConnect: () => { setStatus('connected'); setActive(true) },
        onDisconnect: () => {
          if (pendingRef.current.length > 0) {
            pendingRef.current.splice(0).forEach(({ text, persona }) => {
              const c = cleanText(text)
              if (c) setMessages(prev => [...prev, { role: 'agent', text: c, persona, time: new Date().toLocaleTimeString(lang === 'ko' ? 'ko-KR' : 'en-US', { hour: '2-digit', minute: '2-digit' }) }])
            })
          }
          setStatus('idle')
        },
        onMessage: ({ message, source }) => {
          if (source === 'ai') {
            const persona = detectPersona(message)
            const cleaned = cleanText(message)
            if (!cleaned) return
            if (speakingRef.current) {
              addMessage('agent', cleaned, persona)
            } else {
              pendingRef.current.push({ text: cleaned, persona })
            }
          } else {
            addMessage('user', message, 'user')
          }
        },
        onModeChange: ({ mode }) => {
          if (mode === 'speaking') {
            speakingRef.current = true
            setStatus('speaking')
            if (pendingRef.current.length > 0) {
              pendingRef.current.splice(0).forEach(({ text, persona }) => {
                const c = cleanText(text)
                if (c) setMessages(prev => [...prev, { role: 'agent', text: c, persona, time: new Date().toLocaleTimeString(lang === 'ko' ? 'ko-KR' : 'en-US', { hour: '2-digit', minute: '2-digit' }) }])
              })
            }
          } else {
            speakingRef.current = false
            setStatus('listening')
          }
        },
        onError: (error) => {
          console.error('ElevenLabs error:', error)
          addMessage('system', t.micError, 'system')
        },
      })
      conversationRef.current = conversation
    } catch (err) {
      console.error('Start error:', err)
      alert(t.micAlert)
      setStatus('idle')
    }
    setStarting(false)
  }

  const endSession = async () => {
    const endedId = sessionId
    pendingRef.current = []
    if (conversationRef.current) {
      try { await conversationRef.current.endSession() } catch (e) {}
      conversationRef.current = null
    }
    if (endedId) {
      await api('/api/session/end', { method: 'POST', body: JSON.stringify({ session_id: endedId }) })
    }
    // Refresh remaining time
    if (user) {
      api(`/api/usage/${user.id}`).then(data => {
        if (data) setRemainingMin(data.minutes_remaining ?? 0)
      }).catch(() => {})
    }
    setActive(false); setSessionId(null); setStatus('idle')
    if (onSessionEnd) onSessionEnd(endedId)
    setTab('feedback')
  }

  const statusLabel = t.status[status] || status
  const getPersonaStyle = (msg) => {
    if (msg.role === 'user' || msg.role === 'system') return null
    return PERSONAS[msg.persona] || PERSONAS.unknown
  }

  if (!user) return <p className="text-center mt-20 text-gray-500">{tl.loginFirst}</p>

  return (
    <div className="max-w-5xl mx-auto mt-4 sm:mt-10 px-4 sm:px-6 pb-16 sm:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t.title}</h2>
          {remainingMin !== null && (
            <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${
              remainingMin > 15 ? 'bg-green-50 text-green-700 border border-green-200' :
              remainingMin > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
              'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {tl.timeRemaining(remainingMin)}
            </div>
          )}
        </div>
        {active ? (
          <button onClick={endSession} className="w-full sm:w-auto px-6 py-2.5 bg-red-500 text-white rounded-full font-medium text-sm hover:bg-red-600 transition-all hover:shadow-lg hover:shadow-red-500/20">{t.endBtn}</button>
        ) : remainingMin !== null && remainingMin <= 0 ? (
          <div className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-400 rounded-full font-medium text-sm text-center cursor-not-allowed">
            {tl.timeExpired}
          </div>
        ) : (
          <button onClick={startSession} disabled={starting || !selectedScenario}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-full font-medium text-sm hover:shadow-lg hover:shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            {starting ? t.connecting : t.startBtn}
          </button>
        )}
      </div>

      {/* Scenario selection area (shown before session starts) */}
      {!active && (
        <div className="mb-6">
          {selectedScenario ? (
            <ScenarioDetail scenario={selectedScenario} lang={lang} onClear={() => setSelectedScenario(null)} />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <ScenarioPicker lang={lang} selected={selectedScenario} onSelect={setSelectedScenario} />
            </div>
          )}
        </div>
      )}

      {/* Active session: scenario badge + persona legend */}
      {active && selectedScenario && (
        <div className="mb-3">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg">{selectedScenario.icon}</span>
            <span className="font-semibold text-gray-800 text-sm">{selectedScenario[lang].title}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(PERSONAS).filter(([k]) => k !== 'unknown').map(([key, p]) => (
              <span key={key} className={`text-xs px-2.5 py-1 rounded-full ${p.badge} font-medium`}>{p.label}</span>
            ))}
            <span className="text-xs px-2.5 py-1 rounded-full bg-brand-100 text-brand-600 font-medium">{t.me}</span>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden shadow-sm" style={{ minHeight: '400px' }}>
        {active ? (
          <div className="flex flex-col h-full" style={{ minHeight: '400px' }}>
            <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50/80">
              <div className={`w-3 h-3 rounded-full transition-colors ${status === 'speaking' ? 'bg-blue-400 animate-pulse' : status === 'listening' ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className={`text-sm font-medium ${status === 'speaking' ? 'text-blue-600' : status === 'listening' ? 'text-green-600' : 'text-amber-600'}`}>{statusLabel}</span>
              {sessionId && <span className="text-xs text-gray-400 ml-auto font-mono">ID: {sessionId.slice(0, 12)}...</span>}
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-2" style={{ maxHeight: '400px' }}>
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-10">
                  <p>{t.transcriptWait}</p>
                  <p className="mt-1">{t.micCheck}</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const ps = getPersonaStyle(msg)
                return (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 border ${
                      msg.role === 'user' ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white border-brand-500'
                        : msg.role === 'system' ? 'bg-red-50 text-red-600 border-red-200'
                        : `${ps.bg} ${ps.border} ${ps.text}`
                    }`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        {msg.role === 'agent' && ps && <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${ps.badge}`}>{ps.label}</span>}
                        {msg.role === 'user' && <span className="text-xs font-medium text-blue-100">{t.me}</span>}
                        {msg.role === 'system' && <span className="text-xs font-medium text-red-400">{t.system}</span>}
                        <span className={`text-xs ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-center gap-3">
              {status === 'listening' ? (
                <>
                  <div className="flex gap-1 items-center">{[0,1,2,3,4].map(i => <div key={i} className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: `${12 + Math.random() * 12}px`, animationDelay: `${i * 0.1}s` }} />)}</div>
                  <span className="text-sm text-green-600 font-medium">{t.speak}</span>
                </>
              ) : status === 'speaking' ? (
                <>
                  <div className="flex gap-1 items-center">{[0,1,2,3,4].map(i => <div key={i} className="w-1 bg-blue-400 rounded-full animate-pulse" style={{ height: `${12 + Math.random() * 12}px`, animationDelay: `${i * 0.1}s` }} />)}</div>
                  <span className="text-sm text-blue-600 font-medium">{t.aiSpeaking}</span>
                </>
              ) : (
                <span className="text-sm text-gray-400">{t.preparing}</span>
              )}
            </div>
          </div>
        ) : !selectedScenario ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-50 to-brand-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t.ready}</h3>
            <p className="text-gray-500 max-w-md">{t.readyDesc}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <span className="text-5xl mb-4">{selectedScenario.icon}</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedScenario[lang].title}</h3>
            <p className="text-gray-500 max-w-md mb-6">{selectedScenario[lang].brief}</p>
            <p className="text-sm text-brand-600 font-medium">{t.readyDesc}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Feedback ───
function FeedbackTab({ user, initialSessionId, lang }) {
  const t = T[lang].feedback
  const tl = T[lang].login
  const [sessionId, setSessionId] = useState(initialSessionId || '')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (initialSessionId && initialSessionId !== sessionId) setSessionId(initialSessionId) }, [initialSessionId])
  useEffect(() => { if (initialSessionId && !feedback && !loading) generateFeedback() }, [initialSessionId])

  const generateFeedback = async () => {
    const sid = sessionId || initialSessionId
    if (!sid?.trim()) return alert(t.enterSession)
    setLoading(true)
    try {
      const data = await api('/api/feedback/generate', { method: 'POST', body: JSON.stringify({ session_id: sessionId }) })
      if (data.success) { setFeedback(data.feedback) } else { alert(data.error || t.fail) }
    } catch (err) { alert(tl.serverError) }
    setLoading(false)
  }

  const ScoreBar = ({ label, score }) => (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-700" style={{ width: `${score * 10}%` }} />
      </div>
      <span className="text-sm font-bold text-gray-700 w-8 text-right">{score}</span>
    </div>
  )

  if (!user) return <p className="text-center mt-20 text-gray-500">{tl.loginFirst}</p>

  return (
    <div className="max-w-4xl mx-auto mt-6 sm:mt-10 space-y-4 sm:space-y-6 px-4 sm:px-6 pb-16 sm:pb-0">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t.title}</h2>
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t.sessionId}</label>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input type="text" value={sessionId} onChange={e => setSessionId(e.target.value)} placeholder="ses_..."
            className="flex-1 px-4 sm:px-5 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 outline-none transition-all" />
          <button onClick={generateFeedback} disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-brand-500/20 disabled:opacity-50 transition-all">
            {loading ? t.generating : t.generate}
          </button>
        </div>
      </div>
      {feedback && (
        <div className="space-y-4">
          {feedback.demo_notice && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
              <span className="text-amber-500 text-lg shrink-0">&#9888;</span>
              <p className="text-sm text-amber-700">{feedback.demo_notice}</p>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900">{t.scores}</h3>
            <ScoreBar label={t.listening} score={feedback.scores?.listening ?? 0} />
            <ScoreBar label={t.questioning} score={feedback.scores?.questioning ?? 0} />
            <ScoreBar label={t.empathy} score={feedback.scores?.empathy ?? 0} />
            <ScoreBar label={t.interests} score={feedback.scores?.interests ?? 0} />
            <ScoreBar label={t.resolution} score={feedback.scores?.resolution ?? 0} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
              <h3 className="font-semibold text-green-600 mb-2 sm:mb-3 text-sm sm:text-base">{t.strengths}</h3>
              <ul className="space-y-2">{(feedback.strengths || []).map((s, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-green-500 shrink-0">✓</span> {s}</li>)}</ul>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
              <h3 className="font-semibold text-amber-600 mb-2 sm:mb-3 text-sm sm:text-base">{t.improvements}</h3>
              <ul className="space-y-2">{(feedback.improvements || []).map((s, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-amber-500 shrink-0">→</span> {s}</li>)}</ul>
            </div>
          </div>
          {feedback.techniques_available?.length > 0 && (
            <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100">
              <h3 className="font-semibold text-brand-700 mb-3">{t.techniques}</h3>
              <div className="flex flex-wrap gap-2">{feedback.techniques_available.map((tc, i) => <span key={i} className="px-3 py-1.5 bg-white text-brand-600 text-sm rounded-lg border border-brand-200 font-medium">{tc}</span>)}</div>
            </div>
          )}
          {feedback.overall && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{t.overall}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feedback.overall}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main App ───
export default function Home() {
  const [tab, setTab] = useState('home')
  const [user, setUser] = useState(null)
  const [lastSessionId, setLastSessionId] = useState(null)
  const [lang, setLang] = useState('ko')

  const isLanding = tab === 'home' && !user

  return (
    <div className={isLanding ? '' : 'bg-gray-50 min-h-screen'}>
      <Nav tab={tab} setTab={setTab} user={user} lang={lang} setLang={setLang} isLanding={isLanding} />
      <main className={isLanding ? '' : 'pb-20'}>
        {tab === 'home' && <HomeTab user={user} setUser={setUser} setTab={setTab} lang={lang} />}
        {tab === 'dashboard' && <DashboardTab user={user} lang={lang} />}
        {tab === 'train' && <TrainTab user={user} setTab={setTab} onSessionEnd={setLastSessionId} lang={lang} />}
        {tab === 'feedback' && <FeedbackTab user={user} initialSessionId={lastSessionId} lang={lang} />}
      </main>
      {!isLanding && (
        <footer className="hidden md:block fixed bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-100 py-3 text-center text-xs text-gray-400">
          Wing Mediator v0.3 — Powered by Trinos
        </footer>
      )}
    </div>
  )
}
