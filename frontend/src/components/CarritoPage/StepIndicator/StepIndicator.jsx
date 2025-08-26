import React from 'react';
import './StepIndicator.css';

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Cliente', icon: '👤' },
    { number: 2, title: 'Productos', icon: '🛒' },
    { number: 3, title: 'Finalizar', icon: '💰' }
  ];

  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={`step-indicator-step ${currentStep >= step.number ? 'step-indicator-active' : ''} ${currentStep === step.number ? 'step-indicator-current' : ''}`}>
            <div className="step-indicator-circle">
              <span className="step-indicator-icon">{step.icon}</span>
              <span className="step-indicator-number">{step.number}</span>
            </div>
            <span className="step-indicator-title">{step.title}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`step-indicator-connector ${currentStep > step.number ? 'step-indicator-connector-active' : ''}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
