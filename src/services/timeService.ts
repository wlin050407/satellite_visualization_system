/**
 * 时间管理服务
 * 处理时间控制、GMT时间显示、时间偏移等功能
 */

export class TimeService {
  private static instance: TimeService
  private startTime: Date = new Date()
  private customTime: Date | null = null
  private timeOffset: number = 0 // 累积的时间偏移（秒）
  private lastUpdateTime: number = 0
  private isCustomMode: boolean = false
  
  private constructor() {
    this.lastUpdateTime = performance.now()
  }
  
  public static getInstance(): TimeService {
    if (!TimeService.instance) {
      TimeService.instance = new TimeService()
    }
    return TimeService.instance
  }
  
  /**
   * 设置自定义时间
   */
  public setCustomTime(time: Date): void {
    this.customTime = new Date(time)
    this.isCustomMode = true
    this.timeOffset = 0
    this.lastUpdateTime = performance.now()
    console.log(`时间设置为自定义模式: ${this.formatGMT(time)}`)
  }
  
  /**
   * 重置到实时时间
   */
  public resetToRealTime(): void {
    this.customTime = null
    this.isCustomMode = false
    this.timeOffset = 0
    this.lastUpdateTime = performance.now()
    console.log('时间重置为实时模式')
  }
  
  /**
   * 更新时间偏移（由渲染循环调用）
   */
  public updateTimeOffset(deltaTime: number, timeSpeed: number): void {
    if (this.isCustomMode && timeSpeed !== 0) {
      this.timeOffset += deltaTime * timeSpeed
    }
    this.lastUpdateTime = performance.now()
  }
  
  /**
   * 获取当前有效时间
   */
  public getCurrentTime(): Date {
    if (this.isCustomMode && this.customTime) {
      return new Date(this.customTime.getTime() + this.timeOffset * 1000)
    }
    return new Date()
  }
  
  /**
   * 格式化为GMT时间字符串
   */
  public formatGMT(date: Date): string {
    return date.toISOString().replace('T', ' ').replace('.000Z', ' GMT')
  }
  
  /**
   * 格式化为本地时间字符串（用于比较）
   */
  public formatLocal(date: Date): string {
    return date.toLocaleString()
  }
  
  /**
   * 检查是否为自定义时间模式
   */
  public isCustomTimeMode(): boolean {
    return this.isCustomMode
  }
  
  /**
   * 获取时间偏移量（秒）
   */
  public getTimeOffset(): number {
    return this.timeOffset
  }
  
  /**
   * 计算加速时间（用于卫星轨道计算）
   */
  public getAcceleratedTime(baseAcceleration: number = 60): Date {
    const currentTime = this.getCurrentTime()
    return new Date(currentTime.getTime() + this.timeOffset * 1000 * baseAcceleration)
  }
}

// 导出单例实例
export const timeService = TimeService.getInstance() 