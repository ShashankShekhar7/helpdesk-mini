const config = require('../config/config');

class SLACalculator {
  static calculateDeadline(priority, createdAt = new Date()) {
    const slaHours = config.slaHours[priority] || config.slaHours.medium;
    return new Date(createdAt.getTime() + (slaHours * 60 * 60 * 1000));
  }

  static isBreached(slaDeadline, currentTime = new Date()) {
    return currentTime > new Date(slaDeadline);
  }

  static getTimeRemaining(slaDeadline, currentTime = new Date()) {
    const remaining = new Date(slaDeadline).getTime() - currentTime.getTime();
    
    if (remaining <= 0) {
      return { isBreached: true, timeLeft: 0 };
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    return {
      isBreached: false,
      timeLeft: remaining,
      hours,
      minutes,
      formatted: `${hours}h ${minutes}m`
    };
  }

  static getSLAStatus(slaDeadline, currentTime = new Date()) {
    const remaining = this.getTimeRemaining(slaDeadline, currentTime);
    
    if (remaining.isBreached) {
      return { status: 'breached', class: 'sla-breached' };
    }
    
    if (remaining.hours < 1) {
      return { status: 'critical', class: 'sla-critical' };
    }
    
    if (remaining.hours < 4) {
      return { status: 'warning', class: 'sla-warning' };
    }
    
    return { status: 'safe', class: 'sla-safe' };
  }
}

module.exports = SLACalculator;
