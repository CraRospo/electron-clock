// dom
const clock = document.getElementById('clock')
const digital = document.getElementById('digital')
const digitalH = document.getElementById('digital-hours')
const digitalM = document.getElementById('digital-minute')
const digitalS = document.getElementById('digital-second')
const changeBtn = document.getElementById('changeTimer')
const calendar = document.getElementById('calendar')
const dateStr = document.getElementById('date')
const pullDown = document.getElementById('pull-down')
const calendarC = document.getElementById('calendar-container')

let sPointer = null
let mPointer = null
let hPointer = null

// 定时器
let timer = null
// 时间缓存
const timeCache = {
    H: 0,  // 24-hour
    h: 0,  // 12-hour
    m: 0,  // minutes
    s: 0   // second
}

// 数字的高低电平转化
// ****        0
// *  *      3   1
// ****  =>    2
// *  *      6   4
// ****        5
const binConvert = {
    0: [1,1,0,1,1,1,1],
    1: [0,1,0,0,1,0,0],
    2: [1,1,1,0,0,1,1],
    3: [1,1,1,0,1,1,0],
    4: [0,1,1,1,1,0,0],
    5: [1,0,1,1,1,1,0],
    6: [1,0,1,1,1,1,1],
    7: [1,1,0,0,1,0,0],
    8: [1,1,1,1,1,1,1],
    9: [1,1,1,1,1,1,0]
}

// btn change
changeBtn.onclick = function() {
    if (clock.classList.contains('hide')) {
        clock.classList.remove('hide')
        digital.classList.add('hide')
    } else {
        digital.classList.remove('hide')
        clock.classList.add('hide')
    }
}

pullDown.onclick = function() {
    if (calendarC.classList.contains('down')) {
        calendarC.classList.remove('down')
    } else {
        calendarC.classList.add('down')
    }
}

// 渲染刻度
renderScale()
// 渲染时针
renderPointer()
// 渲染始终数字
renderHourNumber()
// 计时
count()
// 日历
renderCalendar()

// 星期转换
function convertDays(day) {
    switch (day) {
        case 0:
            return '日'
        case 1:
            return '一'
        case 2:
            return '二'
        case 3:
            return '三'
        case 4:
            return '四'
        case 5:
            return '五'
        case 6:
            return '六'
        default:
            return ''
    }
}

// 日历
function renderCalendar() {
    const { Y, M, D, d } = getCurrentDate()
    // 显示时间
    const timeStr = `${Y}/${M + 1}/${D} 星期${convertDays(d)}`
    dateStr.textContent = timeStr

    // 这个月有几天
    const days = getCurrentMonthDays(M + 1)

    // 上个月有几天
    const lastMonthDays = getCurrentMonthDays(M)

    // 这个月的第一天是星期几
    const firstDay = new Date(`${Y}/${M + 1}/1`).getDay()

    // 这个月的最后一天是星期几
    const lastDay = new Date(`${Y}/${M + 1}/${days}`).getDay()

    // 七天
    const weekDays = ['Sun', 'Mon', 'Tus', 'Wen', 'Thu', 'Fri', 'Sat']

    // 渲染星期
    weekDays.forEach(d => {
        const weekdays = document.createElement('div')
        weekdays.classList.add('date')
        weekdays.textContent = d
        calendar.appendChild(weekdays)
    })

    // 需要渲染上个月几天
    for(let e = lastMonthDays - firstDay + 1; e <= lastMonthDays; e++) {
        const implement = document.createElement('div')
        implement.classList.add('date')
        implement.classList.add('prev')
        implement.textContent = e
        calendar.appendChild(implement)
    }

    // 渲染当月
    for(let i = 1; i <= days; i++) {
        const daysEle = document.createElement('div')
        daysEle.classList.add('date')
        if (i === D) {
            daysEle.classList.add('current')
        }
        daysEle.textContent = i
        calendar.appendChild(daysEle)
    }

    // 渲染下月
    for(let n = 1; n < 6 - lastDay + 1; n++) {
        const next = document.createElement('div')
        next.classList.add('date')
        next.classList.add('prev')
        next.textContent = n
        calendar.appendChild(next)
    }
}

/**
 * 将数字转化为对应的电平
 * @param {Array} eleCollection 当前数字的domList集合
 * @param {Number} number 需要显示的数字
 */
function renderDigitalNumber(eleCollection, number) {
    const bin = binConvert[number]
    for(let ele of eleCollection){
        ele.classList.remove('high-level')
        const level = ele.getAttribute('dg')
        if (bin[level]) {
            ele.classList.add('high-level')
        }
    }
}

// 时间解析 将时分秒分别进行转化和处理
function renderDigital(time){
    const { H, m, s } = time

    const collection = {
        H: digitalH.children,
        m: digitalM.children,
        s: digitalS.children,
    }

    for(let [key, value] of Object.entries({ H, m, s })) {
        if(value !== undefined) {
            const bit = value.toString()
            const bitCompletement = bit.length < 2 ? '0' + bit : bit
            bitCompletement.split('').forEach((b, index) => {
                renderDigitalNumber(collection[key][index].children, b)
            })
        }
    }
}

// 获取时间对象
function getCurrentTime() {
    const date = new Date()
    return {
        h: date.getHours() % 12,
        H: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds()
    }
}

// 是闰年
function isLeapYear(year) {
    if (year % 4 === 0 && year % 100 !== 0) return true
    if (year % 400 === 0) return true
    return false
}

// 当月天数
function getCurrentMonthDays(month) {
    const M = month === 0 ? 12 : month
    const { Y } = getCurrentDate()
    if (M === 2) {
        return isLeapYear(Y) ? 29 : 28
    } else if ([1, 3, 5, 7, 8, 10, 12].includes(M)) {
        return 31
    } else {
        return 30
    }
}

// 获取日期对象
function getCurrentDate() {
    const date = new Date()
    return {
        Y: date.getFullYear(),
        M: date.getMonth(),
        D: date.getDate(),
        d: date.getDay()
    }
}

// 产生一个differ differ 会只渲染变更的数据
function diff(cache, newVal) {
    const differ = {}
    for(let props in cache) {
        if(newVal[props] != cache[props]) {
            differ[props] = newVal[props]
        }
    }
    return differ
}

// 遍历differ 执行move
function pointerMove(differ) {
    for(let props in differ) {
        const val = differ[props]
        switch (props) {
            case 's':
                sPointer.style.cssText += `transform: rotateZ(${val * 6}deg)`
                break;
            case 'm':
                mPointer.style.cssText += `transform: rotateZ(${val * 6}deg)`
                break;
            case 'h':
                hPointer.style.cssText += `transform: rotateZ(${val * 30}deg)`
                break;
            default:
                break;
        }
    }
}

// 通知进程 触发消息推送
function createNotification(infos) {
    window.electronAPI.notify(infos)
}

// 计时
function count() {
    if (!timer) clearTimeout(timer)
    timer = setTimeout(() => {
        const newTime = getCurrentTime()

        // 检查并分发通知
        dispathNotification(newTime)

        // differ
        const differ = diff(timeCache, newTime)

        // 渲染指针
        pointerMove(differ)

        // 渲染数字
        renderDigital(differ)

        // 缓存
        Object.assign(timeCache, differ)

        // 递归
        count()
    }, 1000)
}

// 渲染刻度
function renderScale() {
    for(let hour = 1; hour <= 12; hour++) {
        const hourTag = document.createElement('div')
        const offsetX = calculateX(hour)
        const offsetY = calculateY(hour)
        const transFormText = `transform: translate(${offsetX}px, ${offsetY}px) rotateZ(${-30 * hour}deg);`
        hourTag.style.cssText = `
            position: absolute;
            width: 2px;
            height: 8px;
            background: #000;
            margin-top: -4px;
            top: 50%;
            left: 50%;
            background: #666;
            ${transFormText}
        `
        clock.appendChild(hourTag)
    }
}

// 渲染刻度数字
function renderHourNumber() {
    const hours = [12, 3, 6, 9]
    hours.forEach((h, i) => {
        const hourNum = document.createElement('div')
        hourNum.textContent = h
        hourNum.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            margin: -10px;
            top: 50%;
            left: 50%;
            text-align: center;
            transform: translate(${(2 - i) % 2 * 132}px, ${i % 2 ? 0 : i ? 132 : -132}px)
        `
        clock.appendChild(hourNum)
    })
}

// 渲染时针
function renderPointer() {
    const sPointerLength = 120
    const mPointerLength = 90
    const hPointerLength = 60

    sPointer = document.createElement('div')
    sPointer.style.cssText = `
        position: absolute;
        width: 2px;
        height: ${sPointerLength}px;
        top: ${150 - sPointerLength}px;
        left: 50%;
        margin-left: -1px;
        background: #ff0000;
        border-radius: 2px;
        transform-origin: bottom center;
    `

    mPointer = document.createElement('div')
    mPointer.style.cssText = `
        position: absolute;
        width: 4px;
        height: ${mPointerLength}px;
        top: ${150 - mPointerLength}px;
        left: 50%;
        margin-left: -2px;
        background: #ccc;
        border-radius: 4px;
        transform-origin: bottom center;
    `

    hPointer = document.createElement('div')
    hPointer.style.cssText = `
        position: absolute;
        width: 6px;
        height: ${hPointerLength}px;
        top: ${150 - hPointerLength}px;
        left: 50%;
        margin-left: -3px;
        background: #333;
        border-radius: 6px;
        transform-origin: bottom center;
    `

    clock.appendChild(sPointer)
    clock.appendChild(mPointer)
    clock.appendChild(hPointer)
}

// 中心为原点 第一象限为正的坐标系 deg以 (0, 150) 为0deg
// x
function calculateX(i) {
    return Math.sin(Math.PI * i / 6) * 150
}

// y
function calculateY(i) {
    return Math.cos(Math.PI * i / 6) * 150
}

// 分发时间验证
function dispathNotification(time) {
    const { H, m, s } = time

    if (H === 11 && m === 50 && s === 0) {
        createNotification(
            {
                title: '午饭时间！',
                body: '午饭时间到了！赶紧出发！您的小伙伴正在楼下等您！'
            }
        )
    }

    if (H === 17 && m === 5 && s === 0) {
        createNotification(
            {
                title: '回家时间！',
                body: '到点了到点了到点了！还有十分钟，别忘记打卡'
            }
        )
    }

    if (m === 0 && s === 0 && H > 9 && H < 17) {
        createNotification(
            {
                title: '喝水时间！',
                body: '喝水时间！已经工作一个小时了，不如起来活动一下吧！'
            }
        )
    }
}
