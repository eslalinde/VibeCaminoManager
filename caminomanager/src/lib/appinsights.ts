import { ApplicationInsights } from "@microsoft/applicationinsights-web";

let appInsights: ApplicationInsights | null = null;

export function getAppInsights(): ApplicationInsights | null {
  if (appInsights) return appInsights;

  const connectionString =
    process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING;

  if (!connectionString) return null;

  appInsights = new ApplicationInsights({
    config: {
      connectionString,
      enableAutoRouteTracking: true,
      enableUnhandledPromiseRejectionTracking: true,
      enableAjaxPerfTracking: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,
    },
  });

  appInsights.loadAppInsights();
  return appInsights;
}

export function trackException(error: Error, severityLevel?: number) {
  const ai = getAppInsights();
  if (ai) {
    ai.trackException({ exception: error, severityLevel });
  }
  console.error(error);
}

export function trackEvent(name: string, properties?: Record<string, string>) {
  const ai = getAppInsights();
  if (ai) {
    ai.trackEvent({ name }, properties);
  }
}
