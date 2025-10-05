import React, { useState, useEffect } from 'react';
import { calculateSLAStatus } from '../../utils/helpers';
import { SLA_COLORS } from '../../utils/constants';
import '../../styles/components.css';

const SLAStatus = ({ slaDeadline, status, size = 'medium', showText = true }) => {
  const [slaInfo, setSlaInfo] = useState({ status: 'safe', formatted: 'N/A', isBreached: false });

  useEffect(() => {
    if (!slaDeadline || status === 'resolved' || status === 'closed') {
      setSlaInfo({ status: 'safe', formatted: 'Completed', isBreached: false });
      return;
    }

    const updateSLA = () => {
      const info = calculateSLAStatus(slaDeadline);
      setSlaInfo(info);
    };

    // Update immediately
    updateSLA();

    // Update every minute
    const interval = setInterval(updateSLA, 60000);

    return () => clearInterval(interval);
  }, [slaDeadline, status]);

  const slaColor = SLA_COLORS[slaInfo.status];
  const sizeClass = `sla-${size}`;

  return (
    <div className={`sla-status ${sizeClass}`}>
      <div 
        className={`sla-indicator sla-${slaInfo.status}`}
        style={{ backgroundColor: slaColor }}
        title={`SLA Status: ${slaInfo.status.toUpperCase()}`}
      >
        {slaInfo.isBreached && <span className="sla-breach-icon">⚠</span>}
      </div>
      
      {showText && (
        <span className={`sla-text sla-text-${slaInfo.status}`}>
          {slaInfo.formatted}
        </span>
      )}
    </div>
  );
};

export default SLAStatus;
