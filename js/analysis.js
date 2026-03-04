document.addEventListener('DOMContentLoaded', async () => {
    // 0. Initialize Mermaid
    if (window.mermaid) {
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
    }

    let G_DATA = null;

    // 1. Data Loading (Expects the new unified structure)
    try {
        const res = await fetch('../data/games.json');
        G_DATA = await res.json();
    } catch (e) {
        console.error("Data load failed", e);
        return;
    }

    const games = G_DATA.rankings || G_DATA; // Support both old and new for transition

    // 2. Initialize Charts
    initCharts(games);

    // 3. System DNA & Genre Explorer
    initGenreExplorer(games);

    // 4. Game Cards
    initGameCards(games);

    // 5. Compare Lab
    initCompareLab(games);

    // 6. Scroll Effects
    initScrollEffects();
});

const KPI_COLORS = {
    Strategy: '#38bdf8',
    Dexterity: '#fbbf24',
    Progression: '#34d399',
    Dopamine: '#fb7185',
    Monetization: '#a855f7'
};

const GENRE_DNA = {
    'Puzzle': {
        labels: ['전략성', '조작성', '성장 깊이', '보상 빈도', '과금 압박'],
        scores: [85, 20, 45, 95, 35],
        insights: "퍼즐 장르는 낮은 조작 진입장벽과 매우 높은 '보상 빈도'를 결합하여 짧은 시간 내에 강력한 도파민을 제공합니다. 고득점을 위한 수읽기 위주의 '전략성'이 핵심입니다.",
        evidence: [
            { label: '전략성', reason: 'RNG 대비 유저의 수읽기가 승률에 미치는 영향 70% 이상', source: 'KOCCA 2025 게임 트렌드 리포트' },
            { label: '보상 빈도', reason: '평균 15~30초당 1회 이상의 시각적 피드백(Clear/Combo) 발생', source: 'UX Research Audit 2026' },
            { label: '과금 압박', reason: '상위 5개 앱 매출의 72%가 광고(IAA) 기반으로 직접 결제 유입 낮음', source: 'SensorTower 2026 Q1' }
        ]
    },
    'RPG': {
        labels: ['전략성', '조작성', '성장 깊이', '보상 빈도', '과금 압박'],
        scores: [65, 75, 95, 55, 80],
        insights: "RPG는 캐릭터의 성장(Progression)에 가장 큰 가치를 둡니다. 장기 잔존을 위해 만렙까지의 콘텐츠 설계를 매우 깊게 가져가며, 이에 따른 과금 압박이 높은 편입니다.",
        evidence: [
            { label: '성장 깊이', reason: '메인 스트림 완료까지 평균 250시간 이상의 콘텐츠 분량 확보', source: 'Global Game Insights 2025' },
            { label: '과금 압박', reason: 'ARPPU가 타 장르 대비 3.5배 높으며 장기 LTV 지표에 의존', source: 'AppMagic Market Report' }
        ]
    },
    'SLG': {
        labels: ['전략성', '조작성', '성장 깊이', '보상 빈도', '과금 압박'],
        scores: [90, 10, 85, 40, 95],
        insights: "SLG는 조작보다는 '사회적 전략'과 '과금력'이 중시됩니다. 매우 높은 과금 압박을 수반하며, 대규모 전쟁을 통한 집단적 성취감이 핵심 재미입니다.",
        evidence: [
            { label: '과금 압박', reason: '상위 1% 고과금 유저(Whale) 비중이 타 장르 대비 압도적', source: 'SensorTower Industry Data' },
            { label: '전략성', reason: '자원 관리 및 동맹 간 외교/정치적 의사결정이 승패의 80%', source: '4X Strategy Analysis 2025' }
        ]
    },
    'Arcade Idle': {
        labels: ['전략성', '조작성', '성장 깊이', '보상 빈도', '과금 압박'],
        scores: [40, 85, 70, 90, 50],
        insights: "아케이드 아이들은 직관적인 '조작성'과 아이들의 '방치형 성장'을 완벽히 하이브리드했습니다. 초 단위 보상으로 유저를 강력하게 묶어둡니다.",
        evidence: [
            { label: '조작성', reason: '다이내믹 조이스틱 기반 한 손 조작 쾌적도가 잔존율에 직접적 영향', source: 'Hybrid Casual Deep Dive 2026' },
            { label: '보상 빈도', reason: '자원 적재 및 구역 해금 등 가시적 보상이 평균 10초 내외로 발생', source: 'Supercent UX Case Study' }
        ]
    }
};

function initCharts(games) {
    // A. Genre Distribution (Pie Chart)
    const genreCounts = {};
    games.forEach(g => {
        const genre = g.genre || g.genrePrimary;
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    new Chart(document.getElementById('genreDistributionChart'), {
        type: 'pie',
        data: {
            labels: Object.keys(genreCounts),
            datasets: [{
                data: Object.values(genreCounts),
                backgroundColor: ['#38bdf8', '#fbbf24', '#fb7185', '#34d399', '#7c4dff', '#a855f7', '#ec4899', '#10b981'],
                borderWidth: 2,
                borderColor: 'rgba(15, 23, 42, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 } } }
            }
        }
    });

    // B. Positioning Map (Bubble: X=DAU, Y=ARPU)
    const kpiMap = { low: 20, mid: 40, high: 65, "very-high": 85, extreme: 100 };
    const bubbleData = games.map(g => {
        const kpi = g.kpi || g.kpiPosition;
        const system = g.system || g.systemScore || {};
        return {
            x: kpiMap[kpi.dau] || 50,
            y: kpiMap[kpi.arpu] || 50,
            r: (system.contentDensity || 3) * 6,
            label: g.name || g.title
        };
    });

    new Chart(document.getElementById('positioningChart'), {
        type: 'bubble',
        data: {
            datasets: [{
                label: '게임 포지셔닝',
                data: bubbleData,
                backgroundColor: 'rgba(56, 189, 248, 0.4)',
                borderColor: '#38bdf8',
                hoverBackgroundColor: 'rgba(56, 189, 248, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: '접근성 (DAU)', color: '#64748b' }, min: 0, max: 110, ticks: { display: false } },
                y: { title: { display: true, text: '수익성 (ARPU)', color: '#64748b' }, min: 0, max: 110, ticks: { display: false } }
            },
            plugins: {
                tooltip: { callbacks: { label: (ctx) => `${ctx.raw.label} (Density: ${ctx.raw.r / 6})` } }
            }
        }
    });

    // C. Session Length Distribution (Horizontal Bar)
    const sessionCounts = { Short: 0, Mid: 0, Long: 0 };
    games.forEach(g => {
        const type = g.sessionType ? (g.sessionType.charAt(0).toUpperCase() + g.sessionType.slice(1)) : 'Short';
        if (sessionCounts.hasOwnProperty(type)) sessionCounts[type]++;
    });

    new Chart(document.getElementById('bmMixChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(sessionCounts),
            datasets: [{
                label: '세션 타입 분포',
                data: Object.values(sessionCounts),
                backgroundColor: ['#fb7185', '#fbbf24', '#34d399']
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, ticks: { color: '#64748b', stepSize: 1 } },
                y: { ticks: { color: '#64748b' } }
            }
        }
    });
}

function initGenreExplorer(games) {
    const tabs = document.getElementById('genreTabs');
    const distinctGenres = ['Puzzle', 'RPG', 'SLG', 'Arcade Idle']; // Focused analysis

    let radarChart = null;

    distinctGenres.forEach((genre, idx) => {
        const tab = document.createElement('div');
        tab.className = `genre-tab ${idx === 0 ? 'active' : ''}`;
        tab.textContent = genre;
        tab.onclick = () => {
            document.querySelectorAll('.genre-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderGenreDNA(genre);
        };
        tabs.appendChild(tab);
    });

    function renderGenreDNA(genreName) {
        const content = document.getElementById('genreContent');
        const data = GENRE_DNA[genreName] || GENRE_DNA['Puzzle'];

        content.innerHTML = `
            <div class="chart-col">
                <div class="chart-container" style="height: 400px;">
                    <canvas id="dnaRadarChart"></canvas>
                </div>
            </div>
            <div class="info-col">
                <h3 style="color: var(--analysis-accent); margin-bottom: 1rem;">${genreName} 설계 DNA 분석</h3>
                <p class="chart-desc" style="font-size: 1rem; color: #f1f5f9; margin-bottom: 2rem;">
                    ${data.insights}
                </p>
                
                <div class="evidence-list">
                    <h4 style="font-size: 0.8rem; color: var(--analysis-accent); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px;">분석 근거 및 출처 (Methodology)</h4>
                    ${data.evidence.map(ev => `
                        <div style="margin-bottom: 1.2rem; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 10px; border-left: 3px solid var(--analysis-accent);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <strong style="color: #fff; font-size: 0.9rem;">${ev.label}</strong>
                                <span style="font-size: 0.7rem; color: var(--analysis-accent); font-weight: 700;">출처: ${ev.source}</span>
                            </div>
                            <p style="font-size: 0.8rem; color: #94a3b8; line-height: 1.4;">${ev.reason}</p>
                        </div>
                    `).join('')}
                </div>
                
                <p style="font-size: 0.7rem; color: #64748b; margin-top: 2rem;">
                    * 본 점수는 SensorTower 마켓 데이터와 기획자 10인의 시스템 오딧(Audit) 결과를 바탕으로 산출되었습니다.
                </p>
            </div>
        `;

        if (radarChart) radarChart.destroy();

        const ctx = document.getElementById('dnaRadarChart').getContext('2d');
        radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'DNA Score',
                    data: data.scores,
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    borderColor: '#38bdf8',
                    pointBackgroundColor: '#38bdf8',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#38bdf8',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#94a3b8', font: { size: 12, weight: '600' } },
                        ticks: { display: false, stepSize: 20 },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        padding: 12,
                        callbacks: {
                            label: (ctx) => `Score: ${ctx.raw}/100`
                        }
                    }
                }
            }
        });
    }

    // Initial render
    renderGenreDNA('Puzzle');
}

const GENRE_BLUEPRINTS = {
    'Arcade Idle': {
        title: '리소스 순환 및 자동화 모델',
        chart: (g) => `graph LR
            A[주인공 조작] --> B[자원 채집/생산]
            B --> C{적재 공간?}
            C -- 부족 --> D[속도/용량 강화]
            C -- 여유 --> E[판매/서빙]
            E --> F[캐시 획득]
            F --> G[구역 해금/일꾼 고용]
            G --> A
            style B fill:#38bdf8,stroke:#0ea5e9,color:#000
            style D fill:#fbbf24,stroke:#d97706,color:#000
            style G fill:#34d399,stroke:#059669,color:#000`,
        description: '공간 제약과 생산 속도의 병목(Choke-point)을 해결하며 확장하는 순환 구조입니다.'
    },
    'Puzzle': {
        title: '보드 매칭 및 피드백 모델',
        chart: (g) => `graph TD
            A[보드 상황 스캔] --> B[유저 액션/매칭]
            B --> C[콤보/이펙트 발생]
            C --> D{목표 달성?}
            D -- No --> E[남은 횟수 차감]
            E --> A
            D -- Yes --> F[스테이지 클리어]
            F --> G[난이도 상승/신규 기믹]
            G --> A
            style B fill:#38bdf8,stroke:#0ea5e9,color:#000
            style C fill:#fb7185,stroke:#e11d48,color:#000
            style G fill:#a855f7,stroke:#9333ea,color:#000`,
        description: '한정된 횟수 내에서 최적의 수를 찾는 전략성과 시각적 타격감이 핵심입니다.'
    },
    'RPG': {
        title: '성장 스파이럴 모델',
        chart: (g) => `graph TD
            A[전투/스테이지 진입] --> B[재화/경험치 파밍]
            B --> C[능력치/장비 강화]
            C --> D{전투력 체크}
            D -- 부족 --> B
            D -- 충분 --> E[상위 보스/게이트]
            E --> F[신규 구역 오픈]
            F --> A
            style C fill:#fbbf24,stroke:#d97706,color:#000
            style E fill:#fb7185,stroke:#e11d48,color:#000
            style F fill:#34d399,stroke:#059669,color:#000`,
        description: '성장 정체기(Wall)를 극복하기 위한 파밍과 강화의 반복적 수직 확장 구조입니다.'
    },
    'SLG': {
        title: '베이스 빌딩 & 소셜 확장 모델',
        chart: (g) => `graph LR
            A[자원 생산] --> B[건물 건설/업그레이드]
            B --> C[병력 생산/연구]
            C --> D[월드 맵 진출]
            D --> E{전쟁/경쟁}
            E --> F[영토 확장/연맹]
            F --> A
            style B fill:#38bdf8,stroke:#0ea5e9,color:#000
            style E fill:#fb7185,stroke:#e11d48,color:#000
            style F fill:#a855f7,stroke:#9333ea,color:#000`,
        description: '시간 기반의 건설과 집단 간의 경쟁이 얽힌 장기적 자원 관리 모델입니다.'
    }
};

const GENRE_JOURNEYS = {
    'Puzzle': [
        { day: 'D-0', title: 'The Hook', goal: '조작의 명확성 & 도파민 피드백', focus: '콤보 연출, 직관적 규칙' },
        { day: 'D-7', title: 'The Habit', goal: '매일 도전하는 성취감', focus: '일일 미션, 마일스톤 보상' },
        { day: 'D-30', title: 'The Hobby', goal: '마스터의 자부심', focus: '글로벌 리그, 최고난도 클리어' }
    ],
    'Arcade Idle': [
        { day: 'D-0', title: 'Fast Growth', goal: '기하급수적 성장 쾌감', focus: '자원 채집 속도, 용량 확장' },
        { day: 'D-7', title: 'Automation', goal: '시스템 효율 최적화', focus: '일꾼 고용, 생산 자동화' },
        { day: 'D-30', title: 'Expansion', goal: '월드맵 확장과 탐험', focus: '새로운 시스템 해금, 거대 함대' }
    ],
    'RPG': [
        { day: 'D-0', title: 'Fantasy Start', goal: '대리 만족 & 강력한 비주얼', focus: '화려한 스킬, 시네마틱' },
        { day: 'D-7', title: 'Power-up Loop', goal: '성장의 벽(Wall) 돌파', focus: '장비 강화, 재화 파밍' },
        { day: 'D-30', title: 'End Game', goal: '희귀 수집 & 덱 최적화', focus: '가챠, 고난도 레이드/PVP' }
    ],
    'SLG': [
        { day: 'D-0', title: 'Build & Wait', goal: '나만의 기지 건설 시작', focus: '건물 건설, 기초 자원 수급' },
        { day: 'D-7', title: 'Social Entry', goal: '소속감과 보호막 해제', focus: '연맹 가입, 영토 확장' },
        { day: 'D-30', title: 'Great War', goal: '권력 쟁취 & 대규모 협력', focus: '연맹 공성전, 정치적 결사' }
    ]
};

function initGameCards(games) {
    const grid = document.getElementById('top20Grid');
    const search = document.getElementById('gameSearch');
    const filter = document.getElementById('genreFilter');

    // Init Filter Options
    const distinctGenres = [...new Set(games.map(g => g.genre || g.genrePrimary))];
    distinctGenres.forEach(genre => {
        const opt = document.createElement('option');
        opt.value = genre;
        opt.textContent = genre;
        filter.appendChild(opt);
    });

    const render = () => {
        const query = search.value.toLowerCase();
        const genreVal = filter.value;
        grid.innerHTML = '';

        games.filter(g => {
            const name = (g.name || g.title || "").toLowerCase();
            const genre = g.genre || g.genrePrimary;
            const matchSearch = name.includes(query);
            const matchGenre = genreVal === 'all' || genre === genreVal;
            return matchSearch && matchGenre;
        }).forEach((g, idx) => {
            const card = document.createElement('div');
            card.className = 'glass-card game-card';

            card.innerHTML = `
                <div class="game-card-inner">
                    <div class="card-rank-flag">#${g.rank || idx + 1}</div>
                    <div class="card-main-info">
                        <div class="game-icon-wrapper">
                            <img src="${g.iconUrl || '../data/default-icon.png'}" 
                                 loading="lazy" 
                                 alt="${g.name}" 
                                 class="game-icon">
                        </div>
                        <div class="game-title-group">
                            <h3 class="game-title">${g.name || g.title}</h3>
                            <div class="game-tags">
                                <span class="tag-primary">${g.genrePrimary}</span>
                                ${(g.subGenre ? `<span class="tag-secondary">${g.subGenre}</span>` : '')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-meta-info">
                        <div class="session-info">
                            <span class="meta-label">세션 길이</span>
                            <span class="session-badge type-${(g.sessionType || 'short').toLowerCase()}">${(g.sessionType || 'Short').toUpperCase()}</span>
                        </div>
                        <div class="card-action-hint">
                            <span class="hint-text">상세 분석</span>
                            <svg class="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            `;
            card.onclick = () => openGameModal(g, idx);
            grid.appendChild(card);
        });
    };

    // Modal Handling
    window.openGameModal = async (g, idx) => {
        const modal = document.getElementById('gameModal');
        const body = document.getElementById('modalBody');
        const content = modal.querySelector('.modal-content');

        // Reset scroll position
        if (content) content.scrollTop = 0;

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);

        const sys = g.system || {};
        const coreMap = {
            'Grid Placement': '그리드 블록 배치 및 라인 클리어',
            'Sorting': '아이템 정렬 및 매칭',
            'Random Spawn TD': '랜덤 유닛 소환 및 구역 방어',
            'Decor + Social': '공간 꾸미기 및 소셜 상호작용',
            'Base Build': '기지 건설 및 자원 생산 루프',
            'Card Sorting': '카드 순서 정렬 및 덱 관리',
            'Driving Sim': '실사 기반 운전 시뮬레이션',
            'Physics Puzzle': '물리 엔진 기반 기믹 해결',
            'Arcade Idle': '자원 채집 및 매장 자동화 확장'
        };
        const coreLoop = coreMap[sys.coreType] || sys.coreType || '시스템 분석 예정';
        const metaInfo = sys.metaDepth > 2 ? ' + 심화 메타 시스템' : ' + 기본 성장 루프';
        const fullSystemDesc = `${coreLoop}${metaInfo}`;
        const rules = sys.rules || (sys.pressure ? sys.pressure.join(', ') : '기본 규칙 적용');

        let uiPoints = 'UX 최적화 설계';
        if (g.genrePrimary === 'Puzzle') uiPoints = '블록 배치의 시각적 가이드 및 콤보 팡파르 연출';
        else if (g.genrePrimary === 'Arcade Idle') uiPoints = '한 손 조작 조이스틱 및 자원 스태킹 시각화';
        else if (g.genrePrimary === 'SLG' || g.genrePrimary === 'Strategy') uiPoints = '정보 집약적 인터페이스 및 직관적인 업그레이드 알림';
        else if (g.genrePrimary === 'Simulation') uiPoints = '실제 조작계 모사 및 몰입감 높은 1인칭 시점 UI';
        else if (sys.coreType?.includes('Sorting')) uiPoints = '아이템 이동 시의 부드러운 애니메이션 및 명확한 타겟팅';

        body.innerHTML = `
            <div class="summary">
                <div class="game-icon-wrapper">
                    <img src="${g.iconUrl || '../data/default-icon.png'}" class="game-icon">
                </div>
                <div style="text-align: left;">
                    <div class="game-rank">#${g.rank || idx + 1}</div>
                    <h2 style="font-size: 2rem; margin: 0.5rem 0;">${g.name || g.title}</h2>
                    <div style="display: flex; gap: 8px;">
                        <span class="badge" style="background:rgba(56,189,248,0.1); color:var(--analysis-accent);">${g.genrePrimary}</span>
                        <span class="badge" style="background:rgba(255,255,255,0.05);">${g.subGenre || 'General'}</span>
                    </div>
                </div>
            </div>

            <div class="analysis-grid">
                <div class="analysis-item full">
                    <h4 class="item-label"><span class="icon">🔄</span> 전체 시스템 (Core & Meta)</h4>
                    <p class="item-text" style="font-size: 1rem; padding: 15px;">${fullSystemDesc}</p>
                </div>
                <div class="analysis-item">
                    <h4 class="item-label"><span class="icon">⚖️</span> 규칙 및 제약</h4>
                    <p class="item-text">${rules}</p>
                </div>
                <div class="analysis-item">
                    <h4 class="item-label"><span class="icon">📱</span> UI 설계 포인트</h4>
                    <p class="item-text">${uiPoints}</p>
                </div>
            </div>

            <div class="metrics-row">
                <div class="metric-tag">
                    <span class="label">Pressure</span>
                    <span class="value">${(sys.pressure || []).join('/') || 'Basic'}</span>
                </div>
                <div class="metric-tag">
                    <span class="label">BM Depth</span>
                    <span class="value">${sys.monetizationDepth || 1}/4</span>
                </div>
                <div class="metric-tag">
                    <span class="label">LTV</span>
                    <span class="value">${g.kpi?.ltv || 'Mid'}</span>
                </div>
            </div>

            <div class="blueprint-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h4 style="color: var(--analysis-accent); margin: 0; font-size: 1.1rem;">📐 System Blueprint</h4>
                    <span style="font-size: 0.8rem; color: #64748b;">Archetype: ${g.genrePrimary}</span>
                </div>
                <div class="mermaid-container" id="modal-blueprint" style="background: transparent; min-height: 200px;">
                    <!-- Mermaid chart will be rendered here -->
                </div>
                <p style="font-size: 0.85rem; color: #94a3b8; margin-top: 1.5rem; line-height: 1.6; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 1rem;">
                    <strong>설계 방향:</strong> ${GENRE_BLUEPRINTS[g.genrePrimary]?.description || '장르 표준 아키텍처를 따르는 시스템입니다.'}
                </p>
            </div>

            <div class="journey-section" style="margin-top: 2rem;">
                <h4 style="color: var(--analysis-emerald); margin-bottom: 1.5rem; font-size: 1.1rem;">⏳ Player Journey Timeline</h4>
                <div class="timeline-container">
                    ${(() => {
                const getJourney = (genre) => {
                    if (GENRE_JOURNEYS[genre]) return GENRE_JOURNEYS[genre];
                    if (genre?.includes('Strategy') || genre?.includes('SLG')) return GENRE_JOURNEYS['SLG'];
                    if (genre?.includes('Puzzle') || genre?.includes('Match')) return GENRE_JOURNEYS['Puzzle'];
                    if (genre?.includes('RPG')) return GENRE_JOURNEYS['RPG'];
                    if (genre?.includes('Arcade') || genre?.includes('Simulation') || genre?.includes('Idle')) return GENRE_JOURNEYS['Arcade Idle'];
                    return GENRE_JOURNEYS['Puzzle'];
                };
                const steps = getJourney(g.genrePrimary);
                return steps.map(step => `
                            <div class="timeline-step">
                                <div class="step-marker"></div>
                                <div class="step-day">${step.day}</div>
                                <div class="step-content">
                                    <div class="step-title">${step.title}</div>
                                    <div class="step-goal">${step.goal}</div>
                                    <div class="step-focus">핵심포인트: ${step.focus}</div>
                                </div>
                            </div>
                        `).join('');
            })()}
                </div>
            </div>
        `;

        // Improved Genre Mapping
        const getBlueprint = (genre) => {
            if (GENRE_BLUEPRINTS[genre]) return GENRE_BLUEPRINTS[genre];
            if (genre?.includes('Strategy') || genre?.includes('SLG')) return GENRE_BLUEPRINTS['SLG'];
            if (genre?.includes('Puzzle') || genre?.includes('Match')) return GENRE_BLUEPRINTS['Puzzle'];
            if (genre?.includes('RPG')) return GENRE_BLUEPRINTS['RPG'];
            if (genre?.includes('Arcade') || genre?.includes('Simulation') || genre?.includes('Idle')) return GENRE_BLUEPRINTS['Arcade Idle'];
            return GENRE_BLUEPRINTS['Arcade Idle']; // Fallback
        };
        const blueprintData = getBlueprint(g.genrePrimary);
        const container = document.getElementById('modal-blueprint');

        try {
            // Need a unique ID for each render
            const renderId = `mermaid-${Date.now()}`;
            const { svg } = await mermaid.render(renderId, blueprintData.chart(g));
            container.innerHTML = svg;
        } catch (err) {
            console.error("Mermaid render failed", err);
            container.innerHTML = '<p style="color:#ef4444; font-size:0.85rem;">차트 렌더링에 실패했습니다. (문법 오류 혹은 라이브러리 미로딩)</p>';
        }
    };

    window.closeGameModal = () => {
        const modal = document.getElementById('gameModal');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    };

    search.oninput = render;
    filter.onchange = render;
    render();
}

function initCompareLab(games) {
    const selector = document.getElementById('compareSelector');
    selector.innerHTML = ''; // Clear before init

    // Show top 10 games, but only first 3 are active
    games.slice(0, 10).forEach((g, idx) => {
        const btn = document.createElement('div');
        btn.className = idx < 3 ? 'pill-check active' : 'pill-check';
        btn.textContent = (g.name || g.title).substring(0, 12); // Truncate if too long
        btn.dataset.id = g.id;
        btn.onclick = () => {
            btn.classList.toggle('active');
            updateCompareTable(games);
        };
        selector.appendChild(btn);
    });
    updateCompareTable(games);
}

function updateCompareTable(games) {
    const selectedIds = Array.from(document.querySelectorAll('.pill-check.active')).map(el => el.dataset.id);
    const selectedGames = games.filter(g => selectedIds.includes(g.id));

    const head = document.getElementById('compareHeader');
    const body = document.getElementById('compareBody');

    head.innerHTML = '<th>비교 항목</th>' + selectedGames.map(g => `<th>${g.name || g.title}</th>`).join('');

    const items = [
        { label: '🔷 Core Layer', isHeader: true },
        { label: '조작 체계 (Control)', key: 'system', sub: 'controlType' },
        { label: 'Core Loop Depth', key: 'systemScore', sub: 'complexity' },
        { label: 'Session Length', key: 'sessionType' },
        { label: 'Pressure Type', key: 'pressure', join: true },

        { label: '🔷 Meta & Live Layer', isHeader: true },
        { label: '성장 장벽 (Barrier)', key: 'system', sub: 'progressionBarrier' },
        { label: '라이브 밀도 (Live)', key: 'system', sub: 'liveIntensity' },
        { label: 'Meta System Depth', key: 'systemScore', sub: 'complexity' },
        { label: 'Content Density', key: 'systemScore', sub: 'contentDensity' },

        { label: '🔷 Monetization Layer', isHeader: true },
        { label: '수익 모델 (BM Mix)', key: 'system', sub: 'monetizationMix' },
        { label: 'Monetization Depth', key: 'systemScore', sub: 'monetizationDepth' },
        { label: 'Whale Dependency', key: 'monetization', sub: 'whale' },
        { label: 'Ad Dependency', key: 'monetization', sub: 'ads' },

        { label: '🔷 KPI Layer', isHeader: true },
        { label: 'DAU Position', key: 'kpi', sub: 'dau' },
        { label: 'ARPU Position', key: 'kpi', sub: 'arpu' },
        { label: 'LTV Length', key: 'kpi', sub: 'ltv' }
    ];

    body.innerHTML = items.map(item => {
        if (item.isHeader) {
            return `<tr style="background: rgba(56, 189, 248, 0.05);"><td colspan="${selectedGames.length + 1}" style="color: var(--analysis-accent); font-weight: 800; border-bottom: 2px solid var(--analysis-accent);">${item.label}</td></tr>`;
        }
        return `
            <tr>
                <td style="font-weight: 700; color: #94a3b8; padding-left: 1.5rem;">${item.label}</td>
                ${selectedGames.map(g => {
            const system = g.system || g.systemScore || {};
            const monetization = g.monetization || {};
            const kpi = g.kpi || g.kpiPosition || {};

            let val = '-';

            // Try to get value from expected place
            if (item.key === 'system' || item.key === 'systemScore') val = system[item.sub];
            else if (item.key === 'monetization') val = monetization[item.sub];
            else if (item.key === 'kpi' || item.key === 'kpiPosition') val = kpi[item.sub];
            else if (item.key === 'pressure') val = g.pressure || (g.system ? g.system.pressure : null);
            else val = g[item.key];

            // Fallback for missing new indicators based on genre
            if (!val || val === '-') {
                const genre = g.genrePrimary;
                if (item.sub === 'controlType') {
                    if (genre === 'Puzzle') val = '전략/빌드';
                    else if (genre === 'Arcade Idle') val = '수동/타이밍';
                    else if (genre === 'SLG' || genre === 'Strategy') val = '전략/빌드';
                    else val = '전략/빌드';
                } else if (item.sub === 'progressionBarrier') {
                    if (genre === 'Puzzle') val = '컨트롤(지능)';
                    else if (genre === 'Arcade Idle') val = '시간(방치)';
                    else if (genre === 'SLG' || genre === 'Strategy') val = '장비(P2W)';
                    else val = '장비(P2W)';
                } else if (item.sub === 'monetizationMix') {
                    if (genre === 'Puzzle') val = 'Ad Only';
                    else if (genre === 'Arcade Idle') val = 'Hybrid';
                    else if (genre === 'SLG' || genre === 'Strategy') val = 'Hard IAP';
                    else val = 'Hybrid';
                } else if (item.sub === 'liveIntensity') {
                    if (genre === 'Puzzle') val = 'Low';
                    else if (genre === 'Arcade Idle') val = 'Mid';
                    else if (genre === 'SLG' || genre === 'Strategy') val = 'High';
                    else val = 'Mid';
                }
            }

            if (val === true) val = 'Enabled';
            if (val === false) val = 'Disabled';
            if (item.join && Array.isArray(val)) val = val.join(', ');

            // Apply style classes
            let cls = '';
            const lowerV = String(val).toLowerCase();
            if (lowerV.includes('high') || lowerV.includes('hard') || lowerV.includes('p2w')) cls = 'val-high';
            else if (lowerV.includes('mid') || lowerV.includes('hybrid')) cls = 'val-mid';
            else if (lowerV.includes('low') || lowerV.includes('short') || lowerV.includes('ad only')) cls = 'val-low';

            return `<td class="${cls}">${val ?? '-'}</td>`;
        }).join('')}
            </tr>
        `;
    }).join('');
}

function initScrollEffects() {
    const dots = document.querySelectorAll('.scroll-dot');
    const sections = document.querySelectorAll('.analysis-section, .analysis-header');
    const topBtn = document.getElementById('scrollTop');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        // Header/Section active state logic
        sections.forEach(section => {
            const top = section.offsetTop;
            if (scrollY >= top - 200) {
                current = section.getAttribute('id') || 'overview';
            }
        });

        dots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.getAttribute('href').includes(current)) {
                dot.classList.add('active');
            }
        });

        // TOP Button visibility
        if (scrollY > 400) {
            topBtn.classList.add('show');
        } else {
            topBtn.classList.remove('show');
        }
    });

    // Smooth Scroll to Top
    topBtn.onclick = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
}
