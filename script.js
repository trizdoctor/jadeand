// 전역 변수
let currentRequestKey = null;
let pollingInterval = null;
let pollingStartTime = null;

// DOM 요소들
const requestForm = document.getElementById('requestForm');
const sendButton = document.getElementById('sendButton');
const buttonText = sendButton.querySelector('.button-text');
const spinner = sendButton.querySelector('.spinner');
const statusSection = document.getElementById('statusSection');
const statusText = document.getElementById('statusText');
const statusDot = document.getElementById('statusDot');
const statusDescription = document.getElementById('statusDescription');
const progressFill = document.getElementById('progressFill');
const resultSection = document.getElementById('resultSection');
const resultImage = document.getElementById('resultImage');
const imagePlaceholder = document.getElementById('imagePlaceholder');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const newRequestButton = document.getElementById('newRequestButton');
const retryButton = document.getElementById('retryButton');

// 웹훅 URL 설정
const WEBHOOK_URL = 'https://hook.eu2.make.com/mb9x66g8vlqlsjzpl95nm9hckuevwjqn';

// 폼 제출 이벤트 리스너
requestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message1 = document.getElementById('message1').value.trim();
    const message2 = document.getElementById('message2').value.trim();
    
    if (!message1 || !message2) {
        showError('두 메시지를 모두 입력해주세요.');
        return;
    }
    
    await sendWebhookRequest(message1, message2);
});

// 새 요청 버튼 이벤트 리스너
newRequestButton.addEventListener('click', () => {
    resetForm();
});

// 재시도 버튼 이벤트 리스너
retryButton.addEventListener('click', () => {
    const message1 = document.getElementById('message1').value.trim();
    const message2 = document.getElementById('message2').value.trim();
    
    if (message1 && message2) {
        sendWebhookRequest(message1, message2);
    } else {
        resetForm();
    }
});

// 웹훅 요청 전송
async function sendWebhookRequest(message1, message2) {
    try {
        // UI 상태 변경
        setLoadingState(true);
        hideAllSections();
        
        // 웹훅 요청 URL 구성
        const url = `${WEBHOOK_URL}?message1=${encodeURIComponent(message1)}&message2=${encodeURIComponent(message2)}`;
        
        console.log('웹훅 요청 전송:', url);
        
        // 웹훅 요청 전송
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('웹훅 응답:', data);
        
        if (data.status === 'processing' && data.key) {
            currentRequestKey = data.key;
            showProcessingStatus();
            startPolling();
        } else {
            throw new Error('예상하지 못한 응답 형식입니다.');
        }
        
    } catch (error) {
        console.error('웹훅 요청 오류:', error);
        setLoadingState(false);
        showError(`요청 처리 중 오류가 발생했습니다: ${error.message}`);
    }
}

// 상태 확인 폴링 시작
function startPolling() {
    pollingStartTime = Date.now();
    
    // 1분 후에 첫 번째 폴링 시작
    setTimeout(() => {
        if (currentRequestKey) {
            pollStatus();
            // 15초마다 상태 확인
            pollingInterval = setInterval(() => {
                if (currentRequestKey) {
                    pollStatus();
                } else {
                    stopPolling();
                }
            }, 15000);
        }
    }, 60000); // 60초 후 시작
    
    // 진행률 표시 업데이트
    updateProgress();
}

// 상태 확인 요청
async function pollStatus() {
    if (!currentRequestKey) return;
    
    try {
        const url = `${WEBHOOK_URL}?key=${encodeURIComponent(currentRequestKey)}`;
        console.log('상태 확인 요청:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('상태 확인 응답:', data);
        
        if (data.status === 'done' && data.image_url) {
            // 완료된 경우
            stopPolling();
            showResult(data.image_url);
        } else if (data.status === 'processing') {
            // 아직 처리 중인 경우
            updateStatusText('이미지 생성이 진행 중입니다...');
        } else {
            throw new Error('예상하지 못한 응답 형식입니다.');
        }
        
    } catch (error) {
        console.error('상태 확인 오류:', error);
        stopPolling();
        showError(`상태 확인 중 오류가 발생했습니다: ${error.message}`);
    }
}

// 폴링 중지
function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    currentRequestKey = null;
    setLoadingState(false);
}

// 진행률 업데이트
function updateProgress() {
    if (!pollingStartTime) return;
    
    const elapsed = Date.now() - pollingStartTime;
    const progressPercent = Math.min((elapsed / 60000) * 100, 90); // 최대 90%까지
    
    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
    }
    
    if (currentRequestKey && elapsed < 300000) { // 5분까지
        setTimeout(updateProgress, 1000);
    }
}

// UI 상태 관리 함수들
function setLoadingState(loading) {
    sendButton.disabled = loading;
    
    if (loading) {
        buttonText.textContent = '요청 처리 중...';
        spinner.style.display = 'inline-block';
    } else {
        buttonText.textContent = '이미지 생성 요청';
        spinner.style.display = 'none';
    }
}

function hideAllSections() {
    statusSection.style.display = 'none';
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';
}

function showProcessingStatus() {
    hideAllSections();
    statusSection.style.display = 'block';
    statusSection.style.animation = 'fadeInUp 0.5s ease forwards';
    
    statusDot.className = 'status-dot';
    statusText.textContent = '요청 처리 중...';
    statusDescription.textContent = '이미지 생성을 위해 요청을 처리하고 있습니다. 잠시만 기다려주세요.';
    
    if (progressFill) {
        progressFill.style.width = '0%';
    }
}

function updateStatusText(text) {
    if (statusText) {
        statusText.textContent = text;
    }
}

function showResult(imageUrl) {
    hideAllSections();
    setLoadingState(false);
    resultSection.style.display = 'block';
    resultSection.style.animation = 'fadeInUp 0.5s ease forwards';
    
    // 이미지 로드
    const img = new Image();
    img.onload = () => {
        resultImage.src = imageUrl;
        resultImage.style.display = 'block';
        imagePlaceholder.style.display = 'none';
    };
    img.onerror = () => {
        imagePlaceholder.textContent = '이미지를 불러올 수 없습니다.';
    };
    img.src = imageUrl;
}

function showError(message) {
    hideAllSections();
    stopPolling();
    setLoadingState(false);
    
    errorSection.style.display = 'block';
    errorSection.style.animation = 'fadeInUp 0.5s ease forwards';
    errorMessage.textContent = message;
}

function resetForm() {
    // 폴링 중지
    stopPolling();
    
    // 폼 초기화
    document.getElementById('message1').value = '';
    document.getElementById('message2').value = '';
    
    // UI 초기화
    setLoadingState(false);
    hideAllSections();
    
    // 이미지 초기화
    resultImage.style.display = 'none';
    resultImage.src = '';
    imagePlaceholder.style.display = 'block';
    imagePlaceholder.textContent = '이미지를 불러오는 중...';
    
    // 진행률 초기화
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    
    pollingStartTime = null;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('이미지 생성 애플리케이션이 로드되었습니다.');
    resetForm();
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    stopPolling();
});