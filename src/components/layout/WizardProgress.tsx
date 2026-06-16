import clsx from 'clsx';
import { Check } from 'lucide-react';
import { WIZARD_STEPS, type WizardStep } from '../../types';

interface WizardProgressProps {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  onStepClick?: (step: WizardStep) => void;
}

export function WizardSidebar({ currentStep, completedSteps, onStepClick }: WizardProgressProps) {
  return (
    <nav className="hidden lg:flex flex-col gap-1 w-52 shrink-0">
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
        제작 단계
      </p>
      {WIZARD_STEPS.map((step) => {
        const isActive = step.id === currentStep;
        const isDone = completedSteps.includes(step.id);
        const isClickable = isDone && onStepClick;

        return (
          <button
            key={step.id}
            onClick={() => isClickable && onStepClick(step.id)}
            disabled={!isClickable && !isActive}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left w-full',
              isActive
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                : isDone
                  ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                  : 'text-slate-400 dark:text-slate-500 cursor-default',
            )}
          >
            <span className={clsx(
              'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 transition-all',
              isActive
                ? 'bg-blue-600 text-white'
                : isDone
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500',
            )}>
              {isDone && !isActive ? <Check className="w-3 h-3" /> : step.stepNumber}
            </span>
            <span className="truncate">{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function WizardTopBar({ currentStep, completedSteps }: WizardProgressProps) {
  const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
  const progress = ((currentIndex) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {WIZARD_STEPS[currentIndex]?.label}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {currentIndex + 1} / {WIZARD_STEPS.length}
        </span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Step dots */}
      <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
        {WIZARD_STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isDone = completedSteps.includes(step.id);
          return (
            <div
              key={step.id}
              title={step.label}
              className={clsx(
                'shrink-0 rounded-full transition-all duration-200',
                isActive ? 'w-6 h-2 bg-blue-600' : isDone ? 'w-2 h-2 bg-emerald-500' : 'w-2 h-2 bg-slate-300 dark:bg-slate-600',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
