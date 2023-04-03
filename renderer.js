// dom
const clock = document.getElementById('clock')
let sPointer = null
let mPointer = null
let hPointer = null

// 定时器
let timer = null
// 时间缓存
const timeCache = {
    h: 0,
    m: 0,
    s: 0
}

// 渲染刻度
renderScale()
// 渲染时针
renderPointer()
// 渲染始终数字
renderHourNumber()

// 计时
count()
// 初始化
pointerMove(diff(timeCache, getCurrentTime()))

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
        }
    }
}

// 通知进程 触发消息推送
function createNotification(infos) {
    console.log(infos)
    window.electronAPI.notify(infos)
}

// 计时
function count() {
    if (!timer) clearTimeout(timer)
    timer = setTimeout(() => {
        const newTime = getCurrentTime()

        dispathNotification(newTime)

        pointerMove(diff(timeCache, newTime))

        timeCache.h = newTime.h
        timeCache.m = newTime.m
        timeCache.s = newTime.s
        return count()
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
