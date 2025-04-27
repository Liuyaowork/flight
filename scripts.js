// DOM元素
const contentWrapper = document.getElementById('contentWrapper');
const statsSection = document.getElementById('statsSection');
const swipeIndicator = document.getElementById('swipeIndicator');
const timerDisplay = document.getElementById('timerDisplay');
const flightStatus = document.getElementById('flightStatus');
const startButtonContainer = document.getElementById('startButtonContainer');
const runningButtonsContainer = document.getElementById('runningButtonsContainer');
const pausedButtonsContainer = document.getElementById('pausedButtonsContainer');
const startFlightBtn = document.getElementById('startFlightBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const endBtn = document.getElementById('endBtn');
const endPausedBtn = document.getElementById('endPausedBtn');
const currentTime = document.getElementById('currentTime');
const addFlightBtn = document.getElementById('addFlightBtn');
const addFlightModal = document.getElementById('addFlightModal');
const cancelBtn = document.getElementById('cancelBtn');
const confirmBtn = document.getElementById('confirmBtn');
const notification = document.getElementById('notification');
const loadingSpinner = document.getElementById('loadingSpinner');
const confettiContainer = document.getElementById('confettiContainer');
const navItems = document.querySelectorAll('.nav-item');
const calendarDays = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

// 状态变量
let timerInterval;
let seconds = 0;
let timerState = 'not-started'; // 'not-started', 'running', 'paused', 'ended'
let hasScrolledToStats = false;
let currentlyAnimating = false;
let flightRecords = []; // 用于存储所有航班记录的数组
const MAX_VISIBLE_RECORDS = 5; // 在不展开的情况下显示的最大记录数

// 初始化
updateTimerDisplay();
initializeFlightRecords();

// 滚动时显示统计部分的函数
contentWrapper.addEventListener('scroll', () => {
    if (contentWrapper.scrollTop > 100 && !hasScrolledToStats) {
        statsSection.classList.add('visible');
        hasScrolledToStats = true;
        swipeIndicator.style.opacity = '0';
    } else if (contentWrapper.scrollTop < 50 && hasScrolledToStats) {
        hasScrolledToStats = false;
        swipeIndicator.style.opacity = '1';
    }
});

// 点击滑动指示器滚动到统计部分
swipeIndicator.addEventListener('click', () => {
    contentWrapper.scrollTo({
        top: 300,
        behavior: 'smooth'
    });
});

// 计时器功能
function updateTimerDisplay() {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
    updateTimerState('running');
}

function pauseTimer() {
    clearInterval(timerInterval);
    updateTimerState('paused');
}

function resumeTimer() {
    startTimer();
}

function endTimer() {
    clearInterval(timerInterval);
    
    // 记录最终时间
    const finalTime = timerDisplay.textContent;
    
    // 转换为小时和分钟格式，用于记录
    const [hours, minutes, _] = finalTime.split(':');
    const formattedDuration = `${parseInt(hours)}小时${parseInt(minutes)}分钟`;
    
    // 添加到航班记录
    addFlightRecord(formattedDuration);
    
    // 显示成功通知
    showNotification(`航班已完成，时长: ${formattedDuration}`);
    
    // 显示成就效果（如果时间超过特定阈值）
    if (seconds >= 3600) { // 如果时间超过1小时
        createConfetti();
    }
    
    // 重置计时器
    clearInterval(timerInterval);
    seconds = 0;
    updateTimerDisplay();
    
    // 直接更新为未开始状态
    flightStatus.textContent = '未起飞';
    flightStatus.className = 'flight-status not-started';
    timerDisplay.className = 'timer-display';
    startButtonContainer.style.display = 'flex';
    runningButtonsContainer.style.display = 'none';
    pausedButtonsContainer.style.display = 'none';
    startFlightBtn.innerHTML = '<i class="bi bi-airplane-engines"></i><span>开始起飞</span>';
    
    // 更新状态变量
    timerState = 'not-started';
    
    // 滚动到顶部
    contentWrapper.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    updateTimerDisplay();
    updateTimerState('not-started');
    startFlightBtn.textContent = '开始起飞';
    startFlightBtn.innerHTML = '<i class="bi bi-airplane-engines"></i><span>开始起飞</span>';
}

// 添加按钮事件监听器
startFlightBtn.addEventListener('click', () => {
    if (timerState === 'not-started') {
        startTimer();
    } else if (timerState === 'ended') {
        resetTimer();
    }
});

pauseBtn.addEventListener('click', pauseTimer);
resumeBtn.addEventListener('click', resumeTimer);
endBtn.addEventListener('click', endTimer);
endPausedBtn.addEventListener('click', endTimer);

// 初始化计时器
updateTimerState('not-started');
updateTimerDisplay();

// 模态框控制
addFlightBtn.addEventListener('click', () => {
    addFlightModal.style.display = 'flex';
    setTimeout(() => {
        addFlightModal.classList.add('visible');
    }, 10);
});

cancelBtn.addEventListener('click', () => {
    addFlightModal.classList.remove('visible');
    setTimeout(() => {
        addFlightModal.style.display = 'none';
    }, 300);
});

confirmBtn.addEventListener('click', () => {
    // 从表单获取值
    const flightHours = document.getElementById('flightHours').value || '0';
    const flightMinutes = document.getElementById('flightMinutes').value || '0';
    const duration = `${parseInt(flightHours)}小时${parseInt(flightMinutes)}分钟`;
    const flightDate = document.getElementById('flightDate').value || new Date().toISOString().split('T')[0];
    const flightTime = document.getElementById('flightTime').value || 
                      `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`;
    
    // 创建一个新的记录，带有自定义日期/时间
    addFlightRecord(duration, flightDate, flightTime);
    
    // 显示加载动画
    loadingSpinner.style.display = 'block';
    
    // 模拟加载
    setTimeout(() => {
        // 隐藏加载动画
        loadingSpinner.style.display = 'none';
        
        // 隐藏模态框
        addFlightModal.classList.remove('visible');
        setTimeout(() => {
            addFlightModal.style.display = 'none';
        }, 300);
        
        // 显示通知
        showNotification("新航班已添加");
        
        // 动画刷新数据
        refreshStats();
    }, 800);
});

// 导航
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 如果点击当前活动项，则不进行动画
        if (item.classList.contains('active')) return;
        
        // 从所有项中移除活动类
        navItems.forEach(navItem => navItem.classList.remove('active'));
        
        // 添加活动类到点击的项
        item.classList.add('active');
        
        // 使用动画处理页面导航
        const page = item.getAttribute('data-page');
        if (page === 'timer') {
            contentWrapper.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else if (page === 'stats') {
            contentWrapper.scrollTo({
                top: 300,
                behavior: 'smooth'
            });
        } else if (page === 'add') {
            // 已由addFlightBtn点击事件处理
        } else if (page === 'profile') {
            showNotification("个人中心功能即将上线");
        }
        
        // 添加细微的页面过渡效果
        animateNavTransition(item);
    });
});

// 日历交互
const days = document.querySelectorAll('.day');
days.forEach(day => {
    if (day.textContent && parseInt(day.textContent) > 0) {
        day.addEventListener('click', () => {
            // 仅在日期有内容时执行操作
            if (day.classList.contains('has-flight')) {
                showDayDetails(day.textContent);
            } else if (!day.classList.contains('has-flight') && day.textContent) {
                showNotification(`10月${day.textContent}日没有航班记录`);
            }
        });
    }
});

// 航班记录交互
const recordItems = document.querySelectorAll('.record-item');
recordItems.forEach(item => {
    item.addEventListener('click', () => {
        const recordId = item.getAttribute('data-id');
        showRecordDetails(recordId);
    });
});

// 月份导航
prevMonthBtn.addEventListener('click', () => {
    animateCalendarChange('prev');
});

nextMonthBtn.addEventListener('click', () => {
    animateCalendarChange('next');
});

// 辅助动画函数
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function refreshStats() {
    // 动画刷新统计数据
    statsSection.style.opacity = '0.5';
    statsSection.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        statsSection.style.opacity = '1';
        statsSection.style.transform = 'scale(1)';
    }, 400);
}

function animateNavTransition(item) {
    if (currentlyAnimating) return;
    currentlyAnimating = true;
    
    navItems.forEach(navItem => {
        const icon = navItem.querySelector('.nav-icon');
        
        if (navItem === item) {
            // 动画选中的图标
            icon.style.transform = 'translateY(-10px) scale(1.2)';
            setTimeout(() => {
                icon.style.transform = 'translateY(0) scale(1)';
            }, 300);
        } else {
            // 重置其他图标
            icon.style.transform = 'translateY(0) scale(1)';
        }
    });
    
    setTimeout(() => {
        currentlyAnimating = false;
    }, 300);
}

function animateCalendarChange(direction) {
    const calendarMonth = document.querySelector('.calendar-month');
    const days = document.querySelectorAll('.days');
    
    // 创建动画
    days[0].style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    days[0].style.opacity = '0';
    days[0].style.transform = direction === 'next' ? 'translateX(-20px)' : 'translateX(20px)';
    
    setTimeout(() => {
        // 更新月份文本（模拟）
        if (direction === 'next') {
            calendarMonth.textContent = '2023年11月';
        } else {
            calendarMonth.textContent = '2023年9月';
        }
        
        // 重置并动画回到原位
        days[0].style.transform = direction === 'next' ? 'translateX(20px)' : 'translateX(-20px)';
        
        setTimeout(() => {
            days[0].style.opacity = '1';
            days[0].style.transform = 'translateX(0)';
        }, 50);
    }, 300);
}

function showDayDetails(day) {
    showNotification(`查看10月${day}日的航班记录`);
}

function showRecordDetails(id) {
    const records = {
        1: { date: "今天 10:23", duration: "2小时35分钟" },
        2: { date: "昨天 16:42", duration: "2小时05分钟" },
        3: { date: "10月15日 09:10", duration: "2小时25分钟" },
        4: { date: "10月12日 14:35", duration: "1小时50分钟" },
        5: { date: "10月10日 08:15", duration: "3小时10分钟" }
    };
    
    const record = records[id];
    showNotification(`${record.date} 起飞时长: ${record.duration}`);
}

function showStatDetails(type) {
    showNotification(`查看${type}详细数据`);
}

// 创建成就的彩带效果
function createConfetti() {
    confettiContainer.style.display = 'block';
    
    // 创建随机彩带片
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // 随机属性
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.width = Math.random() * 8 + 5 + 'px';
        confetti.style.height = Math.random() * 8 + 5 + 'px';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        
        // 随机颜色
        const colors = [
            '#3f51b5', '#ff4081', '#4caf50', '#ff9800', '#2196f3', '#f44336'
        ];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // 添加到容器
        confettiContainer.appendChild(confetti);
    }
    
    // 动画结束后移除彩带
    setTimeout(() => {
        confettiContainer.style.display = 'none';
        confettiContainer.innerHTML = '';
    }, 6000);
}

// 示例成就触发 - 当计时器达到里程碑时
let lastMinute = Math.floor(seconds / 60);
setInterval(() => {
    const currentMinute = Math.floor(seconds / 60);
    if (currentMinute !== lastMinute && currentMinute % 60 === 0 && timerState === 'running') {
        showNotification("恭喜您！航班起飞已满1小时");
        createConfetti();
    }
    lastMinute = currentMinute;
}, 1000);

// 初始加载时的动画
setTimeout(() => {
    statsSection.classList.add('visible');
    hasScrolledToStats = true;
    
    setTimeout(() => {
        hasScrolledToStats = false;
        statsSection.classList.remove('visible');
        
        // 初始显示后自动滚动回顶部
        contentWrapper.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, 2000);
}, 1500);

// 初始化航班记录函数
function initializeFlightRecords() {
    const flightRecordsContainer = document.getElementById('flightRecords');
    const emptyRecordsMessage = document.getElementById('emptyRecordsMessage');
    const viewMoreContainer = document.getElementById('viewMoreContainer');
    
    // 检查是否有记录
    if (flightRecords.length === 0) {
        emptyRecordsMessage.style.display = 'block';
        viewMoreContainer.style.display = 'none';
    } else {
        emptyRecordsMessage.style.display = 'none';
        
        // 确定是否需要“查看更多”按钮
        if (flightRecords.length > MAX_VISIBLE_RECORDS) {
            viewMoreContainer.style.display = 'block';
        } else {
            viewMoreContainer.style.display = 'none';
        }
        
        // 显示记录
        displayFlightRecords();
    }
}

// 显示航班记录函数
function displayFlightRecords() {
    const flightRecordsContainer = document.getElementById('flightRecords');
    const emptyRecordsMessage = document.getElementById('emptyRecordsMessage');
    
    // 清除现有记录（除空消息外）
    const recordItems = flightRecordsContainer.querySelectorAll('.record-item');
    recordItems.forEach(item => item.remove());
    
    // 显示/隐藏空消息
    if (flightRecords.length === 0) {
        emptyRecordsMessage.style.display = 'block';
        return;
    } else {
        emptyRecordsMessage.style.display = 'none';
    }
    
    // 添加记录到容器
    flightRecords.forEach((record, index) => {
        const newRecord = document.createElement('div');
        newRecord.className = 'record-item';
        if (index >= MAX_VISIBLE_RECORDS) {
            newRecord.classList.add('hidden-record');
        }
        newRecord.setAttribute('data-id', record.id);
        
        newRecord.innerHTML = `
            <div class="record-details">
                <span class="record-date">${record.date}</span>
                <span class="record-duration">起飞时长: ${record.duration}</span>
            </div>
        `;
        
        // 添加点击事件
        newRecord.addEventListener('click', () => {
            showNotification(`${record.date} 起飞时长: ${record.duration}`);
        });
        
        // 添加到容器
        flightRecordsContainer.appendChild(newRecord);
    });
}

// 更新addFlightRecord函数
function addFlightRecord(duration, customDate = null, customTime = null) {
    // 获取当前日期和时间
    const now = new Date();
    let timestamp = now.getTime();
    let formattedDate = `今天 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 如果提供了自定义日期和时间（来自模态框）
    if (customDate && customTime) {
        const date = new Date(customDate);
        const [hours, minutes] = customTime.split(':');
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        timestamp = date.getTime();
        
        // 格式化日期显示
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            formattedDate = `今天 ${hours}:${minutes}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            formattedDate = `昨天 ${hours}:${minutes}`;
        } else {
            formattedDate = `${date.getMonth() + 1}月${date.getDate()}日 ${hours}:${minutes}`;
        }
    }
    
    // 创建记录对象，带有isNew标志
    const newRecord = {
        id: Date.now(),
        date: formattedDate,
        duration: duration,
        timestamp: timestamp,
        isNew: true // 标记为新记录以进行高亮显示
    };
    
    // 添加到记录数组
    flightRecords.unshift(newRecord);
    
    // 保存到localStorage
    saveRecordsToStorage();
    
    // 更新显示
    initializeFlightRecords();
    
    // 更新统计数据和日历
    updateStats();
    
    // 滚动到统计部分以显示更新后的日历
    setTimeout(() => {
        contentWrapper.scrollTo({
            top: 300,
            behavior: 'smooth'
        });
    }, 100);
}

// 保存记录到localStorage
function saveRecordsToStorage() {
    localStorage.setItem('flightRecords', JSON.stringify(flightRecords));
}

// 从localStorage加载记录
function loadRecordsFromStorage() {
    const savedRecords = localStorage.getItem('flightRecords');
    if (savedRecords) {
        flightRecords = JSON.parse(savedRecords);
    }
}

// 页面加载时调用
loadRecordsFromStorage();
initializeFlightRecords();

// 添加“查看更多”按钮功能
document.getElementById('viewMoreBtn').addEventListener('click', function() {
    const flightRecordsContainer = document.getElementById('flightRecords');
    const hiddenRecords = flightRecordsContainer.querySelectorAll('.hidden-record');
    const viewMoreBtn = document.getElementById('viewMoreBtn');
    
    if (flightRecordsContainer.classList.contains('records-expanded')) {
        // 收起记录
        flightRecordsContainer.classList.remove('records-expanded');
        viewMoreBtn.innerHTML = '<i class="bi bi-chevron-down"></i><span>查看更多</span>';
    } else {
        // 展开记录
        flightRecordsContainer.classList.add('records-expanded');
        viewMoreBtn.innerHTML = '<i class="bi bi-chevron-up"></i><span>收起</span>';
    }
});

// 计时器状态更新函数
function updateTimerState(state) {
    timerState = state;
    
    // 重置所有按钮容器的显示状态
    startButtonContainer.style.display = 'none';
    runningButtonsContainer.style.display = 'none';
    pausedButtonsContainer.style.display = 'none';
    
    // 更新状态显示和相应按钮
    switch (state) {
        case 'not-started':
            flightStatus.textContent = '未起飞';
            flightStatus.className = 'flight-status not-started';
            timerDisplay.className = 'timer-display';
            startButtonContainer.style.display = 'flex';
            break;
        
        case 'running':
            flightStatus.textContent = '起飞中';
            flightStatus.className = 'flight-status in-progress';
            timerDisplay.className = 'timer-display active';
            runningButtonsContainer.style.display = 'flex';
            break;
        
        case 'paused':
            flightStatus.textContent = '已暂停';
            flightStatus.className = 'flight-status paused';
            timerDisplay.className = 'timer-display paused';
            pausedButtonsContainer.style.display = 'flex';
            break;
        
        case 'ended':
            flightStatus.textContent = '已完成';
            flightStatus.className = 'flight-status completed';
            timerDisplay.className = 'timer-display';
            startButtonContainer.style.display = 'flex';
            startFlightBtn.textContent = '新航班';
            
            // 添加完成动画效果
            startFlightBtn.classList.add('pulse-animation');
            setTimeout(() => {
                startFlightBtn.classList.remove('pulse-animation');
            }, 5000);
            break;
    }
}

// 根据航班记录更新统计数据
function updateStats() {
    if (flightRecords.length === 0) return;
    
    // 获取统计数据的DOM元素
    const avgDurationElement = document.querySelector('.stat-item[data-value="平均起飞时长"] .stat-value');
    const weeklyCountElement = document.querySelector('.stat-item[data-value="本周次数"] .stat-value');
    const monthlyCountElement = document.querySelector('.stat-item[data-value="本月次数"] .stat-value');
    const totalCountElement = document.querySelector('.stat-item[data-value="总航班记录"] .stat-value');
    
    // 计算总航班次数
    const totalCount = flightRecords.length;
    
    // 计算每周次数
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay()); // 一周的开始（星期天）
    const weeklyCount = flightRecords.filter(record => record.timestamp >= startOfWeek.getTime()).length;
    
    // 计算每月次数
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyCount = flightRecords.filter(record => record.timestamp >= startOfMonth.getTime()).length;
    
    // 计算平均航班时长
    let totalMinutes = 0;
    flightRecords.forEach(record => {
        const duration = record.duration;
        let minutes = 0;
        
        // 从时长字符串中提取小时和分钟（例如，“2小时35分钟”）
        const hourMatch = duration.match(/(\d+)小时/);
        const minuteMatch = duration.match(/(\d+)分钟/);
        
        if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
        if (minuteMatch) minutes += parseInt(minuteMatch[1]);
        
        totalMinutes += minutes;
    });
    
    const avgMinutes = Math.round(totalMinutes / totalCount);
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = avgMinutes % 60;
    const avgDuration = `${avgHours}:${avgMins.toString().padStart(2, '0')}`;
    
    // 更新DOM中的统计数据
    avgDurationElement.textContent = avgDuration;
    weeklyCountElement.textContent = weeklyCount;
    monthlyCountElement.textContent = monthlyCount;
    totalCountElement.textContent = totalCount;
    
    // 根据航班记录更新日历
    updateCalendar();
}

// 更新日历以显示有航班的日期并高亮显示新航班
function updateCalendar() {
    // 获取日历日期
    const calendarDays = document.querySelectorAll('.day');
    
    // 获取当前月份和年份
    const calendarMonthElement = document.querySelector('.calendar-month');
    const monthYearText = calendarMonthElement.textContent; // 例如，“2023年10月”
    const yearMatch = monthYearText.match(/(\d+)年/);
    const monthMatch = monthYearText.match(/(\d+)月/);
    
    if (!yearMatch || !monthMatch) return;
    
    const year = parseInt(yearMatch[1]);
    const month = parseInt(monthMatch[1]) - 1; // JavaScript月份是0索引的
    
    // 首先清除所有has-flight类
    calendarDays.forEach(day => {
        if (day.textContent && parseInt(day.textContent) > 0) {
            day.classList.remove('has-flight');
            day.classList.remove('new-flight');
        }
    });
    
    // 创建映射以跟踪当前月份中有航班的日期
    const daysWithFlights = new Set();
    const daysWithNewFlights = new Set();
    
    // 查找当前月份中有航班的所有日期
    flightRecords.forEach(record => {
        const recordDate = new Date(record.timestamp);
        
        // 检查记录是否来自显示的月份
        if (recordDate.getFullYear() === year && recordDate.getMonth() === month) {
            daysWithFlights.add(recordDate.getDate());
            
            // 检查这是否是新航班
            if (record.isNew) {
                daysWithNewFlights.add(recordDate.getDate());
            }
        }
    });
    
    // 更新日历UI
    calendarDays.forEach(day => {
        if (day.textContent && parseInt(day.textContent) > 0) {
            const dayNum = parseInt(day.textContent);
            if (daysWithFlights.has(dayNum)) {
                day.classList.add('has-flight');
                
                // 如果是新航班，则添加new-flight类
                if (daysWithNewFlights.has(dayNum)) {
                    day.classList.add('new-flight');
                }
            }
        }
    });
}

// 更新日历导航以同时更新日历数据
function updateCalendarMonthDisplay(monthOffset = 0) {
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    
    // 更新日历月份文本
    const calendarMonth = document.querySelector('.calendar-month');
    calendarMonth.textContent = `${targetMonth.getFullYear()}年${targetMonth.getMonth() + 1}月`;
    
    // 重新生成日历日期
    generateCalendarDays(targetMonth.getFullYear(), targetMonth.getMonth());
    
    // 更新航班指示器
    updateCalendar();
}

// 生成给定月份的日历日期的函数
function generateCalendarDays(year, month) {
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = ''; // 清除现有日期
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0表示星期天，1表示星期一，依此类推
    
    // 添加空单元格以填充月份第一天之前的日期
    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day';
        calendarDays.appendChild(emptyDay);
    }
    
    // 添加月份的日期
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'day';
        day.textContent = i;
        
        // 检查这是否是今天
        if (year === today.getFullYear() && 
            month === today.getMonth() && 
            i === today.getDate()) {
            day.classList.add('today');
        }
        
        // 添加事件监听器
        day.addEventListener('click', () => {
            if (day.classList.contains('has-flight')) {
                showDayDetails(`${month + 1}月${i}日`);
            } else {
                showNotification(`${month + 1}月${i}日没有航班记录`);
            }
        });
        
        calendarDays.appendChild(day);
    }
}

// 更新月份导航
let currentMonthOffset = 0;

prevMonthBtn.addEventListener('click', () => {
    currentMonthOffset--;
    animateCalendarChange('prev');
    updateCalendarMonthDisplay(currentMonthOffset);
});

nextMonthBtn.addEventListener('click', () => {
    currentMonthOffset++;
    animateCalendarChange('next');
    updateCalendarMonthDisplay(currentMonthOffset);
});

// 显示特定日期的详细信息
function showDayDetails(dayStr) {
    // 获取指定日期的记录
    const match = dayStr.match(/(\d+)月(\d+)日/);
    if (!match) return;
    
    const month = parseInt(match[1]) - 1;
    const day = parseInt(match[2]);
    const year = new Date().getFullYear();
    
    // 获取一天的开始和结束时间
    const startOfDay = new Date(year, month, day, 0, 0, 0, 0).getTime();
    const endOfDay = new Date(year, month, day, 23, 59, 59, 999).getTime();
    
    // 过滤当天的记录
    const dayRecords = flightRecords.filter(record => {
        const timestamp = record.timestamp;
        return timestamp >= startOfDay && timestamp <= endOfDay;
    });
    
    if (dayRecords.length === 0) {
        showNotification(`${dayStr}没有航班记录`);
        return;
    }
    
    // 计算当天的总航班时间
    let totalMinutes = 0;
    dayRecords.forEach(record => {
        const duration = record.duration;
        let minutes = 0;
        
        const hourMatch = duration.match(/(\d+)小时/);
        const minuteMatch = duration.match(/(\d+)分钟/);
        
        if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
        if (minuteMatch) minutes += parseInt(minuteMatch[1]);
        
        totalMinutes += minutes;
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    showNotification(`${dayStr}共${dayRecords.length}次航班，总时长${hours}小时${minutes}分钟`);
}

// 加载时初始化所有内容
function initialize() {
    loadRecordsFromStorage();
    updateCurrentTime();
    initializeFlightRecords();
    updateStats();
    
    // 在日历中设置当前日期
    updateCalendarMonthDisplay(0);
    
    // 更新当前时间显示
    setInterval(updateCurrentTime, 60000); // 每分钟更新一次
}

// 更新当前时间显示
function updateCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    currentTime.textContent = `${hours}:${minutes}`;
}

// 调用initialize而不是单独的初始化函数
initialize();