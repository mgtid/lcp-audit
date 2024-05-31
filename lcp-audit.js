/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Mocked UIStrings for localization
const UIStrings = {
  description: 'Largest Contentful Paint marks the time at which the largest text or image is ' +
      'painted. [Learn more about the Largest Contentful Paint metric](https://developer.chrome.com/docs/lighthouse/performance/lighthouse-largest-contentful-paint/)',
};

// Mock function for creating ICU messages
const str_ = (msg) => msg;

// Mock Audit class
class Audit {
  static get SCORING_MODES() {
    return {
      NUMERIC: 'numeric'
    };
  }

  static computeLogNormalScore(scoringOptions, value) {
    // Mock computation for demo purposes
    const p10 = scoringOptions.p10;
    const median = scoringOptions.median;
    return Math.min(1, Math.max(0, 1 - (value - p10) / (median - p10)));
  }
}

// Mock LargestContentfulPaint class
class LargestContentfulPaint extends Audit {
  static get meta() {
    return {
      id: 'largest-contentful-paint',
      title: str_('Largest Contentful Paint Metric'),
      description: str_(UIStrings.description),
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      supportedModes: ['navigation'],
      requiredArtifacts: ['HostUserAgent', 'traces', 'devtoolsLogs', 'GatherContext', 'URL'],
    };
  }

  static get defaultOptions() {
    return {
      mobile: {
        scoring: {
          p10: 2500,
          median: 4000,
        },
      },
      desktop: {
        scoring: {
          p10: 1200,
          median: 2400,
        },
      },
    };
  }

  static async audit(artifacts, context) {
    // Mock trace and devtools log data
    const trace = artifacts.traces[Audit.DEFAULT_PASS];
    const devtoolsLog = artifacts.devtoolsLogs[Audit.DEFAULT_PASS];
    const gatherContext = artifacts.GatherContext;
    const metricComputationData = { trace, devtoolsLog, gatherContext,
      settings: context.settings, URL: artifacts.URL };

    // Mock ComputedLcp for demo
    const metricResult = await Promise.resolve({ timing: 3000 });
    const options = context.options[context.settings.formFactor];

    return {
      score: Audit.computeLogNormalScore(
        options.scoring,
        metricResult.timing
      ),
      scoringOptions: options.scoring,
      numericValue: metricResult.timing,
      numericUnit: 'millisecond',
      displayValue: str_('seconds', { timeInMs: metricResult.timing }),
    };
  }
}

// Example usage
(async () => {
  const artifacts = {
    traces: { DEFAULT_PASS: 'trace data' },
    devtoolsLogs: { DEFAULT_PASS: 'devtools log data' },
    GatherContext: 'gather context data',
    URL: { finalUrl: 'https://example.com' }
  };

  const context = {
    settings: { formFactor: 'mobile' },
    options: LargestContentfulPaint.defaultOptions
  };

  const result = await LargestContentfulPaint.audit(artifacts, context);
  console.log(result);
})();
