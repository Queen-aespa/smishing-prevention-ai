// 1. Firebase 설정 (빌드 시 생성되는 firebase-config.js에서 주입)
const firebaseConfig = window.__ADMIN_FIREBASE_CONFIG__;
if (!firebaseConfig || !firebaseConfig.apiKey) {
    const reason = window.__ADMIN_FIREBASE_CONFIG_ERROR__ || "firebase-config.js not generated";
    alert("관리자 Firebase 설정이 누락되었습니다. 배포 환경변수(VITE_FIREBASE_*)를 확인하세요.\n" + reason);
    throw new Error("[admin] Missing Firebase config: " + reason);
}

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

// 전역 변수
let globalReportsData = [];
let globalUsersMap = {};
let charts = { trend: null, ratio: null, category: null, demo: null };
let currentPage = 1;
const rowsPerPage = 10;

console.log("[App.js] 로드 완료.");

// ============================================================
// 2. 헬퍼 함수
// ============================================================

async function generateHash(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function findAdminKeyDocument(hashedKey) {
    const keyDoc = await db.collection('admin_key').doc(hashedKey).get();
    if (keyDoc.exists) return keyDoc;
    return db.collection('admin_codes').doc(hashedKey).get();
}

// 사기 유형 라벨링
function getCategoryLabel(code) {
    if (!code) return '분류 없음';
    const str = String(code).toUpperCase().trim();
    
    if (str.includes('INSTITUTION') || str.includes('기관')) return '기관 사칭';
    if (str.includes('ACQUAINTANCE') || str.includes('지인')) return '지인 사칭';
    if (str.includes('LINK') || str.includes('URL') || str.includes('앱')) return '링크/앱 유도';
    if (str.includes('INVESTMENT') || str.includes('투자')) return '투자 사기';
    if (str.includes('ROMANCE') || str.includes('로맨스')) return '관계형 사기';
    if (str.includes('BLACKMAIL') || str.includes('협박')) return '협박 사기';
    if (str.includes('MALICIOUS') || str.includes('악성')) return '악성 앱';
    if (str.includes('PHISHING') || str.includes('피싱')) return '피싱';
    
    return '기타'; 
}

function mapRiskLevel(dbLevel) {
    if(!dbLevel) return { class: 'caution', label: 'UNKNOWN' };
    const upper = String(dbLevel).toUpperCase();
    if (upper.includes('STOP')) return { class: 'stop', label: 'STOP' };
    if (upper.includes('WARN')) return { class: 'warning', label: 'WARNING' };
    if (upper.includes('CAUTION')) return { class: 'caution', label: 'CAUTION' };
    if (upper.includes('SAFE')) return { class: 'safe', label: 'SAFE' };
    return { class: 'caution', label: 'UNKNOWN' };
}

// 나이 계산
function calculateAgeGroup(input) {
    if (!input) return '미상';
    
    const numStr = String(input).replace(/[^0-9]/g, '');
    const num = parseInt(numStr);
    if (isNaN(num)) return '미상';

    let age = 0;
    const currentYear = new Date().getFullYear();

    if (num > 0 && num < 100) age = num; 
    else if (numStr.length >= 4) { 
        const birthYear = parseInt(numStr.substring(0, 4));
        age = currentYear - birthYear;
    } else {
        return '미상';
    }

    if (age < 20) return '10대 이하';
    if (age < 30) return '20대';
    if (age < 40) return '30대';
    if (age < 50) return '40대';
    if (age < 60) return '50대';
    return '60대 이상';
}

// 성별 인식
function normalizeGender(input) {
    if (!input) return '미상';
    const g = String(input).toLowerCase().trim();
    
    if (g.includes('여') || g.includes('f') || g.includes('w')) return '여성';
    if (g.includes('남') || g.includes('m')) return '남성';
    return '미상';
}

// ============================================================
// 3. 인증 로직
// ============================================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        auth.signInWithEmailAndPassword(email, password)
            .then(async (res) => {
                const adminDoc = await db.collection('admins').doc(res.user.uid).get();
                if (adminDoc.exists) window.location.href = "admin.html";
                else { alert("권한 없음"); auth.signOut(); }
            })
            .catch(e => alert("로그인 실패: " + e.message));
    });
}

const secureAdminForm = document.getElementById('secureAdminForm');
if (secureAdminForm) {
    secureAdminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admEmail').value.trim();
        const password = document.getElementById('admPw').value;
        const inputKey = document.getElementById('admKey').value.trim();

        try {
            const hashedKey = await generateHash(inputKey);
            const docRef = await findAdminKeyDocument(hashedKey);
            if (!docRef.exists) { alert("인증 키 불일치"); return; }

            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await db.collection('admins').doc(userCredential.user.uid).set({
                email: email, role: 'master', createdAt: new Date(), uid: userCredential.user.uid
            });
            alert("관리자 등록 성공");
            window.location.href = "admin.html";
        } catch (error) { alert("오류: " + error.message); }
    });
}

// ============================================================
// 4. 대시보드 로직
// ============================================================
if (window.location.pathname.includes("admin.html")) {
    
    window.onload = function() {
        initRealTimeListeners();
    };

    window.switchTab = function(tabName) {
        document.getElementById('dashboard-section').classList.add('hidden');
        document.getElementById('reports-section').classList.add('hidden');
        document.querySelectorAll('.menu li').forEach(li => li.classList.remove('active'));
        
        if (tabName === 'dashboard') {
            document.getElementById('dashboard-section').classList.remove('hidden');
            document.querySelector('.menu li:nth-child(1)').classList.add('active');
        } else {
            document.getElementById('reports-section').classList.remove('hidden');
            document.querySelector('.menu li:nth-child(2)').classList.add('active');
        }
    }
    window.logout = function() { auth.signOut().then(() => window.location.href = "index.html"); }

    function initRealTimeListeners() {
        // 1. 유저 정보
        db.collection('users').onSnapshot(snapshot => {
            let userCount = 0;
            globalUsersMap = {};

            snapshot.forEach(doc => {
                userCount++;
                const uData = doc.data();
                const ageInput = uData.age || uData.birthDate || uData.birth || uData.birthday;
                
                globalUsersMap[doc.id] = {
                    age: calculateAgeGroup(ageInput),
                    gender: normalizeGender(uData.gender),
                    region: uData.region || '전국'
                };
            });

            const userEl = document.getElementById('totalUsersCount');
            if(userEl) userEl.innerText = `${userCount} 명`;

            if (globalReportsData.length > 0 || userCount > 0) {
                processAndRender(globalReportsData);
            }
        });

        // 2. 신고 내역
        db.collection('community_reports').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            const reports = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                let rawDateObj = null;
                let formattedDate = "-";
                if (data.timestamp) {
                    rawDateObj = typeof data.timestamp.toDate === 'function' ? data.timestamp.toDate() : new Date(data.timestamp);
                    formattedDate = rawDateObj.toLocaleString();
                }

                const rawCat = data.archetype || data.category || data.type || 'Unknown';
                const catLabel = getCategoryLabel(rawCat);

                reports.push({
                    id: doc.id,
                    uid: data.reporterUid,
                    summary: data.summary || '내용 없음',
                    riskObj: mapRiskLevel(data.riskLevel), 
                    category: catLabel, 
                    date: formattedDate,
                    rawDate: rawDateObj, 
                    riskFactors: data.riskFactors || "", 
                    advice: data.advice || "",
                    context: data.contextInfo || "",
                    imageUrl: data.imageUrl || null
                });
            });

            globalReportsData = reports;
            processAndRender(globalReportsData);
        }, error => console.error("실시간 연동 에러:", error));
    }

    function processAndRender(reports) {
        // 조인
        const joinedData = reports.map(item => {
            const uInfo = globalUsersMap[item.uid] || { age: '미상', gender: '미상' };
            return { ...item, reporter: uInfo };
        });

        // 상단 카운트
        const totalEl = document.getElementById('totalReportsCount');
        const recentEl = document.getElementById('recentReportsCount');
        if(totalEl) totalEl.innerText = `${joinedData.length} 건`;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(new Date().getDate() - 7);
        const recentCount = joinedData.filter(r => r.rawDate && r.rawDate >= sevenDaysAgo).length;
        if(recentEl) recentEl.innerText = `${recentCount} 건`;

        renderReportsTable(joinedData);
        renderCharts(joinedData);
    }

    // ------------------------------------------------------------
    // [차트] 연령대별 차트 디자인 원복 (나란히 배치)
    // ------------------------------------------------------------
    function renderCharts(reportData) {
        
        // 초기화
        let dailyCounts = {};
        let riskCounts = { 'SAFE': 0, 'CAUTION': 0, 'WARNING': 0, 'STOP_IMMEDIATELY': 0 };
        let catCounts = {}; 
        
        let demoCounts = {
            '10대 이하': { '남성': 0, '여성': 0 },
            '20대': { '남성': 0, '여성': 0 },
            '30대': { '남성': 0, '여성': 0 },
            '40대': { '남성': 0, '여성': 0 },
            '50대': { '남성': 0, '여성': 0 },
            '60대 이상': { '남성': 0, '여성': 0 },
            '미상': { '남성': 0, '여성': 0 } 
        };

        const today = new Date();
        for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = `${d.getMonth()+1}/${d.getDate()}`;
            dailyCounts[dateStr] = 0;
        }

        // 리포트 루프
        reportData.forEach(item => {
            // 위험도
            if (item.riskObj.class === 'safe') riskCounts['SAFE']++;
            else if (item.riskObj.class === 'caution') riskCounts['CAUTION']++;
            else if (item.riskObj.class === 'warning') riskCounts['WARNING']++;
            else if (item.riskObj.class === 'stop') riskCounts['STOP_IMMEDIATELY']++;

            // 사기 유형
            const cat = item.category || '기타';
            catCounts[cat] = (catCounts[cat] || 0) + 1;

            // 추이
            if (item.rawDate) {
                const m = item.rawDate.getMonth() + 1;
                const d = item.rawDate.getDate();
                const dateKey = `${m}/${d}`;
                if (dailyCounts.hasOwnProperty(dateKey)) dailyCounts[dateKey]++;
            }
        });

        // 유저 루프 (인구통계)
        Object.values(globalUsersMap).forEach(user => {
            const age = user.age || '미상';
            const gender = user.gender || '미상';
            
            if (demoCounts[age] && demoCounts[age][gender] !== undefined) {
                demoCounts[age][gender]++;
            }
        });

        // 차트 그리기
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        };

        const initChart = (id, type, data, opts) => {
            const ctx = document.getElementById(id);
            if (!ctx) return;
            const key = id.replace('Chart', '').replace('riskRatio', 'ratio');
            if (charts[key]) charts[key].destroy();
            charts[key] = new Chart(ctx, { type, data, options: opts });
        }

        // [1] 위험도 추이
        initChart('trendChart', 'line', {
            labels: Object.keys(dailyCounts),
            datasets: [{
                label: '일별 신고',
                data: Object.values(dailyCounts),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.3,
                fill: true
            }]
        }, commonOptions);

        // [2] 사기 유형 (세로 막대형으로 복구 + 데이터 확인용 로그)
        const sortedCats = Object.entries(catCounts)
            .map(([key, val]) => ({key, val}))
            .sort((a, b) => b.val - a.val);

        console.log("📊 사기 유형 데이터:", sortedCats); // 데이터 확인용

        if (sortedCats.length === 0) sortedCats.push({key: '데이터 없음', val: 0});

        initChart('categoryChart', 'bar', {
            labels: sortedCats.map(x => x.key),
            datasets: [{
                label: '건수',
                data: sortedCats.map(x => x.val),
                backgroundColor: sortedCats.map((_, i) => i === 0 ? '#3b82f6' : '#e5e7eb'), // 1위 파랑
                borderRadius: 4
            }]
        }, commonOptions); // indexAxis 삭제 -> 기본 세로형

        // [3] 위험도 비율
        const totalRisks = reportData.length;
        const warningCount = riskCounts['WARNING'];
        const stopCount = riskCounts['STOP_IMMEDIATELY'];
        const warningRatio = totalRisks > 0 ? Math.round(((warningCount + stopCount) / totalRisks) * 100) : 0;
        
        const riskHighEl = document.getElementById('riskHighRatio');
        if(riskHighEl) riskHighEl.innerText = `${warningRatio}%`;
        
        const riskPrevEl = document.getElementById('riskPreventCount');
        if(riskPrevEl) riskPrevEl.innerText = `${warningCount} 건`;

        initChart('riskRatioChart', 'doughnut', {
            labels: ['SAFE', 'CAUTION', 'WARNING', 'STOP'],
            datasets: [{
                data: [riskCounts['SAFE'], riskCounts['CAUTION'], warningCount, stopCount],
                backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
                borderWidth: 0
            }]
        }, commonOptions);

        // [4] 인구통계 (복구: 파란색/분홍색 막대 나란히)
        const ageLabels = ['10대 이하', '20대', '30대', '40대', '50대', '60대 이상'];
        const maleData = ageLabels.map(l => demoCounts[l]['남성']);
        const femaleData = ageLabels.map(l => demoCounts[l]['여성']);

        initChart('demographicChart', 'bar', {
            labels: ageLabels,
            datasets: [
                { label: '남성', data: maleData, backgroundColor: '#60a5fa' }, // 파란색
                { label: '여성', data: femaleData, backgroundColor: '#f472b6' }  // 분홍색
            ]
        }, commonOptions); // scales 옵션 삭제 -> 기본 Grouped Bar Chart
    }

    // 테이블 렌더링
    window.renderReportsTable = function(data) {
        const tbody = document.getElementById('reportTableBody');
        const paginationEl = document.getElementById('paginationControls');
        const pageInfoEl = document.getElementById('pageInfo');
        
        if(!tbody) return;
        tbody.innerHTML = '';
        paginationEl.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">데이터가 없습니다.</td></tr>';
            pageInfoEl.innerText = '0 건';
            return;
        }

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const paginatedItems = data.slice(startIndex, endIndex);

        paginatedItems.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="color: #3b82f6; font-weight:bold;">${item.id.substring(0, 8)}...</td>
                <td>${item.summary.length > 20 ? item.summary.substring(0, 20) + '...' : item.summary}</td>
                <td><span class="badge ${item.riskObj.class}">${item.riskObj.label}</span></td>
                <td><span class="cat-badge" style="background:#f3f4f6; color:#374151; font-weight:600; padding:4px 8px; border-radius:4px;">${item.category}</span></td>
                <td>${item.date}</td>
                <td><button class="btn-primary" style="padding: 0.3rem 0.6rem; font-size:0.8rem;" onclick="openDetail('${item.id}')">상세보기</button></td>
            `;
            tbody.appendChild(tr);
        });

        const totalPages = Math.ceil(data.length / rowsPerPage);
        const createBtn = (text, disabled, onClick) => {
            const btn = document.createElement('button');
            btn.innerText = text;
            btn.className = 'page-btn';
            btn.disabled = disabled;
            btn.onclick = onClick;
            return btn;
        };

        paginationEl.appendChild(createBtn('<', currentPage === 1, () => { currentPage--; renderReportsTable(data); }));
        
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        for(let i=startPage; i<=endPage; i++) {
            const btn = document.createElement('button');
            btn.innerText = i;
            btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            btn.onclick = () => { currentPage = i; renderReportsTable(data); };
            paginationEl.appendChild(btn);
        }

        paginationEl.appendChild(createBtn('>', currentPage === totalPages, () => { currentPage++; renderReportsTable(data); }));
        pageInfoEl.innerText = `총 ${data.length}건 중 ${startIndex+1}-${Math.min(endIndex, data.length)} 표시`;
    }

    // 필터
    window.filterReports = function() {
        currentPage = 1;
        const keyword = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        
        const joinedData = globalReportsData.map(item => {
            const uInfo = globalUsersMap[item.uid] || { age: '미상', gender: '미상' };
            return { ...item, reporter: uInfo };
        });

        const filtered = joinedData.filter(item => {
            const matchKeyword = (item.summary.toLowerCase().includes(keyword) || item.id.toLowerCase().includes(keyword));
            const matchCategory = categoryFilter === "" || item.category === categoryFilter;
            return matchKeyword && matchCategory;
        });
        renderReportsTable(filtered);
    }

    // 모달
    window.openDetail = function(id) {
        const item = globalReportsData.find(r => r.id === id);
        if(!item) return;

        const uInfo = globalUsersMap[item.uid] || { age: '미상', gender: '미상', region: '전국' };
        
        document.getElementById('modalSummaryTitle').innerText = item.summary;
        document.getElementById('modalReporterInfo').innerText = `${uInfo.age} · ${uInfo.gender} · ${uInfo.region}`;
        document.getElementById('modalDate').innerText = item.date;
        document.getElementById('modalAdvice').innerText = item.advice || "조언 없음";
        document.getElementById('modalContext').innerText = item.context || "-";
        
        const badge = document.getElementById('modalRiskBadge');
        badge.className = `badge ${item.riskObj.class}`;
        badge.innerText = item.riskObj.label;

        const riskBox = document.getElementById('modalRiskFactors');
        riskBox.innerHTML = '';
        if(item.riskFactors) {
            item.riskFactors.split(/[•\n]+/).filter(r => r.trim()).forEach(r => {
                riskBox.innerHTML += `<div class="risk-item" style="color:#b91c1c; background:#fef2f2; padding:5px; margin-top:5px; border-radius:4px; font-size:0.9rem;">${r.trim()}</div>`;
            });
        }

        const imgBox = document.getElementById('modalImageContainer');
        imgBox.innerHTML = item.imageUrl ? `<img src="${item.imageUrl}" style="width:100%;height:100%;object-fit:contain; cursor:pointer;" onclick="window.open(this.src)">` : '<span style="color:#999; font-size:0.8rem;">이미지 없음</span>';

        document.getElementById('detailModal').classList.remove('hidden');
    }
    window.closeModal = function() { document.getElementById('detailModal').classList.add('hidden'); }
}
