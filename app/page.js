'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const API_BASE = 'https://wmediator.trinos.group'
const AGENT_ID = 'agent_1201km3k1xa0ee0bc2j2zdpp5rr6'

// ─── API helpers ───
async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  return res.json()
}

// ─── Nav ───
function Nav({ tab, setTab, user }) {
  const tabs = [
    { id: 'home', label: '홈' },
    { id: 'dashboard', label: '대시보드' },
    { id: 'train', label: '훈련 시작' },
    { id: 'feedback', label: '피드백' },
  ]
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="font-bold text-lg text-brand-700">Wing Mediator</span>
        </div>
        <nav className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        {user && (
          <span className="text-sm text-gray-500">{user.name}</span>
        )}
      </div>
    </header>
  )
}

// ─── Home / Login ───
function HomeTab({ user, setUser, setTab }) {
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
        alert(data.error || '등록 실패')
      }
    } catch (err) {
      alert('서버 연결 오류')
    }
    setLoading(false)
  }

  if (user) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <h1 className="text-3xl font-bold text-brand-700 mb-4">환영합니다, {user.name}님</h1>
        <p className="text-gray-500 mb-8">AI 조정 훈련을 시작하세요</p>
        <button
          onClick={() => setTab('train')}
          className="px-8 py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-colors"
        >
          훈련 시작하기
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Wing Mediator</h1>
        <p className="text-gray-500">AI 기반 실전 조정 역량 훈련 시스템</p>
        <p className="text-sm text-gray-400 mt-1">대한상사중재원(KCAB) × Trinos</p>
      </div>
      <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="홍길동"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="hong@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {loading ? '등록 중...' : '시작하기'}
        </button>
      </form>
    </div>
  )
}

// ─── Dashboard ───
function DashboardTab({ user }) {
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    api(`/api/usage/${user.id}`).then(data => {
      setUsage(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  if (!user) return <p className="text-center mt-20 text-gray-500">먼저 로그인해주세요.</p>
  if (loading) return <p className="text-center mt-20 text-gray-400">로딩 중...</p>

  const pct = usage ? Math.round((usage.minutes_used / usage.minutes_allocated) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>

      {/* Usage Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">잔여 시간</p>
          <p className="text-3xl font-bold text-brand-500">{usage?.minutes_remaining ?? '-'}분</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">사용 시간</p>
          <p className="text-3xl font-bold text-gray-900">{usage?.minutes_used ?? 0}분</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">총 배정</p>
          <p className="text-3xl font-bold text-gray-900">{usage?.minutes_allocated ?? 60}분</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">이번 달 사용량</span>
          <span className="font-medium text-gray-700">{pct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Session History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">최근 세션</h3>
        {usage?.sessions?.length > 0 ? (
          <div className="space-y-3">
            {usage.sessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{s.scenario_title || '조정 훈련'}</p>
                  <p className="text-sm text-gray-400">{s.started_at ? new Date(s.started_at).toLocaleString('ko-KR') : '-'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-700">{s.duration_minutes ?? '-'}분</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                  }`}>
                    {s.status === 'completed' ? '완료' : '진행중'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">아직 세션이 없습니다. 훈련을 시작해보세요!</p>
        )}
      </div>
    </div>
  )
}

// ─── Persona config ───
const PERSONAS = {
  facilitator: { label: '[진행]', color: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-600' },
  applicant:   { label: '[신청인]', color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-600' },
  respondent:  { label: '[피신청인]', color: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-600' },
  coach:       { label: '[코치]', color: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-600' },
  unknown:     { label: 'AI', color: 'gray', bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-200 text-gray-600' },
}

// Detect persona from XML-like tags or Korean bracket markers
function detectPersona(text) {
  const lower = text.toLowerCase()
  // XML tags: <Applicant>, <Facilitator>, <Respondent>, <Coach>
  if (/<facilitator>|<진행>/i.test(text) || /\[진행\]/i.test(text)) return 'facilitator'
  if (/<applicant>|<신청인>/i.test(text) || /\[신청인\]/i.test(text)) return 'applicant'
  if (/<respondent>|<피신청인>/i.test(text) || /\[피신청인\]/i.test(text)) return 'respondent'
  if (/<coach>|<코치>/i.test(text) || /\[코치\]/i.test(text)) return 'coach'
  return 'unknown'
}

// Strip emotion tags, persona XML tags, and bracket markers
function cleanText(text) {
  return text
    // Remove emotion tags: [excited], [sad], [angry], [happy], [neutral], [curious], etc.
    .replace(/\[(excited|sad|angry|happy|neutral|curious|surprised|worried|calm|frustrated|hopeful|disappointed|empathetic|assertive|confused|relieved|tense|anxious)\]/gi, '')
    // Remove XML persona tags: <Applicant>, </Applicant>, <Facilitator>, etc.
    .replace(/<\/?(Applicant|Facilitator|Respondent|Coach|신청인|피신청인|진행|코치)>/gi, '')
    // Remove Korean bracket persona markers: [진행], [신청인], [피신청인], [코치]
    .replace(/\[(진행|신청인|피신청인|코치)\]/g, '')
    // Clean up extra whitespace
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// Split text into sentences (Korean + English aware)
function splitSentences(text) {
  // Split on sentence-ending punctuation followed by space or end
  const raw = text.match(/[^.!?。]*[.!?。]+[\s]?|[^.!?。]+$/g)
  if (!raw || raw.length <= 1) return [text]
  return raw.map(s => s.trim()).filter(s => s.length > 0)
}

// ─── Training ───
function TrainTab({ user, setTab, onSessionEnd }) {
  const [sessionId, setSessionId] = useState(null)
  const [active, setActive] = useState(false)
  const [starting, setStarting] = useState(false)
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle') // idle, connecting, connected, speaking, listening
  const conversationRef = useRef(null)
  const scrollRef = useRef(null)
  const timerRefs = useRef([]) // track sentence timers for cleanup

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => timerRefs.current.forEach(t => clearTimeout(t))
  }, [])

  // Add a single message bubble
  const addMessage = useCallback((role, text, persona = 'unknown') => {
    const cleaned = cleanText(text)
    if (!cleaned) return
    setMessages(prev => [...prev, {
      role,
      text: cleaned,
      persona,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    }])
  }, [])

  // Stream AI message sentence by sentence
  const streamSentences = useCallback((fullText) => {
    const persona = detectPersona(fullText)
    const cleaned = cleanText(fullText)
    if (!cleaned) return

    const sentences = splitSentences(cleaned)

    if (sentences.length <= 1) {
      addMessage('agent', cleaned, persona)
      return
    }

    sentences.forEach((sentence, idx) => {
      const timer = setTimeout(() => {
        addMessage('agent', sentence, persona)
      }, idx * 600) // 600ms between each sentence
      timerRefs.current.push(timer)
    })
  }, [addMessage])

  const startSession = async () => {
    if (!user) return alert('먼저 로그인해주세요.')
    setStarting(true)
    try {
      // 1. Register session with Workers API
      const data = await api('/api/session/start', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id }),
      })
      if (!data.success) {
        alert(data.error || '세션 시작 실패')
        setStarting(false)
        return
      }
      if (data.remaining_minutes <= 0) {
        alert('이번 달 사용 시간이 소진되었습니다.')
        setStarting(false)
        return
      }
      setSessionId(data.session_id)
      setMessages([])
      setStatus('connecting')
      timerRefs.current = []

      // 2. Start ElevenLabs conversation
      const { Conversation } = await import('@11labs/client')
      const conversation = await Conversation.startSession({
        agentId: AGENT_ID,
        onConnect: () => {
          setStatus('connected')
          setActive(true)
        },
        onDisconnect: () => {
          setStatus('idle')
        },
        onMessage: ({ message, source }) => {
          if (source === 'ai') {
            // AI messages: detect persona, strip tags, stream sentences
            streamSentences(message)
          } else {
            // User messages: just clean and add
            addMessage('user', message, 'user')
          }
        },
        onModeChange: ({ mode }) => {
          setStatus(mode === 'speaking' ? 'speaking' : 'listening')
        },
        onError: (error) => {
          console.error('ElevenLabs error:', error)
          addMessage('system', '연결 오류가 발생했습니다. 마이크 접근을 허용했는지 확인해주세요.', 'system')
        },
      })
      conversationRef.current = conversation

    } catch (err) {
      console.error('Start error:', err)
      alert('연결 오류: 마이크 접근을 허용해주세요.')
      setStatus('idle')
    }
    setStarting(false)
  }

  const endSession = async () => {
    const endedId = sessionId
    // Clear pending sentence timers
    timerRefs.current.forEach(t => clearTimeout(t))
    timerRefs.current = []
    // End ElevenLabs conversation
    if (conversationRef.current) {
      try {
        await conversationRef.current.endSession()
      } catch (e) { /* ignore */ }
      conversationRef.current = null
    }
    // End API session
    if (endedId) {
      await api('/api/session/end', {
        method: 'POST',
        body: JSON.stringify({ session_id: endedId }),
      })
    }
    setActive(false)
    setSessionId(null)
    setStatus('idle')
    if (onSessionEnd) onSessionEnd(endedId)
    setTab('feedback')
  }

  const statusLabel = {
    idle: { text: '대기', color: 'gray' },
    connecting: { text: '연결 중...', color: 'yellow' },
    connected: { text: '연결됨', color: 'green' },
    speaking: { text: 'AI 발화 중', color: 'blue' },
    listening: { text: '듣는 중...', color: 'green' },
  }[status] || { text: status, color: 'gray' }

  // Get persona style for a message
  const getPersonaStyle = (msg) => {
    if (msg.role === 'user') return null
    if (msg.role === 'system') return null
    return PERSONAS[msg.persona] || PERSONAS.unknown
  }

  if (!user) return <p className="text-center mt-20 text-gray-500">먼저 로그인해주세요.</p>

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">조정 훈련</h2>
        {active ? (
          <button
            onClick={endSession}
            className="px-5 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            훈련 종료
          </button>
        ) : (
          <button
            onClick={startSession}
            disabled={starting}
            className="px-5 py-2 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {starting ? '연결 중...' : '세션 시작'}
          </button>
        )}
      </div>

      {/* Persona Legend */}
      {active && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {Object.entries(PERSONAS).filter(([k]) => k !== 'unknown').map(([key, p]) => (
            <span key={key} className={`text-xs px-2.5 py-1 rounded-full ${p.badge} font-medium`}>
              {p.label}
            </span>
          ))}
          <span className="text-xs px-2.5 py-1 rounded-full bg-brand-100 text-brand-600 font-medium">나 (조정인)</span>
        </div>
      )}

      {/* Training Area */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ minHeight: '500px' }}>
        {active ? (
          <div className="flex flex-col h-full" style={{ minHeight: '500px' }}>
            {/* Status Bar */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50">
              <div className={`w-3 h-3 rounded-full ${
                status === 'speaking' ? 'bg-blue-400 animate-pulse' :
                status === 'listening' ? 'bg-green-400 animate-pulse' :
                'bg-yellow-400'
              }`} />
              <span className={`text-sm font-medium ${
                status === 'speaking' ? 'text-blue-600' :
                status === 'listening' ? 'text-green-600' :
                'text-yellow-600'
              }`}>{statusLabel.text}</span>
              {sessionId && <span className="text-xs text-gray-400 ml-auto">ID: {sessionId.slice(0, 12)}...</span>}
            </div>

            {/* Transcript */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-2" style={{ maxHeight: '400px' }}>
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-10">
                  <p>대화가 시작되면 여기에 트랜스크립트가 표시됩니다.</p>
                  <p className="mt-1">마이크가 켜져 있는지 확인해주세요.</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const ps = getPersonaStyle(msg)
                return (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 border ${
                      msg.role === 'user'
                        ? 'bg-brand-500 text-white border-brand-500'
                        : msg.role === 'system'
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : `${ps.bg} ${ps.border} ${ps.text}`
                    }`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        {msg.role === 'agent' && ps && (
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${ps.badge}`}>
                            {ps.label}
                          </span>
                        )}
                        {msg.role === 'user' && (
                          <span className="text-xs font-medium text-blue-100">나 (조정인)</span>
                        )}
                        {msg.role === 'system' && (
                          <span className="text-xs font-medium text-red-400">시스템</span>
                        )}
                        <span className={`text-xs ${
                          msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                        }`}>{msg.time}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Voice Indicator */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-3">
              {status === 'listening' ? (
                <>
                  <div className="flex gap-1 items-center">
                    <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" />
                    <div className="w-1 h-6 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1 h-5 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                    <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.25s' }} />
                  </div>
                  <span className="text-sm text-green-600">말씀하세요...</span>
                </>
              ) : status === 'speaking' ? (
                <>
                  <div className="flex gap-1 items-center">
                    <div className="w-1 h-3 bg-blue-400 rounded-full animate-pulse" />
                    <div className="w-1 h-5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1 h-6 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                    <div className="w-1 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.25s' }} />
                  </div>
                  <span className="text-sm text-blue-600">AI가 말하는 중...</span>
                </>
              ) : (
                <span className="text-sm text-gray-400">음성 대화 준비 중...</span>
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">AI 조정 훈련 준비 완료</h3>
            <p className="text-gray-500 mb-2 max-w-md">
              "세션 시작" 버튼을 누르면 AI 조정 상대방과 실전 시뮬레이션이 시작됩니다.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-left max-w-lg">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-700 mb-1">5가지 시나리오</p>
                <p className="text-gray-400 text-xs">건설, 금융, 노동, 지식재산, 국제분쟁</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-700 mb-1">3단계 난이도</p>
                <p className="text-gray-400 text-xs">초급 → 중급 → 고급</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-700 mb-1">AI 코칭</p>
                <p className="text-gray-400 text-xs">대화 종료 후 즉시 피드백</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Feedback ───
function FeedbackTab({ user, initialSessionId }) {
  const [sessionId, setSessionId] = useState(initialSessionId || '')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)

  // Auto-generate feedback when coming from training tab
  useEffect(() => {
    if (initialSessionId && initialSessionId !== sessionId) {
      setSessionId(initialSessionId)
    }
  }, [initialSessionId])

  useEffect(() => {
    if (initialSessionId && !feedback && !loading) {
      generateFeedback()
    }
  }, [initialSessionId])

  const generateFeedback = async () => {
    const sid = sessionId || initialSessionId
    if (!sid?.trim()) return alert('세션 ID를 입력해주세요.')
    setLoading(true)
    try {
      const data = await api('/api/feedback/generate', {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId }),
      })
      if (data.success) {
        setFeedback(data.feedback)
      } else {
        alert(data.error || '피드백 생성 실패')
      }
    } catch (err) {
      alert('서버 연결 오류')
    }
    setLoading(false)
  }

  const ScoreBar = ({ label, score }) => (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-700"
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-8 text-right">{score}</span>
    </div>
  )

  if (!user) return <p className="text-center mt-20 text-gray-500">먼저 로그인해주세요.</p>

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">AI 코칭 피드백</h2>

      {/* Input */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">세션 ID</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
            placeholder="ses_..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
          <button
            onClick={generateFeedback}
            disabled={loading}
            className="px-6 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {loading ? '분석 중...' : '피드백 생성'}
          </button>
        </div>
      </div>

      {/* Feedback Result */}
      {feedback && (
        <div className="space-y-4">
          {/* Demo Notice */}
          {feedback.demo_notice && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
              <span className="text-amber-500 text-lg shrink-0">&#9888;</span>
              <p className="text-sm text-amber-700">{feedback.demo_notice}</p>
            </div>
          )}

          {/* Scores */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">역량 평가 (10점 만점)</h3>
            <ScoreBar label="경청" score={feedback.scores?.listening ?? 0} />
            <ScoreBar label="질문" score={feedback.scores?.questioning ?? 0} />
            <ScoreBar label="공감" score={feedback.scores?.empathy ?? 0} />
            <ScoreBar label="이해관계" score={feedback.scores?.interests ?? 0} />
            <ScoreBar label="해결" score={feedback.scores?.resolution ?? 0} />
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-green-600 mb-3">강점</h3>
              <ul className="space-y-2">
                {(feedback.strengths || []).map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-green-500 shrink-0">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-amber-600 mb-3">개선점</h3>
              <ul className="space-y-2">
                {(feedback.improvements || []).map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-amber-500 shrink-0">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Techniques */}
          {feedback.techniques_available?.length > 0 && (
            <div className="bg-brand-50 rounded-2xl p-6">
              <h3 className="font-semibold text-brand-700 mb-3">추천 조정 기법</h3>
              <div className="flex flex-wrap gap-2">
                {feedback.techniques_available.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white text-brand-600 text-sm rounded-lg border border-brand-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Overall */}
          {feedback.overall && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">종합 평가</h3>
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

  return (
    <>
      <Nav tab={tab} setTab={setTab} user={user} />
      <main className="pb-20 px-4">
        {tab === 'home' && <HomeTab user={user} setUser={setUser} setTab={setTab} />}
        {tab === 'dashboard' && <DashboardTab user={user} />}
        {tab === 'train' && <TrainTab user={user} setTab={setTab} onSessionEnd={setLastSessionId} />}
        {tab === 'feedback' && <FeedbackTab user={user} initialSessionId={lastSessionId} />}
      </main>
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-100 py-3 text-center text-xs text-gray-400">
        Wing Mediator v0.1 — Powered by Trinos × KCAB
      </footer>
    </>
  )
}
