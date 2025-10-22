import { AutomationEngine } from "./automation-engine"
import { prisma } from "./db"

interface ScheduledTask {
  id: string
  clientId: string
  type: "ranking_check" | "reoptimization" | "monthly_report" | "analytics_sync"
  schedule: string // cron expression
  enabled: boolean
  lastRun?: Date
  nextRun: Date
}

export class CronScheduler {
  private automationEngine: AutomationEngine
  private running = false
  private tasks: ScheduledTask[] = []

  constructor(automationEngine: AutomationEngine) {
    this.automationEngine = automationEngine
  }

  async start(): Promise<void> {
    this.running = true
    logger.info("Cron scheduler started")

    // Load scheduled tasks from database
    await this.loadScheduledTasks()

    // Start the scheduling loop
    this.scheduleLoop()
  }

  async stop(): Promise<void> {
    this.running = false
    logger.info("Cron scheduler stopped")
  }

  private async loadScheduledTasks(): Promise<void> {
    try {
      // In a real implementation, you'd have a ScheduledTask model
      // For now, we'll create default schedules for all clients

      const clients = await prisma.client.findMany({
        select: { id: true, name: true }
      })

      this.tasks = []

      for (const client of clients) {
        // Daily ranking check at 9 AM
        this.tasks.push({
          id: `ranking_check_${client.id}`,
          clientId: client.id,
          type: "ranking_check",
          schedule: "0 9 * * *", // 9 AM daily
          enabled: true,
          nextRun: this.getNextRunTime("0 9 * * *"),
        })

        // Weekly re-optimization check on Monday at 10 AM
        this.tasks.push({
          id: `reoptimization_${client.id}`,
          clientId: client.id,
          type: "reoptimization",
          schedule: "0 10 * * 1", // Monday 10 AM
          enabled: true,
          nextRun: this.getNextRunTime("0 10 * * 1"),
        })

        // Monthly report on 1st of month at 8 AM
        this.tasks.push({
          id: `monthly_report_${client.id}`,
          clientId: client.id,
          type: "monthly_report",
          schedule: "0 8 1 * *", // 1st of month 8 AM
          enabled: true,
          nextRun: this.getNextRunTime("0 8 1 * *"),
        })

        // Daily analytics sync at 11 PM
        this.tasks.push({
          id: `analytics_sync_${client.id}`,
          clientId: client.id,
          type: "analytics_sync",
          schedule: "0 23 * * *", // 11 PM daily
          enabled: true,
          nextRun: this.getNextRunTime("0 23 * * *"),
        })
      }

      logger.info(`Loaded ${this.tasks.length} scheduled tasks`)
    } catch (error) {
      logger.error("Error loading scheduled tasks:", error)
    }
  }

  private scheduleLoop(): void {
    const checkInterval = setInterval(async () => {
      if (!this.running) {
        clearInterval(checkInterval)
        return
      }

      const now = new Date()

      for (const task of this.tasks) {
        if (task.enabled && task.nextRun <= now) {
          await this.executeTask(task)
          task.lastRun = now
          task.nextRun = this.getNextRunTime(task.schedule)
        }
      }
    }, 60000) // Check every minute
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    try {
      logger.info(`Executing scheduled task: ${task.type} for client ${task.clientId}`)

      switch (task.type) {
        case "ranking_check":
          await this.automationEngine.checkReoptimizationTriggers()
          break

        case "reoptimization":
          await this.automationEngine.checkReoptimizationTriggers()
          break

        case "monthly_report":
          const report = await this.automationEngine.generateMonthlyReport()
          if (report.success) {
            await this.sendMonthlyReport(task.clientId, report.reportData)
          }
          break

        case "analytics_sync":
          await this.syncClientAnalytics(task.clientId)
          break

        default:
          logger.warning(`Unknown task type: ${task.type}`)
      }

      logger.info(`Task ${task.id} completed successfully`)
    } catch (error) {
      logger.error(`Error executing task ${task.id}:`, error)
    }
  }

  private async syncClientAnalytics(clientId: string): Promise<void> {
    try {
      // Import the analytics sync function
      const { syncAnalytics } = await import("../app/actions/analytics")
      await syncAnalytics(clientId)
      logger.info(`Analytics synced for client ${clientId}`)
    } catch (error) {
      logger.error(`Error syncing analytics for client ${clientId}:`, error)
    }
  }

  private async sendMonthlyReport(clientId: string, reportData: any): Promise<void> {
    try {
      // In a real implementation, you'd send this via email or other notification
      logger.info(`Monthly report generated for client ${clientId}`)

      // Store report in database or send via email
      await prisma.analytics.create({
        data: {
          clientId,
          date: new Date(),
          // Store report summary in analytics
          organicTraffic: reportData.ga4Analytics?.totalSessions || 0,
          keywordRankings: reportData.keywordRankings?.length || 0,
        }
      })

      // TODO: Implement email sending
      console.log("Monthly Report for", clientId, JSON.stringify(reportData, null, 2))
    } catch (error) {
      logger.error(`Error sending monthly report for client ${clientId}:`, error)
    }
  }

  private getNextRunTime(cronExpression: string): Date {
    // Simple cron parser for basic expressions
    // In production, use a proper cron library like 'node-cron' or 'cron-parser'

    const now = new Date()
    const [minute, hour, day, month, dayOfWeek] = cronExpression.split(' ')

    let nextRun = new Date(now)

    // Handle daily schedules (ignore day/month/dayOfWeek for simplicity)
    if (minute !== '*' && hour !== '*') {
      const targetHour = parseInt(hour)
      const targetMinute = parseInt(minute)

      nextRun.setHours(targetHour, targetMinute, 0, 0)

      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
    }

    // Handle monthly schedules
    if (day !== '*') {
      const targetDay = parseInt(day)
      nextRun.setDate(targetDay)

      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1)
        nextRun.setDate(targetDay)
      }
    }

    // Handle weekly schedules
    if (dayOfWeek !== '*') {
      const targetDayOfWeek = parseInt(dayOfWeek)
      const currentDayOfWeek = now.getDay()

      let daysToAdd = targetDayOfWeek - currentDayOfWeek
      if (daysToAdd <= 0) {
        daysToAdd += 7
      }

      nextRun = new Date(now)
      nextRun.setDate(now.getDate() + daysToAdd)
      nextRun.setHours(parseInt(hour), parseInt(minute), 0, 0)
    }

    return nextRun
  }

  async addTask(task: Omit<ScheduledTask, 'id' | 'nextRun'>): Promise<void> {
    const newTask: ScheduledTask = {
      ...task,
      id: `custom_${Date.now()}`,
      nextRun: this.getNextRunTime(task.schedule),
    }

    this.tasks.push(newTask)
    logger.info(`Added custom task: ${newTask.id}`)
  }

  async removeTask(taskId: string): Promise<void> {
    const index = this.tasks.findIndex(t => t.id === taskId)
    if (index !== -1) {
      this.tasks.splice(index, 1)
      logger.info(`Removed task: ${taskId}`)
    }
  }

  getTasks(): ScheduledTask[] {
    return [...this.tasks]
  }

  getTasksForClient(clientId: string): ScheduledTask[] {
    return this.tasks.filter(t => t.clientId === clientId)
  }
}

// Simple logger (replace with proper logging library in production)
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warning: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
}