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

    // 3. Pressure Heatmap
    renderPressureHeatmap(games);

    // 4. Game Cards
    initGameCards(games);

    // 5. Compare Lab
    initCompareLab(games);

    // 6. Scroll Effects
    initScrollEffects();
});

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

function renderPressureHeatmap(games) {
    const container = document.getElementById('genreContent');
    container.innerHTML = `
        <div style="grid-column: 1 / -1;">
            <h3 style="color: var(--analysis-accent); margin-bottom: 2rem;">🛡️ Mobile TOP 50 Pressure Matrix</h3>
            <div class="compare-table-wrapper" style="background: rgba(0,0,0,0.2); border-radius: 15px; padding: 1rem;">
                <table class="compare-table" style="font-size: 0.85rem;">
                    <thead>
                        <tr>
                            <th>랭킹 / 게임명</th>
                            <th>Space</th>
                            <th>Time</th>
                            <th>PvP</th>
                            <th>Moves</th>
                            <th>Resource</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${games.slice(0, 10).map(g => {
        const p = g.pressure || (g.system ? g.system.pressure : []);
        const check = (type) => p.some(item => item.toLowerCase().includes(type)) ? '<span style="color:var(--analysis-rose)">●</span>' : '<span style="color:#334155">○</span>';
        return `
                                <tr>
                                    <td style="font-weight:700;">#${g.rank || '-'} ${g.name || g.title}</td>
                                    <td style="text-align:center;">${check('space')}</td>
                                    <td style="text-align:center;">${check('time')}</td>
                                    <td style="text-align:center;">${check('pvp') || check('threat')}</td>
                                    <td style="text-align:center;">${check('moves')}</td>
                                    <td style="text-align:center;">${check('resource')}</td>
                                </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
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
