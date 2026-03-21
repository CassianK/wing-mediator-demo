'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const API_BASE = 'https://wmediator.trinos.group'

// Same agent, language passed via overrides
const AGENT_ID = 'agent_1201km3k1xa0ee0bc2j2zdpp5rr6'

// ─── i18n ───
const T = {
  ko: {
    brand: 'Wing Mediator',
    subtitle: 'AI 기반 실전 조정 역량 훈련 시스템',
    partner: '대한상사중재원(KCAB) × Trinos',
    tabs: { home: '홈', dashboard: '대시보드', train: '훈련 시작', feedback: '피드백' },
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
      readyDesc: '"세션 시작" 버튼을 누르면 AI 조정 상대방과 실전 시뮬레이션이 시작됩니다.',
      scenarios: '5가지 시나리오',
      scenarioDesc: '건설, 금융, 노동, 지식재산, 국제분쟁',
      difficulty: '3단계 난이도',
      difficultyDesc: '초급 → 중급 → 고급',
      coaching: 'AI 코칭',
      coachingDesc: '대화 종료 후 즉시 피드백',
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
    partner: 'Trinos AI',
    tabs: { home: 'Home', dashboard: 'Dashboard', train: 'Training', feedback: 'Feedback' },
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
      readyDesc: 'Press "Start Session" to begin a real-time simulation with an AI counterpart.',
      scenarios: '5 Scenarios',
      scenarioDesc: 'Commercial, Employment, Partnership, Real Estate, Medical',
      difficulty: '3 Levels',
      difficultyDesc: 'Beginner → Intermediate → Advanced',
      coaching: 'AI Coaching',
      coachingDesc: 'Instant feedback after each session',
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

// ─── Language Switcher ───
function LangSwitch({ lang, setLang }) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
      <button
        onClick={() => setLang('ko')}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
          lang === 'ko' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        한국어
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
          lang === 'en' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        EN
      </button>
    </div>
  )
}

// ─── Nav ───
function Nav({ tab, setTab, user, lang, setLang }) {
  const t = T[lang]
  const tabs = [
    { id: 'home', label: t.tabs.home },
    { id: 'dashboard', label: t.tabs.dashboard },
    { id: 'train', label: t.tabs.train },
    { id: 'feedback', label: t.tabs.feedback },
  ]
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="font-bold text-lg text-brand-700">{t.brand}</span>
        </div>
        <nav className="flex gap-1">
          {tabs.map(tb => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === tb.id
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LangSwitch lang={lang} setLang={setLang} />
          {user && <span className="text-sm text-gray-500">{user.name}</span>}
        </div>
      </div>
    </header>
  )
}

// ─── Home / Login ───
function HomeTab({ user, setUser, setTab, lang }) {
  const t = T[lang].login
  const tb = T[lang]
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await api('/api/user/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, role: 'student', institution: 'KCAB' }),
      })
      if (data.success) {
        setUser({ id: data.user_id, name: data.name, email: data.email })
        setTab('dashboard')
      } else {
        alert(data.error || t.registerFail)
      }
    } catch (err) {
      alert(t.serverError)
    }
    setLoading(false)
  }

  if (user) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <h1 className="text-3xl font-bold text-brand-700 mb-4">{t.welcome(user.name)}</h1>
        <p className="text-gray-500 mb-8">{t.startPrompt}</p>
        <button
          onClick={() => setTab('train')}
          className="px-8 py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-colors"
        >
          {t.startBtn}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto mt-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">W</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tb.brand}</h1>
        <p className="text-gray-500">{tb.subtitle}</p>
        <p className="text-sm text-gray-400 mt-1">{tb.partner}</p>
      </div>
      <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameLabel}</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder={t.namePlaceholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailLabel}</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder={t.emailPlaceholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {loading ? t.submitting : t.submit}
        </button>
      </form>
    </div>
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
    api(`/api/usage/${user.id}`).then(data => {
      setUsage(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  if (!user) return <p className="text-center mt-20 text-gray-500">{tl.loginFirst}</p>
  if (loading) return <p className="text-center mt-20 text-gray-400">{t.loading}</p>

  const pct = usage ? Math.round((usage.minutes_used / usage.minutes_allocated) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">{t.remaining}</p>
          <p className="text-3xl font-bold text-brand-500">{usage?.minutes_remaining ?? '-'}{t.min}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">{t.used}</p>
          <p className="text-3xl font-bold text-gray-900">{usage?.minutes_used ?? 0}{t.min}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">{t.total}</p>
          <p className="text-3xl font-bold text-gray-900">{usage?.minutes_allocated ?? 60}{t.min}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">{t.monthUsage}</span>
          <span className="font-medium text-gray-700">{pct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">{t.recentSessions}</h3>
        {usage?.sessions?.length > 0 ? (
          <div className="space-y-3">
            {usage.sessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{s.scenario_title || t.training}</p>
                  <p className="text-sm text-gray-400">{s.started_at ? new Date(s.started_at).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US') : '-'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-700">{s.duration_minutes ?? '-'}{t.min}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                  }`}>
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
    unknown:     { label: 'AI', bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-200 text-gray-600' },
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

function splitSentences(text) {
  const raw = text.match(/[^.!?。]*[.!?。]+[\s]?|[^.!?。]+$/g)
  if (!raw || raw.length <= 1) return [text]
  return raw.map(s => s.trim()).filter(s => s.length > 0)
}

// ─── Training ───
function TrainTab({ user, setTab, onSessionEnd, lang }) {
  const t = T[lang].train
  const tl = T[lang].login
  const PERSONAS = getPersonas(lang)
  const [sessionId, setSessionId] = useState(null)
  const [active, setActive] = useState(false)
  const [starting, setStarting] = useState(false)
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle')
  const conversationRef = useRef(null)
  const scrollRef = useRef(null)
  const timerRefs = useRef([])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    return () => timerRefs.current.forEach(t => clearTimeout(t))
  }, [])

  const addMessage = useCallback((role, text, persona = 'unknown') => {
    const cleaned = cleanText(text)
    if (!cleaned) return
    setMessages(prev => [...prev, {
      role, text: cleaned, persona,
      time: new Date().toLocaleTimeString(lang === 'ko' ? 'ko-KR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    }])
  }, [lang])

  const streamSentences = useCallback((fullText) => {
    const persona = detectPersona(fullText)
    const cleaned = cleanText(fullText)
    if (!cleaned) return
    const sentences = splitSentences(cleaned)
    if (sentences.length <= 1) { addMessage('agent', cleaned, persona); return }
    sentences.forEach((sentence, idx) => {
      const timer = setTimeout(() => addMessage('agent', sentence, persona), idx * 600)
      timerRefs.current.push(timer)
    })
  }, [addMessage])

  const startSession = async () => {
    if (!user) return alert(tl.loginFirst)
    setStarting(true)
    try {
      const data = await api('/api/session/start', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id }),
      })
      if (!data.success) { alert(data.error || t.sessionFail); setStarting(false); return }
      if (data.remaining_minutes <= 0) { alert(t.noTime); setStarting(false); return }
      setSessionId(data.session_id)
      setMessages([])
      setStatus('connecting')
      timerRefs.current = []

      const { Conversation } = await import('@11labs/client')
      const conversation = await Conversation.startSession({
        agentId: AGENT_ID,
        overrides: {
          agent: {
            language: lang === 'en' ? 'en' : 'ko',
            firstMessage: lang === 'en'
              ? 'Hello, welcome to the Wing Mediator negotiation simulator. Please choose a scenario and difficulty level. Scenarios: 1. Construction defect dispute. 2. Wage dispute. 3. Partnership dissolution. 4. Real estate dispute. 5. Medical expense dispute. 6. Custom scenario. Difficulty: Beginner, Intermediate, or Advanced. Please say the number and difficulty.'
              : undefined,
          },
        },
        onConnect: () => { setStatus('connected'); setActive(true) },
        onDisconnect: () => { setStatus('idle') },
        onMessage: ({ message, source }) => {
          if (source === 'ai') { streamSentences(message) }
          else { addMessage('user', message, 'user') }
        },
        onModeChange: ({ mode }) => { setStatus(mode === 'speaking' ? 'speaking' : 'listening') },
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
    timerRefs.current.forEach(t => clearTimeout(t))
    timerRefs.current = []
    if (conversationRef.current) {
      try { await conversationRef.current.endSession() } catch (e) {}
      conversationRef.current = null
    }
    if (endedId) {
      await api('/api/session/end', { method: 'POST', body: JSON.stringify({ session_id: endedId }) })
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
    <div className="max-w-4xl mx-auto mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        {active ? (
          <button onClick={endSession} className="px-5 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">{t.endBtn}</button>
        ) : (
          <button onClick={startSession} disabled={starting} className="px-5 py-2 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors">
            {starting ? t.connecting : t.startBtn}
          </button>
        )}
      </div>

      {active && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {Object.entries(PERSONAS).filter(([k]) => k !== 'unknown').map(([key, p]) => (
            <span key={key} className={`text-xs px-2.5 py-1 rounded-full ${p.badge} font-medium`}>{p.label}</span>
          ))}
          <span className="text-xs px-2.5 py-1 rounded-full bg-brand-100 text-brand-600 font-medium">{t.me}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ minHeight: '500px' }}>
        {active ? (
          <div className="flex flex-col h-full" style={{ minHeight: '500px' }}>
            <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50">
              <div className={`w-3 h-3 rounded-full ${
                status === 'speaking' ? 'bg-blue-400 animate-pulse' :
                status === 'listening' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
              }`} />
              <span className={`text-sm font-medium ${
                status === 'speaking' ? 'text-blue-600' :
                status === 'listening' ? 'text-green-600' : 'text-yellow-600'
              }`}>{statusLabel}</span>
              {sessionId && <span className="text-xs text-gray-400 ml-auto">ID: {sessionId.slice(0, 12)}...</span>}
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
                      msg.role === 'user' ? 'bg-brand-500 text-white border-brand-500'
                        : msg.role === 'system' ? 'bg-red-50 text-red-600 border-red-200'
                        : `${ps.bg} ${ps.border} ${ps.text}`
                    }`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        {msg.role === 'agent' && ps && (
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${ps.badge}`}>{ps.label}</span>
                        )}
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

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-3">
              {status === 'listening' ? (
                <>
                  <div className="flex gap-1 items-center">
                    {[4,6,3,5,3].map((h,i) => (
                      <div key={i} className={`w-1 h-${h} bg-green-${i%2?5:4}00 rounded-full animate-pulse`} style={{ animationDelay: `${i*0.05+0.1}s` }} />
                    ))}
                  </div>
                  <span className="text-sm text-green-600">{t.speak}</span>
                </>
              ) : status === 'speaking' ? (
                <>
                  <div className="flex gap-1 items-center">
                    {[3,5,4,6,3].map((h,i) => (
                      <div key={i} className={`w-1 h-${h} bg-blue-${i%2?5:4}00 rounded-full animate-pulse`} style={{ animationDelay: `${i*0.05+0.1}s` }} />
                    ))}
                  </div>
                  <span className="text-sm text-blue-600">{t.aiSpeaking}</span>
                </>
              ) : (
                <span className="text-sm text-gray-400">{t.preparing}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t.ready}</h3>
            <p className="text-gray-500 mb-2 max-w-md">{t.readyDesc}</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-left max-w-lg">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-700 mb-1">{t.scenarios}</p>
                <p className="text-gray-400 text-xs">{t.scenarioDesc}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-700 mb-1">{t.difficulty}</p>
                <p className="text-gray-400 text-xs">{t.difficultyDesc}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-700 mb-1">{t.coaching}</p>
                <p className="text-gray-400 text-xs">{t.coachingDesc}</p>
              </div>
            </div>
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

  useEffect(() => {
    if (initialSessionId && initialSessionId !== sessionId) setSessionId(initialSessionId)
  }, [initialSessionId])

  useEffect(() => {
    if (initialSessionId && !feedback && !loading) generateFeedback()
  }, [initialSessionId])

  const generateFeedback = async () => {
    const sid = sessionId || initialSessionId
    if (!sid?.trim()) return alert(t.enterSession)
    setLoading(true)
    try {
      const data = await api('/api/feedback/generate', {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId }),
      })
      if (data.success) { setFeedback(data.feedback) }
      else { alert(data.error || t.fail) }
    } catch (err) { alert(tl.serverError) }
    setLoading(false)
  }

  const ScoreBar = ({ label, score }) => (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${score * 10}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-8 text-right">{score}</span>
    </div>
  )

  if (!user) return <p className="text-center mt-20 text-gray-500">{tl.loginFirst}</p>

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t.sessionId}</label>
        <div className="flex gap-3">
          <input type="text" value={sessionId} onChange={e => setSessionId(e.target.value)}
            placeholder="ses_..." className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none" />
          <button onClick={generateFeedback} disabled={loading}
            className="px-6 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors">
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

          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">{t.scores}</h3>
            <ScoreBar label={t.listening} score={feedback.scores?.listening ?? 0} />
            <ScoreBar label={t.questioning} score={feedback.scores?.questioning ?? 0} />
            <ScoreBar label={t.empathy} score={feedback.scores?.empathy ?? 0} />
            <ScoreBar label={t.interests} score={feedback.scores?.interests ?? 0} />
            <ScoreBar label={t.resolution} score={feedback.scores?.resolution ?? 0} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-green-600 mb-3">{t.strengths}</h3>
              <ul className="space-y-2">
                {(feedback.strengths || []).map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-green-500 shrink-0">✓</span> {s}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-amber-600 mb-3">{t.improvements}</h3>
              <ul className="space-y-2">
                {(feedback.improvements || []).map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-amber-500 shrink-0">→</span> {s}</li>
                ))}
              </ul>
            </div>
          </div>

          {feedback.techniques_available?.length > 0 && (
            <div className="bg-brand-50 rounded-2xl p-6">
              <h3 className="font-semibold text-brand-700 mb-3">{t.techniques}</h3>
              <div className="flex flex-wrap gap-2">
                {feedback.techniques_available.map((tc, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white text-brand-600 text-sm rounded-lg border border-brand-200">{tc}</span>
                ))}
              </div>
            </div>
          )}

          {feedback.overall && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
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

  return (
    <>
      <Nav tab={tab} setTab={setTab} user={user} lang={lang} setLang={setLang} />
      <main className="pb-20 px-4">
        {tab === 'home' && <HomeTab user={user} setUser={setUser} setTab={setTab} lang={lang} />}
        {tab === 'dashboard' && <DashboardTab user={user} lang={lang} />}
        {tab === 'train' && <TrainTab user={user} setTab={setTab} onSessionEnd={setLastSessionId} lang={lang} />}
        {tab === 'feedback' && <FeedbackTab user={user} initialSessionId={lastSessionId} lang={lang} />}
      </main>
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-100 py-3 text-center text-xs text-gray-400">
        Wing Mediator v0.1 — Powered by Trinos {lang === 'ko' ? '× KCAB' : 'AI'}
      </footer>
    </>
  )
}
