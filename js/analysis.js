document.addEventListener('DOMContentLoaded', async () => {
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
                                <span style="font-size: 0.7rem; color: var(--analysis-accent); font-weight: 700;">SOURCE: ${ev.source}</span>
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

            // Extract analysis data
            const sys = g.system || {};
            const coreLoop = sys.coreLoop || g.system?.coreType || 'Core Loop 분석 예정';
            const rules = sys.rules || (sys.pressure ? sys.pressure.join(', ') : '기본 규칙 적용');
            const uiPoints = sys.uiPoints || 'UX 최적화 설계';

            card.innerHTML = `
                <div class="summary">
                    <div style="display: flex; gap: 1.2rem; align-items: center;">
                        <div class="game-icon-wrapper">
                            <img src="${g.iconUrl || '../data/default-icon.png'}" 
                                 loading="lazy" 
                                 alt="${g.name}" 
                                 class="game-icon">
                        </div>
                        <div>
                            <div class="game-rank">#${g.rank || idx + 1}</div>
                            <h3 style="margin: 2px 0; font-size: 1.2rem;">${g.name || g.title}</h3>
                            <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 5px;">
                                <span class="badge-mini" style="background:rgba(56,189,248,0.1); color:var(--analysis-accent); padding: 2px 8px; border-radius: 4px; font-size: 0.65rem; font-weight:700;">${g.genrePrimary}</span>
                                ${(g.subGenre ? `<span class="badge-mini" style="background:rgba(255,255,255,0.05); color:#94a3b8; padding: 2px 8px; border-radius: 4px; font-size: 0.65rem;">${g.subGenre}</span>` : '')}
                            </div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge-mini" style="background: var(--analysis-accent); color: var(--analysis-bg); padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight:800;">${(g.sessionType || 'Short').toUpperCase()}</span>
                    </div>
                </div>
                <div class="game-details">
                    <div class="analysis-grid">
                        <div class="analysis-item full">
                            <h4 class="item-label"><span class="icon">🔄</span> 전체 시스템 (Core & Meta)</h4>
                            <p class="item-text">${coreLoop}</p>
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
                </div>
            `;
            card.onclick = () => {
                const isActive = card.classList.contains('active');
                document.querySelectorAll('.game-card').forEach(c => c.classList.remove('active'));
                if (!isActive) card.classList.add('active');
            };
            grid.appendChild(card);
        });
    };

    search.oninput = render;
    filter.onchange = render;
    render();
}

function initCompareLab(games) {
    const selector = document.getElementById('compareSelector');
    games.slice(0, 4).forEach(g => {
        const btn = document.createElement('div');
        btn.className = 'pill-check active';
        btn.textContent = g.title;
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

    head.innerHTML = '<th>비교 항목</th>' + selectedGames.map(g => `<th>${g.title}</th>`).join('');

    const items = [
        { label: '🔷 Core Layer', isHeader: true },
        { label: 'Core Loop Depth', key: 'systemScore', sub: 'complexity' },
        { label: 'Session Length', key: 'sessionType' },
        { label: 'Pressure Type', key: 'pressure', join: true },
        { label: '🔷 Meta Layer', isHeader: true },
        { label: 'Meta System Depth', key: 'systemScore', sub: 'complexity' },
        { label: 'Content Density', key: 'systemScore', sub: 'contentDensity' },
        { label: 'LiveOps Intensity', key: 'systemScore', sub: 'liveOpsIntensity' },
        { label: '🔷 Monetization Layer', isHeader: true },
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
            if (item.key === 'system' || item.key === 'systemScore') val = system[item.sub];
            else if (item.key === 'monetization') val = monetization[item.sub];
            else if (item.key === 'kpi' || item.key === 'kpiPosition') val = kpi[item.sub];
            else if (item.key === 'pressure') val = g.pressure || (g.system ? g.system.pressure : null);
            else val = g[item.key];

            if (val === true) val = 'Enabled';
            if (val === false) val = 'Disabled';
            if (item.join && Array.isArray(val)) val = val.join(', ');
            return `<td>${val ?? '-'}</td>`;
        }).join('')}
            </tr>
        `;
    }).join('');
}

function initScrollEffects() {
    const dots = document.querySelectorAll('.scroll-dot');
    const sections = document.querySelectorAll('.analysis-section, .analysis-header');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop;
            if (pageYOffset >= top - 200) {
                current = section.getAttribute('id') || 'overview';
            }
        });

        dots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.getAttribute('href').includes(current)) {
                dot.classList.add('active');
            }
        });
    });
}
