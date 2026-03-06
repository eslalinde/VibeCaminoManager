'use client';

import { useState, useEffect } from 'react';
import { Download, X, ArrowUpCircle } from 'lucide-react';

const GITHUB_REPO = 'eslalinde/VibeCaminoManager';
const DOWNLOAD_URL = `https://github.com/${GITHUB_REPO}/releases/latest`;
const RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const CURRENT_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0';

function compareVersions(a: string, b: string): number {
  const normalize = (v: string) => v.replace(/^v/, '');
  const pa = normalize(a).split(/[-.]/).map(s => isNaN(Number(s)) ? s : Number(s));
  const pb = normalize(b).split(/[-.]/).map(s => isNaN(Number(s)) ? s : Number(s));

  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (typeof va === 'number' && typeof vb === 'number') {
      if (va !== vb) return va - vb;
    } else {
      const sa = String(va);
      const sb = String(vb);
      if (sa < sb) return -1;
      if (sa > sb) return 1;
    }
  }
  return 0;
}

export function DownloadApp() {
  const [isElectron, setIsElectron] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const hasUpdate = latestVersion !== null && compareVersions(latestVersion, CURRENT_VERSION) > 0;

  useEffect(() => {
    setIsElectron(!!window.electronAPI);
    setDismissed(sessionStorage.getItem('download-app-dismissed') === '1');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) return;

    fetch(RELEASES_API)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.tag_name) {
          setLatestVersion(data.tag_name);
        }
      })
      .catch(() => {});
  }, []);

  if (isElectron || dismissed) return null;

  return (
    <div className="mx-2 mb-2 flex flex-col gap-1.5">
      {hasUpdate && (
        <a
          href={DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm hover:bg-amber-100 transition-colors dark:border-amber-700 dark:bg-amber-950 dark:hover:bg-amber-900"
        >
          <ArrowUpCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-amber-800 dark:text-amber-200">
              Nueva version {latestVersion}
            </span>
            <span className="block text-xs text-amber-600 dark:text-amber-400">
              Actual: {CURRENT_VERSION}
            </span>
          </div>
        </a>
      )}
      {!hasUpdate && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm dark:border-blue-800 dark:bg-blue-950">
          <Download className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="flex-1 min-w-0">
            <a
              href={DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-700 hover:underline dark:text-blue-300"
            >
              Descargar app de escritorio
            </a>
          </div>
          <button
            onClick={() => {
              setDismissed(true);
              sessionStorage.setItem('download-app-dismissed', '1');
            }}
            className="shrink-0 rounded p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900"
            aria-label="Cerrar"
          >
            <X className="h-3.5 w-3.5 text-blue-500" />
          </button>
        </div>
      )}
    </div>
  );
}
