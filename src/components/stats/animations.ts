import { gsap } from "gsap";

export interface NumberAnimationOptions {
  duration?: number;
  ease?: string;
  delay?: number;
  onUpdate?: (value: number, formattedValue: string) => void;
  onComplete?: () => void;
}

interface ParsedNumber {
  value: number;
  prefix: string;
  suffix: string;
  decimals: number;
}

/**
 * Parses a text string to extract numeric value and formatting information
 * Handles formats like: "15%", "1.5M", "99", "$2.3K", "100+", etc.
 */
function parseNumber(text: string): ParsedNumber {
  // Remove all whitespace
  const cleaned = text.replace(/\s/g, "");

  // Match pattern: optional prefix + number + optional suffix
  const match = cleaned.match(/^([^\d\.]*)(\d*\.?\d+)([^\d\.]*)$/);

  if (!match) {
    return { value: 0, prefix: "", suffix: text, decimals: 0 };
  }

  const [, prefix, numberStr, suffix] = match;
  let value = Number.parseFloat(numberStr);

  // Handle common suffixes that modify the value
  const lowerSuffix = suffix.toLowerCase();
  if (lowerSuffix.includes("k")) {
    value *= 1000;
  } else if (lowerSuffix.includes("m")) {
    value *= 1000000;
  } else if (lowerSuffix.includes("b")) {
    value *= 1000000000;
  }

  // Determine decimal places from original number
  const decimals = numberStr.includes(".") ? numberStr.split(".")[1].length : 0;

  return { value, prefix, suffix, decimals };
}

/**
 * Formats a number back to its original format during animation
 */
function formatNumber(currentValue: number, parsed: ParsedNumber): string {
  let displayValue = currentValue;
  const suffix = parsed.suffix;

  // Handle scaling back down for display
  const lowerSuffix = parsed.suffix.toLowerCase();
  if (lowerSuffix.includes("k") && currentValue >= 1000) {
    displayValue = currentValue / 1000;
  } else if (lowerSuffix.includes("m") && currentValue >= 1000000) {
    displayValue = currentValue / 1000000;
  } else if (lowerSuffix.includes("b") && currentValue >= 1000000000) {
    displayValue = currentValue / 1000000000;
  }

  // Format with appropriate decimal places
  const formatted = displayValue.toFixed(parsed.decimals);

  return `${parsed.prefix}${formatted}${suffix}`;
}

/**
 * Creates a beautiful number animation that counts from 0 to target value
 */
export function animateNumber(
  element: HTMLElement,
  targetText: string,
  options: NumberAnimationOptions = {},
): GSAPTween {
  const {
    duration = 2,
    ease = "power2.out",
    delay = 0,
    onUpdate,
    onComplete,
  } = options;

  const parsed = parseNumber(targetText);
  const animationTarget = { value: 0 };

  return gsap.to(animationTarget, {
    value: parsed.value,
    duration,
    ease,
    delay,
    onUpdate: () => {
      const formattedValue = formatNumber(animationTarget.value, parsed);
      element.textContent = formattedValue;
      onUpdate?.(animationTarget.value, formattedValue);
    },
    onComplete: () => {
      // Ensure final value is exactly the target
      element.textContent = targetText;
      onComplete?.();
    },
  });
}

/**
 * Sets up intersection observer to trigger animation when element enters viewport
 */
export function animateNumberOnScroll(
  element: HTMLElement,
  targetText: string,
  options: NumberAnimationOptions = {},
): void {
  let hasAnimated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          animateNumber(element, targetText, options);
          observer.unobserve(element);
        }
      }
    },
    {
      threshold: 0.1,
      rootMargin: "-10% 0px",
    },
  );

  observer.observe(element);
}

/**
 * Staggered animation for multiple stat elements
 */
export function animateStatsStaggered(
  elements: HTMLElement[],
  targetTexts: string[],
  options: NumberAnimationOptions = {},
): GSAPTimeline {
  const timeline = gsap.timeline();

  elements.forEach((element, index) => {
    if (targetTexts[index]) {
      const parsed = parseNumber(targetTexts[index]);
      const animationTarget = { value: 0 };

      timeline.to(
        animationTarget,
        {
          value: parsed.value,
          duration: options.duration || 2,
          ease: options.ease || "power2.out",
          onUpdate: () => {
            const formattedValue = formatNumber(animationTarget.value, parsed);
            element.textContent = formattedValue;
            options.onUpdate?.(animationTarget.value, formattedValue);
          },
          onComplete: () => {
            element.textContent = targetTexts[index];
            options.onComplete?.();
          },
        },
        index * 0.2, // Stagger delay
      );
    }
  });

  return timeline;
}

export default {
  animateNumber,
  animateNumberOnScroll,
  animateStatsStaggered,
  parseNumber,
  formatNumber,
};
